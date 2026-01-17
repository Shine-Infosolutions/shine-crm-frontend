import React, { useState, useEffect, useRef } from "react";
import { useAppContext } from "../context/AppContext";

import api from '../utils/axiosConfig';
function EmployeeAttendance() {
  const { currentUser, API_URL, getAuthHeaders } = useAppContext();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [autoCheckoutTimer, setAutoCheckoutTimer] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [isManualCheckout, setIsManualCheckout] = useState(false);
  const [customCheckoutTime, setCustomCheckoutTime] = useState('');
  const dateInputRef = useRef(null);

  const isAdmin = currentUser?.role !== "employee";

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto checkout after 9 hours
  useEffect(() => {
    if (!isAdmin && isCheckedIn && !isCompleted) {
      checkAutoCheckout();
      const interval = setInterval(checkAutoCheckout, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [isCheckedIn, isCompleted, attendanceRecords, isAdmin]);

  useEffect(() => {
    loadAttendanceRecords();
  }, [currentUser, isAdmin]);

  useEffect(() => {
    filterRecords();
  }, [attendanceRecords, selectedDate, selectedEmployee]);

  useEffect(() => {
    if (isAdmin) {
      loadEmployees();
    }
  }, [isAdmin]);

  const [employees, setEmployees] = useState([]);

  const formatTime = (dateString) => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  };

  const loadAttendanceRecords = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        // For admin: load both attendance and employees
        const [attendanceResponse, employeeResponse] = await Promise.all([
          api.get('/api/attendance'),
          api.get('/api/employees'),
        ]);

        const attendanceData = attendanceResponse.data;
        const records = attendanceData.data || attendanceData || [];

        const employeeData = employeeResponse.data;
        const employeeList = employeeData.data || employeeData || [];

        const recordsWithNames = records.map((record) => ({
          ...record,
          employee_name: record.employee_id?.name || "Unknown",
        }));

        setAttendanceRecords(recordsWithNames);
      } else {
        // For employee: only load attendance
        const employeeId = currentUser?._id || currentUser?.id;
        const response = await api.get(`/api/attendance?employee_id=${employeeId}`);

        if (response.status === 200) {
          const data = response.data;
          const records = data.data || data || [];
          setAttendanceRecords(records);

          // Check attendance status for today
          const today = new Date().toDateString();
          const todayRecord = records.find((record) => {
            if (!record.date) return false;
            const recordDate = new Date(record.date).toDateString();
            return recordDate === today;
          });
          
          console.log('Today:', today);
          console.log('Records:', records);
          console.log('Today record:', todayRecord);
          
          // Simple logic: show checkout if checked in but not checked out
          const hasCheckedIn = todayRecord && todayRecord.time_in;
          const hasCheckedOut = todayRecord && (todayRecord.checkout_time || todayRecord.time_out);
          
          setIsCheckedIn(hasCheckedIn && !hasCheckedOut);
          setIsCompleted(hasCheckedOut);
        }
      }
    } catch (error) {
      console.error("Error loading attendance records:", error);
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  const handleCheckIn = async () => {
    // Frontend validation: prevent multiple check-ins
    const today = new Date().toDateString();
    const todayRecord = attendanceRecords.find((record) => {
      if (!record.date) return false;
      const recordDate = new Date(record.date).toDateString();
      return recordDate === today;
    });
    
    if (todayRecord && todayRecord.time_in) {
      if (todayRecord.checkout_time) {
        alert("You have already completed attendance for today!");
      } else {
        alert("You are already checked in! Please check out first.");
      }
      return;
    }

    setLoading(true);
    try {
      const employeeId = currentUser?._id || currentUser?.id;
      const attendanceData = {
        employee_id: employeeId
      };

      const response = await api.post('/api/attendance/time-in', attendanceData);

      const data = response.data;
      
      await loadAttendanceRecords();
      alert("Checked in successfully!");
    } catch (error) {
      console.error("Error checking in:", error);
      alert("Error checking in: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const validateCheckoutTime = (checkoutTime, checkinTime) => {
    const checkout = new Date(checkoutTime);
    const checkin = new Date(checkinTime);
    const now = new Date();
    
    if (checkout <= checkin) {
      return "Checkout time must be after check-in time";
    }
    if (checkout > now) {
      return "Checkout time cannot be in the future";
    }
    return null;
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const today = new Date().toDateString();
      const todayRecord = attendanceRecords.find((record) => {
        if (!record.date) return false;
        const recordDate = new Date(record.date).toDateString();
        return recordDate === today;
      });

      const employeeId = currentUser?._id || currentUser?.id;
      const requestBody = {
        employee_id: employeeId
      };

      if (isManualCheckout && customCheckoutTime) {
        const checkoutDateTime = new Date(`${new Date().toDateString()} ${customCheckoutTime}`).toISOString();
        
        if (todayRecord?.time_in) {
          const validationError = validateCheckoutTime(checkoutDateTime, todayRecord.time_in);
          if (validationError) {
            alert(validationError);
            setLoading(false);
            return;
          }
        }
        
        requestBody.checkout_time = checkoutDateTime;
      }

      const response = await api.post('/api/attendance/checkout', requestBody);

      const data = response.data;
      
      if (data.success) {
        setIsCheckedIn(false);
        setIsCompleted(true);
        await loadAttendanceRecords();
        
        const checkoutType = data.data?.is_manual_checkout ? "manual" : "automatic";
        alert(`Checked out successfully! (${checkoutType} checkout)`);
        
        setIsManualCheckout(false);
        setCustomCheckoutTime('');
      } else {
        alert(data.message || "Failed to check out");
      }
    } catch (error) {
      console.error("Error checking out:", error);
      alert("Error checking out: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateWorkingHours = (record) => {
    return record.hours_worked || record.total_hours || "--";
  };

  const getWorkingHoursNumber = (record) => {
    if (!record.time_in) return 0;
    const endTime = record.checkout_time || record.time_out;
    if (!endTime) return 0;
    return (new Date(endTime) - new Date(record.time_in)) / (1000 * 60 * 60);
  };

  const getCurrentWorkingHours = (record) => {
    if (!record.time_in) return 0;
    const now = new Date();
    return (now - new Date(record.time_in)) / (1000 * 60 * 60);
  };

  const checkAutoCheckout = async () => {
    const employeeId = currentUser?._id || currentUser?.id;
    if (!employeeId || isCompleted) return;
    
    const today = new Date().toDateString();
    const todayRecord = attendanceRecords.find((record) => {
      if (!record.date) return false;
      const recordDate = new Date(record.date).toDateString();
      return recordDate === today && record.employee_id === employeeId;
    });
    
    if (todayRecord && todayRecord.time_in && !(todayRecord.checkout_time || todayRecord.time_out)) {
      const currentHours = getCurrentWorkingHours(todayRecord);
      
      if (currentHours >= 9) {
        try {
          const response = await api.post('/api/attendance/checkout', { employee_id: employeeId });
          
          const data = response.data;
          setIsCheckedIn(false);
          setIsCompleted(true);
          await loadAttendanceRecords();
          alert("You have been automatically checked out after 9 hours of work!");
        } catch (error) {
          console.error("Auto checkout error:", error);
        }
      }
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await api.get('/api/employees');
      const data = response.data;
      setEmployees(data.data || data || []);
    } catch (error) {
      console.error("Error loading employees:", error);
    }
  };

  const filterRecords = () => {
    let filtered = [...attendanceRecords];
    
    if (selectedDate) {
      const filterDate = new Date(selectedDate).setHours(0, 0, 0, 0);
      filtered = filtered.filter(record => {
        const recordDate = record.date ? new Date(record.date).setHours(0, 0, 0, 0) : null;
        return recordDate === filterDate;
      });
    }
    
    if (selectedEmployee) {
      filtered = filtered.filter(record => {
        const employeeId = record.employee_id?._id || record.employee_id;
        return employeeId === selectedEmployee;
      });
    }
    
    setFilteredRecords(filtered);
  };

  const hasWorked7Hours = (record) => {
    if (!record.time_in) return false;
    const endTime = record.checkout_time || record.time_out;
    if (!endTime) {
      // For active sessions, check current working hours
      const currentHours = getCurrentWorkingHours(record);
      return currentHours >= 7;
    }
    return getWorkingHoursNumber(record) >= 7;
  };

  const hasWorked9Hours = (record) => {
    return getWorkingHoursNumber(record) >= 9;
  };



  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">
          {isAdmin ? "All Employee Attendance" : "Employee Attendance"}
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex gap-3 items-center">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date Filter:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white text-sm"
            />
          </div>
          
          {isAdmin && (
            <div className="flex gap-3 items-center">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Employee:</label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white text-sm"
              >
                <option value="">All Employees</option>
                {employees.map((employee) => (
                  <option key={employee._id} value={employee._id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {(selectedDate || selectedEmployee) && (
            <button
              onClick={() => {
                setSelectedDate('');
                setSelectedEmployee('');
              }}
              className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Check In/Out Card - Only for Employees */}
      {!isAdmin && (
        <div className="bg-blue-gray-200/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/50 p-8 mb-6">
          <div className="text-center">
            {/* Clock Icon */}
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-4">
                <svg
                  className="w-10 h-10 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Date and Time */}
            <div className="mb-8">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Today
              </div>
              <div className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {currentTime.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                {currentTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>

            {/* Status Badge */}
            <div className="mb-8">
              <div
                className={`inline-flex items-center px-6 py-3 rounded-full text-base font-medium border-2 ${
                  isCheckedIn
                    ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700"
                    : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-700/50 dark:text-gray-300 dark:border-gray-600"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full mr-3 ${
                    isCheckedIn
                      ? "bg-green-500 animate-pulse"
                      : "bg-gray-400"
                  }`}
                ></div>
                {isCompleted
                  ? "Attendance Completed"
                  : isCheckedIn
                  ? "Currently Checked In"
                  : "Ready to Check In"}
              </div>
            </div>

            {/* Manual Checkout Controls - Only show when checked in */}
            {isCheckedIn && !isCompleted && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-center mb-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isManualCheckout}
                      onChange={(e) => setIsManualCheckout(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`relative w-11 h-6 rounded-full transition-colors ${
                      isManualCheckout ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}>
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        isManualCheckout ? 'translate-x-5' : 'translate-x-0'
                      }`}></div>
                    </div>
                    <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Manual Checkout Time
                    </span>
                  </label>
                </div>
                
                {isManualCheckout && (
                  <div className="flex justify-center">
                    <input
                      type="time"
                      value={customCheckoutTime}
                      onChange={(e) => setCustomCheckoutTime(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required={isManualCheckout}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={isCompleted ? null : (isCheckedIn ? handleCheckOut : handleCheckIn)}
              disabled={loading || isCompleted || (isCheckedIn && isManualCheckout && !customCheckoutTime)}
              className={`inline-flex items-center px-10 py-4 rounded-xl font-semibold text-lg text-white transition-all duration-200 transform hover:scale-105 shadow-lg ${
                isCheckedIn
                  ? "bg-red-600 hover:bg-red-700 hover:shadow-red-200 dark:hover:shadow-red-900/20 disabled:bg-red-400"
                  : "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200 dark:hover:shadow-blue-900/20 disabled:bg-blue-400"
              } disabled:cursor-not-allowed disabled:transform-none disabled:shadow-md`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Getting Location...
                </>
              ) : (
                <>
                  <svg
                    className="w-6 h-6 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={
                        isCheckedIn
                          ? "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          : "M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      }
                    />
                  </svg>
                  {isCompleted ? "Completed" : (isCheckedIn ? "Check Out Now" : "Check In Now")}
                </>
              )}
            </button>

            {/* Additional Info */}
            <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center justify-center space-x-4">
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Location tracked
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  Secure & Private
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Check In/Out Records Table */}
      <div className="bg-blue-gray-200/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-lg shadow-md mb-6 border border-white/20 dark:border-gray-700/50">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Check In/Out Records
          </h3>
        </div>

        <div className="overflow-x-auto">
          {filteredRecords.filter(record => (record.time_in || record.time_out) && !hasWorked7Hours(record)).length > 0 ? (
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {isAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Employee
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Check In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Check Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {filteredRecords.filter(record => (record.time_in || record.time_out) && !hasWorked7Hours(record)).map((record, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {record.employee_id?.name || record.employee_name || "Unknown"}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {record.date ? new Date(record.date).toLocaleDateString() : '--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {record.time_in ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-900 dark:text-white">
                            {formatTime(record.time_in)}
                          </span>
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                            In
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500">--</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {(record.checkout_time || record.time_out) ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-900 dark:text-white">
                            {formatTime(record.checkout_time || record.time_out)}
                          </span>
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full">
                            Out
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500">--</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {record.time_in && (record.checkout_time || record.time_out) ? 
                          `${((new Date(record.checkout_time || record.time_out) - new Date(record.time_in)) / (1000 * 60 * 60)).toFixed(1)}h` : 
                          "--"
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {(record.checkout_time || record.time_out) ? (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          record.is_manual_checkout 
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                          {record.is_manual_checkout ? 'Manual' : 'Auto'}
                        </span>
                      ) : (
                        <span className="text-gray-400">--</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {(record.checkout_time || record.time_out) ? (
                        (() => {
                          const hours = getWorkingHoursNumber(record);
                          if (hours >= 8) {
                            return (
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                                Full Day
                              </span>
                            );
                          } else if (hours >= 4) {
                            return (
                              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full">
                                Half Day
                              </span>
                            );
                          } else {
                            return (
                              <span className="px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full">
                                Short Day
                              </span>
                            );
                          }
                        })()
                      ) : (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                          In Progress
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No check-in/out records found.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Timeout Records Table */}
      <div className="bg-blue-gray-200/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-lg shadow-md border border-white/20 dark:border-gray-700/50">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Timeout Records
          </h3>
        </div>

        <div className="overflow-x-auto">
          {filteredRecords.filter(record => hasWorked7Hours(record)).length > 0 ? (
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {isAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Employee
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Check In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Check Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Reason
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {filteredRecords.filter(record => hasWorked7Hours(record)).map((record, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {record.employee_id?.name || record.employee_name || "Unknown"}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {record.date ? new Date(record.date).toLocaleDateString() : '--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {record.time_in ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-900 dark:text-white">
                            {formatTime(record.time_in)}
                          </span>
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                            In
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500">--</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {record.checkout_time ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-900 dark:text-white">
                            {formatTime(record.checkout_time)}
                          </span>
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full">
                            Out
                          </span>
                        </div>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {record.time_in && record.checkout_time ? 
                          `${((new Date(record.checkout_time) - new Date(record.time_in)) / (1000 * 60 * 60)).toFixed(1)}h` : 
                          "--"
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {getWorkingHoursNumber(record) >= 9 && record.checkout_time ? 
                        `Auto checkout at ${formatTime(record.checkout_time)}` : 
                        (record.timeout_reason || 'Extended work session')
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No timeout records found.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmployeeAttendance;
