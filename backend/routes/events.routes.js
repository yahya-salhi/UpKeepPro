import express from "express";
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../controllers/events.controller.js"; // Import all controller functions
import { protect } from "../middleware/protect.js";

const router = express.Router();

// GET /api/events
router.get("/", protect, getEvents);

// GET /api/events/:id
router.get("/:id", protect, getEventById);

// POST /api/events
router.post("/", protect, createEvent);

// PUT /api/events/:id
router.put("/:id", protect, updateEvent);

// DELETE /api/events/:id
router.delete("/:id", protect, deleteEvent);

export default router;
