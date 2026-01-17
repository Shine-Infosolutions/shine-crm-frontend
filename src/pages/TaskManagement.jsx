import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

import api from '../utils/axiosConfig';
function TaskManagement() {
  const { currentUser, API_URL } = useAppContext();
  const [tasks, setTasks] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('assigned');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  useEffect(() => {
    if (currentUser?._id) {
      loadTasks();
    }
  }, [currentUser?._id, activeTab]);

  // Add visibility change listener to refresh tasks when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && currentUser?._id) {
        loadTasks();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [currentUser?._id, activeTab]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      if (activeTab === 'assigned') {
        const response = await api.get(`/api/tasks/employee/${currentUser?._id}`);
        if (response.status === 200) {
          const data = response.data;
          const taskList = data.tasks || data.data || [];
          setTasks(Array.isArray(taskList) ? taskList : []);
        } else {
          setTasks([]);
        }
      } else {
        const response = await api.get('/api/tasks/available');
        if (response.status === 200) {
          const data = response.data;
          const taskList = data.tasks || data.data || [];
          setAvailableTasks(Array.isArray(taskList) ? taskList : []);
        } else {
          setAvailableTasks([]);
        }
      }
    } catch (error) {
      toast.error('Error loading tasks');
    }
    setLoading(false);
  };

  const takeTask = async (taskId) => {
    try {
      const response = await api.patch(`/api/tasks/${taskId}/take`, {
        employee_id: currentUser?._id
      });
      
      toast.success('Task taken successfully');
      await loadTasks();
      if (activeTab === 'available') {
        const assignedResponse = await api.get(`/api/tasks/employee/${currentUser?._id}`);
        if (assignedResponse.status === 200) {
          const assignedData = assignedResponse.data;
          const assignedList = assignedData.tasks || assignedData.data || [];
          setTasks(Array.isArray(assignedList) ? assignedList : []);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to take task');
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      await api.patch(`/api/tasks/${taskId}/status`, { status });
      toast.success(`Task marked as ${status}`);
      loadTasks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update task status');
    }
  };

  const updateTaskProgress = async (taskId, progress, notes, timeSpent) => {
    try {
      await api.patch(`/api/tasks/${taskId}/progress`, {
        progress,
        notes,
        time_spent: timeSpent
      });
      toast.success('Task progress updated');
      loadTasks();
      setShowProgressModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update progress');
    }
  };

  const updateDailySummary = async (taskId, summaryNotes, isCompleted) => {
    try {
      await api.patch(`/api/tasks/${taskId}/daily-summary`, {
        summary_notes: summaryNotes,
        is_completed: isCompleted
      });
      toast.success('Daily summary updated');
      loadTasks();
      setShowSummaryModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update summary');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'On Hold': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-600 dark:text-red-400';
      case 'Medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'Low': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Task Management</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your tasks and track progress</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('assigned')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'assigned'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              My Tasks
            </button>
            <button
              onClick={() => setActiveTab('available')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'available'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Available Tasks
            </button>
          </nav>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading tasks...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {activeTab === 'assigned' ? (
              tasks.length > 0 ? (
                tasks.map((task) => (
                  <div key={task._id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{task.title}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                          <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority} Priority
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">{task.description}</p>
                        {task.due_date && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </p>
                        )}
                        {task.progress !== undefined && (
                          <div className="mb-3">
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                              <span>Progress</span>
                              <span>{task.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${task.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col space-y-2 ml-4">
                        {task.status !== 'Completed' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedTask(task);
                                setShowProgressModal(true);
                              }}
                              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                            >
                              Update Progress
                            </button>
                            <button
                              onClick={() => updateTaskStatus(task._id, 'Completed')}
                              className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                            >
                              Mark Complete
                            </button>
                            <button
                              onClick={() => {
                                setSelectedTask(task);
                                setShowSummaryModal(true);
                              }}
                              className="px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600"
                            >
                              Daily Summary
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-600 dark:text-gray-400">No assigned tasks found</p>
                </div>
              )
            ) : (
              availableTasks.length > 0 ? (
                availableTasks.map((task) => (
                  <div key={task._id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{task.title}</h3>
                          <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority} Priority
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">{task.description}</p>
                        {task.due_date && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => takeTask(task._id)}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Take Task
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-600 dark:text-gray-400">No available tasks found</p>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Progress Modal */}
      {showProgressModal && selectedTask && (
        <ProgressModal
          task={selectedTask}
          onClose={() => setShowProgressModal(false)}
          onUpdate={updateTaskProgress}
        />
      )}

      {/* Summary Modal */}
      {showSummaryModal && selectedTask && (
        <SummaryModal
          task={selectedTask}
          onClose={() => setShowSummaryModal(false)}
          onUpdate={updateDailySummary}
        />
      )}
    </div>
  );
}

// Progress Modal Component
function ProgressModal({ task, onClose, onUpdate }) {
  const [progress, setProgress] = useState(task.progress || 0);
  const [notes, setNotes] = useState('');
  const [timeSpent, setTimeSpent] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(task._id, progress, notes, timeSpent);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Update Progress</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Progress ({progress}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows="3"
              placeholder="Progress notes..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Time Spent (minutes)
            </label>
            <input
              type="number"
              value={timeSpent}
              onChange={(e) => setTimeSpent(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              min="0"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Summary Modal Component
function SummaryModal({ task, onClose, onUpdate }) {
  const [summaryNotes, setSummaryNotes] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(task._id, summaryNotes, isCompleted);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Daily Summary</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Summary Notes
            </label>
            <textarea
              value={summaryNotes}
              onChange={(e) => setSummaryNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows="4"
              placeholder="Describe what you accomplished today..."
              required
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isCompleted"
              checked={isCompleted}
              onChange={(e) => setIsCompleted(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="isCompleted" className="text-sm text-gray-700 dark:text-gray-300">
              Mark as completed for today
            </label>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Save Summary
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskManagement;
