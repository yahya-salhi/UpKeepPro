import express from "express";
import { authorizeAdmin } from "../middleware/authorizeAdmin.js";
import { protect } from "../middleware/protect.js";
import {
  exportTasksReport,
  exportUsersReport,
} from "../controllers/reportsTask.controller.js";

const router = express.Router();
router.get("/export/tasks", protect, authorizeAdmin, exportTasksReport); //EXPORT ALL TASKS AS EXCEL PDF
router.get("/export/users", protect, authorizeAdmin, exportUsersReport); //EXPORT USER-TASK REPORT

export default router;
