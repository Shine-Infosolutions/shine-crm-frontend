import React from 'react';
import { motion } from 'framer-motion';

const ProjectWorkflow = ({ dashboardData, navigate }) => {
  return (
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
          <span className="bg-blue-100/80 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded-full backdrop-blur-sm">{dashboardData.leads.length}</span>
        </div>
        
        <div className="space-y-4">
          {dashboardData.leads.slice(0, 2).map((lead, index) => {
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
          {dashboardData.leads.length === 0 && (
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
          <span className="bg-yellow-100/80 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs px-2 py-1 rounded-full backdrop-blur-sm">{dashboardData.activeProjects}</span>
        </div>
        
        <div className="space-y-4">
          {dashboardData.projects.filter(p => p.status === 'Active').slice(0, 2).map((project, index) => {
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
          {dashboardData.activeProjects === 0 && (
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
          <span className="bg-green-100/80 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs px-2 py-1 rounded-full backdrop-blur-sm">{dashboardData.projects.filter(p => p.status === 'Completed').length}</span>
        </div>
        
        <div className="space-y-4">
          {dashboardData.projects.filter(p => p.status === 'Completed').slice(0, 2).map((project, index) => {
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
          {dashboardData.projects.filter(p => p.status === 'Completed').length === 0 && (
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
  );
};

export default ProjectWorkflow;