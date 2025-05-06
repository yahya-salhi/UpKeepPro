import express from "express";
import {
  createPlacement,
  getAllPlacements,
} from "../controllers/placement.contoller.js";

const router = express.Router();

router.post("/", createPlacement);
router.get("/", getAllPlacements);

export default router;
