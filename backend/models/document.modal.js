import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    // Document Information
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    
    // Metadata
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    
    // Status
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },

    // User References
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastModified: {
      timestamp: {
        type: Date,
        default: Date.now,
      },
      by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },

    // Access Control
    permissions: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      access: {
        type: String,
        enum: ["read", "write", "admin"],
        default: "read",
      },
    }],

    // Version Control
    version: {
      type: Number,
      default: 1,
    },
    previousVersions: [{
      content: String,
      modifiedAt: Date,
      modifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      version: Number,
    }],
  },
  {
    timestamps: true,
  }
);

// Index for better search performance
documentSchema.index({ title: 'text', content: 'text', tags: 'text' });

// Pre-save middleware to handle versioning
documentSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    // If content is modified, increment version and store previous version
    if (!this.isNew) {
      this.previousVersions.push({
        content: this._original.content,
        modifiedAt: new Date(),
        modifiedBy: this.lastModified.by,
        version: this.version,
      });
    }
    this.version += 1;
  }
  next();
});

const Document = mongoose.model("Document", documentSchema);

export default Document;
