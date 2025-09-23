import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Link } from "react-router-dom";
import { FaChevronDown } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

function Sidebar() {
  const { sidebarOpen, toggleSidebar, currentUser } = useAppContext();
  const [employeeDropdownOpen, setEmployeeDropdownOpen] = useState(false);

  const isEmployee = currentUser?.role === "employee";

  return (
    <motion.div
      initial={{ x: -256 }}
      animate={{ x: sidebarOpen ? 0 : -256 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="bg-slate-300/80 dark:bg-gray-800/80 backdrop-blur-xl text-gray-800 dark:text-white border-r border-white/20 dark:border-gray-700/50 h-screen fixed top-0 left-0 z-10 w-64 shadow-2xl"
    >
      <div className="p-4 relative">
        {/* Hamburger/Close button */}
        <div className="flex items-center justify-between mb-6">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            Shine CRM
          </motion.h2>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleSidebar}
            className="p-1 rounded-full hover:bg-white/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-all duration-200"
            aria-label="Toggle sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
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
          </motion.button>
        </div>

        <nav>
          <ul className="space-y-2">
            {/* Dashboard - Admin only */}
            {!isEmployee && (
              <li>
                <motion.div
                  whileHover={{ scale: 1.02, x: 5, backgroundColor: "rgba(255,255,255,0.2)" }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-lg"
                >
                  <Link
                    to="/"
                    className="block py-2 px-4 rounded hover:bg-white/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-all duration-200"
                  >
                    Dashboard
                  </Link>
                </motion.div>
              </li>
            )}
            {!isEmployee && (
              <li>
                <motion.div
                  whileHover={{ scale: 1.02, x: 5, backgroundColor: "rgba(255,255,255,0.2)" }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-lg"
                >
                  <Link
                    to="/leads"
                    className="block py-2 px-4 rounded hover:bg-white/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-all duration-200"
                  >
                    Lead Management
                  </Link>
                </motion.div>
              </li>
            )}
            {!isEmployee && (
              <li>
                <motion.div
                  whileHover={{ scale: 1.02, x: 5, backgroundColor: "rgba(255,255,255,0.2)" }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-lg"
                >
                  <Link
                    to="/projects"
                    className="block py-2 px-4 rounded hover:bg-white/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-all duration-200"
                  >
                    Project Management
                  </Link>
                </motion.div>
              </li>
            )}
            {!isEmployee && (
              <li>
                <motion.div
                  whileHover={{ scale: 1.02, x: 5, backgroundColor: "rgba(255,255,255,0.2)" }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-lg"
                >
                  <Link
                    to="/invoices"
                    className="block py-2 px-4 rounded hover:bg-white/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-all duration-200"
                  >
                    Invoice Management
                  </Link>
                </motion.div>
              </li>
            )}
            {!isEmployee && (
              <li>
                <motion.div
                  whileHover={{ scale: 1.02, x: 5, backgroundColor: "rgba(255,255,255,0.2)" }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-lg"
                >
                  <Link
                    to="/task-assignment"
                    className="block py-2 px-4 rounded hover:bg-white/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-all duration-200"
                  >
                    Task Assignment
                  </Link>
                </motion.div>
              </li>
            )}
            {!isEmployee && (
              <li>
                <motion.div
                  whileHover={{ scale: 1.02, x: 5, backgroundColor: "rgba(255,255,255,0.2)" }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-lg"
                >
                  <Link
                    to="/timesheet"
                    className="block py-2 px-4 rounded hover:bg-white/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-all duration-200"
                  >
                    Employee Timesheets
                  </Link>
                </motion.div>
              </li>
            )}
            <li>
              <motion.div
                whileHover={{ scale: 1.02, x: 5, backgroundColor: "rgba(255,255,255,0.2)" }}
                whileTap={{ scale: 0.98 }}
                className="rounded-lg"
              >
                <Link
                  to="/attendance"
                  className="block py-2 px-4 rounded hover:bg-white/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-all duration-200"
                >
                  Employee Attendance
                </Link>
              </motion.div>
            </li>
            {isEmployee && (
              <li>
                <motion.div
                  whileHover={{ scale: 1.02, x: 5, backgroundColor: "rgba(255,255,255,0.2)" }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-lg"
                >
                  <Link
                    to="/task-management"
                    className="block py-2 px-4 rounded hover:bg-white/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-all duration-200"
                  >
                    My Tasks
                  </Link>
                </motion.div>
              </li>
            )}
            {isEmployee && (
              <li>
                <motion.div
                  whileHover={{ scale: 1.02, x: 5, backgroundColor: "rgba(255,255,255,0.2)" }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-lg"
                >
                  <Link
                    to="/timesheet"
                    className="block py-2 px-4 rounded hover:bg-white/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-all duration-200"
                  >
                    Employee Timesheet
                  </Link>
                </motion.div>
              </li>
            )}
            {isEmployee && (
              <li>
                <motion.div
                  whileHover={{ scale: 1.02, x: 5, backgroundColor: "rgba(255,255,255,0.2)" }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-lg"
                >
                  <Link
                    to="/contracts"
                    className="block py-2 px-4 rounded hover:bg-white/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-all duration-200"
                  >
                    Contract Agreement
                  </Link>
                </motion.div>
              </li>
            )}
            {isEmployee && (
              <li>
                <motion.div
                  whileHover={{ scale: 1.02, x: 5, backgroundColor: "rgba(255,255,255,0.2)" }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-lg"
                >
                  <Link
                    to="/work-history"
                    className="block py-2 px-4 rounded hover:bg-white/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-all duration-200"
                  >
                    Work History
                  </Link>
                </motion.div>
              </li>
            )}
            {isEmployee && (
              <li>
                <motion.div
                  whileHover={{ scale: 1.02, x: 5, backgroundColor: "rgba(255,255,255,0.2)" }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-lg"
                >
                  <Link
                    to="/work-summary"
                    className="block py-2 px-4 rounded hover:bg-white/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-all duration-200"
                  >
                    Work Summary
                  </Link>
                </motion.div>
              </li>
            )}
            {!isEmployee && (
              <li>
                <motion.div
                  whileHover={{ scale: 1.02, x: 5, backgroundColor: "rgba(255,255,255,0.2)" }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-lg"
                >
                  <Link
                    to="/work-summary"
                    className="block py-2 px-4 rounded hover:bg-white/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-all duration-200"
                  >
                    Employee Work Summary
                  </Link>
                </motion.div>
              </li>
            )}
            {!isEmployee && (
              <li>
                <motion.div
                  whileHover={{ scale: 1.02, x: 5, backgroundColor: "rgba(255,255,255,0.2)" }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-lg"
                >
                  <button
                    onClick={() => setEmployeeDropdownOpen(!employeeDropdownOpen)}
                    className="flex items-center justify-between w-full py-2 px-4 rounded hover:bg-white/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-all duration-200"
                  >
                    <span>Employee Management</span>
                    <FaChevronDown
                      className={`transition-transform ${
                        employeeDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </motion.div>
                {employeeDropdownOpen && (
                  <ul className="ml-6 mt-1 space-y-1">
                    <li>
                      <motion.div
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Link
                          to="/employees"
                          className="block text-md text-orange-400 hover:text-white"
                        >
                          • Employee List
                        </Link>
                      </motion.div>
                    </li>
                    <li>
                      <motion.div
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Link
                          to="/contracts"
                          className="block text-md text-orange-400 hover:text-white"
                        >
                          • Contract Agreement
                        </Link>
                      </motion.div>
                    </li>
                  </ul>
                )}
              </li>
            )}
            <li>
              <motion.div
                whileHover={{ scale: 1.02, x: 5, backgroundColor: "rgba(255,255,255,0.2)" }}
                whileTap={{ scale: 0.98 }}
                className="rounded-lg"
              >
                <Link
                  to="/settings"
                  className="block py-2 px-4 rounded hover:bg-white/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-all duration-200"
                >
                  Settings
                </Link>
              </motion.div>
            </li>
          </ul>
        </nav>
      </div>
    </motion.div>
  );
}

export default Sidebar;