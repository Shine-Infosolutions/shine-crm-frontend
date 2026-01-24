import React, { useState, useEffect, useRef } from "react";
import { useAppContext } from "../context/AppContext";

import api from '../utils/axiosConfig';
function EmployeeAttendance() {
  const { currentUser, API_URL, getAuthHeaders } = useAppContext();
  // Manual check-in/out state variables - COMMENTED OUT (Using RFID-based attendance)
  // const [isCheckedIn, setIsCheckedIn] = useState(false);
  // const [isCompleted, setIsCompleted] = useState(false);
  // const [isManualCheckout, setIsManualCheckout] = useState(false);
  // const [customCheckoutTime, setCustomCheckoutTime] = useState('');
  // const [autoCheckoutTimer, setAutoCheckoutTimer] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const dateInputRef = useRef(null);

  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto checkout logic - COMMENTED OUT (Using RFID-based attendance)
  // useEffect(() => {
  //   if (!isAdmin && isCheckedIn && !isCompleted) {
  //     checkAutoCheckout();
  //     const interval = setInterval(checkAutoCheckout, 60000); // Check every minute
  //     return () => clearInterval(interval);
  //   }
  // }, [isCheckedIn, isCompleted, attendanceRecords, isAdmin]);

  useEffect(() => {
    loadAttendanceRecords();
  }, [currentUser, isAdmin]);

  useEffect(() => {
    filterRecords();
  }, [attendanceRecords, selectedDate, selectedEmployee]);

  useEffect(() => {
    if (isAdmin) {
      loadEmployees();
      loadGoogleSheetsData();
    }
  }, [isAdmin]);

  const [employees, setEmployees] = useState([]);
  const [googleSheetsData, setGoogleSheetsData] = useState([]);
  const [loadingGoogleSheets, setLoadingGoogleSheets] = useState(false);
  const [attendanceByDate, setAttendanceByDate] = useState({});
  const [selectedCalendarEmployee, setSelectedCalendarEmployee] = useState('');
  const [employeeCalendarData, setEmployeeCalendarData] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedAttendanceDate, setSelectedAttendanceDate] = useState('');

  const loadEmployeeCalendarData = async (employeeName, month) => {
    if (!employeeName || !month) return;
    setLoadingGoogleSheets(true);
    try {
      const year = month.getFullYear();
      const monthNum = month.getMonth() + 1;
      const monthStr = `${year}-${String(monthNum).padStart(2, '0')}`;
      
      // Try monthly summary first
      const response = await fetch(`${import.meta.env.VITE_ATTENDANCE_API_URL}?summary_month=${monthStr}`);
      const data = await response.json();
      
      let employeeData = data.data?.find(emp => emp.Name === employeeName) || {};
      
      // If no data in monthly summary, try to build from daily records
      if (Object.keys(employeeData).length <= 2) {
        console.log(`No monthly data for ${employeeName}, trying daily records...`);
        employeeData = { Name: employeeName };
        
        // Get all days in the month
        const daysInMonth = new Date(year, monthNum, 0).getDate();
        
        for (let day = 1; day <= daysInMonth; day++) {
          const dateStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          try {
            const dailyResponse = await fetch(`${import.meta.env.VITE_ATTENDANCE_API_URL}?date=${dateStr}`);
            const dailyData = await dailyResponse.json();
            
            const employeeRecord = dailyData.data?.find(record => record.Name === employeeName);
            if (employeeRecord) {
              // Check if employee has check-in data for this day
              const hasCheckIn = Object.keys(employeeRecord).some(key => 
                key.startsWith('Check-in') && employeeRecord[key] && employeeRecord[key] !== '-'
              );
              if (hasCheckIn) {
                employeeData[dateStr] = 'P'; // Mark as Present
              }
            }
          } catch (dailyError) {
            // Skip this day if error
            continue;
          }
        }
      }
      
      console.log(`Final employee data for ${employeeName}:`, employeeData);
      setEmployeeCalendarData(prev => ({ ...prev, [`${employeeName}-${monthStr}`]: employeeData }));
    } catch (error) {
      console.error('Error loading employee calendar data:', error);
    } finally {
      setLoadingGoogleSheets(false);
    }
  };

  const getAttendanceStatus = (date, employeeData) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const status = employeeData[dateStr];
    if (status === 'P' || status === 'Present') return { status: 'P', class: 'bg-green-500 text-white' };
    if (status === 'A' || status === 'Absent') return { status: 'A', class: 'bg-red-500 text-white' };
    if (status === 'L' || status === 'Leave') return { status: 'L', class: 'bg-yellow-500 text-white' };
    if (status === 'WFH' || status === 'Work From Home') return { status: 'W', class: 'bg-blue-500 text-white' };
    if (status === 'H' || status === 'Holiday') return { status: 'H', class: 'bg-gray-400 text-white' };
    if (status === 'HD' || status === 'Half Day') return { status: 'HD', class: 'bg-orange-500 text-white' };
    return { status: '', class: 'bg-gray-100 text-gray-400' };
  };

  const formatTime = (dateString) => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  };

  const calculateAttendanceStatus = (checkInTimes, checkOutTimes) => {
    if (checkInTimes.length === 0) return { status: 'No Data', class: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' };
    
    // Extract just the time part and parse it correctly
    const timeStr = checkInTimes[0].includes(',') ? checkInTimes[0].split(', ')[1] : checkInTimes[0];
    const firstCheckIn = new Date(`2000-01-01 ${timeStr}`);
    
    let lastCheckOut = null;
    if (checkOutTimes.length > 0) {
      const outTimeStr = checkOutTimes[checkOutTimes.length - 1].includes(',') ? 
                        checkOutTimes[checkOutTimes.length - 1].split(', ')[1] : 
                        checkOutTimes[checkOutTimes.length - 1];
      lastCheckOut = new Date(`2000-01-01 ${outTimeStr}`);
    }
    
    const lateTime_1035 = new Date('2000-01-01 10:35:00 AM');
    const earlyOutTime = new Date('2000-01-01 05:30:00 PM');
    
    let totalHours = 0;
    if (lastCheckOut) {
      totalHours = (lastCheckOut - firstCheckIn) / (1000 * 60 * 60);
    }
    
    if (!lastCheckOut) {
      if (firstCheckIn > lateTime_1035) {
        return { status: 'Late (After 10:35)', class: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' };
      } else {
        return { status: 'Checked In', class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
      }
    }
    
    if (totalHours >= 7) {
      return { status: 'Completed', class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
    } else if (firstCheckIn > lateTime_1035) {
      return { status: 'Late (After 10:35)', class: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' };
    } else if (lastCheckOut < earlyOutTime) {
      return { status: 'Early Out (Before 17:30)', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' };
    } else if (totalHours > 0) {
      return { status: 'Under 7 Hours', class: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' };
    } else {
      return { status: 'No Work Recorded', class: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' };
    }
  };

  const formatGoogleSheetsTime = (timeStr) => {
    if (!timeStr || timeStr === '-' || timeStr === '') return '--';
    try {
      const dateObj = new Date(timeStr);
      if (isNaN(dateObj.getTime())) return timeStr;
      
      // If it's a 1899 date (Google Sheets time-only format), use today's date with that time
      if (dateObj.getFullYear() === 1899) {
        const today = new Date();
        const timeOnlyDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 
                                     dateObj.getHours(), dateObj.getMinutes(), dateObj.getSeconds());
        
        return timeOnlyDate.toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          day: '2-digit',
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        });
      }
      
      // For normal dates, format as is
      return dateObj.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch (e) {
      return timeStr;
    }
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
        // For employee: load RFID attendance data
        const today = new Date();
        const rfidRecords = [];
        const userName = currentUser?.name.toLowerCase();
        
        for (let i = 0; i < 3; i++) {
          const date = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000));
          const dateStr = date.toISOString().split('T')[0];
          
          try {
            const response = await fetch(`${import.meta.env.VITE_ATTENDANCE_API_URL}?date=${dateStr}`);
            const data = await response.json();
            
            if (data.data && data.data.length > 0) {
              // Find only the current user's record
              const userRecord = data.data.find(emp => emp.Name.toLowerCase() === userName);
              
              if (userRecord) {
                const checkInTimes = [];
                const checkOutTimes = [];
                
                for (let j = 1; j <= 10; j++) {
                  const checkIn = userRecord[`Check-in ${j}`];
                  const checkOut = userRecord[`Check-out ${j}`];
                  
                  if (checkIn && checkIn !== '-' && checkIn !== '') {
                    checkInTimes.push(checkIn);
                  }
                  if (checkOut && checkOut !== '-' && checkOut !== '') {
                    checkOutTimes.push(checkOut);
                  }
                }
                
                if (checkInTimes.length > 0) {
                  rfidRecords.push({
                    date: date,
                    time_in: checkInTimes[0],
                    time_out: checkOutTimes[checkOutTimes.length - 1] || null,
                    employee_name: userRecord.Name,
                    source: 'rfid'
                  });
                }
              }
            }
          } catch (dailyError) {
            // Skip this day if error
          }
        }
        
        setAttendanceRecords(rfidRecords);
      }
    } catch (error) {
      console.error('Error in loadAttendanceRecords:', error);
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

  // Manual check-in/out functions - COMMENTED OUT (Using RFID-based attendance)
  // const handleCheckIn = async () => {
  //   const today = new Date().toDateString();
  //   const todayRecord = attendanceRecords.find((record) => {
  //     if (!record.date) return false;
  //     const recordDate = new Date(record.date).toDateString();
  //     return recordDate === today;
  //   });
    
  //   if (todayRecord && todayRecord.time_in) {
  //     if (todayRecord.checkout_time) {
  //       alert("You have already completed attendance for today!");
  //     } else {
  //       alert("You are already checked in! Please check out first.");
  //     }
  //     return;
  //   }

  //   setLoading(true);
  //   try {
  //     const employeeId = currentUser?._id || currentUser?.id;
  //     const attendanceData = {
  //       employee_id: employeeId
  //     };

  //     const response = await api.post('/api/attendance/time-in', attendanceData);

  //     const data = response.data;
      
  //     await loadAttendanceRecords();
  //     alert("Checked in successfully!");
  //   } catch (error) {
  //     alert("Error checking in: " + error.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleCheckOut = async () => {
  //   setLoading(true);
  //   try {
  //     const today = new Date().toDateString();
  //     const todayRecord = attendanceRecords.find((record) => {
  //       if (!record.date) return false;
  //       const recordDate = new Date(record.date).toDateString();
  //       return recordDate === today;
  //     });

  //     const employeeId = currentUser?._id || currentUser?.id;
  //     const requestBody = {
  //       employee_id: employeeId
  //     };

  //     if (isManualCheckout && customCheckoutTime) {
  //       const checkoutDateTime = new Date(`${new Date().toDateString()} ${customCheckoutTime}`).toISOString();
        
  //       if (todayRecord?.time_in) {
  //         const validationError = validateCheckoutTime(checkoutDateTime, todayRecord.time_in);
  //         if (validationError) {
  //           alert(validationError);
  //           setLoading(false);
  //           return;
  //         }
  //       }
        
  //       requestBody.checkout_time = checkoutDateTime;
  //     }

  //     const response = await api.post('/api/attendance/checkout', requestBody);

  //     const data = response.data;
      
  //     if (data.success) {
  //       setIsCheckedIn(false);
  //       setIsCompleted(true);
  //       await loadAttendanceRecords();
        
  //       const checkoutType = data.data?.is_manual_checkout ? "manual" : "automatic";
  //       alert(`Checked out successfully! (${checkoutType} checkout)`);
        
  //       setIsManualCheckout(false);
  //       setCustomCheckoutTime('');
  //     } else {
  //       alert(data.message || "Failed to check out");
  //     }
  //   } catch (error) {
  //     alert("Error checking out: " + error.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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

  // Auto checkout function - COMMENTED OUT (Using RFID-based attendance)
  // const checkAutoCheckout = async () => {
  //   const employeeId = currentUser?._id || currentUser?.id;
  //   if (!employeeId || isCompleted) return;
    
  //   const today = new Date().toDateString();
  //   const todayRecord = attendanceRecords.find((record) => {
  //     if (!record.date) return false;
  //     const recordDate = new Date(record.date).toDateString();
  //     return recordDate === today && record.employee_id === employeeId;
  //   });
    
  //   if (todayRecord && todayRecord.time_in && !(todayRecord.checkout_time || todayRecord.time_out)) {
  //     const currentHours = getCurrentWorkingHours(todayRecord);
      
  //     if (currentHours >= 9) {
  //       try {
  //         const response = await api.post('/api/attendance/checkout', { employee_id: employeeId });
          
  //         const data = response.data;
  //         setIsCheckedIn(false);
  //         setIsCompleted(true);
  //         await loadAttendanceRecords();
  //         alert("You have been automatically checked out after 9 hours of work!");
  //       } catch (error) {
  //       }
  //     }
  //   }
  // };

  const loadEmployees = async () => {
    try {
      const response = await api.get('/api/employees');
      const data = response.data;
      setEmployees(data.data || data || []);
    } catch (error) {
    }
  };

  const loadGoogleSheetsData = async () => {
    setLoadingGoogleSheets(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_ATTENDANCE_API_URL}?sheet=Summary`);
      const data = await response.json();
      setGoogleSheetsData(data.data || []);
    } catch (error) {
      console.error('Error loading Google Sheets data:', error);
      setGoogleSheetsData([]);
    } finally {
      setLoadingGoogleSheets(false);
    }
  };

  const loadAttendanceByDate = async (date) => {
    if (!date) return;
    
    setLoadingGoogleSheets(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_ATTENDANCE_API_URL}?date=${date}`);
      const data = await response.json();
      
      setAttendanceByDate(prev => ({
        ...prev,
        [date]: data.data || []
      }));
      
    } catch (error) {
      console.error('Error loading attendance data for date:', error);
      setAttendanceByDate(prev => ({
        ...prev,
        [date]: []
      }));
    } finally {
      setLoadingGoogleSheets(false);
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
    if (!endTime) return false; // If no checkout time, it's not a completed 7+ hour session
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
              placeholder="Filter by specific date"
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
          
          {isAdmin && (
            <div className="flex gap-3 items-center">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name as it appears in RFID attendance system:</label>
              <select
                value={selectedCalendarEmployee}
                onChange={(e) => setSelectedCalendarEmployee(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white text-sm"
              >
                <option value="">All Employees</option>
                {[...employees.map(emp => emp.name), ...googleSheetsData.map(emp => emp.Name)]
                  .filter((name, index, arr) => arr.indexOf(name) === index)
                  .sort()
                  .map((name, index) => (
                    <option key={index} value={name}>
                      {name}
                    </option>
                  ))}
              </select>
            </div>
          )}
          
          {(selectedDate || selectedEmployee || selectedCalendarEmployee) && (
            <button
              onClick={() => {
                setSelectedDate('');
                setSelectedEmployee('');
                setSelectedCalendarEmployee('');
              }}
              className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Check In/Out Card - COMMENTED OUT (Using RFID-based attendance) */}
      {/* {!isAdmin && (
        <div className="bg-blue-gray-200/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/50 p-8 mb-6">
          <div className="text-center">
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
                      placeholder="HH:MM (24-hour format)"
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required={isManualCheckout}
                    />
                  </div>
                )}
              </div>
            )}

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
      )} */}

      {/* Employee Time In/Out Status */}
      <div className="bg-blue-gray-200/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-lg shadow-md mb-6 border border-white/20 dark:border-gray-700/50">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Employee Time In/Out Status
          </h3>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Loading attendance records...</p>
            </div>
          ) : filteredRecords.filter(record => (record.time_in || record.time_out) && !hasWorked7Hours(record)).length > 0 ? (
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
                      ) : record.time_in ? (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                          In Progress
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 rounded-full">
                          Absent
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

      {/* Google Sheets Attendance Data */}
      {isAdmin && (
        <div className="bg-blue-gray-200/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-lg shadow-md mb-6 border border-white/20 dark:border-gray-700/50">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              RFID Employee Records
            </h3>
            <button
              onClick={loadGoogleSheetsData}
              disabled={loadingGoogleSheets}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 text-sm"
            >
              {loadingGoogleSheets ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          <div className="overflow-x-auto">
            {googleSheetsData.length > 0 ? (
              <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Employee Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      RFID UID
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {googleSheetsData.map((employee, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {employee.Name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {employee.UID}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  {loadingGoogleSheets ? 'Loading RFID data...' : 'No RFID employee records found.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Google Sheets Daily Attendance */}
      {isAdmin && (
        <div className="bg-blue-gray-200/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-lg shadow-md mb-6 border border-white/20 dark:border-gray-700/50">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Daily RFID Attendance Records
              </h3>
            </div>
            <div className="flex gap-3 items-center">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Date:</label>
              <input
                type="date"
                value={selectedAttendanceDate}
                onChange={(e) => {
                  setSelectedAttendanceDate(e.target.value);
                  if (e.target.value) {
                    loadAttendanceByDate(e.target.value);
                  }
                }}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {selectedAttendanceDate && attendanceByDate[selectedAttendanceDate] ? (
              attendanceByDate[selectedAttendanceDate].length > 0 ? (
                <table className="min-w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Employee Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Check-in Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Check-out Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {attendanceByDate[selectedAttendanceDate].map((record, index) => {
                      // Extract check-in and check-out times
                      const checkInTimes = [];
                      const checkOutTimes = [];
                      
                      // Look for Check-in 1, Check-in 2, etc.
                      for (let i = 1; i <= 10; i++) {
                        const checkIn = record[`Check-in ${i}`];
                        const checkOut = record[`Check-out ${i}`];
                        
                        if (checkIn && checkIn !== '-' && checkIn !== '') {
                          checkInTimes.push(formatGoogleSheetsTime(checkIn));
                        }
                        if (checkOut && checkOut !== '-' && checkOut !== '') {
                          checkOutTimes.push(formatGoogleSheetsTime(checkOut));
                        }
                      }
                      
                      return (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {record.Name || record.name || '--'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {checkInTimes.length > 0 ? (
                              <div className="space-y-1">
                                {checkInTimes.map((time, idx) => (
                                  <div key={idx} className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded font-mono">
                                    {time}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-500">--</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {checkOutTimes.length > 0 ? (
                              <div className="space-y-1">
                                {checkOutTimes.map((time, idx) => (
                                  <div key={idx} className="px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded font-mono">
                                    {time}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-500">--</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {(() => {
                              const statusInfo = calculateAttendanceStatus(checkInTimes, checkOutTimes);
                              return (
                                <span className={`px-3 py-1 text-xs rounded-full font-medium ${statusInfo.class}`}>
                                  {statusInfo.status}
                                </span>
                              );
                            })()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    No attendance records found for {selectedAttendanceDate}
                  </p>
                </div>
              )
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  {loadingGoogleSheets ? 'Loading attendance data...' : 'Select a date to view attendance records'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Employee Calendar Section */}
      {isAdmin && (
        <div className="bg-blue-gray-200/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-lg shadow-md mb-6 border border-white/20 dark:border-gray-700/50">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Employee Calendar View
            </h3>
            <div className="flex gap-4 items-center mb-4">
              <select
                value={selectedCalendarEmployee}
                onChange={(e) => {
                  setSelectedCalendarEmployee(e.target.value);
                  if (e.target.value) {
                    loadEmployeeCalendarData(e.target.value, currentMonth);
                  }
                }}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white text-sm"
              >
                <option value="">Choose Employee</option>
                {googleSheetsData.map((employee, index) => (
                  <option key={index} value={employee.Name}>
                    {employee.Name}
                  </option>
                ))}
              </select>
              
              {selectedCalendarEmployee && (
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => {
                      const newMonth = new Date(currentMonth);
                      newMonth.setMonth(newMonth.getMonth() - 1);
                      setCurrentMonth(newMonth);
                      loadEmployeeCalendarData(selectedCalendarEmployee, newMonth);
                    }}
                    className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                  >
                    ←
                  </button>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[120px] text-center">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <button
                    onClick={() => {
                      const newMonth = new Date(currentMonth);
                      newMonth.setMonth(newMonth.getMonth() + 1);
                      setCurrentMonth(newMonth);
                      loadEmployeeCalendarData(selectedCalendarEmployee, newMonth);
                    }}
                    className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                  >
                    →
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-6">
            {selectedCalendarEmployee ? (
              loadingGoogleSheets ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">Loading calendar...</p>
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-1">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center font-medium text-gray-500 dark:text-gray-400 text-sm">
                      {day}
                    </div>
                  ))}
                  {(() => {
                    const year = currentMonth.getFullYear();
                    const month = currentMonth.getMonth();
                    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
                    const employeeData = employeeCalendarData[`${selectedCalendarEmployee}-${monthStr}`] || {};
                    const firstDay = new Date(year, month, 1);
                    const lastDay = new Date(year, month + 1, 0);
                    const startDate = new Date(firstDay);
                    startDate.setDate(startDate.getDate() - firstDay.getDay());
                    const days = [];
                    const current = new Date(startDate);
                    while (current <= lastDay || days.length < 42) {
                      days.push(new Date(current));
                      current.setDate(current.getDate() + 1);
                      if (days.length >= 42) break;
                    }
                    return days.map((date, index) => {
                      const isCurrentMonth = date.getMonth() === month;
                      const attendanceInfo = getAttendanceStatus(date, employeeData);
                      return (
                        <div
                          key={index}
                          className={`p-2 text-center text-sm border border-gray-200 dark:border-gray-600 ${
                            isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400'
                          }`}
                        >
                          <div className="font-medium mb-1">{date.getDate()}</div>
                          {isCurrentMonth && attendanceInfo.status && (
                            <div className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center text-xs font-bold ${attendanceInfo.class}`}>
                              {attendanceInfo.status}
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              )
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">Select an employee to view their attendance calendar</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Timeout Records Table */}
      <div className="bg-blue-gray-200/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-lg shadow-md border border-white/20 dark:border-gray-700/50">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Timeout Records
          </h3>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Loading timeout records...</p>
            </div>
          ) : filteredRecords.filter(record => hasWorked7Hours(record)).length > 0 ? (
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
