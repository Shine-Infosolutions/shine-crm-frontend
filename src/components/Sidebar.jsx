import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Link } from "react-router-dom";
import { FaChevronDown, FaTachometerAlt, FaUsers, FaProjectDiagram, FaFileInvoiceDollar, FaTasks, FaClock, FaCalendarCheck, FaClipboardList, FaFileContract, FaHistory, FaChartBar, FaUserTie, FaCog, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../assets/Shine Infosolutions Logo Blue Black.png";
function Sidebar() {
  const { sidebarOpen, toggleSidebar, currentUser } = useAppContext();
  const [employeeDropdownOpen, setEmployeeDropdownOpen] = useState(false);

  const isEmployee = currentUser?.role === "employee";

  return (
    <motion.div
      initial={{ x: -256 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className={`bg-slate-300/80 dark:bg-gray-800/80 backdrop-blur-xl text-gray-800 dark:text-white border-r border-white/20 dark:border-gray-700/50 h-screen fixed top-0 left-0 z-10 shadow-2xl transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}
    >
      <div className="p-4 relative">
        {/* Hamburger/Close button */}
        <div className="flex items-center justify-center mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center"
          >
            <img 
              src={Logo} 
              alt="Shine Infosolutions Logo" 
              className="h-13 w-auto"
            />
            {sidebarOpen && <span className="ml-2 text-xl font-bold text-gray-800 dark:text-white">SHINE CRM</span>}
          </motion.div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleSidebar}
          className="absolute top-1/2 -translate-y-1/2 -right-3 p-2 rounded-full bg-slate-300/80 dark:bg-gray-800/80 hover:bg-white/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-all duration-200 border border-white/20 dark:border-gray-700/50"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <FaChevronLeft className="h-3 w-3" /> : <FaChevronRight className="h-3 w-3" />}
        </motion.button>

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
                    className="flex items-center gap-3 py-2 px-4 rounded hover:bg-white/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-all duration-200"
                    title="Dashboard"
                  >
                    <FaTachometerAlt className="text-lg" />
                    {sidebarOpen && <span>Dashboard</span>}
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
                    className="flex items-center gap-3 py-2 px-4 rounded hover:bg-white/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-all duration-200"
                    title="Lead Management"
                  >
                    <FaUsers className="text-lg" />
                    {sidebarOpen && <span>Lead Management</span>}
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
                    className="flex items-center gap-3 py-2 px-4 rounded hover:bg-white/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-all duration-200"
                    title="Project Management"
                  >
                    <FaProjectDiagram className="text-lg" />
                    {sidebarOpen && <span>Project Management</span>}
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
                    className="flex items-center gap-3 py-2 px-4 rounded hover:bg-white/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-all duration-200"
                    title="Invoice Management"
                  >
                    <FaFileInvoiceDollar className="text-lg" />
                    {sidebarOpen && <span>Invoice Management</span>}
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
                    className="flex items-center gap-3 py-2 px-4 rounded hover:bg-white/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-all duration-200"
                    title="Task Assignment"
                  >
                    <FaTasks className="text-lg" />
                    {sidebarOpen && <span>Task Assignment</span>}
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
                    className="flex items-center gap-3 py-2 px-4 rounded hover:bg-white/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-all duration-200"
                    title="Employee Timesheets"
                  >
                    <FaClock className="text-lg" />
                    {sidebarOpen && <span>Employee Timesheets</span>}
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
                  className="flex items-center gap-3 py-2 px-4 rounded hover:bg-white/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-all duration-200"
                  title="Employee Attendance"
                >
                  <FaCalendarCheck className="text-lg" />
                  {sidebarOpen && <span>Employee Attendance</span>}
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
                    className="flex items-center gap-3 py-2 px-4 rounded hover:bg-white/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-all duration-200"
                    title="My Tasks"
                  >
                    <FaClipboardList className="text-lg" />
                    {sidebarOpen && <span>My Tasks</span>}
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
                    className="flex items-center gap-3 py-2 px-4 rounded hover:bg-white/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-all duration-200"
                    title="Employee Timesheet"
                  >
                    <FaClock className="text-lg" />
                    {sidebarOpen && <span>Employee Timesheet</span>}
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
                    className="flex items-center gap-3 py-2 px-4 rounded hover:bg-white/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-all duration-200"
                    title="Contract Agreement"
                  >
                    <FaFileContract className="text-lg" />
                    {sidebarOpen && <span>Contract Agreement</span>}
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
                    className="flex items-center gap-3 py-2 px-4 rounded hover:bg-white/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-all duration-200"
                    title="Work History"
                  >
                    <FaHistory className="text-lg" />
                    {sidebarOpen && <span>Work History</span>}
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
                    className="flex items-center gap-3 py-2 px-4 rounded hover:bg-white/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-all duration-200"
                    title="Work Summary"
                  >
                    <FaChartBar className="text-lg" />
                    {sidebarOpen && <span>Work Summary</span>}
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
                    className="flex items-center gap-3 py-2 px-4 rounded hover:bg-white/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-all duration-200"
                    title="Employee Work Summary"
                  >
                    <FaChartBar className="text-lg" />
                    {sidebarOpen && <span>Employee Work Summary</span>}
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
                    onClick={() => {
                      if (!sidebarOpen) {
                        toggleSidebar();
                      } else {
                        setEmployeeDropdownOpen(!employeeDropdownOpen);
                      }
                    }}
                    className="flex items-center justify-between w-full py-2 px-4 rounded hover:bg-white/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-all duration-200"
                    title="Employee Management"
                  >
                    <span className="flex items-center gap-3">
                      <FaUserTie className="text-lg" />
                      {sidebarOpen && <span>Employee Management</span>}
                    </span>
                    {sidebarOpen && <FaChevronDown
                      className={`transition-transform ${
                        employeeDropdownOpen ? "rotate-180" : ""
                      }`}
                    />}
                  </button>
                </motion.div>
                {employeeDropdownOpen && sidebarOpen && (
                  <ul className="ml-6 mt-1 space-y-1">
                    <li>
                      <motion.div
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Link
                          to="/employees"
                          className="flex items-center gap-2 text-md text-black dark:text-gray-800 hover:text-gray-600 dark:hover:text-gray-600"
                        >
                          <FaUsers className="text-sm" />
                          Employee List
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
                          className="flex items-center gap-2 text-md text-black dark:text-gray-800 hover:text-gray-600 dark:hover:text-gray-600"
                        >
                          <FaFileContract className="text-sm" />
                          Contract Agreement
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
                  className="flex items-center gap-3 py-2 px-4 rounded hover:bg-white/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-all duration-200"
                  title="Settings"
                >
                  <FaCog className="text-lg" />
                  {sidebarOpen && <span>Settings</span>}
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