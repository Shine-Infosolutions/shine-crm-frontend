import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  assigned_to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  },
  assigned_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  due_date: {
    type: Date
  },
  completed_at: {
    type: Date
  }
}, {
  timestamps: true
});

const Task = mongoose.model("Task", taskSchema);

export default Task;