import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";

function EmployeeAttendance() {
  const { currentUser, API_URL } = useAppContext();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const isAdmin = currentUser?.role !== "employee";

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadAttendanceRecords();
  }, [currentUser, isAdmin]);

  const [employees, setEmployees] = useState([]);

  const loadAttendanceRecords = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        // For admin: load both attendance and employees
        const [attendanceResponse, employeeResponse] = await Promise.all([
          fetch(`${API_URL}/api/attendance`),
          fetch(`${API_URL}/api/employees`),
        ]);

        if (attendanceResponse.ok) {
          const data = await attendanceResponse.json();
          const records = data.data || data || [];

          if (employeeResponse?.ok) {
            const employeeData = await employeeResponse.json();
            const employeeList = employeeData.data || employeeData || [];

            const recordsWithNames = records.map((record) => ({
              ...record,
              employee_name: record.employee_id?.name || "Unknown",
            }));

            setAttendanceRecords(recordsWithNames);
          } else {
            setAttendanceRecords(records);
          }
        }
      } else {
        // For employee: only load attendance
        const response = await fetch(
          `${API_URL}/api/attendance?employee_id=${currentUser?.id}`
        );

        if (response.ok) {
          const data = await response.json();
          const records = data.data || data || [];
          setAttendanceRecords(records);

          // Check if currently checked in
          const today = new Date().toDateString();
          const todayRecord = records.find(
            (record) =>
              record.time_in && 
              new Date(record.date).toDateString() === today &&
              !record.time_out
          );
          setIsCheckedIn(!!todayRecord);
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
    setLoading(true);
    try {
      const attendanceData = {
        employee_id: currentUser.id
      };

      const response = await fetch(`${API_URL}/api/attendance/time-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(attendanceData),
      });

      if (response.ok) {
        setIsCheckedIn(true);
        loadAttendanceRecords();
        alert("Checked in successfully!");
      } else {
        const errorText = await response.text();
        console.error("Failed to check in:", response.status, errorText);
        alert(`Failed to check in: ${response.status}`);
      }
    } catch (error) {
      console.error("Error checking in:", error);
      alert("Error checking in: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const location = await getCurrentLocation();
      const attendanceData = {
        employee_id: currentUser.id,
        location: {
          latitude: location.latitude,
          longitude: location.longitude
        }
      };

      const response = await fetch(`${API_URL}/api/attendance/time-out`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(attendanceData),
      });

      if (response.ok) {
        setIsCheckedIn(false);
        loadAttendanceRecords();
        alert("Checked out successfully!");
      } else {
        let errorMessage = "Failed to check out";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = `Server error (${response.status})`;
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Error checking out:", error);
      alert("Failed to get location: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateWorkingHours = (record) => {
    if (!record.time_out || !record.time_in) return "--";

    const diff = (new Date(record.time_out) - new Date(record.time_in)) / (1000 * 60 * 60);
    return `${diff.toFixed(1)}h`;
  };



  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        {isAdmin ? "All Employee Attendance" : "Employee Attendance"}
      </h2>

      {/* Check In/Out Card - Only for Employees */}
      {!isAdmin && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 mb-6">
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
                {isCheckedIn
                  ? "Currently Checked In"
                  : "Ready to Check In"}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={isCheckedIn ? handleCheckOut : handleCheckIn}
              disabled={loading}
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
                  {isCheckedIn ? "Check Out Now" : "Check In Now"}
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

      {/* Attendance Records */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {isAdmin ? "All Employee Records" : "Attendance History"}
          </h3>
        </div>

        <div className="overflow-x-auto">
          {attendanceRecords.length > 0 ? (
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
                    Location
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {attendanceRecords.map((record, index) => (
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
                            {new Date(record.time_in).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
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
                      {record.time_out ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-900 dark:text-white">
                            {new Date(record.time_out).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
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
                        {calculateWorkingHours(record)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      --
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No attendance records found.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmployeeAttendance;
