import Test from "../models/test.model.js";
import Question from "../models/question.model.js";
import TestAttempt from "../models/testAttempt.model.js";
import User from "../models/user.modal.js";

// @desc    Create a new test
// @route   POST /api/tests
// @access  Private (Formateurs and Admins)
export const createTest = async (req, res) => {
  try {
    const {
      title,
      description,
      instructions,
      duration,
      passingScore,
      shuffleQuestions,
      shuffleAnswers,
      showResults,
      allowRetake,
      maxAttempts,
      startDate,
      endDate,
      assignedTo,
      category,
      tags,
    } = req.body;

    // Validate required fields
    if (!title || !description || !duration || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Title, description, duration, and end date are required",
      });
    }

    // Validate dates
    const start = new Date(startDate || Date.now());
    const end = new Date(endDate);

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      });
    }

    const test = new Test({
      title,
      description,
      instructions,
      duration,
      passingScore: passingScore || 60,
      shuffleQuestions: shuffleQuestions || false,
      shuffleAnswers: shuffleAnswers || false,
      showResults: showResults !== undefined ? showResults : true,
      allowRetake: allowRetake || false,
      maxAttempts: maxAttempts || 1,
      startDate: start,
      endDate: end,
      assignedTo: assignedTo || [],
      category: category || "General",
      tags: tags || [],
      createdBy: req.user._id,
      totalQuestions: 0, // Will be updated when questions are added
    });

    const savedTest = await test.save();
    await savedTest.populate("createdBy", "username email");

    res.status(201).json({
      success: true,
      message: "Test created successfully",
      data: savedTest,
    });
  } catch (error) {
    console.error("Error creating test:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create test",
      error: error.message,
    });
  }
};

// @desc    Get all tests (with filtering)
// @route   GET /api/tests
// @access  Private
export const getTests = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      createdBy,
      assignedTo,
      search,
    } = req.query;

    const user = req.user;
    let filter = {};

    // Role-based filtering
    if (user.role === "FORM" || user.isAdmin()) {
      // Formateurs and admins can see tests they created
      if (createdBy) {
        filter.createdBy = createdBy;
      } else {
        filter.createdBy = user._id;
      }
    } else {
      // Regular users can only see tests assigned to them or public tests
      filter.$or = [
        { assignedTo: user._id },
        { assignedTo: { $size: 0 } }, // Public tests
      ];
      filter.status = "published"; // Only published tests
    }

    // Additional filters
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (assignedTo) filter.assignedTo = assignedTo;

    // Search filter - combine with existing filters instead of overriding
    if (search) {
      const searchConditions = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];

      // If there's already an $or condition (for role-based filtering), combine them
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchConditions }];
        delete filter.$or;
      } else {
        filter.$or = searchConditions;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tests = await Test.find(filter)
      .populate("createdBy", "username email")
      .populate("assignedTo", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Test.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        tests,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching tests:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tests",
      error: error.message,
    });
  }
};

// @desc    Get test by ID
// @route   GET /api/tests/:id
// @access  Private
export const getTestById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const test = await Test.findById(id)
      .populate("createdBy", "username email")
      .populate("assignedTo", "username email")
      .populate("questions");

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    // Check permissions
    const canView =
      test.createdBy._id.toString() === user._id.toString() ||
      user.isAdmin() ||
      user.role === "FORM" ||
      test.assignedTo.some(
        (assignedUser) => assignedUser._id.toString() === user._id.toString()
      ) ||
      (test.assignedTo.length === 0 && test.status === "published");

    if (!canView) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this test",
      });
    }

    res.status(200).json({
      success: true,
      data: test,
    });
  } catch (error) {
    console.error("Error fetching test:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch test",
      error: error.message,
    });
  }
};

// @desc    Update test
// @route   PUT /api/tests/:id
// @access  Private (Formateurs and Admins)
export const updateTest = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const test = await Test.findById(id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    // Check permissions
    const canEdit =
      test.createdBy.toString() === user._id.toString() || user.isAdmin();

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to edit this test",
      });
    }

    // Prevent editing if test has attempts and is published
    if (test.status === "published" && test.totalAttempts > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot edit test that has been attempted by users",
      });
    }

    // Validate and sanitize the update data
    const updateData = { ...req.body };

    // Ensure category is valid if provided
    const validCategories = [
      "Test",
      "Exam",
      "Rattrapage",
      "Exercice",
      "Quiz",
      "Pré-Test",
    ];
    if (updateData.category !== undefined) {
      if (
        !updateData.category ||
        !validCategories.includes(updateData.category)
      ) {
        updateData.category = "Test"; // Default to "Test" if invalid
      }
    }

    const updatedTest = await Test.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("createdBy", "username email")
      .populate("assignedTo", "username email");

    res.status(200).json({
      success: true,
      message: "Test updated successfully",
      data: updatedTest,
    });
  } catch (error) {
    console.error("Error updating test:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update test",
      error: error.message,
    });
  }
};

// @desc    Delete test
// @route   DELETE /api/tests/:id
// @access  Private (Formateurs and Admins)
export const deleteTest = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const test = await Test.findById(id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    // Check permissions - Formateurs and Admins can delete ANY test
    const canDelete = user.role === "FORM" || user.isAdmin();

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this test",
      });
    }

    // Delete all related test attempts first
    await TestAttempt.deleteMany({ test: id });

    // Delete the test
    await Test.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Test and all related data deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting test:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete test",
      error: error.message,
    });
  }
};

// @desc    Bulk delete tests
// @route   DELETE /api/tests/bulk
// @access  Private (Formateurs and Admins)
export const bulkDeleteTests = async (req, res) => {
  try {
    const { testIds } = req.body;
    const user = req.user;

    if (!testIds || !Array.isArray(testIds) || testIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Test IDs array is required",
      });
    }

    // Check permissions - Formateurs and Admins can delete ANY test
    const canDelete = user.role === "FORM" || user.isAdmin();

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete tests",
      });
    }

    // Delete all related test attempts first
    await TestAttempt.deleteMany({ test: { $in: testIds } });

    // Delete all tests
    const deleteResult = await Test.deleteMany({ _id: { $in: testIds } });

    res.status(200).json({
      success: true,
      message: `${deleteResult.deletedCount} test(s) and all related data deleted successfully`,
      deletedCount: deleteResult.deletedCount,
    });
  } catch (error) {
    console.error("Error bulk deleting tests:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete tests",
      error: error.message,
    });
  }
};

// @desc    Publish test
// @route   PATCH /api/tests/:id/publish
// @access  Private (Formateurs and Admins)
export const publishTest = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const test = await Test.findById(id).populate("questions");

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    // Check permissions
    const canPublish =
      test.createdBy.toString() === user._id.toString() || user.isAdmin();

    if (!canPublish) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to publish this test",
      });
    }

    // Validate test before publishing
    if (test.questions.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot publish test without questions. Please add at least one question before publishing.",
      });
    }

    test.status = "published";
    test.totalQuestions = test.questions.length;
    await test.save();

    res.status(200).json({
      success: true,
      message: "Test published successfully",
      data: test,
    });
  } catch (error) {
    console.error("Error publishing test:", error);
    res.status(500).json({
      success: false,
      message: "Failed to publish test",
      error: error.message,
    });
  }
};

// @desc    Archive test
// @route   PATCH /api/tests/:id/archive
// @access  Private (Formateurs and Admins)
export const archiveTest = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const test = await Test.findById(id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    // Check permissions - Formateurs and Admins can archive ANY test
    const canArchive = user.role === "FORM" || user.isAdmin();

    if (!canArchive) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to archive this test",
      });
    }

    // Cannot archive a test that's already archived
    if (test.status === "archived") {
      return res.status(400).json({
        success: false,
        message: "Test is already archived",
      });
    }

    test.status = "archived";
    await test.save();

    res.status(200).json({
      success: true,
      message: "Test archived successfully",
      data: test,
    });
  } catch (error) {
    console.error("Error archiving test:", error);
    res.status(500).json({
      success: false,
      message: "Failed to archive test",
      error: error.message,
    });
  }
};

// @desc    Unarchive test
// @route   PATCH /api/tests/:id/unarchive
// @access  Private (Formateurs and Admins)
export const unarchiveTest = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const test = await Test.findById(id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    // Check permissions - Formateurs and Admins can unarchive ANY test
    const canUnarchive = user.role === "FORM" || user.isAdmin();

    if (!canUnarchive) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to unarchive this test",
      });
    }

    // Can only unarchive archived tests
    if (test.status !== "archived") {
      return res.status(400).json({
        success: false,
        message: "Test is not archived",
      });
    }

    // Unarchive to draft status (formateur can then publish if needed)
    test.status = "draft";
    await test.save();

    res.status(200).json({
      success: true,
      message: "Test unarchived successfully. Status set to draft.",
      data: test,
    });
  } catch (error) {
    console.error("Error unarchiving test:", error);
    res.status(500).json({
      success: false,
      message: "Failed to unarchive test",
      error: error.message,
    });
  }
};
