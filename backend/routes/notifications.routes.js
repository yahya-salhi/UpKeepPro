import express from "express";

import { protect } from "../middleware/protect.js";
import {
  getNotifications,
  deleteNotifications,
  getUnreadNotifications,
  markNotificationsAsRead,
} from "../controllers/notification.controller.js";

const router = express.Router();
router.get("/", protect, getNotifications);
router.delete("/", protect, deleteNotifications);
router.get("/unread", protect, getUnreadNotifications);
router.put("/read", protect, markNotificationsAsRead);

export default router;
