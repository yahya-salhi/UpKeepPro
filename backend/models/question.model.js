import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    // Question content
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    questionType: {
      type: String,
      enum: ["multiple-choice", "true-false", "single-choice"],
      default: "multiple-choice",
      required: true,
    },
    // Rich text content for complex questions
    questionHtml: {
      type: String, // For rich text content from TinyMCE/ReactQuill
      default: "",
    },
    // Answer options
    options: [
      {
        text: {
          type: String,
          required: true,
          trim: true,
          maxlength: 500,
        },
        isCorrect: {
          type: Boolean,
          default: false,
        },
        explanation: {
          type: String,
          default: "",
          maxlength: 1000,
        },
      },
    ],
    // Question settings
    points: {
      type: Number,
      default: 1,
      min: 0,
      max: 100,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    // Time limit for this specific question (in seconds)
    timeLimit: {
      type: Number,
      default: 0, // 0 means no time limit
      min: 0,
    },
    // Categorization
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
    // Question metadata
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Usage tracking
    timesUsed: {
      type: Number,
      default: 0,
    },
    correctAnswers: {
      type: Number,
      default: 0,
    },
    totalAnswers: {
      type: Number,
      default: 0,
    },
    // Media attachments
    attachments: [
      {
        type: {
          type: String,
          enum: ["image", "video", "audio", "document"],
        },
        url: String,
        filename: String,
        size: Number,
      },
    ],
    // Status
    status: {
      type: String,
      enum: ["active", "inactive", "archived"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
questionSchema.index({ createdBy: 1, status: 1 });
questionSchema.index({ category: 1, difficulty: 1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ questionType: 1, status: 1 });

// Virtual for success rate
questionSchema.virtual("successRate").get(function () {
  if (this.totalAnswers === 0) return 0;
  return Math.round((this.correctAnswers / this.totalAnswers) * 100);
});

// Method to validate question structure
questionSchema.methods.validateQuestion = function () {
  const errors = [];

  // Check if question has content
  if (!this.question && !this.questionHtml) {
    errors.push("Question must have content");
  }

  // Check options
  if (!this.options || this.options.length < 2) {
    errors.push("Question must have at least 2 options");
  }

  // Check for correct answers
  const correctOptions = this.options.filter((option) => option.isCorrect);
  if (correctOptions.length === 0) {
    errors.push("Question must have at least one correct answer");
  }

  // For single-choice, only one correct answer allowed
  if (this.questionType === "single-choice" && correctOptions.length > 1) {
    errors.push("Single-choice questions can only have one correct answer");
  }

  // For true-false, exactly 2 options required
  if (this.questionType === "true-false" && this.options.length !== 2) {
    errors.push("True-false questions must have exactly 2 options");
  }

  return errors;
};

// Method to update statistics
questionSchema.methods.updateStats = function (isCorrect) {
  this.totalAnswers += 1;
  if (isCorrect) {
    this.correctAnswers += 1;
  }
  return this.save();
};

// Pre-save validation
questionSchema.pre("save", function (next) {
  const errors = this.validateQuestion();
  if (errors.length > 0) {
    const error = new Error(`Question validation failed: ${errors.join(", ")}`);
    return next(error);
  }
  next();
});

const Question = mongoose.model("Question", questionSchema);

export default Question;
