import express from "express";
import { login, signup, logout } from "../controllers/auth.controller.js";

const router = express.Router();

// signup Admin
router.post("/signup", signup);

// login Admin
router.post("/login", login);

// lougout
router.post("/logout", logout);

export default router;
