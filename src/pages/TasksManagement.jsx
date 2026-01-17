import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Pagination from "../components/Pagination";
import api from '../utils/axiosConfig';
function TasksManagement() {
  const { currentUser, API_URL } = useAppContext();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0, limit: 10 });
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assigned_to: "",
    priority: "Medium",
    due_date: "",
  });
  const isAdmin = currentUser?.role !== "employee";

  useEffect(() => {
    
    if (currentUser?._id || currentUser?.id) {
      if (isAdmin) {
        loadEmployees();
        loadTasks();
      } else {
        loadMyTasks();
      }
    } else {
    }
  }, [currentUser, isAdmin, currentPage]);

  // Add visibility change listener to refresh tasks when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && (currentUser?._id || currentUser?.id)) {
        if (isAdmin) {
          loadTasks();
        } else {
          loadMyTasks();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [currentUser, isAdmin, currentPage]);

  const loadEmployees = async () => {
    try {
      const response = await api.get('/api/employees');
      
      if (response.status === 200) {
        const data = response.data;
        setEmployees(data.data || []);
      } else {
        setEmployees([]);
      }
    } catch (error) {
      setEmployees([]);
    }
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/tasks?page=${currentPage}&limit=10`);
      
      if (response.status === 200) {
        const data = response.data;
        if (data.success) {
          setTasks(data.data || []);
          setPagination(data.pagination || { total: 0, pages: 0, limit: 10 });
        } else {
          const taskList = data.data || data.tasks || [];
          setTasks(Array.isArray(taskList) ? taskList : []);
        }
      } else {
        setTasks([]);
      }
    } catch (error) {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMyTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/tasks/employee/${currentUser._id || currentUser.id}?page=${currentPage}&limit=10`);
      
      if (response.status === 200) {
        const data = response.data;
        if (data.success) {
          setTasks(data.data || []);
          setPagination(data.pagination || { total: 0, pages: 0, limit: 10 });
        } else {
          const taskList = data.data || data.tasks || [];
          setTasks(Array.isArray(taskList) ? taskList : []);
        }
      } else {
        setTasks([]);
      }
    } catch (error) {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      const response = await fetch(`${API_URL}/api/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || "Task status updated!");
        if (isAdmin) {
          loadTasks();
        } else {
          loadMyTasks();
        }
      } else {
        const data = await response.json();
        alert(data.message || "Failed to update task status");
      }
    } catch (error) {
      alert("Error updating task status");
    }
  };

  const updateTask = async (taskId, taskData) => {
    try {
      const response = await fetch(`${API_URL}/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser._id || currentUser.id,
          ...taskData
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || "Task updated successfully!");
        setEditingTask(null);
        setShowForm(false);
        setFormData({
          title: "",
          description: "",
          assigned_to: "",
          priority: "Medium",
          due_date: ""
        });
        loadTasks();
      } else {
        const data = await response.json();
        alert(data.message || "Failed to update task");
      }
    } catch (error) {
      alert("Error updating task");
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      assigned_to: task.assigned_to._id || task.assigned_to,
      priority: task.priority,
      due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : ''
    });
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setFormData({
      title: "",
      description: "",
      assigned_to: "",
      priority: "Medium",
      due_date: ""
    });
    setShowForm(false);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      assigned_to: "",
      priority: "Medium",
      due_date: ""
    });
    setEditingTask(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (editingTask) {
        // Update existing task
        await updateTask(editingTask._id, formData);
      } else {
        // Create new task
        const response = await fetch(`${API_URL}/api/tasks/assign`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            assigned_by: currentUser._id || currentUser.id
          }),
        });

        if (response.ok) {
          const data = await response.json();
          alert(data.message || "Task assigned successfully!");
          setFormData({
            title: "",
            description: "",
            assigned_to: "",
            priority: "Medium",
            due_date: ""
          });
          setShowForm(false);
          loadTasks();
        } else {
          const data = await response.json();
          alert(data.message || "Failed to assign task");
        }
      }
    } catch (error) {
      alert("Error with task. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isAdmin ? "Tasks Management" : "My Tasks"}
        </h2>
        <div className="flex space-x-2">
          {isAdmin && (
            <>
              <button
                onClick={() => isAdmin ? loadTasks() : loadMyTasks()}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
              <button
                onClick={() => showForm ? handleCancelEdit() : (resetForm(), setShowForm(true))}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {showForm ? "Cancel" : "Assign New Task"}
              </button>
            </>
          )}
        </div>
      </div>

      {isAdmin && showForm && (
        <div className="mb-6 bg-blue-gray-200/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-lg shadow-md p-6 border border-white/20 dark:border-gray-700/50">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {editingTask ? "Edit Task" : "Assign New Task"}
          </h3>
          <motion.form 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit} 
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Task Title
              </label>
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <motion.textarea
                whileFocus={{ scale: 1.02 }}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows="3"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Assign To ({employees.length} employees loaded)
                </label>
                <select
                  value={formData.assigned_to}
                  onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}
                  className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp._id || emp.id} value={emp._id || emp.id}>
                      {emp.name || emp.username || emp.email || 'Unknown Employee'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                  className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? (editingTask ? "Updating..." : "Assigning...") : (editingTask ? "Update Task" : "Assign Task")}
            </button>
          </motion.form>
        </div>
      )}

      <div className="bg-blue-gray-200/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-lg shadow-md border border-white/20 dark:border-gray-700/50">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isAdmin ? "All Tasks" : "My Assigned Tasks"}
          </h3>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center">Loading...</div>
          ) : tasks.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 dark:bg-gray-700">
                  <th className="text-left py-3 px-4">Title</th>
                  {isAdmin && <th className="text-left py-3 px-4">Assigned To</th>}
                  <th className="text-left py-3 px-4">Priority</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Due Date</th>
                  {isAdmin && <th className="text-left py-3 px-4">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task._id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4 font-medium">
                      {isAdmin ? (
                        <button
                          onClick={() => setSelectedTask(task)}
                          className="text-blue-600 hover:text-blue-800 hover:underline text-left"
                        >
                          {task.title}
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedTask(task)}
                          className="text-blue-600 hover:text-blue-800 hover:underline text-left"
                        >
                          {task.title}
                        </button>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{task.assigned_to?.name || task.assigned_to?.email || 'Unassigned'}</div>
                          {task.taken_at && (
                            <div className="text-xs text-gray-500">
                              Taken: {new Date(task.taken_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        task.priority === 'High' ? 'bg-red-100 text-red-800' :
                        task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        task.status === 'Available' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status || 'Available'}
                      </span>
                    </td>
                    <td className="py-3 px-4">{new Date(task.due_date).toLocaleDateString()}</td>
                    {isAdmin && (
                      <td className="py-3 px-4">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleEditTask(task)}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => loadTasks()}
                            className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                          >
                            Refresh
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-gray-500">No tasks found</div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {!loading && pagination.pages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.pages}
            onPageChange={setCurrentPage}
            itemsPerPage={pagination.limit}
            totalItems={pagination.total}
          />
        </div>
      )}

      {/* Task Detail Modal - For Employees */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-blue-gray-200/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-white/20 dark:border-gray-700/50">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Task Details
                </h3>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">{selectedTask.title}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{selectedTask.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Priority
                    </label>
                    <span className={`px-2 py-1 rounded text-xs ${
                      selectedTask.priority === 'High' ? 'bg-red-100 text-red-800' :
                      selectedTask.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {selectedTask.priority}
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <span className={`px-2 py-1 rounded text-xs ${
                      selectedTask.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      selectedTask.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedTask.status || 'Pending'}
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Due Date
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(selectedTask.due_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {selectedTask.assigned_by && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Assigned By
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedTask.assigned_by?.name || 'Unknown'}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TasksManagement;
