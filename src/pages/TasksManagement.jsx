import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

function TasksManagement() {
  const { currentUser, API_URL } = useAppContext();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assigned_to: "",
    priority: "Medium",
    due_date: "",
  });
  const isAdmin = currentUser?.role !== "employee";

  useEffect(() => {
    console.log("TasksManagement useEffect triggered");
    console.log("currentUser:", currentUser);
    console.log("isAdmin:", isAdmin);
    
    if (currentUser?._id || currentUser?.id) {
      console.log("User ID exists, proceeding...");
      if (isAdmin) {
        console.log("User is admin, loading employees and tasks");
        loadEmployees();
        loadTasks();
      } else {
        console.log("User is employee, loading my tasks");
        loadMyTasks();
      }
    } else {
      console.log("No user ID found");
    }
  }, [currentUser, isAdmin]);

  const loadEmployees = async () => {
    try {
      console.log("API_URL:", API_URL);
      console.log("Loading employees from:", `${API_URL}/api/employees`);
      const response = await fetch(`${API_URL}/api/employees`);
      console.log("Employee response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Employee response data:", data);
        console.log("Employees array:", data.data);
        setEmployees(data.data || []);
      } else {
        const errorText = await response.text();
        console.error("Failed to load employees:", response.status, errorText);
        setEmployees([]);
      }
    } catch (error) {
      console.error("Error loading employees:", error);
      setEmployees([]);
    }
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/tasks`);
      
      if (response.ok) {
        const data = await response.json();
        setTasks(data.data || []);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMyTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/tasks?employee_id=${currentUser._id || currentUser.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setTasks(data.data || []);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error("Error loading my tasks:", error);
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
      console.error("Error updating task status:", error);
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
      console.error("Error updating task:", error);
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

        const data = await response.json();
        
        if (response.ok) {
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
          alert(data.message || "Failed to assign task");
        }
      }
    } catch (error) {
      console.error("Error with task:", error);
      alert("Error with task. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isAdmin ? "Tasks Management" : "My Tasks"}
        </h2>
        {isAdmin && (
          <button
            onClick={() => showForm ? handleCancelEdit() : (resetForm(), setShowForm(true))}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {showForm ? "Cancel" : "Assign New Task"}
          </button>
        )}
      </div>

      {isAdmin && showForm && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {editingTask ? "Edit Task" : "Assign New Task"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Task Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
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
                        task.title
                      ) : (
                        <button
                          onClick={() => setSelectedTask(task)}
                          className="text-blue-600 hover:text-blue-800 hover:underline text-left"
                        >
                          {task.title}
                        </button>
                      )}
                    </td>
                    {isAdmin && <td className="py-3 px-4">{task.assigned_to?.name || 'Unknown'}</td>}
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
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status || 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4">{new Date(task.due_date).toLocaleDateString()}</td>
                    {isAdmin && (
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleEditTask(task)}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                        >
                          Edit
                        </button>
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

      {/* Task Detail Modal - For Employees */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
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