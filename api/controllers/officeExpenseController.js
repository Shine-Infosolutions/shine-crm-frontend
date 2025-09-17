// controllers/officeExpenseController.js
import OfficeExpense from "../models/OfficeExpense.js";

// Create new expense
export const createExpense = async (req, res) => {
  try {
    const expenseData = req.body;

    // Handle file upload correctly for upload.fields
    if (req.files?.receipt_attachment?.[0]) {
      expenseData.receipt_attachment = req.files.receipt_attachment[0].filename;
    }

    const newExpense = new OfficeExpense(expenseData);
    await newExpense.save();

    res.status(201).json({ success: true, data: newExpense });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get all expenses
export const getAllExpenses = async (req, res) => {
  try {
    const expenses = await OfficeExpense.find().sort({ payment_date: -1 });
    res.status(200).json({ success: true, data: expenses });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get expense by ID
export const getExpenseById = async (req, res) => {
  try {
    const expense = await OfficeExpense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    res.status(200).json({ success: true, data: expense });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update expense
export const updateExpense = async (req, res) => {
  try {
    const updatedData = req.body;

    if (req.files?.receipt_attachment?.[0]) {
      updatedData.receipt_attachment = req.files.receipt_attachment[0].filename;
    }

    const updated = await OfficeExpense.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
    });

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete expense
export const deleteExpense = async (req, res) => {
  try {
    await OfficeExpense.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
