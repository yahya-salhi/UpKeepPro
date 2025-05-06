import mongoose from "mongoose";

const toolingSchema = new mongoose.Schema(
  {
    // **Core Identification**
    designation: {
      type: String,
      required: [true, "Designation is required"],
      trim: true,
      uppercase: true,
      maxlength: [50, "Designation cannot exceed 50 characters"],
    },
    mat: {
      type: String,
      unique: true,
      immutable: true,
      match: [/^[A-Z]{2}\d{3}$/, "MAT must be in format AA001"],
    },

    // **Acquisition Information (PV or M11)**
    acquisitionType: {
      type: String,
      required: true,
      enum: ["PV", "M11"],
      default: "PV",
    },
    acquisitionRef: {
      type: String,
      required: [true, "Reference is required"],
      trim: true,
    },
    acquisitionDate: {
      type: Date,
      required: [true, "Acquisition date is required"],
      max: [Date.now, "Date cannot be in the future"],
    },
    originalQte: {
      type: Number,
      required: [true, "Original quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },

    // **Exit Information (Only M11)**
    exits: [
      {
        exitRef: {
          type: String,
          required: true,
          trim: true,
          match: [/^M11\d+$/, "Please enter valid M11 reference"],
        },
        exitDate: {
          type: Date,
          required: true,
          max: [Date.now, "Date cannot be in the future"],
        },
        exitQte: {
          type: Number,
          required: true,
          min: [1, "Exit quantity must be at least 1"],
        },
        exitReason: {
          type: String,
          enum: ["consumed", "lost", "transferred", "other"],
          required: true,
        },
      },
    ],

    // **Current Status**
    currentQte: {
      type: Number,
      required: true,
      min: [0, "Quantity cannot be negative"],
    },
    situation: {
      type: String,
      enum: ["available", "unavailable", "partial"],
      required: true,
      default: "available",
    },

    // **Tool Classification**
    type: {
      type: String,
      enum: ["calibration", "maintenance", "common"],
      required: true,
    },
    direction: {
      type: String,
      enum: ["DEMRE", "DGTI", "DGGM", "DHS", "DASIC"],
      required: true,
    },

    // **Responsible Parties**
    responsible: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Responsible",
      required: true,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    placement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Placement",
      required: true,
    },

    // **History Tracking**
    history: [
      {
        eventType: {
          type: String,
          enum: ["entry", "exit", "conversion", "adjustment"],
        },
        reference: String,
        date: Date,
        qteChange: Number,
        notes: String,
        performedBy: String,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// **MAT Generation (e.g., HA001)**
toolingSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  // Generate MAT (first 2 letters of designation + sequential number)
  const prefix = this.designation.substring(0, 2).toUpperCase();
  const count = await mongoose
    .model("Tooling")
    .countDocuments({ designation: this.designation });
  this.mat = `${prefix}${String(count + 1).padStart(3, "0")}`;

  // Set initial current quantity
  this.currentQte = this.originalQte;
  next();
});

// **Exit Validation**
toolingSchema.pre("save", function (next) {
  if (this.isModified("exits")) {
    const totalExited = this.exits.reduce((sum, exit) => sum + exit.exitQte, 0);

    if (totalExited > this.originalQte) {
      return next(
        new Error("Total exited quantity cannot exceed original quantity")
      );
    }

    this.currentQte = this.originalQte - totalExited;

    // Update situation based on current quantity
    if (this.currentQte <= 0) {
      this.situation = "unavailable";
    } else if (this.currentQte < this.originalQte) {
      this.situation = "partial";
    } else {
      this.situation = "available";
    }
  }
  next();
});

// **Virtual for PV to M11 Conversion Tracking**
toolingSchema.virtual("isConverted").get(function () {
  return this.history.some((event) => event.eventType === "conversion");
});

const Tooling = mongoose.model("Tooling", toolingSchema);

export default Tooling;
