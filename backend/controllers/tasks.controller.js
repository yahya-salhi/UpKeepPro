import Task from "../models/task.modal.js";
import mongoose from "mongoose";
//@desc get all tasks(admin:all,user:only assigned tasks)
//@route GET /api/tasks
//@access Private
// Get Tasks
export const getTasks = async (req, res) => {
  try {
    const { status } = req.query;
    console.log("API Request - getTasks:", {
      statusFromQuery: status,
      user: {
        id: req.user._id,
        role: req.user.role,
      },
    });

    // Get all unique status values from the database to debug
    const allStatusValues = await Task.distinct("status");
    console.log("All status values in database:", allStatusValues);

    let filter = {};
    if (status && status !== "all") {
      // Map frontend status values to actual database values if needed
      let dbStatus = status;

      // Normalize status values to match database
      if (status === "pending") dbStatus = "pending";
      else if (status === "inprogress") dbStatus = "inprogress";
      else if (status === "done") dbStatus = "done";

      filter.status = dbStatus;
      console.log(
        `Filtering tasks by status: "${status}" (mapped to "${dbStatus}" in database)`
      );
    }

    // Log filter to debug
    console.log("Database filter:", filter);

    let tasks;
    if (req.user.role === "REPI" || req.user.role === "CC") {
      console.log("Admin user, fetching all tasks with filter");
      tasks = await Task.find(filter).populate(
        "assignedTo",
        "name email role grade profileImg"
      );
    } else {
      console.log("Regular user, fetching only assigned tasks with filter");
      tasks = await Task.find({
        ...filter,
        assignedTo: req.user._id,
      }).populate("assignedTo", "name email role grade profileImg");
    }

    console.log(`Found ${tasks.length} tasks matching filter`);

    // Show sample of tasks found (first 2)
    if (tasks.length > 0) {
      console.log(
        "Sample tasks:",
        tasks.slice(0, 2).map((t) => ({
          id: t._id,
          title: t.title,
          status: t.status,
          createdAt: t.createdAt,
        }))
      );
    }

    //add completed todocheklist count to each task
    tasks = await Promise.all(
      tasks.map(async (task) => {
        const completedCount = task.todocheklist.filter(
          (item) => item.completed
        ).length;
        return { ...task._doc, completedTodoCount: completedCount };
      })
    );

    //status summary counts - using native database values
    const allTasks = await Task.countDocuments(
      req.user.role === "REPI" || req.user.role === "CC"
        ? {}
        : { assignedTo: req.user._id }
    );
    const pendingTask = await Task.countDocuments({
      status: "pending",
      ...(req.user.role === "REPI" || req.user.role === "CC"
        ? {}
        : { assignedTo: req.user._id }),
    });
    const inProgressTask = await Task.countDocuments({
      status: "inprogress",
      ...(req.user.role === "REPI" || req.user.role === "CC"
        ? {}
        : { assignedTo: req.user._id }),
    });
    const completedTask = await Task.countDocuments({
      status: "done",
      ...(req.user.role === "REPI" || req.user.role === "CC"
        ? {}
        : { assignedTo: req.user._id }),
    });

    // Log counts for debugging
    console.log("Task counts:", {
      all: allTasks,
      pending: pendingTask,
      inProgress: inProgressTask,
      completed: completedTask,
    });

    const responseData = {
      tasks,
      statusSummary: {
        all: allTasks,
        pendingTask,
        inProgressTask,
        completedTask,
      },
    };

    console.log(
      "Sending response with status summary:",
      responseData.statusSummary
    );

    res.json(responseData);
  } catch (error) {
    console.error("Error in getTasks controller:", error);
    res.status(500).json({ message: "server error", error: error.message });
  }
};

//@desc get task by id
//@route GET /api/tasks/:id
//@access Private
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate(
      "assignedTo",
      "name email role grade profileImg"
    );
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "server error", error: error.message });
  }
};

//@desc create a new task (admin only)
//@route POST /api/tasks
//@access Private(admin only)
// Create Task
export const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      attchments,
      todocheklist,
    } = req.body;

    // Validate assignedTo
    if (!Array.isArray(assignedTo)) {
      return res.status(400).json({ message: "assignedTo should be an array" });
    }

    // Convert to ObjectIds with error handling
    const assignedToIds = [];
    for (const id of assignedTo) {
      try {
        assignedToIds.push(new mongoose.Types.ObjectId(id));
      } catch (err) {
        return res.status(400).json({
          message: `Invalid user ID format: ${id}`,
          error: err.message,
        });
      }
    } // Validate and process attachments
    let processedAttachments = [];
    if (Array.isArray(attchments)) {
      processedAttachments = attchments.map((attachment) => ({
        ...attachment,
        uploadedBy: req.user._id,
        uploadedAt: new Date(),
      }));
    }

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      assignedTo: assignedToIds,
      createdBy: req.user._id,
      todocheklist: todocheklist || [],
      attchments: processedAttachments,
    });

    res.status(201).json({
      message: "Task created successfully",
      task: {
        ...task._doc,
        assignedTo: task.assignedTo.map((id) => id.toString()),
      },
    });
  } catch (error) {
    console.error("Task creation error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        error: error.message,
      });
    }
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
//@desc update task details
//@route PUT /api/tasks/:id
//@access Private(admin only)
// Update Task
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    task.title = req.body.title || task.title;
    task.description = req.body.description || task.description;
    task.priority = req.body.priority || task.priority;
    task.dueDate = req.body.dueDate || task.dueDate;
    task.todocheklist = req.body.todocheklist || task.todocheklist;

    // Handle attachment updates
    if (req.body.attchments) {
      // Keep existing attachments and add new ones with proper metadata
      const newAttachments = req.body.attchments.map((attachment) => ({
        ...attachment,
        uploadedBy: req.user._id,
        uploadedAt: new Date(),
      }));
      task.attchments = newAttachments;
    }

    if (req.body.assignedTo) {
      task.assignedTo = req.body.assignedTo;
    }
    const updatedTask = await task.save();
    res.json({
      message: "Task updated successfully",
      updatedTask,
    });
  } catch (error) {
    res.status(500).json({ message: "server error", error: error.message });
  }
};

//@desc delete task admin only
//@route DELETE /api/tasks/:id
//@access Private(admin only)
// Delete Task
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    await task.deleteOne();
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "server error", error: error.message });
  }
};

//@desc  update task status
//@route PUT /api/tasks/:id/status
//@access Private(user only)
export const updateTaskStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    const isAssigned = task.assignedTo.some(
      (userId) => userId.toString() === req.user._id.toString()
    );
    if (!isAssigned && req.user.role !== "REPI" && req.user.role !== "CC") {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this task" });
    }
    task.status = req.body.status || task.status;
    if (task.status === "done") {
      task.todocheklist.forEach((item) => {
        item.completed = true;
        task.progrss = 100;
      });
    }
    await task.save();
    res.json({ message: "Task status updated successfully", task });
  } catch (error) {
    res.status(500).json({ message: "server error", error: error.message });
  }
};

//desc update task checklist
//@route PUT /api/tasks/:id/todo
//@access Private(user only)
export const updateTaskChecklist = async (req, res) => {
  try {
    const { todocheklist } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    if (
      !task.assignedTo.includes(req.user._id) &&
      req.user.role !== "REPI" &&
      req.user.role !== "CC"
    ) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this task" });
    }
    task.todocheklist = todocheklist;

    // Calculate completion stats
    const completedCount = todocheklist.filter((item) => item.completed).length;
    const totalItems = todocheklist.length;

    // Update progress
    task.progrss =
      totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

    // Update status based on checklist completion
    if (totalItems === 0 || completedCount === 0) {
      task.status = "pending";
    } else if (completedCount === totalItems) {
      task.status = "done";
    } else {
      task.status = "inprogress";
    }

    await task.save();
    const updatedTask = await Task.findById(req.params.id).populate(
      "assignedTo",
      "name email role grade profileImg"
    );
    res.json({
      message: "Task checklist updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    res.status(500).json({ message: "server error", error: error.message });
  }
};

//desc dashboard data (admin only)
//@route GET /api/tasks/dashboard-data
//@access Private(admin only)
export const getDashboardData = async (req, res) => {
  try {
    //fetching statisticss
    const totalTasks = await Task.countDocuments();
    const pendingTasks = await Task.countDocuments({ status: "pending" });
    const completedTasks = await Task.countDocuments({ status: "done" });
    const overdueTasks = await Task.countDocuments({
      status: { $ne: "done" },
      dueDate: { $lt: new Date() },
    });
    //ensure all posssible status are included
    const taskstatuses = ["pending", "inprogress", "done"];
    const taskDistributionRow = await Task.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const taskDistribution = taskstatuses.reduce((acc, status) => {
      const formattedKey = status.replace(/-/g, " ");
      acc[formattedKey] =
        taskDistributionRow.find((item) => item._id === status)?.count || 0;
      return acc;
    }, {});
    taskDistribution["All"] = totalTasks;
    //ensure all prioirity are included
    const taskPriorities = ["low", "medium", "high"];
    const taskPriorityLevelsRow = await Task.aggregate([
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ]);
    const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
      acc[priority] =
        taskPriorityLevelsRow.find((item) => item._id === priority)?.count || 0;
      return acc;
    }, {});
    //fetch recent 10 taks
    const recentTasks = await Task.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("title status priority dueDate createdAt");

    res.status(200).json({
      statistics: {
        totalTasks,
        pendingTasks,
        completedTasks,
        overdueTasks,
      },
      charts: {
        taskDistribution,
        taskPriorityLevels,
      },
      recentTasks,
    });
  } catch (error) {
    res.status(500).json({ message: "server error", error: error.message });
  }
};

//desc dashboard data (user-specific)
//@route GET /api/tasks/user-dashboard-data
//@access Private
export const getUserDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;

    //fetching statisticss
    const totalTasks = await Task.countDocuments({ assignedTo: userId });
    const pendingTasks = await Task.countDocuments({
      assignedTo: userId,
      status: "pending",
    });
    const completedTasks = await Task.countDocuments({
      assignedTo: userId,
      status: "done",
    });
    const overdueTasks = await Task.countDocuments({
      assignedTo: userId,
      status: { $ne: "done" },
      dueDate: { $lt: new Date() },
    });
    //task distribution by status
    const taskstatuses = ["pending", "inprogress", "done"];
    const taskDistributionRow = await Task.aggregate([
      {
        $match: { assignedTo: userId },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);
    const taskDistribution = taskstatuses.reduce((acc, status) => {
      const formattedKey = status.replace(/-/g, " ");
      acc[formattedKey] =
        taskDistributionRow.find((item) => item._id === status)?.count || 0;
      return acc;
    }, {});

    taskDistribution["All"] = totalTasks;
    //task distribution by priority
    const taskPriorities = ["low", "medium", "high"];
    const taskPriorityLevelsRow = await Task.aggregate([
      {
        $match: { assignedTo: userId },
      },
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ]);
    const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
      acc[priority] =
        taskPriorityLevelsRow.find((item) => item._id === priority)?.count || 0;
      return acc;
    }, {});
    // fetch recent 10 tasks for logged in user
    const recentTasks = await Task.find({ assignedTo: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("title status priority dueDate createdAt");

    res.status(200).json({
      statistics: {
        totalTasks,
        pendingTasks,
        completedTasks,
        overdueTasks,
      },
      charts: {
        taskDistribution,
        taskPriorityLevels,
      },
      recentTasks,
    });
  } catch (error) {
    res.status(500).json({ message: "server error", error: error.message });
  }
};
