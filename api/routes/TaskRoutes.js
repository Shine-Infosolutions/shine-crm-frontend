import express from "express";
import {
  getPresentEmployees,
  assignTask,
  getTasks,
  getTask,
  updateTask,
  updateTaskStatus
} from "../controllers/TaskController.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

// Task routes
router.get("/present-employees", getPresentEmployees);
router.post("/assign", assignTask);
router.get("/", getTasks);
router.get("/:id", getTask);
router.put("/:id", adminAuth, updateTask);
router.patch("/:id/status", updateTaskStatus);

export default router;