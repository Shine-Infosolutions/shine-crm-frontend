import Task from '../models/Task.js';
import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';

// Get present employees
export const getPresentEmployees = async (req, res) => {
  try {
    const today = new Date().setHours(0, 0, 0, 0);
    
    const presentAttendance = await Attendance.find({
      date: today,
      status: 'Present'
    }).populate('employee_id', 'name employee_id');

    res.status(200).json({
      success: true,
      data: presentAttendance.map(att => att.employee_id)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Assign task to employee
export const assignTask = async (req, res) => {
  try {
    const { title, description, assigned_to, assigned_by, priority, due_date } = req.body;

    // Check if employee exists
    const employee = await Employee.findById(assigned_to);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const task = new Task({
      title,
      description,
      assigned_to,
      assigned_by,
      priority,
      due_date
    });

    await task.save();
    await task.populate(['assigned_to', 'assigned_by']);

    res.status(201).json({
      success: true,
      data: task,
      message: 'Task assigned successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get tasks
export const getTasks = async (req, res) => {
  try {
    const { employee_id, status } = req.query;
    let filter = {};

    if (employee_id) filter.assigned_to = employee_id;
    if (status) filter.status = status;

    const tasks = await Task.find(filter)
      .populate('assigned_to', 'name employee_id')
      .populate('assigned_by', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single task
export const getTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    const task = await Task.findById(id)
      .populate('assigned_to', 'name employee_id')
      .populate('assigned_by', 'name');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update task
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, assigned_to, priority, due_date } = req.body;

    // Check if employee exists when updating assigned_to
    if (assigned_to) {
      const employee = await Employee.findById(assigned_to);
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }
    }

    const task = await Task.findByIdAndUpdate(
      id,
      { title, description, assigned_to, priority, due_date },
      { new: true, runValidators: true }
    ).populate(['assigned_to', 'assigned_by']);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      data: task,
      message: 'Task updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update task status
export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updateData = { status };
    if (status === 'Completed') {
      updateData.completed_at = new Date();
    }

    const task = await Task.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate(['assigned_to', 'assigned_by']);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      data: task,
      message: 'Task status updated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};