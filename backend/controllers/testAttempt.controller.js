import mongoose from "mongoose";
import TestAttempt from "../models/testAttempt.model.js";
import Test from "../models/test.model.js";
import Question from "../models/question.model.js";

// @desc    Start a test attempt
// @route   POST /api/test-attempts/start/:testId
// @access  Private
export const startTestAttempt = async (req, res) => {
  try {
    const { testId } = req.params;
    const userId = req.user._id;

    const test = await Test.findById(testId).populate("questions");

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    // Check if user can take the test
    if (!test.canUserTakeTest(userId)) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to take this test or it's not available",
      });
    }

    // Check existing attempts
    const existingAttempts = await TestAttempt.find({
      test: testId,
      user: userId,
    }).sort({ attemptNumber: -1 });

    // Check if user has exceeded max attempts
    if (existingAttempts.length >= test.maxAttempts) {
      return res.status(400).json({
        success: false,
        message: `Maximum attempts (${test.maxAttempts}) reached for this test`,
      });
    }

    // Check if there's an ongoing attempt
    const ongoingAttempt = existingAttempts.find(
      (attempt) => attempt.status === "in-progress"
    );

    if (ongoingAttempt) {
      return res.status(200).json({
        success: true,
        message: "Resuming existing attempt",
        data: ongoingAttempt,
      });
    }

    // Create question order (shuffle if required)
    let questionOrder = [...test.questions];
    if (test.shuffleQuestions) {
      questionOrder = questionOrder.sort(() => Math.random() - 0.5);
    }

    // Create new attempt
    const attemptNumber = existingAttempts.length + 1;
    const newAttempt = new TestAttempt({
      test: testId,
      user: userId,
      attemptNumber,
      questionOrder: questionOrder.map((q) => q._id),
      browserInfo: {
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip,
      },
    });

    const savedAttempt = await newAttempt.save();
    await savedAttempt.populate([
      { path: "test", select: "title duration passingScore" },
      { path: "user", select: "username email" },
    ]);

    res.status(201).json({
      success: true,
      message: "Test attempt started successfully",
      data: savedAttempt,
    });
  } catch (error) {
    console.error("Error starting test attempt:", error);
    res.status(500).json({
      success: false,
      message: "Failed to start test attempt",
      error: error.message,
    });
  }
};

// @desc    Get test questions for attempt
// @route   GET /api/test-attempts/:attemptId/questions
// @access  Private
export const getTestQuestions = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user._id;

    const attempt = await TestAttempt.findById(attemptId)
      .populate("test")
      .populate("questionOrder");

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Test attempt not found",
      });
    }

    // Check ownership
    if (attempt.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this attempt",
      });
    }

    // Check if attempt is still valid
    if (attempt.status !== "in-progress") {
      return res.status(400).json({
        success: false,
        message: "This test attempt is no longer active",
      });
    }

    // Check time limit
    const timeElapsed = (Date.now() - attempt.startTime) / 1000 / 60; // minutes
    if (timeElapsed > attempt.test.duration) {
      attempt.status = "expired";
      await attempt.save();
      return res.status(400).json({
        success: false,
        message: "Test time has expired",
      });
    }

    // Prepare questions (hide correct answers)
    const questions = attempt.questionOrder.map((question) => {
      let options = [...question.options];

      // Shuffle answers if required
      if (attempt.test.shuffleAnswers) {
        options = options.sort(() => Math.random() - 0.5);
      }

      // Remove correct answer information
      const sanitizedOptions = options.map((option) => ({
        text: option.text,
        _id: option._id,
      }));

      return {
        _id: question._id,
        question: question.question,
        questionHtml: question.questionHtml,
        questionType: question.questionType,
        options: sanitizedOptions,
        points: question.points,
        timeLimit: question.timeLimit,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        attempt: {
          _id: attempt._id,
          test: attempt.test,
          startTime: attempt.startTime,
          timeRemaining: Math.max(0, attempt.test.duration - timeElapsed),
          currentAnswers: attempt.answers,
        },
        questions,
      },
    });
  } catch (error) {
    console.error("Error fetching test questions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch test questions",
      error: error.message,
    });
  }
};

// @desc    Submit answer for a question
// @route   POST /api/test-attempts/:attemptId/answer
// @access  Private
export const submitAnswer = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { questionId, selectedOptions, timeSpent } = req.body;
    const userId = req.user._id;

    const attempt = await TestAttempt.findById(attemptId);

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Test attempt not found",
      });
    }

    // Check ownership
    if (attempt.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this attempt",
      });
    }

    // Check if attempt is still valid
    if (attempt.status !== "in-progress") {
      return res.status(400).json({
        success: false,
        message: "This test attempt is no longer active",
      });
    }

    // Submit the answer
    await attempt.submitAnswer(questionId, selectedOptions, timeSpent);

    res.status(200).json({
      success: true,
      message: "Answer submitted successfully",
      data: {
        questionId,
        selectedOptions,
        totalAnswered: attempt.answers.length,
        totalQuestions: attempt.questionOrder.length,
      },
    });
  } catch (error) {
    console.error("Error submitting answer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit answer",
      error: error.message,
    });
  }
};

// @desc    Complete test attempt
// @route   POST /api/test-attempts/:attemptId/complete
// @access  Private
export const completeTestAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user._id;

    const attempt = await TestAttempt.findById(attemptId)
      .populate("test")
      .populate("answers.question");

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Test attempt not found",
      });
    }

    // Check ownership
    if (attempt.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this attempt",
      });
    }

    // Check if attempt is still valid
    if (attempt.status !== "in-progress") {
      return res.status(400).json({
        success: false,
        message: "This test attempt is already completed",
      });
    }

    // Complete the attempt
    await attempt.complete();

    // Prepare result data
    const result = {
      _id: attempt._id,
      score: attempt.score,
      passed: attempt.passed,
      timeSpent: attempt.timeSpent,
      totalQuestions: attempt.questionOrder.length,
      answeredQuestions: attempt.answers.length,
      earnedPoints: attempt.earnedPoints,
      totalPoints: attempt.totalPoints,
      passingScore: attempt.test.passingScore,
    };

    // Include detailed results if test allows it
    if (attempt.test.showResults) {
      result.detailedResults = attempt.answers.map((answer) => ({
        question: answer.question.question,
        selectedOptions: answer.selectedOptions,
        isCorrect: answer.isCorrect,
        pointsEarned: answer.pointsEarned,
        correctOptions: answer.question.options
          .map((option, index) => (option.isCorrect ? index : -1))
          .filter((index) => index !== -1),
      }));
    }

    res.status(200).json({
      success: true,
      message: "Test completed successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error completing test attempt:", error);
    res.status(500).json({
      success: false,
      message: "Failed to complete test attempt",
      error: error.message,
    });
  }
};

// @desc    Get user's test results
// @route   GET /api/tests/my-results
// @access  Private
export const getMyTestResults = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, search, status, sort = "recent" } = req.query;

    let filter = {
      user: userId,
      status: "completed",
    };

    // Build aggregation pipeline
    let pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: "tests",
          localField: "test",
          foreignField: "_id",
          as: "test",
        },
      },
      { $unwind: "$test" },
    ];

    // Add search filter
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { "test.title": { $regex: search, $options: "i" } },
            { "test.description": { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    // Add status filter
    if (status && status !== "all") {
      if (status === "passed") {
        pipeline.push({ $match: { passed: true } });
      } else if (status === "failed") {
        pipeline.push({ $match: { passed: false } });
      }
    }

    // Add sorting
    let sortStage = {};
    switch (sort) {
      case "recent":
        sortStage = { endTime: -1 };
        break;
      case "oldest":
        sortStage = { endTime: 1 };
        break;
      case "score-high":
        sortStage = { score: -1 };
        break;
      case "score-low":
        sortStage = { score: 1 };
        break;
      default:
        sortStage = { endTime: -1 };
    }
    pipeline.push({ $sort: sortStage });

    // Add pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });

    // Execute aggregation
    const results = await TestAttempt.aggregate(pipeline);

    // Get total count for pagination
    const totalPipeline = [
      { $match: filter },
      {
        $lookup: {
          from: "tests",
          localField: "test",
          foreignField: "_id",
          as: "test",
        },
      },
      { $unwind: "$test" },
    ];

    if (search) {
      totalPipeline.push({
        $match: {
          $or: [
            { "test.title": { $regex: search, $options: "i" } },
            { "test.description": { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    if (status && status !== "all") {
      if (status === "passed") {
        totalPipeline.push({ $match: { passed: true } });
      } else if (status === "failed") {
        totalPipeline.push({ $match: { passed: false } });
      }
    }

    totalPipeline.push({ $count: "total" });
    const totalResult = await TestAttempt.aggregate(totalPipeline);
    const total = totalResult[0]?.total || 0;

    res.status(200).json({
      success: true,
      data: {
        results,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user test results:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch test results",
      error: error.message,
    });
  }
};

// @desc    Get specific test attempt result
// @route   GET /api/tests/attempts/:attemptId
// @access  Private
export const getTestAttemptResult = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user._id;

    const attempt = await TestAttempt.findById(attemptId)
      .populate(
        "test",
        "title description passingScore showResults allowRetake"
      )
      .populate("answers.question");

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Test attempt not found",
      });
    }

    // Check ownership
    if (attempt.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this result",
      });
    }

    // Prepare result data
    const result = {
      _id: attempt._id,
      score: attempt.score,
      passed: attempt.passed,
      timeSpent: attempt.timeSpent,
      totalQuestions: attempt.questionOrder.length,
      answeredQuestions: attempt.answers.length,
      earnedPoints: attempt.earnedPoints,
      totalPoints: attempt.totalPoints,
      endTime: attempt.endTime,
      test: attempt.test,
    };

    // Include detailed results if test allows it
    if (attempt.test.showResults) {
      result.detailedResults = attempt.answers.map((answer) => ({
        question: answer.question.question || answer.question.questionHtml,
        selectedOptions: answer.selectedOptions,
        isCorrect: answer.isCorrect,
        pointsEarned: answer.pointsEarned,
        correctOptions: answer.question.options
          .map((option, index) => (option.isCorrect ? index : -1))
          .filter((index) => index !== -1),
      }));
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching test attempt result:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch test result",
      error: error.message,
    });
  }
};

// @desc    Get test results for formateur's tests
// @route   GET /api/tests/formateur-results
// @access  Private (Formateurs and Admins)
export const getFormateurTestResults = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      page = 1,
      limit = 20,
      search,
      testId,
      status,
      sort = "recent",
    } = req.query;

    // First, get all tests created by this formateur
    const formateurTests = await Test.find({ createdBy: userId }).select("_id");
    const testIds = formateurTests.map((test) => test._id);

    if (testIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          results: [],
          stats: {
            totalAttempts: 0,
            passRate: 0,
            averageScore: 0,
            averageTime: 0,
          },
          pagination: {
            current: 1,
            pages: 0,
            total: 0,
          },
        },
      });
    }

    let filter = {
      test: { $in: testIds },
      status: "completed",
    };

    // Build aggregation pipeline
    let pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: "tests",
          localField: "test",
          foreignField: "_id",
          as: "test",
        },
      },
      { $unwind: "$test" },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 1,
          score: 1,
          passed: 1,
          timeSpent: 1,
          totalQuestions: { $size: "$questionOrder" },
          answeredQuestions: { $size: "$answers" },
          earnedPoints: 1,
          totalPoints: 1,
          endTime: 1,
          "test._id": 1,
          "test.title": 1,
          "test.passingScore": 1,
          "user._id": 1,
          "user.username": 1,
          "user.email": 1,
        },
      },
    ];

    // Add search filter
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { "user.username": { $regex: search, $options: "i" } },
            { "user.email": { $regex: search, $options: "i" } },
            { "test.title": { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    // Add test filter
    if (testId && testId !== "all") {
      pipeline.push({
        $match: {
          "test._id": new mongoose.Types.ObjectId(testId),
        },
      });
    }

    // Add status filter
    if (status && status !== "all") {
      if (status === "passed") {
        pipeline.push({ $match: { passed: true } });
      } else if (status === "failed") {
        pipeline.push({ $match: { passed: false } });
      }
    }

    // Add sorting
    let sortStage = {};
    switch (sort) {
      case "recent":
        sortStage = { endTime: -1 };
        break;
      case "oldest":
        sortStage = { endTime: 1 };
        break;
      case "score-high":
        sortStage = { score: -1 };
        break;
      case "score-low":
        sortStage = { score: 1 };
        break;
      case "student":
        sortStage = { "user.username": 1 };
        break;
      default:
        sortStage = { endTime: -1 };
    }
    pipeline.push({ $sort: sortStage });

    // Get total count for pagination
    const totalPipeline = [...pipeline];
    totalPipeline.push({ $count: "total" });
    const totalResult = await TestAttempt.aggregate(totalPipeline);
    const total = totalResult[0]?.total || 0;

    // Add pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });

    // Execute aggregation
    const results = await TestAttempt.aggregate(pipeline);

    // Calculate statistics
    const statsPipeline = [
      { $match: { test: { $in: testIds }, status: "completed" } },
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          totalPassed: { $sum: { $cond: ["$passed", 1, 0] } },
          averageScore: { $avg: "$score" },
          averageTime: { $avg: "$timeSpent" },
        },
      },
    ];

    const statsResult = await TestAttempt.aggregate(statsPipeline);
    const stats = statsResult[0] || {
      totalAttempts: 0,
      totalPassed: 0,
      averageScore: 0,
      averageTime: 0,
    };

    const passRate =
      stats.totalAttempts > 0
        ? Math.round((stats.totalPassed / stats.totalAttempts) * 100)
        : 0;

    res.status(200).json({
      success: true,
      data: {
        results,
        stats: {
          totalAttempts: stats.totalAttempts,
          passRate,
          averageScore: Math.round(stats.averageScore || 0),
          averageTime: Math.round(stats.averageTime || 0),
        },
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching formateur test results:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch test results",
      error: error.message,
    });
  }
};
