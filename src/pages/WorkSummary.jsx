import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";

function WorkSummary() {
  const { currentUser, API_URL } = useAppContext();
  const [workHistory, setWorkHistory] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState("");

  const isAdmin = currentUser?.role !== "employee";

  useEffect(() => {
    if (currentUser === null) {
      return;
    }

    if (currentUser?.id) {
      if (isAdmin) {
        loadEmployees().then((employeeList) => {
          loadWorkHistory(employeeList);
        });
      } else {
        loadWorkHistory();
      }
    } else {
      setLoading(false);
    }
  }, [currentUser, isAdmin]);

  const loadEmployees = async () => {
    try {
      const response = await fetch(`${API_URL}/api/employees`);
      if (response.ok) {
        const data = await response.json();
        const employeeList = data.data || data || [];
        setEmployees(employeeList);
        return employeeList;
      }
      return [];
    } catch (error) {
      console.error("Error loading employees:", error);
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
        // Admin: Load all timesheets
        const response = await fetch(`${API_URL}/api/timesheet`);
        if (response.ok) {
          const data = await response.json();
          const records = data.timesheets || [];

          // Add employee names to records
          const recordsWithNames = records.map((record) => ({
            ...record,
            employee_name:
              employeeList.find((emp) => emp._id === record.employee_id)
                ?.name || "Unknown",
          }));

          setWorkHistory(recordsWithNames);
        }
      } else {
        // Employee: Load own timesheets
        const response = await fetch(`${API_URL}/api/timesheet`);
        let employeeRecords = [];

        if (response.ok) {
          const data = await response.json();
          const records = data.timesheets || [];
          employeeRecords = records.filter(
            (record) => record.employee_id === currentUser.id
          );
        }

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

        const allRecords = [...employeeRecords];
        localRecords.forEach((localRecord) => {
          const exists = employeeRecords.some(
            (apiRecord) =>
              new Date(apiRecord.date).toDateString() ===
              new Date(localRecord.date).toDateString()
          );
          if (!exists) {
            allRecords.push(localRecord);
          }
        });

        allRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
        setWorkHistory(allRecords);
      }
    } catch (error) {
      console.error("Error loading work history:", error);
      setWorkHistory([]);
    } finally {
      setLoading(false);
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
        loadWorkHistory();
        alert("Timesheet approved successfully!");
      } else {
        alert("Failed to approve timesheet");
      }
    } catch (error) {
      console.error("Error approving timesheet:", error);
      alert("Error approving timesheet");
    }
  };

  const filteredHistory =
    isAdmin && selectedEmployee
      ? workHistory.filter((record) => record.employee_id === selectedEmployee)
      : workHistory;

  if (currentUser === null || loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!currentUser) {
    return <div className="p-6">Please log in to view work summary.</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        {isAdmin ? "Employee Work Summary" : "Work Summary"}
      </h2>

      {/* Admin Overview - Show all employees' summary */}
      {isAdmin && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            All Employees Summary Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map((employee) => {
              const employeeRecords = workHistory.filter(
                (record) => record.employee_id === employee._id
              );
              const totalHours = employeeRecords.reduce(
                (sum, record) => sum + (record.total_hours || 0),
                0
              );
              const submittedCount = employeeRecords.filter(
                (record) => record.status === "Submitted"
              ).length;
              const approvedCount = employeeRecords.filter(
                (record) => record.status === "Approved"
              ).length;
              const pendingCount = employeeRecords.filter(
                (record) => record.status === "Pending"
              ).length;

              return (
                <div
                  key={employee._id}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => setSelectedEmployee(employee._id)}
                >
                  <div className="font-medium text-gray-900 dark:text-white">
                    {employee.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Total Hours: {totalHours}h
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {employeeRecords.length} timesheet(s)
                  </div>
                  <div className="flex space-x-2 mt-2">
                    {pendingCount > 0 && (
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                        {pendingCount} Pending
                      </span>
                    )}
                    {submittedCount > 0 && (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        {submittedCount} Submitted
                      </span>
                    )}
                    {approvedCount > 0 && (
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {approvedCount} Approved
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter for Admin */}
      {isAdmin && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filter by Employee:
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
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
                onClick={() => setSelectedEmployee("")}
                className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>
      )}

      {/* Summary Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="overflow-x-auto">
          {filteredHistory.length > 0 ? (
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {isAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Employee
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Total Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Tasks Completed
                  </th>
                  {isAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {filteredHistory.map((record, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {record.employee_name || "Unknown"}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {record.total_hours}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          record.status === "Submitted"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : record.status === "Approved"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : record.status === "Pending"
                            ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {record.time_entries?.filter((entry) =>
                        entry.task_description.trim()
                      ).length || 0}{" "}
                      tasks
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {record.status === "Submitted" && (
                          <button
                            onClick={() => approveTimesheet(record)}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                          >
                            Approve
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                {isAdmin && selectedEmployee
                  ? "No work history found for selected employee."
                  : "No work history found."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WorkSummary;
