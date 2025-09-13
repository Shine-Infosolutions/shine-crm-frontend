function Dashboard() {
  return (
    <div className="p-6 bg-gray-50 dark:bg-[#101828] min-h-screen">
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard Overview
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor your business performance and key metrics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-slate-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider">
                Total Leads
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                1,234
              </p>
              <div className="flex items-center mt-3">
                <div className="flex items-center text-slate-700 dark:text-slate-300">
                  <svg
                    className="h-4 w-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 17l9.2-9.2M17 17V7H7"
                    />
                  </svg>
                  <span className="text-sm font-medium">+12%</span>
                </div>
                <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                  vs last month
                </span>
              </div>
            </div>
            <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-full">
              <svg
                className="h-8 w-8 text-slate-600 dark:text-slate-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-zinc-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider">
                Active Projects
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                56
              </p>
              <div className="flex items-center mt-3">
                <div className="flex items-center text-zinc-700 dark:text-zinc-300">
                  <svg
                    className="h-4 w-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 17l9.2-9.2M17 17V7H7"
                    />
                  </svg>
                  <span className="text-sm font-medium">+8%</span>
                </div>
                <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                  vs last month
                </span>
              </div>
            </div>
            <div className="bg-zinc-100 dark:bg-zinc-700 p-4 rounded-full">
              <svg
                className="h-8 w-8 text-zinc-600 dark:text-zinc-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider">
                Revenue
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                $12,345
              </p>
              <div className="flex items-center mt-3">
                <div className="flex items-center text-blue-800 dark:text-blue-300">
                  <svg
                    className="h-4 w-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 17l9.2-9.2M17 17V7H7"
                    />
                  </svg>
                  <span className="text-sm font-medium">+15%</span>
                </div>
                <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                  vs last month
                </span>
              </div>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full">
              <svg
                className="h-8 w-8 text-blue-800 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-gray-900 dark:border-gray-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider">
                Conversion Rate
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                24%
              </p>
              <div className="flex items-center mt-3">
                <div className="flex items-center text-gray-800 dark:text-gray-300">
                  <svg
                    className="h-4 w-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 7l-9.2 9.2M7 7v10h10"
                    />
                  </svg>
                  <span className="text-sm font-medium">-2%</span>
                </div>
                <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                  vs last month
                </span>
              </div>
            </div>
            <div className="bg-gray-200 dark:bg-gray-700 p-4 rounded-full">
              <svg
                className="h-8 w-8 text-gray-800 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <svg
                className="h-6 w-6 mr-2 text-slate-600 dark:text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Recent Activity
            </h3>
            <button className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              View All
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-lg border-l-4 border-slate-600">
              <div className="bg-slate-600 dark:bg-slate-400 p-2 rounded-full">
                <svg
                  className="h-5 w-5 text-white dark:text-slate-900"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">
                  New lead converted successfully
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  John Doe from Tech Corp - 2 hours ago
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border-l-4 border-blue-800">
              <div className="bg-blue-800 dark:bg-blue-600 p-2 rounded-full">
                <svg
                  className="h-5 w-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">
                  Project milestone completed
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Website redesign phase 2 - Jane Smith - 3 hours ago
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-700 rounded-lg border-l-4 border-zinc-700">
              <div className="bg-zinc-700 dark:bg-zinc-400 p-2 rounded-full">
                <svg
                  className="h-5 w-5 text-white dark:text-zinc-900"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">
                  Payment received
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  $5,000 from Mike Johnson - 5 hours ago
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <svg
              className="h-5 w-5 mr-2 text-zinc-600 dark:text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
            Top Performers
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-slate-300 dark:bg-slate-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    JS
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    John Smith
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Sales Manager
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900 dark:text-white">$45K</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This month
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-zinc-300 dark:bg-zinc-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                    AD
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Alice Davis
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Lead Developer
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900 dark:text-white">$38K</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This month
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-800 dark:text-blue-300">
                    MJ
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Mike Johnson
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Project Manager
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900 dark:text-white">$32K</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This month
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Project Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <svg
              className="h-5 w-5 mr-2 text-blue-800 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Project Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Website Redesign
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Due: Dec 15, 2024
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-slate-600 dark:bg-slate-400 h-2 rounded-full"
                    style={{ width: "75%" }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  75%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  E-commerce Platform
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Due: Jan 20, 2025
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-blue-200 dark:bg-blue-900/30 rounded-full h-2">
                  <div
                    className="bg-blue-800 dark:bg-blue-600 h-2 rounded-full"
                    style={{ width: "45%" }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  45%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  CRM Integration
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Due: Feb 10, 2025
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                  <div
                    className="bg-zinc-800 dark:bg-zinc-400 h-2 rounded-full"
                    style={{ width: "90%" }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-300">
                  90%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <svg
              className="h-5 w-5 mr-2 text-slate-600 dark:text-slate-400"
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
            Upcoming Tasks
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <input
                type="checkbox"
                className="mt-1 rounded border-slate-300 dark:border-slate-600"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  Review client proposals
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Today, 2:00 PM
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
              <input
                type="checkbox"
                className="mt-1 rounded border-zinc-300 dark:border-zinc-600"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  Team standup meeting
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Tomorrow, 9:00 AM
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <input
                type="checkbox"
                className="mt-1 rounded border-blue-300 dark:border-blue-600"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  Update project documentation
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Dec 12, 2024
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <input
                type="checkbox"
                className="mt-1 rounded border-gray-300 dark:border-gray-600"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  Client presentation prep
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Dec 14, 2024
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
