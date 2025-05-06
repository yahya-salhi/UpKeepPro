import express from "express";
import {
  sendMessage,
  getChatHistory,
} from "../controllers/chatbot.controller.js";

const router = express.Router();

// Route to send a message to the AI model
router.post("/send-message", sendMessage);

// Route to get chat history
router.get("/history", getChatHistory);

export default router;
