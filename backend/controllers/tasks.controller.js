import Task from "../models/task.modal.js";
import Notification from "../models/notification.modal.js";
import User from "../models/user.modal.js";
import mongoose from "mongoose";
import { io } from "../server.js";

// Helper function to notify admins when a task is completed by a user
const notifyAdminsOfTaskCompletion = async (task, completedByUser) => {
  try {
    // Find all admin users (REPI and CC roles)
    const adminUsers = await User.find({
      role: { $in: ["REPI", "CC"] },
    });

    if (adminUsers.length === 0) return;

    // Create notifications for all admins
    const notifications = adminUsers.map((admin) => ({
      from: completedByUser._id,
      to: admin._id,
      type: "task_completion",
      message: `${completedByUser.username} has completed the task: "${task.title}"`,
      data: {
        taskId: task._id,
        taskTitle: task.title,
        taskPriority: task.priority,
        taskDueDate: task.dueDate,
        completedBy: completedByUser.username,
        completedAt: new Date(),
      },
      read: false,
      createdAt: new Date(),
    }));

    // Save notifications to database
    await Notification.insertMany(notifications);

    // Send real-time notifications to admins via socket
    if (io) {
      adminUsers.forEach((admin) => {
        io.to(admin._id.toString()).emit("newTaskCompletionNotification", {
          type: "task_completion",
          message: `${completedByUser.username} has completed the task: "${task.title}"`,
          taskId: task._id,
          taskTitle: task.title,
          taskPriority: task.priority,
          taskDueDate: task.dueDate,
          completedBy: completedByUser.username,
          completedAt: new Date(),
        });
      });
    }
  } catch (error) {
    console.error("Error notifying admins of task completion:", error);
    // Don't throw error to avoid breaking the main operation
  }
};

// Helper function to notify users when admins edit their tasks
const notifyUsersOfTaskEdit = async (task, editedByAdmin, changes) => {
  try {
    // Get all assigned users
    const assignedUsers = await User.find({
      _id: { $in: task.assignedTo },
    });

    if (assignedUsers.length === 0) return;

    // Create a summary of changes
    const changesList = [];
    if (changes.title) changesList.push("title");
    if (changes.description) changesList.push("description");
    if (changes.priority) changesList.push("priority");
    if (changes.dueDate) changesList.push("due date");
    if (changes.checklist) changesList.push("checklist");
    if (changes.attachments) changesList.push("attachments");

    const changesText =
      changesList.length > 0 ? ` (Updated: ${changesList.join(", ")})` : "";

    // Create notifications for all assigned users
    const notifications = assignedUsers.map((user) => ({
      from: editedByAdmin._id,
      to: user._id,
      type: "task_edited",
      message: `Admin ${editedByAdmin.username} has updated your task: "${task.title}"${changesText}`,
      data: {
        taskId: task._id,
        taskTitle: task.title,
        taskPriority: task.priority,
        taskDueDate: task.dueDate,
        editedBy: editedByAdmin.username,
        editedAt: new Date(),
        changes: changesList,
      },
      read: false,
      createdAt: new Date(),
    }));

    // Save notifications to database
    await Notification.insertMany(notifications);

    // Send real-time notifications to users via socket
    if (io) {
      assignedUsers.forEach((user) => {
        io.to(user._id.toString()).emit("newTaskEditNotification", {
          type: "task_edited",
          message: `Admin ${editedByAdmin.username} has updated your task: "${task.title}"${changesText}`,
          taskId: task._id,
          taskTitle: task.title,
          taskPriority: task.priority,
          taskDueDate: task.dueDate,
          editedBy: editedByAdmin.username,
          editedAt: new Date(),
          changes: changesList,
        });
      });
    }
  } catch (error) {
    console.error("Error notifying users of task edit:", error);
    // Don't throw error to avoid breaking the main operation
  }
};

//@desc get all tasks(admin:all,user:only assigned tasks)
//@route GET /api/tasks
//@access Private
// Get Tasks
export const getTasks = async (req, res) => {
  try {
    const { status } = req.query;

    let filter = {};
    if (status && status !== "all") {
      // Map frontend status values to actual database values if needed
      let dbStatus = status;

      // Normalize status values to match database
      if (status === "pending") dbStatus = "pending";
      else if (status === "inprogress") dbStatus = "inprogress";
      else if (status === "done") dbStatus = "done";

      filter.status = dbStatus;
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

    //add completed todocheklist count and progress to each task
    tasks = await Promise.all(
      tasks.map(async (task) => {
        const totalCount = task.todocheklist.length;
        const completedCount = task.todocheklist.filter(
          (item) => item.completed
        ).length;
        const progress =
          totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        // Update task status based on progress
        let newStatus = task.status;
        if (totalCount === 0 || completedCount === 0) {
          newStatus = "pending";
        } else if (completedCount === totalCount) {
          newStatus = "done";
        } else {
          newStatus = "inprogress";
        }

        // Only update the task if status has changed
        if (newStatus !== task.status) {
          await Task.findByIdAndUpdate(task._id, {
            status: newStatus,
            progress: progress,
          });
        }

        return {
          ...task._doc,
          completedTodoCount: completedCount,
          progress,
          status: newStatus,
        };
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

    const responseData = {
      tasks,
      statusSummary: {
        all: allTasks,
        pendingTask,
        inProgressTask,
        completedTask,
      },
    };

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

    // Create notifications for assigned users
    try {
      const assignedUsers = await User.find({
        _id: { $in: assignedToIds },
      });

      const notifications = assignedUsers.map((user) => ({
        from: req.user._id,
        to: user._id,
        type: "task_assignment",
        message: `You have been assigned a new task: "${title}"`,
        data: {
          taskId: task._id,
          taskTitle: title,
          taskPriority: priority,
          taskDueDate: dueDate,
          assignedBy: req.user.username,
        },
        read: false,
        createdAt: new Date(),
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);

        // Send real-time notifications to assigned users via socket
        if (io) {
          assignedUsers.forEach((user) => {
            io.to(user._id.toString()).emit("newTaskAssignmentNotification", {
              type: "task_assignment",
              message: `You have been assigned a new task: "${title}"`,
              taskId: task._id,
              taskTitle: title,
              taskPriority: priority,
              taskDueDate: dueDate,
              assignedBy: req.user.username,
            });
          });
        }
      }
    } catch (notificationError) {
      console.error(
        "Error creating task assignment notifications:",
        notificationError
      );
      // Don't fail the main operation if notification creation fails
    }

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

    // Track changes for notification purposes (only if admin is making changes)
    const isAdminEdit = req.user.role === "REPI" || req.user.role === "CC";
    const changes = {};

    // Detect changes in task fields
    if (req.body.title && req.body.title !== task.title) {
      changes.title = true;
    }
    if (req.body.description && req.body.description !== task.description) {
      changes.description = true;
    }
    if (req.body.priority && req.body.priority !== task.priority) {
      changes.priority = true;
    }
    if (
      req.body.dueDate &&
      new Date(req.body.dueDate).getTime() !== new Date(task.dueDate).getTime()
    ) {
      changes.dueDate = true;
    }

    // Update task fields
    task.title = req.body.title || task.title;
    task.description = req.body.description || task.description;
    task.priority = req.body.priority || task.priority;
    task.dueDate = req.body.dueDate || task.dueDate;

    // Update checklist and recalculate progress
    if (req.body.todocheklist) {
      // Check if checklist has changed
      const oldChecklistLength = task.todocheklist.length;
      const newChecklistLength = req.body.todocheklist.length;
      if (oldChecklistLength !== newChecklistLength) {
        changes.checklist = true;
      } else {
        // Check if checklist items have changed
        const checklistChanged = task.todocheklist.some((item, index) => {
          const newItem = req.body.todocheklist[index];
          return !newItem || item.title !== newItem.title;
        });
        if (checklistChanged) {
          changes.checklist = true;
        }
      }

      task.todocheklist = req.body.todocheklist;
      const completedCount = task.todocheklist.filter(
        (item) => item.completed
      ).length;
      const totalItems = task.todocheklist.length;
      const progress =
        totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;
      task.progress = progress;

      // Update status based on progress
      if (progress === 0) {
        task.status = "pending";
      } else if (progress === 100) {
        task.status = "done";
      } else {
        task.status = "inprogress";
      }
    }

    // Handle attachment updates
    if (req.body.attchments) {
      // Check if attachments have changed
      const oldAttachmentCount = task.attchments.length;
      const newAttachmentCount = req.body.attchments.length;
      if (oldAttachmentCount !== newAttachmentCount) {
        changes.attachments = true;
      }

      // Keep existing attachments and add new ones with proper metadata
      const newAttachments = req.body.attchments.map((attachment) => ({
        ...attachment,
        uploadedBy: req.user._id,
        uploadedAt: new Date(),
      }));
      task.attchments = newAttachments;
    }

    // Handle assignedTo updates and send notifications to newly assigned users
    if (req.body.assignedTo) {
      const oldAssignedTo = task.assignedTo.map((id) => id.toString());
      const newAssignedTo = req.body.assignedTo.map((id) => id.toString());

      // Find newly assigned users (users in new list but not in old list)
      const newlyAssignedUsers = newAssignedTo.filter(
        (userId) => !oldAssignedTo.includes(userId)
      );

      task.assignedTo = req.body.assignedTo;

      // Send notifications to newly assigned users
      if (newlyAssignedUsers.length > 0) {
        try {
          const assignedUsers = await User.find({
            _id: { $in: newlyAssignedUsers },
          });

          const notifications = assignedUsers.map((user) => ({
            from: req.user._id,
            to: user._id,
            type: "task_update",
            message: `You have been assigned to task: "${task.title}"`,
            data: {
              taskId: task._id,
              taskTitle: task.title,
              taskPriority: task.priority,
              taskDueDate: task.dueDate,
              assignedBy: req.user.username,
            },
            read: false,
            createdAt: new Date(),
          }));

          if (notifications.length > 0) {
            await Notification.insertMany(notifications);

            // Send real-time notifications to newly assigned users via socket
            if (io) {
              assignedUsers.forEach((user) => {
                io.to(user._id.toString()).emit(
                  "newTaskAssignmentNotification",
                  {
                    type: "task_update",
                    message: `You have been assigned to task: "${task.title}"`,
                    taskId: task._id,
                    taskTitle: task.title,
                    taskPriority: task.priority,
                    taskDueDate: task.dueDate,
                    assignedBy: req.user.username,
                  }
                );
              });
            }
          }
        } catch (notificationError) {
          console.error(
            "Error creating task update notifications:",
            notificationError
          );
          // Don't fail the main operation if notification creation fails
        }
      }
    }

    const updatedTask = await task.save();

    // Notify assigned users if admin made significant changes
    if (isAdminEdit && Object.keys(changes).length > 0) {
      try {
        await notifyUsersOfTaskEdit(updatedTask, req.user, changes);
      } catch (notificationError) {
        console.error("Error notifying users of task edit:", notificationError);
        // Don't fail the main operation if notification creation fails
      }
    }

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
        task.progress = 100;
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

    // Update progress based on completed checklist items
    const progress =
      totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;
    task.progress = progress;

    // Check if task status is changing to "done" and notify admins
    const wasTaskCompleted = task.status !== "done" && progress === 100;

    // Update status based on progress percentage
    if (progress === 0) {
      task.status = "pending";
    } else if (progress === 100) {
      task.status = "done";
    } else {
      task.status = "inprogress";
    }

    await task.save();

    // Notify admins if task was just completed by a user (not admin)
    if (
      wasTaskCompleted &&
      req.user.role !== "REPI" &&
      req.user.role !== "CC"
    ) {
      await notifyAdminsOfTaskCompletion(task, req.user);
    }
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

//desc update individual checklist item
//@route PATCH /api/tasks/:taskId/checklist/:todoIndex
//@access Private
export const updateChecklistItem = async (req, res) => {
  try {
    const { taskId, todoIndex } = req.params;
    const { completed } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid task ID format" });
    }

    // Validate todoIndex
    const index = parseInt(todoIndex);
    if (isNaN(index) || index < 0) {
      return res.status(400).json({ message: "Invalid todo index" });
    }

    // Validate completed field
    if (typeof completed !== "boolean") {
      return res
        .status(400)
        .json({ message: "Completed field must be a boolean" });
    }

    const task = await Task.findById(taskId).populate(
      "assignedTo",
      "username email profileImg"
    );
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if user is admin, creator, or assigned to the task
    const isAdmin = req.user.role === "REPI" || req.user.role === "CC";
    const isCreator = task.createdBy.toString() === req.user._id.toString();
    const isAssigned = task.assignedTo.some(
      (user) => user._id.toString() === req.user._id.toString()
    );

    if (!isAdmin && !isCreator && !isAssigned) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this task" });
    }

    // Check if todo index exists
    if (index >= task.todocheklist.length) {
      return res.status(400).json({ message: "Todo item not found" });
    }

    // Update the specific todo item
    task.todocheklist[index].completed = completed;

    // Calculate new task status based on checklist completion
    const totalTodos = task.todocheklist.length;
    const completedTodos = task.todocheklist.filter(
      (todo) => todo.completed
    ).length;

    let newStatus = task.status; // Keep current status as default

    // Check if task is being completed by a user
    const wasTaskCompleted =
      task.status !== "done" && completedTodos === totalTodos && totalTodos > 0;

    if (totalTodos > 0) {
      if (completedTodos === 0) {
        newStatus = "pending";
      } else if (completedTodos === totalTodos) {
        newStatus = "done";
      } else {
        newStatus = "inprogress";
      }
    }

    // Update task status if it changed
    task.status = newStatus;

    await task.save();

    // Notify admins if task was just completed by a user (not admin)
    if (
      wasTaskCompleted &&
      req.user.role !== "REPI" &&
      req.user.role !== "CC"
    ) {
      await notifyAdminsOfTaskCompletion(task, req.user);
    }

    // Populate the task for response
    const updatedTask = await Task.findById(taskId).populate(
      "assignedTo",
      "username email profileImg"
    );

    res.status(200).json({
      message: "Checklist item updated successfully",
      task: updatedTask,
      statusChanged: newStatus !== req.body.originalStatus,
    });
  } catch (error) {
    console.error("Error in updateChecklistItem:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

//desc upload user submissions for a task
//@route POST /api/tasks/:taskId/submissions
//@access Private
export const uploadUserSubmissions = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid task ID format" });
    }

    const task = await Task.findById(taskId).populate(
      "assignedTo",
      "username email profileImg"
    );
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if user is admin, creator, or assigned to the task
    const isAdmin = req.user.role === "REPI" || req.user.role === "CC";
    const isCreator = task.createdBy.toString() === req.user._id.toString();
    const isAssigned = task.assignedTo.some(
      (user) => user._id.toString() === req.user._id.toString()
    );

    if (!isAdmin && !isCreator && !isAssigned) {
      return res
        .status(403)
        .json({ message: "Not authorized to upload files to this task" });
    }

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // Process uploaded files
    const submissions = req.files.map((file) => ({
      name: file.originalname,
      type: file.mimetype,
      size: file.size,
      data: file.buffer.toString("base64"),
      uploadedAt: new Date(),
      uploadedBy: req.user._id,
    }));

    // Add submissions to task
    if (!task.userSubmissions) {
      task.userSubmissions = [];
    }
    task.userSubmissions.push(...submissions);

    await task.save();

    // Create notifications for admin users
    try {
      const adminUsers = await User.find({
        role: { $in: ["REPI", "CC"] },
      });

      const notifications = adminUsers.map((admin) => ({
        from: req.user._id,
        to: admin._id,
        type: "file_submission",
        message: `${req.user.username} uploaded ${submissions.length} file(s) to task "${task.title}"`,
        data: {
          taskId: task._id,
          taskTitle: task.title,
          submittedBy: req.user.username,
          fileCount: submissions.length,
          fileNames: submissions.map((sub) => sub.name),
        },
        read: false,
        createdAt: new Date(),
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);

        // Send real-time notifications to admin users via socket
        if (io) {
          adminUsers.forEach((admin) => {
            io.to(admin._id.toString()).emit("newFileSubmissionNotification", {
              type: "file_submission",
              message: `${req.user.username} uploaded ${submissions.length} file(s) to task "${task.title}"`,
              taskId: task._id,
              taskTitle: task.title,
              submittedBy: req.user.username,
              fileCount: submissions.length,
            });
          });
        }
      }
    } catch (notificationError) {
      // Don't fail the main operation if notification creation fails
    }

    // Populate the task for response
    const updatedTask = await Task.findById(taskId).populate(
      "assignedTo",
      "username email profileImg"
    );

    res.status(200).json({
      message: `${submissions.length} file(s) uploaded successfully`,
      task: updatedTask,
      uploadedFiles: submissions.map((sub) => ({
        name: sub.name,
        type: sub.type,
        size: sub.size,
        uploadedAt: sub.uploadedAt,
      })),
    });
  } catch (error) {
    console.error("Error in uploadUserSubmissions:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
