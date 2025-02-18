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
} from "../controllers/user.controller.js";
import { authorizeAdmin } from "../middleware/authorizeAdmin.js";

const router = express.Router();
router.get("/profile/:username", protect, getUserProfile);
// signup Admin CREATE USER
router.post("/signup", protect, authorizeAdmin, signup);

router.get("/suggested", protect, getAllUsers);
router.post("/follow/:id", protect, followUnFollowUser);

router.post("/update/:id", protect, updateUser);
router.delete("/delete/:id", protect, authorizeAdmin, deleteUser);
router.get("/online", protect, getOnlineUsers);

export default router;
