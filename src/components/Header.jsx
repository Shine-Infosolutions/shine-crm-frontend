import { useAppContext } from "../context/AppContext";

function Header() {
  const { toggleSidebar, darkMode, toggleDarkMode, currentUser, logout, sidebarOpen } =
    useAppContext();

  return (
    <header className="bg-white shadow-md dark:bg-gray-900 dark:text-white">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          {/* Show hamburger button when sidebar is collapsed or on mobile */}
          {(!sidebarOpen || window.innerWidth < 768) && (
            <button
              onClick={toggleSidebar}
              className="mr-4 text-gray-600 dark:text-gray-200"
              title="Toggle Sidebar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          )}
          <h1 className="text-xl font-bold">
            {currentUser?.role === "employee"
              ? "Employee Dashboard"
              : "Admin Dashboard"}
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Toggle Dark Mode Button */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? (
              // Sun icon for light mode
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-yellow-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              // Moon icon for dark mode
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-700 dark:text-gray-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>

          {/* User Info */}
          {currentUser ? (
            <div className="flex items-center">
              <span className="mr-2">{currentUser.name}</span>
              <button
                onClick={logout}
                className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          ) : (
            <button className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
