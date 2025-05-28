import express from "express";
import multer from "multer";
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
  uploadUserSubmissions,
} from "../controllers/tasks.controller.js";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_, __, cb) => {
    // Allow all file types for now, but you can add restrictions here
    cb(null, true);
  },
});

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
router.post(
  "/:taskId/submissions",
  protect,
  upload.array("files", 10),
  uploadUserSubmissions
);

export default router;
