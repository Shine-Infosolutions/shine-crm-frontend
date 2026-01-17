import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import api from '../utils/axiosConfig';

function Dashboard() {
  const { API_URL, navigate } = useAppContext();
  const [totalLeads, setTotalLeads] = useState(0);
  const [activeProjects, setActiveProjects] = useState(0);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [projects, setProjects] = useState([]);
  const [leads, setLeads] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch leads data
        const leadsResponse = await api.get('/api/leads');
        const leadsData = leadsResponse.data;
        const leadsArray = Array.isArray(leadsData) ? leadsData : leadsData.data || [];
        setLeads(leadsArray.slice(0, 5));
        setTotalLeads(leadsArray.length || 0);

        // Fetch projects data
        const projectsResponse = await api.get('/api/projects');
        const projectsData = projectsResponse.data;
        const projectsArray = Array.isArray(projectsData) ? projectsData : projectsData.data || [];
        setProjects(projectsArray);
        
        // Count active projects (not completed)
        const activeCount = projectsArray.filter(project => {
          return !project.handoverDate || project.handoverDate.trim() === "";
        }).length;
        setActiveProjects(activeCount);
        
        // Calculate total revenue from all projects
        const revenue = projectsArray.reduce((sum, project) => {
          const amount = parseFloat(project.projectAmount) || 0;
          return sum + amount;
        }, 0);
        setTotalRevenue(revenue);

        // Fetch employees data
        const employeesResponse = await api.get('/api/employees');
        const employeesData = employeesResponse.data;
        if (employeesData?.success) {
          const data = employeesData.data;
          const employeeArray = Array.isArray(data) ? data : data.employees || [];
          setEmployees(employeeArray.slice(0, 4)); // Show first 4 employees
          setTotalEmployees(employeeArray.length || 0);
        }

        // Fetch recent tasks
        const tasksResponse = await api.get('/api/tasks');
        const tasksData = tasksResponse.data;
        const tasksArray = Array.isArray(tasksData) ? tasksData : tasksData.data || [];
        setRecentTasks(tasksArray.slice(0, 3));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [API_URL]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-6"
      >
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-2xl font-bold text-gray-900 dark:text-white"
            >
              Dashboard Overview
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="text-gray-600 dark:text-gray-400 mt-1"
            >
              Monitor your business performance and key metrics
            </motion.p>
          </div>
          
          {/* Team Avatars */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex items-center space-x-2"
          >
            <div className="flex -space-x-2">
              {employees.map((employee, index) => {
                const initials = employee.name ? employee.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
                const colors = ['from-blue-400 to-purple-500', 'from-green-400 to-blue-500', 'from-purple-400 to-pink-500', 'from-yellow-400 to-red-500'];
                return (
                  <motion.div 
                    key={employee._id || index}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.15 + index * 0.05 }}
                    whileHover={{ scale: 1.15, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedEmployee(employee)}
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${colors[index % colors.length]} border-2 border-white/50 backdrop-blur-sm shadow-lg flex items-center justify-center text-white text-sm font-medium cursor-pointer`}
                  >
                    {initials}
                  </motion.div>
                );
              })}
              {totalEmployees > 4 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.35 }}
                  className="w-10 h-10 rounded-full bg-gray-500/80 backdrop-blur-sm border-2 border-white/50 shadow-lg flex items-center justify-center text-white text-xs font-medium"
                >
                  +{totalEmployees - 4}
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Key Metrics Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-6 shadow-xl border border-white/20 dark:border-gray-700/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Leads</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {loading ? '...' : totalLeads.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 616 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-6 shadow-xl border border-white/20 dark:border-gray-700/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Projects</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {loading ? '...' : activeProjects}
                </p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-6 shadow-xl border border-white/20 dark:border-gray-700/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {loading ? '...' : `₹${totalRevenue.toLocaleString()}`}
                </p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.35 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-6 shadow-xl border border-white/20 dark:border-gray-700/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Employees</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {loading ? '...' : totalEmployees}
                </p>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 515 0z" />
                </svg>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Main Kanban Board - Project Workflow */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Recent Leads */}
          <motion.div 
            whileHover={{ y: -3 }}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-6 shadow-xl border border-white/20 dark:border-gray-700/50"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white">Recent Leads</h3>
              <span className="bg-blue-100/80 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded-full backdrop-blur-sm">{leads.length}</span>
            </div>
            
            <div className="space-y-4">
              {leads.slice(0, 2).map((lead, index) => {
                const initials = lead.name ? lead.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'L';
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500'];
                return (
                  <motion.div 
                    key={lead._id || index}
                    whileHover={{ scale: 1.02 }}
                    className="bg-blue-50/80 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500 backdrop-blur-sm"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full ${colors[index % colors.length]} flex items-center justify-center text-white text-sm font-medium`}>
                        {initials}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{lead.projectType || 'New Lead'}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{lead.name}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {leads.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No recent leads</p>
              )}
            </div>
          </motion.div>

          {/* Active Projects */}
          <motion.div 
            whileHover={{ y: -3 }}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-6 shadow-xl border border-white/20 dark:border-gray-700/50"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white">Active Projects</h3>
              <span className="bg-yellow-100/80 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs px-2 py-1 rounded-full backdrop-blur-sm">{activeProjects}</span>
            </div>
            
            <div className="space-y-4">
              {projects.filter(p => !p.handoverDate || p.handoverDate.trim() === "").slice(0, 2).map((project, index) => {
                const initials = project.clientName ? project.clientName.split(' ').map(n => n[0]).join('').toUpperCase() : 'P';
                return (
                  <motion.div 
                    key={project._id || index}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gray-50/80 dark:bg-gray-700/50 p-4 rounded-lg border-l-4 border-yellow-500 backdrop-blur-sm"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white text-sm font-medium">
                        {initials}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{project.projectName || 'Unnamed Project'}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{project.clientName || 'Unknown Client'}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {activeProjects === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No active projects</p>
              )}
            </div>
          </motion.div>

          {/* Completed Projects */}
          <motion.div 
            whileHover={{ y: -3 }}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-6 shadow-xl border border-white/20 dark:border-gray-700/50"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white">Completed</h3>
              <span className="bg-green-100/80 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs px-2 py-1 rounded-full backdrop-blur-sm">{projects.filter(p => p.handoverDate && p.handoverDate.trim() !== "").length}</span>
            </div>
            
            <div className="space-y-4">
              {projects.filter(p => p.handoverDate && p.handoverDate.trim() !== "").slice(0, 2).map((project, index) => {
                const initials = project.clientName ? project.clientName.split(' ').map(n => n[0]).join('').toUpperCase() : 'C';
                return (
                  <motion.div 
                    key={project._id || index}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gray-50/80 dark:bg-gray-700/50 p-4 rounded-lg border-l-4 border-green-500 backdrop-blur-sm"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-medium">
                        {initials}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{project.projectName || 'Completed Project'}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{project.clientName || 'Unknown Client'}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {projects.filter(p => p.handoverDate && p.handoverDate.trim() !== "").length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No completed projects</p>
              )}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            whileHover={{ y: -3 }}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-6 shadow-xl border border-white/20 dark:border-gray-700/50"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
            </div>
            
            <div className="space-y-3">
              <motion.button 
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/leads/add')}
                className="w-full text-left p-3 rounded-lg bg-blue-50/80 dark:bg-blue-900/20 hover:bg-blue-100/80 dark:hover:bg-blue-900/30 transition-colors backdrop-blur-sm"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-blue-500 rounded-lg mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Add New Lead</span>
                </div>
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/projects/add')}
                className="w-full text-left p-3 rounded-lg bg-green-50/80 dark:bg-green-900/20 hover:bg-green-100/80 dark:hover:bg-green-900/30 transition-colors backdrop-blur-sm"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-green-500 rounded-lg mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Create Project</span>
                </div>
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/invoices')}
                className="w-full text-left p-3 rounded-lg bg-purple-50/80 dark:bg-purple-900/20 hover:bg-purple-100/80 dark:hover:bg-purple-900/30 transition-colors backdrop-blur-sm"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-purple-500 rounded-lg mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Generate Invoice</span>
                </div>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Recent Tasks */}
          <motion.div 
            whileHover={{ y: -3 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-xl border border-white/20 dark:border-gray-700/50"
          >
            <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Tasks</h3>
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  className="p-2 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-lg backdrop-blur-sm"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </motion.button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {recentTasks.length > 0 ? recentTasks.map((task, index) => {
                  const statusColors = {
                    'completed': 'bg-green-500',
                    'in_progress': 'bg-blue-500', 
                    'pending': 'bg-yellow-500',
                    'assigned': 'bg-purple-500'
                  };
                  const statusColor = statusColors[task.status] || 'bg-gray-500';
                  const timeAgo = task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : 'Recently';
                  
                  return (
                    <motion.div 
                      key={task._id || index}
                      whileHover={{ x: 5 }}
                      className="flex items-center space-x-3"
                    >
                      <div className={`w-2 h-2 ${statusColor} rounded-full`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{task.title || task.description || 'Task'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{timeAgo}</p>
                      </div>
                    </motion.div>
                  );
                }) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">No recent tasks</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Performance Overview */}
          <motion.div 
            whileHover={{ y: -3 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-xl border border-white/20 dark:border-gray-700/50"
          >
            <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Overview</h3>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-center space-x-8">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="text-center"
                >
                  <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold mb-2">
                    {totalLeads > 0 ? Math.round((projects.length / totalLeads) * 100) : 0}%
                  </div>
                  <p className="text-sm font-medium text-blue-600">Lead to Project</p>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="text-center"
                >
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white text-xl font-bold mb-2">
                    {projects.length > 0 ? Math.round((projects.filter(p => p.handoverDate && p.handoverDate.trim() !== "").length / projects.length) * 100) : 0}%
                  </div>
                  <p className="text-sm font-medium text-green-600">Project Completion</p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Employee Details Modal */}
      <AnimatePresence>
        {selectedEmployee && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedEmployee(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.3, type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full shadow-2xl border border-white/20 dark:border-gray-700/50"
            >
              <div className="flex items-center justify-between mb-4">
                <motion.h3 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-lg font-semibold text-gray-900 dark:text-white"
                >
                  Employee Details
                </motion.h3>
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedEmployee(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-700/50"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                {[
                  { label: 'Name', value: selectedEmployee.name },
                  { label: 'Email', value: selectedEmployee.email },
                  { label: 'Contact', value: selectedEmployee.contact1 },
                  { label: 'Employee ID', value: selectedEmployee.employee_id }
                ].map((field, index) => (
                  <motion.div 
                    key={field.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="group"
                  >
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{field.label}</p>
                    <p className="font-medium text-gray-900 dark:text-white bg-gray-50/50 dark:bg-gray-700/50 rounded-lg px-3 py-2 backdrop-blur-sm">
                      {field.value || 'N/A'}
                    </p>
                  </motion.div>
                ))}
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</p>
                  <motion.span 
                    whileHover={{ scale: 1.05 }}
                    className={`inline-block px-3 py-2 rounded-lg text-xs font-medium backdrop-blur-sm ${
                      selectedEmployee.employee_status === 'Active' 
                        ? 'bg-green-100/80 text-green-800 border border-green-200/50' 
                        : 'bg-red-100/80 text-red-800 border border-red-200/50'
                    }`}
                  >
                    {selectedEmployee.employee_status || 'N/A'}
                  </motion.span>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
};

export default Dashboard;