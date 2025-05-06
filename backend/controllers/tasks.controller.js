import Task from "../models/task.modal.js";
import mongoose from "mongoose";
//@desc get all tasks(admin:all,user:only assigned tasks)
//@route GET /api/tasks
//@access Private
// Get Tasks
export const getTasks = async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};
    if (status) {
      filter.status = status;
    }
    let tasks;
    if (req.user.role === "REPI" || req.user.role === "CC") {
      tasks = await Task.find(filter).populate(
        "assignedTo",
        "name email role grade profileImg"
      );
    } else {
      tasks = await Task.find({
        ...filter,
        assignedTo: req.user._id,
      }).populate("assignedTo", "name email role grade profileImg");
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
    //status summary counts
    const allTasks = await Task.countDocuments(
      req.user.role === "REPI" || req.user.role === "CC"
        ? {}
        : { assignedTo: req.user._id }
    );
    const pendingTasks = await Task.countDocuments({
      ...filter,
      status: "pending",
      ...(req.user.role === "REPI" ||
        (req.user.role === "CC" && { assignedTo: req.user._id })),
    });
    const inProgressTasks = await Task.countDocuments({
      ...filter,
      status: "in-progress",
      ...(req.user.role === "REPI" ||
        (req.user.role === "CC" && { assignedTo: req.user._id })),
    });
    const completedTasks = await Task.countDocuments({
      ...filter,
      status: "done",
      ...(req.user.role === "REPI" ||
        (req.user.role === "CC" && { assignedTo: req.user._id })),
    });

    res.json({
      tasks,
      statusSummary: {
        all: allTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
      },
    });
  } catch (error) {
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
        assignedToIds.push(new mongoose.Types.ObjectId(id)); // ✅ fixed here
      } catch (err) {
        return res.status(400).json({
          message: `Invalid user ID format: ${id}`,
          error: err.message,
        });
      }
    }

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      assignedTo: assignedToIds,
      createdBy: req.user._id,
      todocheklist: todocheklist || [],
      attchments: attchments || [],
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
    task.attchments = req.body.attchments || task.attchments;
    if (req.body.assignedTo) {
      // if (!Array.isArray(req.body.assignedTo)) {
      //   return res
      //     .status(400)
      //     .json({ message: "assignedTo should be an array of users ID " });
      // }
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
    task.todocheklist = todocheklist; //replave with updated checklist
    //auto update progress based on checklist completion
    const completedCount = task.todocheklist.filter(
      (item) => item.completed
    ).length;
    const totalItems = task.todocheklist.length;
    task.progrss =
      totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

    //auto-mark task as completed if all items are checked
    if (task.progrss === 100) {
      task.status = "done";
    } else if (task.progrss > 0) {
      task.status = "inprogress";
    } else {
      task.status = "pending";
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
      const formattedKey = status.replace(/-/g, " "); //remove space for response keys
      acc[formattedKey] =
        taskDistributionRow.find((item) => item._id === status)?.count || 0;
      return acc;
    }, {});
    taskDistribution["All"] = totalTasks; //add total count to task distribution
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
      const formattedKey = status.replace(/-/g, " "); //remove space for response keys
      acc[formattedKey] =
        taskDistributionRow.find((item) => item._id === status)?.count || 0;
      return acc;
    }, {});

    taskDistribution["All"] = totalTasks; //add total count to task distribution
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
