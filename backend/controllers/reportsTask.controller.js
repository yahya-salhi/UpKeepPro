import { inplaceeditor } from "@syncfusion/ej2";
import Task from "../models/task.modal.js";
import User from "../models/user.modal.js";
import excelJs from "exceljs";

//@desc export all tasks as excel file
//@route GET /api/reportsTask/export/tasks
//@access private/admin only

export const exportTasksReport = async (req, res) => {
  try {
    const tasks = await Task.find().populate("assignedTo", "name email");
    const workbook = new excelJs.Workbook();
    const worksheet = workbook.addWorksheet("Tasks Report");
    worksheet.columns = [
      { header: "Task ID", key: "_id", width: 25 },
      { header: "Title", key: "title", width: 30 },
      { header: "Description", key: "description", width: 50 },
      { header: "Priority", key: "priority", width: 15 },
      { header: "Status", key: "status", width: 20 },
      { header: "Due Date", key: "dueDate", width: 20 },
      { header: "Assigned To", key: "assignedTo.name", width: 30 },
    ];
    tasks.forEach((task) => {
      const assignedTo = task.assignedTo
        .map((user) => `${user.name} (${user.email})`)
        .join(", ")
        .join(", ");
      worksheet.addRow({
        _id: task._id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate.toLocaleDateString().split("T")[0],
        assignedTo: assignedTo || "Unassigned",
      });
    });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=tasks_report_${Date.now()}.xlsx`
    );
    return workbook.xlsx.write(res).then(() => {
      res.status(200).end();
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc export user-task report as excel file
//@route GET /api/reportsTask/export/users
//@access private/admin only

export const exportUsersReport = async (req, res) => {
  try {
    const users = await User.find().select("name email_id").lean();
    const userTasks = await Task.find().populate("assignedTo", "name email_id");
    const userTaskMap = {};
    users.forEach((user) => {
      userTaskMap[user._id] = {
        name: user.name,
        email: user.email,
        taskCount: 0,
        pendingTasks: 0,
        inplaceeditor: 0,
        completedTasks: 0,
      };
    });
    userTasks.forEach((task) => {
      if (task.assignedTo) {
        task.assignedTo.forEach((assignedUser) => {
          if (userTaskMap[assignedUser._id]) {
            userTaskMap[assignedUser._id].taskCount += 1;
            if (task.status === "Pending") {
              userTaskMap[assignedUser._id].pendingTasks += 1;
            } else if (task.status === "inProgress") {
              userTaskMap[assignedUser._id].inProgressTasks += 1;
            } else if (task.status === "Completed") {
              userTaskMap[assignedUser._id].completedTasks += 1;
            }
          }
        });
      }
    });

    const workbook = new excelJs.Workbook();
    const worksheet = workbook.addWorksheet("Users  Task Report");
    worksheet.columns = [
      { header: " User Name", key: "name", width: 30 },
      { header: "Email", key: "email", width: 40 },
      { header: "Total assigned Tasks", key: "taskCount", width: 20 },
      { header: "Pending Tasks", key: "pendingTasks", width: 20 },
      { header: "In Progress Tasks", key: "inProgressTasks", width: 20 },
      { header: "Completed Tasks", key: "completedTasks", width: 20 },
    ];
    Object.values(userTaskMap).forEach((user) => {
      worksheet.addRow(user);
    });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=users_report_${Date.now()}.xlsx`
    );
    return workbook.xlsx.write(res).then(() => {
      res.status(200).end();
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
