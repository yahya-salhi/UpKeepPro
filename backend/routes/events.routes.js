import express from "express";
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../controllers/events.controller.js"; // Import all controller functions

const router = express.Router();

// GET /api/events
router.get("/", getEvents);

// GET /api/events/:id
router.get("/:id", getEventById);

// POST /api/events
router.post("/", createEvent);

// PUT /api/events/:id
router.put("/:id", updateEvent);

// DELETE /api/events/:id
router.delete("/:id", deleteEvent);

export default router;
