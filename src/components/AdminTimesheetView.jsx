import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

const AdminTimesheetView = () => {
  const [timesheets, setTimesheets] = useState([]);
  const { API_URL } = useAppContext();

  useEffect(() => {
    fetch(`${API_URL}/api/employee-timesheet/admin/all`)
      .then(res => res.json())
      .then(data => setTimesheets(data.timesheets || []));
  }, []);

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          All Employee Timesheets
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          View all employee timesheet submissions
        </p>
      </div>

      <div className="space-y-6">
        {timesheets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No timesheets found</p>
          </div>
        ) : (
          timesheets.map((timesheet) => (
            <div key={timesheet._id} className="bg-blue-gray-200/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-lg shadow-md border border-white/20 dark:border-gray-700/50">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {timesheet.employee_name} - {new Date(timesheet.date).toLocaleDateString("en-US", {
                      weekday: "long", year: "numeric", month: "long", day: "numeric"
                    })}
                  </h3>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Total Hours: {timesheet.total_hours}h
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      timesheet.status === 'Approved' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : timesheet.status === 'Submitted'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}>
                      {timesheet.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid gap-4">
                  {timesheet.time_entries?.map((entry, index) => (
                    <div key={index} className="group bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-2 rounded-xl p-5 transition-all duration-200 hover:shadow-lg border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Time Slot
                          </label>
                          <div className="px-4 py-2 rounded-lg text-sm font-medium border-2 bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
                            {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Task Description
                              </label>
                              <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[60px] flex items-center">
                                {entry.task_description || 'No description'}
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Project Name
                              </label>
                              <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                {entry.project_name || 'No project'}
                              </div>
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
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminTimesheetView;