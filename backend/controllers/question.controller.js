import Question from "../models/question.model.js";
import Test from "../models/test.model.js";

// @desc    Create a new question
// @route   POST /api/questions
// @access  Private (Formateurs and Admins)
export const createQuestion = async (req, res) => {
  try {
    const {
      question,
      questionType,
      questionHtml,
      options,
      points,
      difficulty,
      timeLimit,
      category,
      tags,
      testId,
    } = req.body;

    // Validate required fields
    if (!question && !questionHtml) {
      return res.status(400).json({
        success: false,
        message: "Question content is required",
      });
    }

    if (!options || options.length < 2) {
      return res.status(400).json({
        success: false,
        message: "At least 2 options are required",
      });
    }

    // Validate correct answers
    const correctOptions = options.filter(option => option.isCorrect);
    if (correctOptions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one correct answer is required",
      });
    }

    const newQuestion = new Question({
      question,
      questionType: questionType || "multiple-choice",
      questionHtml,
      options,
      points: points || 1,
      difficulty: difficulty || "medium",
      timeLimit: timeLimit || 0,
      category: category || "General",
      tags: tags || [],
      createdBy: req.user._id,
    });

    const savedQuestion = await newQuestion.save();
    await savedQuestion.populate("createdBy", "username email");

    // If testId is provided, add question to test
    if (testId) {
      const test = await Test.findById(testId);
      if (test && (test.createdBy.toString() === req.user._id.toString() || req.user.isAdmin())) {
        test.questions.push(savedQuestion._id);
        test.totalQuestions = test.questions.length;
        await test.save();
      }
    }

    res.status(201).json({
      success: true,
      message: "Question created successfully",
      data: savedQuestion,
    });
  } catch (error) {
    console.error("Error creating question:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create question",
      error: error.message,
    });
  }
};

// @desc    Get questions with filtering
// @route   GET /api/questions
// @access  Private (Formateurs and Admins)
export const getQuestions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      difficulty,
      questionType,
      createdBy,
      search,
      testId,
    } = req.query;

    const user = req.user;
    let filter = {};

    // Role-based filtering
    if (user.role === "FORM" || user.isAdmin()) {
      if (createdBy) {
        filter.createdBy = createdBy;
      } else {
        filter.createdBy = user._id;
      }
    } else {
      return res.status(403).json({
        success: false,
        message: "Access denied. Formateurs and Admins only.",
      });
    }

    // Additional filters
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (questionType) filter.questionType = questionType;
    if (search) {
      filter.$or = [
        { question: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // If testId is provided, get questions for that test
    if (testId) {
      const test = await Test.findById(testId);
      if (test) {
        filter._id = { $in: test.questions };
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const questions = await Question.find(filter)
      .populate("createdBy", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Question.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        questions,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch questions",
      error: error.message,
    });
  }
};

// @desc    Get question by ID
// @route   GET /api/questions/:id
// @access  Private
export const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const question = await Question.findById(id).populate("createdBy", "username email");

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    // Check permissions
    const canView = 
      question.createdBy._id.toString() === user._id.toString() ||
      user.isAdmin() ||
      user.role === "FORM";

    if (!canView) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this question",
      });
    }

    res.status(200).json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error("Error fetching question:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch question",
      error: error.message,
    });
  }
};

// @desc    Update question
// @route   PUT /api/questions/:id
// @access  Private (Formateurs and Admins)
export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    // Check permissions
    const canEdit = 
      question.createdBy.toString() === user._id.toString() ||
      user.isAdmin();

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to edit this question",
      });
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true, runValidators: true }
    ).populate("createdBy", "username email");

    res.status(200).json({
      success: true,
      message: "Question updated successfully",
      data: updatedQuestion,
    });
  } catch (error) {
    console.error("Error updating question:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update question",
      error: error.message,
    });
  }
};

// @desc    Delete question
// @route   DELETE /api/questions/:id
// @access  Private (Formateurs and Admins)
export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    // Check permissions
    const canDelete = 
      question.createdBy.toString() === user._id.toString() ||
      user.isAdmin();

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this question",
      });
    }

    // Remove question from any tests
    await Test.updateMany(
      { questions: id },
      { $pull: { questions: id } }
    );

    // Update totalQuestions count for affected tests
    const affectedTests = await Test.find({ questions: { $ne: id } });
    for (const test of affectedTests) {
      test.totalQuestions = test.questions.length;
      await test.save();
    }

    await Question.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting question:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete question",
      error: error.message,
    });
  }
};
