import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { motion } from "framer-motion";

function WorkHistory() {
  const { currentUser, API_URL } = useAppContext();
  const [workHistory, setWorkHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");

  const isEmployee = currentUser?.role === "employee";
  useEffect(() => {
    if (currentUser?.id) {
      loadWorkHistory();
      loadTasks();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const loadTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/tasks/employee/${currentUser.id}`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data.data || data.tasks || []);
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  };
  const loadWorkHistory = async () => {
    setLoading(true);
    try {
      // Try API first
      const response = await fetch(`${API_URL}/api/employee-timesheet`);
      if (response.ok) {
        const data = await response.json();
        const timesheets = data.timesheets || data.data || [];
        
        // Filter for current employee
        const employeeTimesheets = timesheets.filter(
          record => record.employee_id === currentUser.id
        );
        
        employeeTimesheets.sort((a, b) => new Date(b.date) - new Date(a.date));
        setWorkHistory(employeeTimesheets);
        
        if (employeeTimesheets.length > 0) {
          setSelectedDate(employeeTimesheets[0].date.split('T')[0]);
        }
      } else {
        // Fallback to localStorage
        const localStorageKeys = Object.keys(localStorage).filter(key =>
          key.startsWith(`timesheet_${currentUser.id}_`)
        );
        
        const localRecords = [];
        localStorageKeys.forEach(key => {
          try {
            const data = JSON.parse(localStorage.getItem(key));
            localRecords.push(data);
          } catch (e) {
            console.warn(`Invalid localStorage data for key: ${key}`);
          }
        });
        
        localRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
        setWorkHistory(localRecords);
        
        if (localRecords.length > 0) {
          setSelectedDate(localRecords[0].date);
        }
      }
    } catch (error) {
      console.error("Error loading work history:", error);
      setError("Failed to load work history");
    } finally {
      setLoading(false);
    }
  };

  const selectedRecord = workHistory.find(record => {
    const recordDate = record.date.split('T')[0];
    return recordDate === selectedDate;
  });

  const formatTime = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getAvailableDates = () => {
    return workHistory
      .map(record => record.date.split('T')[0])
      .filter((date, index, self) => self.indexOf(date) === index)
      .sort((a, b) => new Date(b) - new Date(a));
  };

  const getTotalHours = () => {
    return workHistory.reduce((total, record) => total + (record.total_hours || 0), 0);
  };

  const getCompletedTasks = () => {
    return tasks.filter(task => task.status === 'Completed').length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading work history...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Please log in to view work history.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md mx-auto">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6"
      >
        <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          My Work History
        </h2>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg p-6 border border-white/20 dark:border-gray-700/50"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Hours</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{getTotalHours()}h</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg p-6 border border-white/20 dark:border-gray-700/50"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed Tasks</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{getCompletedTasks()}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg p-6 border border-white/20 dark:border-gray-700/50"
          >
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Days Worked</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{workHistory.length}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Date Filter */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg p-6 mb-8 border border-white/20 dark:border-gray-700/50"
        >
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Date:
            </label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Dates</option>
              {getAvailableDates().map((date) => (
                <option key={date} value={date}>
                  {new Date(date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </option>
              ))}
            </select>
            
            {selectedRecord && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Total: {selectedRecord.total_hours}h
                </span>
                <span className={`px-3 py-1 text-xs rounded-full ${
                  selectedRecord.status === "Submitted"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                    : selectedRecord.status === "Approved"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                }`}>
                  {selectedRecord.status}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Work Entries */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/50"
        >
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {selectedDate ? `Work Entries - ${new Date(selectedDate).toLocaleDateString()}` : 'All Work Entries'}
            </h3>
          </div>

          <div className="p-6">
            {selectedRecord?.time_entries?.length > 0 ? (
              <div className="space-y-4">
                {selectedRecord.time_entries
                  .filter(entry => entry.task_description?.trim())
                  .map((entry, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                              {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {entry.hours_worked}h
                            </span>
                          </div>
                          <p className="text-gray-900 dark:text-white font-medium mb-1">
                            {entry.task_description}
                          </p>
                          {entry.project_name && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Project: {entry.project_name}
                            </p>
                          )}
                        </div>
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    </motion.div>
                  ))
                }
              </div>
            ) : workHistory.length > 0 && !selectedDate ? (
              <div className="space-y-4">
                {workHistory.slice(0, 5).map((record, recordIndex) => (
                  <motion.div 
                    key={recordIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: recordIndex * 0.1 }}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedDate(record.date.split('T')[0])}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {record.total_hours}h
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          record.status === "Submitted"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                            : record.status === "Approved"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                        }`}>
                          {record.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {record.time_entries?.filter(e => e.task_description?.trim()).length || 0} tasks completed
                    </p>
                  </motion.div>
                ))}
                {workHistory.length > 5 && (
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                    Showing latest 5 entries. Select a specific date to view details.
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                  {selectedDate ? "No work entries found for this date" : "No work history available"}
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-sm">
                  {selectedDate ? "Try selecting a different date" : "Start by submitting your daily timesheets"}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default WorkHistory;
