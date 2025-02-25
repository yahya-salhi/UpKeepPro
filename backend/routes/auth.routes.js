import express from "express";
import { login, logout, getMe } from "../controllers/auth.controller.js";
import { protect } from "../middleware/protect.js";

const router = express.Router();

// login Admin&
router.post("/login", login);
// lougout
router.post("/logout", protect, logout);
//get me
router.get("/me", protect, getMe);

export default router;
