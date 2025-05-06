import express from "express";

import { protect } from "../middleware/protect.js";
import {
  getMessageNotifications,
  deleteMessageNotifications,
  getUnreadMessageNotifications,
  markMessageNotificationsAsRead,
} from "../controllers/messagenotification.controller.js";

const router = express.Router();
router.get("/", protect, getMessageNotifications);
router.delete("/", protect, deleteMessageNotifications);
router.get("/unread", protect, getUnreadMessageNotifications);
router.put("/read", protect, markMessageNotificationsAsRead);

export default router;
