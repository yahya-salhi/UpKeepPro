import express from "express";
import { protect } from "../middleware/protect.js";
import { authorizeAdmin } from "../middleware/authorizeAdmin.js";

import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getDashboardData,
  getUserDashboardData,
  getTaskById,
  updateTaskStatus,
  updateTaskChecklist,
  updateChecklistItem,
} from "../controllers/tasks.controller.js";

const router = express.Router();
router.get("/dashboard-data", protect, getDashboardData);
router.get("/user-dashborad-data", protect, getUserDashboardData);
router.get("/", protect, getTasks);
router.get("/:id", protect, getTaskById);
router.post("/", protect, authorizeAdmin, createTask);
router.put("/:id", protect, updateTask);
router.delete("/:id", protect, authorizeAdmin, deleteTask);
router.put("/:id/status", protect, updateTaskStatus); // This is correct
router.put("/:id/todo", protect, updateTaskChecklist);
router.patch("/:taskId/checklist/:todoIndex", protect, updateChecklistItem);

export default router;
