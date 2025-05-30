import express from "express";
import { protect } from "../middleware/protect.js";
import {
  getUserProfile,
  signup,
  deleteUser,
  updateUser,
  getAllUsers,
  getOnlineUsers,
  followUnFollowUser,
  getUserCount,
  getUsers,
  getUsersTasks,
  getUserTaskById,
  getUserStats,
} from "../controllers/user.controller.js";
import { authorizeAdmin } from "../middleware/authorizeAdmin.js";

const router = express.Router();
router.get("/profile/:username", protect, getUserProfile);
// signup Admin CREATE USER
router.post("/signup", protect, authorizeAdmin, signup);

router.get("/suggested", protect, getAllUsers);
router.post("/follow/:id", protect, followUnFollowUser);

router.post("/update", protect, updateUser);
router.delete("/delete/:id", protect, authorizeAdmin, deleteUser);
router.get("/online", protect, getOnlineUsers);
router.get("/count", protect, getUserCount);
router.get("/all", protect, getUsers);
router.get("/users-tasks", protect, authorizeAdmin, getUsersTasks);
router.get("/stats", protect, getUserStats);
router.get("/:id", protect, getUserTaskById);

export default router;
