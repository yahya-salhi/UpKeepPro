import mongoose from "mongoose";

const testAttemptSchema = new mongoose.Schema(
  {
    // References
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Attempt details
    attemptNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["in-progress", "completed", "abandoned", "expired"],
      default: "in-progress",
    },
    // Timing
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    timeSpent: {
      type: Number, // Time spent in seconds
      default: 0,
    },
    // Scoring
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    earnedPoints: {
      type: Number,
      default: 0,
    },
    passed: {
      type: Boolean,
      default: false,
    },
    // Answers
    answers: [{
      question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: true,
      },
      selectedOptions: [{
        type: Number, // Index of selected option
      }],
      isCorrect: {
        type: Boolean,
        default: false,
      },
      pointsEarned: {
        type: Number,
        default: 0,
      },
      timeSpent: {
        type: Number, // Time spent on this question in seconds
        default: 0,
      },
      answeredAt: {
        type: Date,
        default: Date.now,
      },
    }],
    // Question order (for shuffled tests)
    questionOrder: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
    }],
    // Browser/session info
    browserInfo: {
      userAgent: String,
      ipAddress: String,
      screenResolution: String,
    },
    // Flags for monitoring
    flags: [{
      type: {
        type: String,
        enum: ["tab-switch", "window-blur", "copy-paste", "right-click", "suspicious-activity"],
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      details: String,
    }],
    // Review and feedback
    feedback: {
      type: String,
      maxlength: 2000,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
testAttemptSchema.index({ test: 1, user: 1 });
testAttemptSchema.index({ user: 1, status: 1 });
testAttemptSchema.index({ test: 1, status: 1 });
testAttemptSchema.index({ startTime: 1, endTime: 1 });

// Virtual for duration in minutes
testAttemptSchema.virtual('durationMinutes').get(function() {
  if (!this.endTime || !this.startTime) return 0;
  return Math.round((this.endTime - this.startTime) / (1000 * 60));
});

// Virtual for completion percentage
testAttemptSchema.virtual('completionPercentage').get(function() {
  if (!this.questionOrder || this.questionOrder.length === 0) return 0;
  return Math.round((this.answers.length / this.questionOrder.length) * 100);
});

// Method to calculate score
testAttemptSchema.methods.calculateScore = async function() {
  if (this.answers.length === 0) {
    this.score = 0;
    this.earnedPoints = 0;
    return this.save();
  }

  await this.populate('answers.question');
  
  let totalPoints = 0;
  let earnedPoints = 0;

  this.answers.forEach(answer => {
    const question = answer.question;
    totalPoints += question.points;
    
    if (answer.isCorrect) {
      earnedPoints += question.points;
      answer.pointsEarned = question.points;
    } else {
      answer.pointsEarned = 0;
    }
  });

  this.totalPoints = totalPoints;
  this.earnedPoints = earnedPoints;
  this.score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  
  // Check if passed
  const test = await mongoose.model('Test').findById(this.test);
  this.passed = this.score >= test.passingScore;

  return this.save();
};

// Method to submit answer
testAttemptSchema.methods.submitAnswer = async function(questionId, selectedOptions, timeSpent = 0) {
  // Find existing answer or create new one
  let answerIndex = this.answers.findIndex(
    answer => answer.question.toString() === questionId.toString()
  );

  const question = await mongoose.model('Question').findById(questionId);
  if (!question) {
    throw new Error('Question not found');
  }

  // Check if answer is correct
  const correctOptions = question.options
    .map((option, index) => option.isCorrect ? index : -1)
    .filter(index => index !== -1);

  const isCorrect = selectedOptions.length === correctOptions.length &&
    selectedOptions.every(option => correctOptions.includes(option));

  const answerData = {
    question: questionId,
    selectedOptions,
    isCorrect,
    pointsEarned: isCorrect ? question.points : 0,
    timeSpent,
    answeredAt: new Date(),
  };

  if (answerIndex >= 0) {
    // Update existing answer
    this.answers[answerIndex] = answerData;
  } else {
    // Add new answer
    this.answers.push(answerData);
  }

  // Update question statistics
  await question.updateStats(isCorrect);

  return this.save();
};

// Method to complete the attempt
testAttemptSchema.methods.complete = async function() {
  this.status = 'completed';
  this.endTime = new Date();
  this.timeSpent = Math.round((this.endTime - this.startTime) / 1000);
  
  await this.calculateScore();
  
  // Update test statistics
  const test = await mongoose.model('Test').findById(this.test);
  await test.updateStatistics();
  
  return this.save();
};

const TestAttempt = mongoose.model("TestAttempt", testAttemptSchema);

export default TestAttempt;
