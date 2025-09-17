import express from "express";
const router = express.Router();

import {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  getNextInvoiceNumber,
} from "../controllers/InvoiceController.js";

router.post("/create", createInvoice);
router.get("/all", getAllInvoices);
router.get("/mono/:id", getInvoiceById);
router.put("/update/:id", updateInvoice);
router.delete("/delete/:id", deleteInvoice);
router.get("/next-invoice-number", getNextInvoiceNumber);

export default router;
