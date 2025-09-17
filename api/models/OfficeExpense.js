// models/OfficeExpense.js
import mongoose from 'mongoose';

const officeExpenseSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    enum: [
      'Office Rent', 'Camera EMI', 'Driver', 'Cameraman', 'Cleaner',
      'Electricity', 'Internet'
    ]
  },
  description: {
    type: String
  },
  amount: {
    type: Number,
    required: true
  },
  payment_mode: {
    type: String,
    enum: ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Card'],
    required: true
  },
  payment_date: {
    type: Date,
    required: true
  },
  paid_to: {
    type: String,
    required: true
  },
  recurring: {
    type: Boolean,
    default: false
  },
  recurring_type: {
    type: String,
    enum: ['Monthly', 'Quarterly', 'Yearly', 'One-Time'],
    default: 'One-Time'
  },
  billing_month: {
    type: String // e.g. "June 2025"
  },
  due_date: {
    type: Date
  },
  receipt_attachment: {
    type: String // Store file path or filename
  },
  expense_category: {
    type: String,
    enum: [
      'Rent', 'EMI', 'Personnel', 'Maintenance',
      'Utilities', 'Travel', 'Office Supplies', 'Miscellaneous'
    ],
    required: true
  },
  approved_by: {
    type: String
  },
  created_by: {
    type: String
  }
}, {
  timestamps: true
});

const OfficeExpense = mongoose.model('OfficeExpense', officeExpenseSchema);
export default OfficeExpense;
