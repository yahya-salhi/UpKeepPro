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
      sparse: true, // Allows multiple null values
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
          match: [
            /^(M11|C12)[-]?.*$/,
            "Please enter valid M11 or C12 reference",
          ],
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
          enum: ["consumed", "re-form", "lost", "transferred", "other"],
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
      enum: ["calibration", "maintenance", "common", "didactic"],
      required: true,
    },
    direction: {
      type: String,
      enum: ["DGMRE", "DGTI", "DGGM", "DHS", "DASIC"],
      required: true,
    },

    // **Responsible Parties**
    responsible: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Responsible",
      required: false,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: false,
    },
    placement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Placement",
      required: false,
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

// **MAT Generation with improved retry mechanism**
toolingSchema.pre("save", async function (next) {
  // Skip if not new or already has MAT
  if (!this.isNew || this.mat) return next();

  try {
    // Check for existing tool with same designation
    const existingTool = await mongoose
      .model("Tooling")
      .findOne({
        designation: new RegExp(`^${this.designation}$`, "i"),
      })
      .select("mat");

    if (existingTool) {
      // Use existing MAT if tool with same designation exists
      this.mat = existingTool.mat;
      return next();
    }

    // Generate new MAT only for completely new designations
    const prefix = this.designation.substring(0, 2).toUpperCase();
    const count = await mongoose.model("Tooling").countDocuments({
      mat: new RegExp(`^${prefix}\\d{3}$`),
    });

    this.mat = `${prefix}${String(count + 1).padStart(3, "0")}`;
    return next();
  } catch (error) {
    return next(error);
  }
});

// **Exit Validation**
toolingSchema.pre("save", async function (next) {
  if (!this.isNew || this.mat) return next();

  try {
    // Reuse MAT if same designation exists
    const existing = await mongoose.model("Tooling").findOne({
      designation: new RegExp(`^${this.designation}$`, "i"),
      mat: { $ne: null },
    });

    if (existing) {
      this.mat = existing.mat;
      return next();
    }

    // Generate MAT for new designations
    const prefix = this.designation.substring(0, 2).toUpperCase();
    const count = await mongoose.model("Tooling").countDocuments({
      mat: new RegExp(`^${prefix}\\d{3}$`),
    });

    this.mat = `${prefix}${String(count + 1).padStart(3, "0")}`;
    next();
  } catch (err) {
    next(err);
  }
});

const Tooling = mongoose.model("Tooling", toolingSchema);
export default Tooling;
