import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';

const EmployeeAttendanceWidget = () => {
  const { currentUser } = useAppContext();
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.rfid_attendance_name) {
      loadTodayAttendance();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const loadTodayAttendance = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`${import.meta.env.VITE_ATTENDANCE_API_URL}?date=${today}`);
      const data = await response.json();
      
      const employeeRecord = data.data?.find(record => 
        record.Name === currentUser.rfid_attendance_name
      );
      
      if (employeeRecord) {
        // Extract check-in and check-out times
        const checkInTimes = [];
        const checkOutTimes = [];
        
        for (let i = 1; i <= 10; i++) {
          const checkIn = employeeRecord[`Check-in ${i}`];
          const checkOut = employeeRecord[`Check-out ${i}`];
          
          if (checkIn && checkIn !== '-' && checkIn !== '') {
            checkInTimes.push(checkIn);
          }
          if (checkOut && checkOut !== '-' && checkOut !== '') {
            checkOutTimes.push(checkOut);
          }
        }
        
        setAttendanceData({
          checkInTime: checkInTimes[0] || null,
          checkOutTime: checkOutTimes[checkOutTimes.length - 1] || null,
          totalCheckIns: checkInTimes.length,
          totalCheckOuts: checkOutTimes.length,
          isPresent: checkInTimes.length > 0
        });
      } else {
        setAttendanceData({
          checkInTime: null,
          checkOutTime: null,
          totalCheckIns: 0,
          totalCheckOuts: 0,
          isPresent: false
        });
      }
    } catch (error) {
      console.error('Error loading attendance:', error);
      setAttendanceData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '--';
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeStr;
    }
  };

  const calculateWorkingHours = () => {
    if (!attendanceData?.checkInTime || !attendanceData?.checkOutTime) return '--';
    try {
      const checkIn = new Date(attendanceData.checkInTime);
      const checkOut = new Date(attendanceData.checkOutTime);
      const hours = (checkOut - checkIn) / (1000 * 60 * 60);
      return `${hours.toFixed(1)}h`;
    } catch {
      return '--';
    }
  };

  if (!currentUser?.rfid_attendance_name) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-yellow-50/80 dark:bg-yellow-900/20 backdrop-blur-md rounded-lg p-4 shadow-lg border border-yellow-200/50"
      >
        <div className="text-center">
          <svg className="w-8 h-8 text-yellow-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            RFID attendance name not configured
          </p>
          <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">
            Contact admin to set up attendance tracking
          </p>
        </div>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-lg p-4 shadow-lg border border-white/20"
      >
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-lg p-4 shadow-lg border border-white/20"
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center">
          <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Today's Attendance
        </h4>
        <div className={`w-3 h-3 rounded-full ${attendanceData?.isPresent ? 'bg-green-500' : 'bg-gray-400'}`}></div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-green-700 dark:text-green-400">Check In</span>
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </div>
            <div className="text-lg font-bold text-green-800 dark:text-green-300">
              {formatTime(attendanceData?.checkInTime)}
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-red-700 dark:text-red-400">Check Out</span>
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <div className="text-lg font-bold text-red-800 dark:text-red-300">
              {formatTime(attendanceData?.checkOutTime)}
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-blue-700 dark:text-blue-400">Working Hours</span>
            <span className="text-lg font-bold text-blue-800 dark:text-blue-300">
              {calculateWorkingHours()}
            </span>
          </div>
        </div>

        {attendanceData && (attendanceData.totalCheckIns > 1 || attendanceData.totalCheckOuts > 1) && (
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>Total Check-ins: {attendanceData.totalCheckIns}</span>
              <span>Total Check-outs: {attendanceData.totalCheckOuts}</span>
            </div>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={() => window.location.href = '/attendance'}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
          >
            View Full Attendance →
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default EmployeeAttendanceWidget;