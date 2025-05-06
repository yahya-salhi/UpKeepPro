import express from "express";
import {
  acquireTooling, // PV or M11 Acquisition
  exitTooling, // M11 Exit
  getAllTooling,
  getToolingById,
  updateTooling,
  deleteTooling,
  getToolStock, // Get current stock
  convertPVtoM11, // Convert PV acquisition to M11
  getToolHistory, // Get full history of a tool
  getToolsByDirection, // Filter by direction
  getToolsByType, // Filter by type
} from "../controllers/tooling.controller.js";

const router = express.Router();

// **Acquisition (PV or M11)**
router.post("/acquire", acquireTooling);

// **Exit (M11 only)**
router.post("/:id/exit", exitTooling);

// **PV to M11 Conversion**
router.post("/:id/convert", convertPVtoM11);

// **Retrieve Data**
router.get("/", getAllTooling);
router.get("/:id", getToolingById);
router.get("/:id/stock", getToolStock);
router.get("/:id/history", getToolHistory);
router.get("/direction/:direction", getToolsByDirection);
router.get("/type/:type", getToolsByType);

// **Update & Delete**
router.put("/:id", updateTooling);
router.delete("/:id", deleteTooling);

export default router;
