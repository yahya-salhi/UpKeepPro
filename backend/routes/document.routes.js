import express from "express";
import {
  createDocument,
  getAllDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  getDocumentHistory,
  shareDocument,
  getDocumentsByCategory,
  searchDocuments,
  archiveDocument,
  publishDocument,
} from "../controllers/document.controller.js";
import { protect } from "../middleware/protect.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Document CRUD Operations
router.post("/", createDocument);
router.get("/", getAllDocuments);
router.get("/:id", getDocumentById);
router.put("/:id", updateDocument);
router.delete("/:id", deleteDocument);

// Document Version Control
router.get("/:id/history", getDocumentHistory);

// Document Sharing
router.post("/:id/share", shareDocument);

// Document Management
router.get("/category/:category", getDocumentsByCategory);
router.get("/search", searchDocuments);
router.put("/:id/archive", archiveDocument);
router.put("/:id/publish", publishDocument);

export default router;
