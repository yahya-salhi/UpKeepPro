import express from "express";
import { protect } from "../middleware/protect.js";
import {
  getUsersForSidebar,
  getMessages,
  sendMessage,
} from "../controllers/message.controller.js";
const router = express.Router();

router.get("/users", protect, getUsersForSidebar);
router.get("/:id", protect, getMessages);
router.post("/send/:id", protect, sendMessage);

export default router;
