import express from "express";
import {
  login,
  signup,
  logout,
  getMe,
} from "../controllers/auth.controller.js";
import { authorizeAdmin } from "../middleware/authorizeAdmin.js";
import { protect } from "../middleware/protect.js";

const router = express.Router();

// signup Admin
router.post("/signup", protect, authorizeAdmin, signup);
// login Admin
router.post("/login", login);
// lougout
router.post("/logout", logout);
//get me
router.get("/me", protect, getMe);

export default router;
