import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { toast } from 'react-toastify';
import AdminTimesheetView from '../components/AdminTimesheetView';

function EmployeeTimesheet() {
  const { currentUser, API_URL } = useAppContext();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [timeEntries, setTimeEntries] = useState([]);
  const [timesheetStatus, setTimesheetStatus] = useState("Draft");
  const [loading, setLoading] = useState(false);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(null);

  const isAdmin = currentUser?.isAdmin === true;

  const timeSlots = [
    { start: "10:30", end: "11:30", label: "10:30 AM - 11:30 AM" },
    { start: "11:30", end: "12:30", label: "11:30 AM - 12:30 PM" },
    { start: "12:30", end: "13:30", label: "12:30 PM - 1:30 PM" },
    { start: "14:30", end: "15:30", label: "2:30 PM - 3:30 PM" },
    { start: "15:30", end: "16:30", label: "3:30 PM - 4:30 PM" },
    { start: "16:30", end: "17:30", label: "4:30 PM - 5:30 PM" },
    { start: "17:30", end: "18:30", label: "5:30 PM - 6:30 PM" },
  ];

  const isDateEditable = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const selected = new Date(selectedDate);

    return (
      selected.toDateString() === today.toDateString() ||
      selected.toDateString() === yesterday.toDateString()
    );
  };

  useEffect(() => {
    if (currentUser?.id && !isAdmin) {
      loadTimesheet();
      loadTasks();
    }
  }, [selectedDate, currentUser?.id]);

  if (isAdmin) {
    return <AdminTimesheetView />;
  }

  const loadTimesheet = async () => {
    const timesheetKey = `timesheet_${currentUser?.id}_${selectedDate}`;
    const savedTimesheet = localStorage.getItem(timesheetKey);

    try {
      const response = await fetch(`${API_URL}/api/employee-timesheet`);
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          const apiRecord = data.timesheets?.find(
            (record) =>
              record.employee_id === currentUser?.id &&
              new Date(record.date).toDateString() ===
                new Date(selectedDate).toDateString()
          );

          if (apiRecord) {
            setTimeEntries(apiRecord.time_entries || []);
            setTimesheetStatus(apiRecord.status || "Draft");
            return;
          }
        }
      }
    } catch (error) {
      console.log("API check failed, using localStorage", error);
    }

    if (savedTimesheet) {
      try {
        const data = JSON.parse(savedTimesheet);
        setTimeEntries(data.time_entries || []);
        setTimesheetStatus(data.status || "Draft");
      } catch (error) {
        console.error("Error parsing saved timesheet:", error);
        initializeTimeEntries();
      }
    } else {
      initializeTimeEntries();
    }
  };

  const loadTasks = async () => {
    if (!currentUser?.id) return;
    
    try {
      const availableResponse = await fetch(`${API_URL}/api/tasks/available`);
      if (availableResponse.ok) {
        const availableData = await availableResponse.json();
        const availableList = availableData?.data || availableData?.tasks || [];
        setAvailableTasks(Array.isArray(availableList) ? availableList : []);
      }

      const assignedResponse = await fetch(`${API_URL}/api/tasks/employee/${currentUser.id}`);
      if (assignedResponse.ok) {
        const assignedData = await assignedResponse.json();
        const assignedList = assignedData?.data || assignedData?.tasks || [];
        setAssignedTasks(Array.isArray(assignedList) ? assignedList : []);
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
      setAvailableTasks([]);
      setAssignedTasks([]);
    }
  };

  const takeTask = async (taskId) => {
    if (!currentUser?.id || !taskId) {
      toast.error("Invalid user or task");
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/api/tasks/${taskId}/take`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee_id: currentUser.id })
      });
      
      if (response.ok) {
        toast.success("Task taken successfully");
        loadTasks();
        setShowTaskModal(false);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to take task");
      }
    } catch (error) {
      console.error("Take task error:", error);
      toast.error("Error taking task");
    }
  };

  const initializeTimeEntries = () => {
    const entries = timeSlots.map((slot) => ({
      start_time: slot.start,
      end_time: slot.end,
      task_description: "",
      project_name: "",
      hours_worked: 1,
      task_id: null,
    }));
    setTimeEntries(entries);
    setTimesheetStatus("Draft");
  };

  const saveToLocalStorage = (entries, status = timesheetStatus) => {
    const timesheetKey = `timesheet_${currentUser?.id}_${selectedDate}`;
    const timesheetData = {
      employee_id: currentUser?.id,
      employee_name: currentUser?.name,
      date: selectedDate,
      time_entries: entries,
      total_hours: entries
        .filter((entry) => entry.task_description.trim())
        .reduce((sum, entry) => sum + entry.hours_worked, 0),
      status: status,
    };
    localStorage.setItem(timesheetKey, JSON.stringify(timesheetData));
  };

  const updateTimeEntry = (index, field, value) => {
    const updatedEntries = [...timeEntries];
    updatedEntries[index] = {
      ...updatedEntries[index],
      [field]: value,
    };
    setTimeEntries(updatedEntries);
    saveToLocalStorage(updatedEntries);
  };

  const saveProject = () => {
    saveToLocalStorage(timeEntries);
    toast.success("Project saved successfully to local storage");
  };

  const submitProject = async () => {
    if (!currentUser?.id) {
      toast.error("User information not found. Please login again.");
      return;
    }

    const emptyEntries = timeEntries.filter(
      (entry) => !entry.task_description.trim()
    );

    if (emptyEntries.length > 0) {
      toast.warning("Please fill all task descriptions before submitting the project.");
      return;
    }

    setLoading(true);
    try {
      const timesheetData = {
        employee_id: currentUser.id,
        employee_name: currentUser.name || currentUser.email,
        date: selectedDate,
        time_entries: timeEntries,
        total_hours: timeEntries.reduce(
          (sum, entry) => sum + entry.hours_worked,
          0
        ),
        status: "Submitted",
      };

      const response = await fetch(`${API_URL}/api/employee-timesheet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(timesheetData),
      });

      if (response.ok) {
        setTimesheetStatus("Submitted");
        const timesheetKey = `timesheet_${currentUser.id}_${selectedDate}`;
        localStorage.removeItem(timesheetKey);
        toast.success("Project submitted successfully");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to submit timesheet");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getTotalHours = () => {
    return timeEntries
      .filter((entry) => entry.task_description.trim())
      .reduce((sum, entry) => sum + entry.hours_worked, 0);
  };

  const canEdit = isDateEditable() && timesheetStatus !== "Approved" && timesheetStatus !== "Submitted";

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Employee Timesheet
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Fill your daily work activities and time entries
        </p>
      </div>

      {/* Controls Card */}
      <div className="bg-blue-gray-200/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-lg shadow-md p-6 mb-6 border border-white/20 dark:border-gray-700/50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {!canEdit && (
              <p className="text-xs text-red-500 mt-1">
                {timesheetStatus === "Approved" || timesheetStatus === "Submitted"
                  ? `${timesheetStatus} timesheet cannot be edited`
                  : "You can only edit today's and yesterday's timesheet"}
              </p>
            )}
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
              Total Hours
            </div>
            <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
              {getTotalHours()}h
            </div>
          </div>

          <div className={`p-4 rounded-lg border ${
            timesheetStatus === "Draft"
              ? "bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600"
              : timesheetStatus === "Submitted"
              ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700"
              : timesheetStatus === "Approved"
              ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700"
              : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700"
          }`}>
            <div className={`text-sm font-medium mb-2 ${
              timesheetStatus === "Draft"
                ? "text-gray-700 dark:text-gray-300"
                : timesheetStatus === "Submitted"
                ? "text-yellow-700 dark:text-yellow-300"
                : timesheetStatus === "Approved"
                ? "text-green-700 dark:text-green-300"
                : "text-red-700 dark:text-red-300"
            }`}>
              Status
            </div>
            <div className={`text-lg font-bold ${
              timesheetStatus === "Draft"
                ? "text-gray-800 dark:text-gray-200"
                : timesheetStatus === "Submitted"
                ? "text-yellow-800 dark:text-yellow-200"
                : timesheetStatus === "Approved"
                ? "text-green-800 dark:text-green-200"
                : "text-red-800 dark:text-red-200"
            }`}>
              {timesheetStatus}
            </div>
          </div>
        </div>
      </div>

      {/* Time Entries */}
      <div className="bg-blue-gray-200/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-lg shadow-md border border-white/20 dark:border-gray-700/50">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Time Entries - {new Date(selectedDate).toLocaleDateString("en-US", {
              weekday: "long", year: "numeric", month: "long", day: "numeric"
            })}
          </h3>
        </div>

        <div className="p-6">
          <div className="grid gap-4">
            {timeEntries.map((entry, index) => (
              <div key={index} className="group bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-2 rounded-xl p-5 transition-all duration-200 hover:shadow-lg border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Time Slot
                    </label>
                    <div className="px-4 py-2 rounded-lg text-sm font-medium border-2 bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
                      {timeSlots[index]?.label}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Task Description
                          </label>
                          {canEdit && (
                            <button
                              onClick={() => {
                                setSelectedTaskIndex(index);
                                setShowTaskModal(true);
                              }}
                              className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                            >
                              Select Task
                            </button>
                          )}
                        </div>
                        <textarea
                          value={entry.task_description}
                          onChange={(e) => updateTimeEntry(index, "task_description", e.target.value)}
                          placeholder="Describe your work activity..."
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          rows="2"
                          disabled={!canEdit}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Project Name
                        </label>
                        <input
                          type="text"
                          value={entry.project_name}
                          onChange={(e) => updateTimeEntry(index, "project_name", e.target.value)}
                          placeholder="Project name (optional)"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={!canEdit}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0 flex items-center">
                    {entry.task_description ? (
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-yellow-700 dark:text-yellow-300">
                Lunch Break: 1:30 PM - 2:30 PM (No work entry required)
              </span>
            </div>
          </div>

          {canEdit && (
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={saveProject}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span>Save Project</span>
              </button>
              <button
                onClick={submitProject}
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span>{loading ? "Submitting..." : "Submit Project"}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Task Selection Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Task</h3>
              <button
                onClick={() => setShowTaskModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">My Assigned Tasks</h4>
                {assignedTasks.length > 0 ? (
                  <div className="space-y-2">
                    {assignedTasks.map((task) => (
                      <div key={task._id} className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white">{task.title}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{task.description}</div>
                            <div className="text-xs text-blue-600 dark:text-blue-400">Priority: {task.priority}</div>
                          </div>
                          <button
                            onClick={() => {
                              updateTimeEntry(selectedTaskIndex, "task_description", task.title);
                              updateTimeEntry(selectedTaskIndex, "project_name", task.description);
                              updateTimeEntry(selectedTaskIndex, "task_id", task._id);
                              setShowTaskModal(false);
                            }}
                            className="ml-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                          >
                            Select
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No assigned tasks</p>
                )}
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Available Tasks</h4>
                {availableTasks.length > 0 ? (
                  <div className="space-y-2">
                    {availableTasks.map((task) => (
                      <div key={task._id} className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white">{task.title}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{task.description}</div>
                            <div className="text-xs text-blue-600 dark:text-blue-400">Priority: {task.priority}</div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                updateTimeEntry(selectedTaskIndex, "task_description", task.title);
                                updateTimeEntry(selectedTaskIndex, "project_name", task.description);
                                updateTimeEntry(selectedTaskIndex, "task_id", task._id);
                                setShowTaskModal(false);
                              }}
                              className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                            >
                              Select
                            </button>
                            <button
                              onClick={() => takeTask(task._id)}
                              className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                            >
                              Take Task
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No available tasks</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeTimesheet;