import express from "express";

import { protect } from "../middleware/protect.js";
import {
  getNotifications,
  deleteNotifications,
} from "../controllers/notification.controller.js";

const router = express.Router();
router.get("/", protect, getNotifications);
router.delete("/", protect, deleteNotifications);

export default router;
