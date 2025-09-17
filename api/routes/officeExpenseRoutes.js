import express from "express";
import {
  createExpense,
  updateExpense,
  getAllExpenses,
  getExpenseById,
  deleteExpense,
} from "../controllers/officeExpenseController.js";

import upload from "../config/multer.js";

const router = express.Router();

// Only one file field for receipt
const uploadFields = upload.fields([{ name: "receipt_attachment", maxCount: 1 }]);

router.post("/create", uploadFields, createExpense);
router.put("/update/:id", uploadFields, updateExpense);
router.get("/", getAllExpenses);
router.get("/:id", getExpenseById);
router.delete("/delete/:id", deleteExpense);

export default router;
