import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAppContext } from "../context/AppContext";
import api from "../utils/axiosConfig";

function WorkSummary() {
  const { currentUser, API_URL } = useAppContext();
  const [workHistory, setWorkHistory] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState("");

  const isAdmin = currentUser?.role !== "employee";

  useEffect(() => {
    const userId = currentUser?._id || currentUser?.id;
    if (userId) {
      if (isAdmin) {
        loadEmployees();
      } else {
        loadWorkHistory();
        loadTaskData();
      }
    } else {
      setLoading(false);
    }
  }, [currentUser, isAdmin]);

  // Load work history and tasks after employees are loaded
  useEffect(() => {
    if (isAdmin && employees.length > 0) {
      loadWorkHistory();
      loadTaskData();
    }
  }, [employees]);

  useEffect(() => {
    if (selectedEmployee && isAdmin && employees.length > 0) {
      loadTaskData();
      loadWorkHistory();
    }
  }, [selectedEmployee, employees]);

  const loadEmployees = async () => {
    try {
      const response = await api.get('/api/employees');
      const data = response.data;
      const employeeList = data.data || data || [];
      setEmployees(employeeList);
    } catch (error) {
      setEmployees([]);
    }
  };

  const loadTaskData = async () => {
    try {
      let allTasks = [];
      
      if (isAdmin) {
        if (selectedEmployee) {
          // Load tasks for specific employee
          const response = await api.get(`/api/tasks/employee/${selectedEmployee}`);
          const data = response.data;
          const taskList = data.data || data.tasks || [];
          allTasks = taskList;
        } else {
          // Load all tasks for admin - get all employees' tasks
          const employeePromises = employees.length > 0 ? employees.map(emp => 
            api.get(`/api/tasks/employee/${emp._id}`)
              .then(res => res.data.data || res.data.tasks || [])
              .catch(() => [])
          ) : [];
          
          // Also load available tasks
          const availableResponse = api.get('/api/tasks/available')
            .then(res => res.data.data || res.data.tasks || [])
            .catch(() => []);
          
          const [employeeTasks, availableTasks] = await Promise.all([
            Promise.all(employeePromises).then(results => results.flat()),
            availableResponse
          ]);
          
          allTasks = [...employeeTasks, ...availableTasks];
        }
      } else {
        // Load tasks for current employee
        const response = await api.get(`/api/tasks/employee/${currentUser._id || currentUser.id}`);
        const data = response.data;
        allTasks = data.data || data.tasks || [];
      }
      
      setTasks(allTasks);
    } catch (error) {
      setTasks([]);
    }
  };

  const loadWorkHistory = async () => {
    try {
      const userId = currentUser?._id || currentUser?.id;
      if (!userId) {
        setLoading(false);
        return;
      }

      let allRecords = [];
      
      // First try to load from API
      try {
        const response = await api.get('/api/employee-timesheet');
        const data = response.data;
        const apiRecords = data.timesheets || data.data || [];
          
          if (isAdmin) {
            // Admin sees all timesheets
            allRecords = apiRecords.map(record => ({
              ...record,
              employee_name: employees.find(emp => emp._id === record.employee_id)?.name || 'Unknown'
            }));
          } else {
            // Employee sees only their own
            allRecords = apiRecords.filter(record => record.employee_id === userId);
          }
      } catch (apiError) {
      }
      
      // If no API data, load from localStorage
      if (allRecords.length === 0) {
        if (isAdmin) {
          // Admin: Load all localStorage timesheets for all employees
          employees.forEach((employee) => {
            const localStorageKeys = Object.keys(localStorage).filter((key) =>
              key.startsWith(`timesheet_${employee._id}_`)
            );
            localStorageKeys.forEach((key) => {
              try {
                const data = JSON.parse(localStorage.getItem(key));
                allRecords.push({
                  ...data,
                  employee_id: employee._id,
                  employee_name: employee.name,
                  status: data.status || "Pending",
                });
              } catch (e) {
              }
            });
          });
        } else {
          // Employee: Load own localStorage timesheets only
          const localStorageKeys = Object.keys(localStorage).filter((key) =>
            key.startsWith(`timesheet_${userId}_`)
          );

          localStorageKeys.forEach((key) => {
            try {
              const data = JSON.parse(localStorage.getItem(key));
              allRecords.push({
                ...data,
                employee_id: userId,
                employee_name: currentUser.name,
                status: data.status || "Pending",
              });
            } catch (e) {
            }
          });
        }
      }

      allRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
      setWorkHistory(allRecords);
    } catch (error) {
      setWorkHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const approveTimesheet = async (record) => {
    try {
      const response = await api.put(`/api/timesheet/${record._id}`, {
        status: "Approved"
      });

      // Update the record status locally
      const updatedHistory = workHistory.map(item => 
        item === record ? { ...item, status: 'Approved' } : item
      );
      setWorkHistory(updatedHistory);
      alert("Timesheet approved successfully!");
    } catch (error) {
      alert("Error approving timesheet");
    }
  };

  const filteredHistory = isAdmin && selectedEmployee
    ? workHistory.filter((record) => record.employee_id === selectedEmployee)
    : workHistory;

  const filteredTasks = isAdmin && selectedEmployee
    ? tasks.filter((task) => {
        // Check if task is assigned to selected employee or if it's an available task
        return task.assigned_to === selectedEmployee || 
               task.employee_id === selectedEmployee ||
               (!task.assigned_to && !task.employee_id); // Available tasks
      })
    : tasks;

  const getTaskStats = (taskList) => ({
    total: taskList.length,
    pending: taskList.filter(t => t.status === 'Available').length,
    inProgress: taskList.filter(t => t.status === 'In Progress').length,
    completed: taskList.filter(t => t.status === 'Completed').length,
    overdue: taskList.filter(t => new Date(t.due_date) < new Date() && t.status !== 'Completed').length
  });

  const taskStats = getTaskStats(filteredTasks);
  const totalHours = filteredHistory.reduce((sum, record) => sum + (record.total_hours || 0), 0);
  



  
  if (currentUser === null || loading) return <div className="p-6">Loading...</div>;
  if (!currentUser) return <div className="p-6">Please log in to view work summary.</div>;
  


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-6"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          {isAdmin ? "Employee Work Summary" : "Work Summary"}
        </h2>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{taskStats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{taskStats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{taskStats.inProgress}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{taskStats.completed}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{taskStats.overdue}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Hours</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalHours}h</p>
              </div>
            </div>
          </div>
        </div>


        {/* Filter for Admin */}
        {isAdmin && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Filter by Employee:
              </label>
              <select
                value={selectedEmployee}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedEmployee(value);
                  if (!value) {
                    // Reload all data when clearing filter
                    loadTaskData();
                    loadWorkHistory();
                  }
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name}
                  </option>
                ))}
              </select>
              {selectedEmployee && (
                <button
                  onClick={() => {
                    setSelectedEmployee("");
                    loadTaskData();
                    loadWorkHistory();
                  }}
                  className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                >
                  Clear Filter
                </button>
              )}
            </div>
          </div>
        )}

        {/* Combined Work Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tasks Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="p-4 border-b border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Tasks</h3>
            </div>
            <div className="p-4">
              {filteredTasks.length > 0 ? (
                <div className="space-y-3">
                  {filteredTasks.slice(0, 5).map((task) => (
                    <div key={task._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">{task.title}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{task.description}</div>
                        {isAdmin && task.assigned_to && (
                          <div className="text-xs text-gray-400 dark:text-gray-500">Assigned to: {task.assigned_to.name}</div>
                        )}
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          task.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          task.status === 'In Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          task.status === 'Available' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {task.status}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          task.priority === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No tasks found.</p>
              )}
            </div>
          </div>

          {/* Timesheets Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="p-4 border-b border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Timesheets</h3>
            </div>
            <div className="p-4">
              {filteredHistory.length > 0 ? (
                <div className="space-y-3">
                  {filteredHistory.slice(0, 5).map((record, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-1">
                        {isAdmin && (
                          <div className="font-medium text-gray-900 dark:text-white">{record.employee_name || "Unknown"}</div>
                        )}
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(record.date).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {record.time_entries?.filter((entry) => entry.task_description.trim()).length || 0} tasks
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">{record.total_hours}h</div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          record.status === "Submitted" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                          record.status === "Approved" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" :
                          record.status === "Pending" ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" :
                          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}>
                          {record.status}
                        </span>
                        {isAdmin && record.status === "Submitted" && (
                          <button
                            onClick={() => approveTimesheet(record)}
                            className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  {isAdmin && selectedEmployee ? "No work history found for selected employee." : "No work history found."}
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default WorkSummary;
