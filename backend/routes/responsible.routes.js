import express from "express";
import {
  createResponsible,
  getAllResponsibles,
} from "../controllers/responsible.controller.js";

const router = express.Router();

router.post("/", createResponsible);
router.get("/", getAllResponsibles);

export default router;
