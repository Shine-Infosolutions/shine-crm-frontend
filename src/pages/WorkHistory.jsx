import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";

function WorkHistory() {
  const { currentUser, API_URL } = useAppContext();
  const [workHistory, setWorkHistory] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [error, setError] = useState("");

  const isAdmin = currentUser?.role !== "employee";
  console.log("Current user:", currentUser, "isAdmin:", isAdmin);

  useEffect(() => {
    if (currentUser === null) {
      return;
    }

    if (currentUser?.id) {
      if (isAdmin) {
        loadEmployeesAndHistory();
      } else {
        loadWorkHistory();
      }
    } else {
      setLoading(false);
    }
  }, [currentUser, isAdmin]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && currentUser?.id) {
        if (isAdmin) {
          loadEmployeesAndHistory();
        } else {
          loadWorkHistory();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [currentUser, isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      if (selectedEmployee && selectedDate) {
        // Show specific employee's work for selected date
        const selectedRecord = workHistory.find(
          (record) =>
            formatDateForComparison(record.date) === selectedDate &&
            record.employee_id === selectedEmployee
        );
        setFilteredEntries(
          selectedRecord?.time_entries?.filter((entry) =>
            entry.task_description?.trim()
          ) || []
        );
      } else if (!selectedEmployee && !selectedDate) {
        // Show all recent work entries from all employees
        const allEntries = workHistory
          .slice(0, 10) // Show latest 10 timesheets
          .flatMap(
            (record) =>
              record.time_entries?.map((entry) => ({
                ...entry,
                employee_name: record.employee_name,
                date: record.date,
                status: record.status,
              })) || []
          )
          .filter((entry) => entry.task_description?.trim());
        setFilteredEntries(allEntries);
      } else {
        setFilteredEntries([]);
      }
    } else {
      // Employee logic remains the same
      if (selectedDate && workHistory.length > 0) {
        const selectedRecord = workHistory.find(
          (record) => formatDateForComparison(record.date) === selectedDate
        );
        setFilteredEntries(
          selectedRecord?.time_entries?.filter((entry) =>
            entry.task_description?.trim()
          ) || []
        );
      } else {
        setFilteredEntries([]);
      }
    }
  }, [selectedDate, selectedEmployee, workHistory, isAdmin, currentUser]);
  // Helper function to format date for consistent comparison
  const formatDateForComparison = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const loadEmployeesAndHistory = async () => {
    try {
      setLoading(true);
      setError("");

      // First load employees
      const employeeList = await loadEmployees();

      // Then load work history with the employee list
      await loadWorkHistory(employeeList);
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Failed to load employee data");
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      console.log("Loading employees from:", `${API_URL}/api/employees`);
      const response = await fetch(`${API_URL}/api/employees`);

      if (response.ok) {
        const data = await response.json();
        console.log("Employee API response:", data);

        // Handle different possible response structures
        let employeeList = [];
        if (Array.isArray(data)) {
          employeeList = data;
        } else if (data.data && Array.isArray(data.data)) {
          employeeList = data.data;
        } else if (data.employees && Array.isArray(data.employees)) {
          employeeList = data.employees;
        }

        console.log("Processed employee list:", employeeList);
        setEmployees(employeeList);
        return employeeList;
      } else {
        throw new Error(`Failed to load employees: ${response.status}`);
      }
    } catch (error) {
      console.error("Error loading employees:", error);
      setError("Failed to load employees");
      return [];
    }
  };

  const loadWorkHistory = async (employeeList = employees) => {
    try {
      if (!currentUser?.id) {
        setLoading(false);
        return;
      }

      if (isAdmin) {
        const response = await fetch(`${API_URL}/api/timesheet`);
        if (response.ok) {
          const data = await response.json();
          const records = data.timesheets || [];

          const recordsWithNames = records.map((record) => ({
            ...record,
            employee_name:
              employeeList.find((emp) => emp._id === record.employee_id)
                ?.name || "Unknown",
          }));

          // Sort by date descending
          recordsWithNames.sort((a, b) => new Date(b.date) - new Date(a.date));
          setWorkHistory(recordsWithNames);
        } else {
          throw new Error(`Failed to load timesheets: ${response.status}`);
        }
      } else {
        // Employee logic remains the same
        const localStorageKeys = Object.keys(localStorage).filter((key) =>
          key.startsWith(`timesheet_${currentUser.id}_`)
        );

        const localRecords = localStorageKeys.map((key) => {
          const data = JSON.parse(localStorage.getItem(key));
          return {
            ...data,
            status: "Pending",
          };
        });

        const response = await fetch(`${API_URL}/api/timesheet`);
        let employeeRecords = [];

        if (response.ok) {
          const data = await response.json();
          const records = data.timesheets || [];
          employeeRecords = records.filter(
            (record) => record.employee_id === currentUser.id
          );
        }

        const allRecords = [...localRecords];
        employeeRecords.forEach((apiRecord) => {
          const exists = localRecords.some(
            (localRecord) =>
              formatDateForComparison(localRecord.date) ===
              formatDateForComparison(apiRecord.date)
          );
          if (!exists) {
            allRecords.push(apiRecord);
          }
        });

        allRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
        setWorkHistory(allRecords);

        if (allRecords.length > 0) {
          setSelectedDate(formatDateForComparison(allRecords[0].date));
        }
      }
    } catch (error) {
      console.error("Error loading work history:", error);
      setError("Failed to load work history");
      setWorkHistory([]);
    } finally {
      if (!isAdmin) {
        setLoading(false);
      }
    }
  };

  const approveTimesheet = async (record) => {
    try {
      const response = await fetch(`${API_URL}/api/timesheet/${record._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "Approved" }),
      });

      if (response.ok) {
        loadEmployeesAndHistory();
        alert("Timesheet approved successfully!");
      } else {
        alert("Failed to approve timesheet");
      }
    } catch (error) {
      console.error("Error approving timesheet:", error);
      alert("Error approving timesheet");
    }
  };

  const selectedRecord = workHistory.find((record) => {
    const targetEmployeeId = isAdmin ? selectedEmployee : currentUser?.id;
    return (
      formatDateForComparison(record.date) === selectedDate &&
      record.employee_id === targetEmployeeId
    );
  });

  const formatTime = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Get available dates for selected employee (admin) or current user (employee)
  const getAvailableDates = () => {
    const targetEmployeeId = isAdmin ? selectedEmployee : currentUser?.id;
    return workHistory
      .filter((record) => record.employee_id === targetEmployeeId)
      .map((record) => formatDateForComparison(record.date))
      .filter((date, index, self) => self.indexOf(date) === index)
      .sort((a, b) => new Date(b) - new Date(a));
  };

  if (currentUser === null || loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!currentUser) {
    return <div className="p-6">Please log in to view work history.</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        {isAdmin ? "Employee Work History" : "Work History"}
      </h2>

      {/* Admin Overview - Show all employees' recent activity */}
      {isAdmin && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            All Employees Activity Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map((employee) => {
              const employeeRecords = workHistory.filter(
                (record) => record.employee_id === employee._id
              );
              const latestRecord = employeeRecords[0];

              return (
                <div
                  key={employee._id}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => {
                    setSelectedEmployee(employee._id);
                    if (latestRecord) {
                      setSelectedDate(
                        formatDateForComparison(latestRecord.date)
                      );
                    }
                  }}
                >
                  <div className="font-medium text-gray-900 dark:text-white">
                    {employee.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {employeeRecords.length} timesheet(s)
                  </div>
                  {latestRecord && (
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Latest: {new Date(latestRecord.date).toLocaleDateString()}
                      <span
                        className={`ml-2 px-2 py-1 rounded-full ${
                          latestRecord.status === "Submitted"
                            ? "bg-green-100 text-green-800"
                            : latestRecord.status === "Approved"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {latestRecord.status}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="flex items-center space-x-4 flex-wrap">
          {isAdmin && (
            <>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Employee: ({employees.length} employees loaded)
              </label>
              <select
                value={selectedEmployee}
                onChange={(e) => {
                  console.log("Employee selected:", e.target.value);
                  console.log("Available employees:", employees);
                  setSelectedEmployee(e.target.value);
                  setSelectedDate(""); // Reset date when employee changes
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Employee</option>
                {employees.length === 0 ? (
                  <option disabled>No employees found</option>
                ) : (
                  employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name || emp.username || `Employee ${emp._id}`}
                    </option>
                  ))
                )}
              </select>
            </>
          )}

          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Select Date:
          </label>
          <select
            value={selectedDate}
            onChange={(e) => {
              console.log("Date selected:", e.target.value);
              setSelectedDate(e.target.value);
            }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isAdmin && !selectedEmployee}
          >
            <option value="">Select Date</option>
            {getAvailableDates().map((date) => (
              <option key={date} value={date}>
                {new Date(date).toLocaleDateString()}
              </option>
            ))}
          </select>

          {/* Add a clear button for admin */}
          {isAdmin && (selectedEmployee || selectedDate) && (
            <button
              onClick={() => {
                setSelectedEmployee("");
                setSelectedDate("");
              }}
              className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
            >
              Clear Selection
            </button>
          )}

          {selectedRecord && (
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Total: {selectedRecord.total_hours}h
              </span>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  selectedRecord.status === "Submitted"
                    ? "bg-green-100 text-green-800"
                    : selectedRecord.status === "Approved"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {selectedRecord.status}
              </span>

              {isAdmin && selectedRecord.status === "Submitted" && (
                <button
                  onClick={() => approveTimesheet(selectedRecord)}
                  className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                >
                  Approve
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="overflow-x-auto">
          {filteredEntries.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 dark:bg-gray-700">
                  {isAdmin && !selectedEmployee && (
                    <th className="text-left py-3 px-4">Employee</th>
                  )}
                  <th className="text-left py-3 px-4">Time Slot</th>
                  <th className="text-center py-3 px-4">Task Description</th>
                  <th className="text-left py-3 px-4">Hours</th>
                  {isAdmin && !selectedEmployee && (
                    <th className="text-left py-3 px-4">Date</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry, entryIndex) => (
                  <tr key={entryIndex} className="border-b border-gray-200">
                    {isAdmin && !selectedEmployee && (
                      <td className="py-3 px-4 font-medium">
                        {entry.employee_name}
                      </td>
                    )}
                    <td className="py-3 px-4">
                      {formatTime(entry.start_time)} to{" "}
                      {formatTime(entry.end_time)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {entry.task_description}
                    </td>
                    <td className="py-3 px-4">{entry.hours_worked}h</td>
                    {isAdmin && !selectedEmployee && (
                      <td className="py-3 px-4">
                        {new Date(entry.date).toLocaleDateString()}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                {isAdmin
                  ? selectedEmployee
                    ? selectedDate
                      ? "No work entries found for selected date."
                      : "Please select a date to view work history."
                    : "Please select an employee to view their work history."
                  : selectedDate
                  ? "No work entries found for selected date."
                  : "Please select a date to view work history."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WorkHistory;
