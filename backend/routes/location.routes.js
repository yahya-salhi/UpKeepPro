import express from "express";
import {
  createLocation,
  getAllLocations,
} from "../controllers/location.controller.js";

const router = express.Router();

router.post("/", createLocation);
router.get("/", getAllLocations);

export default router;
