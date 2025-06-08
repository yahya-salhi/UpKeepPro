import express from "express";
import { protect } from "../middleware/protect.js";
import { authorizeFormateur } from "../middleware/authorizeFormateur.js";
import {
  authorizeStagiaire,
  authorizeStagiaireOrFormateur,
} from "../middleware/authorizeStagiaire.js";
import {
  createTest,
  getTests,
  getTestById,
  updateTest,
  deleteTest,
  bulkDeleteTests,
  publishTest,
} from "../controllers/test.controller.js";
import {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} from "../controllers/question.controller.js";
import {
  startTestAttempt,
  getTestQuestions,
  submitAnswer,
  completeTestAttempt,
  getMyTestResults,
  getTestAttemptResult,
  getFormateurTestResults,
} from "../controllers/testAttempt.controller.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Results Routes - MUST BE BEFORE /:id routes
router.get("/my-results", authorizeStagiaire, getMyTestResults); // Only stagiaires can view their results
router.get("/formateur-results", authorizeFormateur, getFormateurTestResults); // Only formateurs can view all results

// Question Management Routes (Formateurs and Admins only) - MUST BE BEFORE /:id routes
router.post("/questions", authorizeFormateur, createQuestion);
router.get("/questions", authorizeFormateur, getQuestions);
router.get("/questions/:id", getQuestionById);
router.put("/questions/:id", authorizeFormateur, updateQuestion);
router.delete("/questions/:id", authorizeFormateur, deleteQuestion);

// Test Taking Routes (Stagiaires only) - MUST BE BEFORE /:id routes
router.post("/attempts/start/:testId", authorizeStagiaire, startTestAttempt);
router.get(
  "/attempts/:attemptId/questions",
  authorizeStagiaire,
  getTestQuestions
);
router.post("/attempts/:attemptId/answer", authorizeStagiaire, submitAnswer);
router.post(
  "/attempts/:attemptId/complete",
  authorizeStagiaire,
  completeTestAttempt
);
router.get(
  "/attempts/:attemptId",
  authorizeStagiaireOrFormateur,
  getTestAttemptResult
);

// Test Management Routes (Formateurs and Admins only) - /:id routes MUST BE LAST
router.post("/", authorizeFormateur, createTest);
router.get("/", getTests);
router.delete("/bulk", authorizeFormateur, bulkDeleteTests); // Bulk delete route BEFORE /:id
router.get("/:id", getTestById);
router.put("/:id", authorizeFormateur, updateTest);
router.delete("/:id", authorizeFormateur, deleteTest);
router.patch("/:id/publish", authorizeFormateur, publishTest);

export default router;
