import mongoose from "mongoose";

const testSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    instructions: {
      type: String,
      default: "",
      maxlength: 2000,
    },
    // Test configuration
    duration: {
      type: Number, // Duration in minutes
      required: true,
      min: 1,
      max: 480, // Max 8 hours
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    passingScore: {
      type: Number, // Percentage required to pass
      required: true,
      min: 0,
      max: 100,
      default: 60,
    },
    // Test settings
    shuffleQuestions: {
      type: Boolean,
      default: false,
    },
    shuffleAnswers: {
      type: Boolean,
      default: false,
    },
    showResults: {
      type: Boolean,
      default: true, // Show results immediately after completion
    },
    allowRetake: {
      type: Boolean,
      default: false,
    },
    maxAttempts: {
      type: Number,
      default: 1,
      min: 1,
    },
    // Scheduling
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    // Access control
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Categories and tags
    category: {
      type: String,
      enum: ["Test", "Exam", "Rattrapage", "Exercice", "Quiz", "Pré-Test"],
      default: "Test",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    // Status
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    // Statistics
    totalAttempts: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
    },
    // Questions reference
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
testSchema.index({ createdBy: 1, status: 1 });
testSchema.index({ assignedTo: 1, status: 1 });
testSchema.index({ startDate: 1, endDate: 1 });
testSchema.index({ category: 1, status: 1 });

// Virtual for checking if test is active
testSchema.virtual("isActive").get(function () {
  const now = new Date();
  return (
    this.status === "published" && this.startDate <= now && this.endDate >= now
  );
});

// Method to check if user can take the test
testSchema.methods.canUserTakeTest = function (userId) {
  const now = new Date();
  return (
    this.status === "published" &&
    this.startDate <= now &&
    this.endDate >= now &&
    (this.assignedTo.length === 0 || this.assignedTo.includes(userId))
  );
};

// Method to update statistics
testSchema.methods.updateStatistics = async function () {
  const TestAttempt = mongoose.model("TestAttempt");
  const attempts = await TestAttempt.find({
    test: this._id,
    status: "completed",
  });

  this.totalAttempts = attempts.length;
  if (attempts.length > 0) {
    const totalScore = attempts.reduce(
      (sum, attempt) => sum + attempt.score,
      0
    );
    this.averageScore = Math.round(totalScore / attempts.length);
  }

  return this.save();
};

const Test = mongoose.model("Test", testSchema);

export default Test;
