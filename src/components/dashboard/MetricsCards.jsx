import React from 'react';
import { motion } from 'framer-motion';

const MetricsCards = ({ dashboardData, loading }) => {
  const metrics = [
    {
      title: 'Total Leads',
      value: dashboardData.totalLeads,
      icon: (
        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      delay: 0.2
    },
    {
      title: 'Active Projects',
      value: dashboardData.activeProjects,
      icon: (
        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      delay: 0.25
    },
    {
      title: 'Revenue',
      value: `₹${dashboardData.totalRevenue.toLocaleString()}`,
      icon: (
        <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      delay: 0.3
    },
    {
      title: 'Employees',
      value: dashboardData.totalEmployees,
      icon: (
        <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      delay: 0.35
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
    >
      {metrics.map((metric, index) => (
        <motion.div 
          key={metric.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: metric.delay }}
          whileHover={{ y: -5, scale: 1.02 }}
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-6 shadow-xl border border-white/20 dark:border-gray-700/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{metric.title}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {loading ? '...' : metric.value}
              </p>
            </div>
            <div className={`p-3 ${metric.bgColor} rounded-lg`}>
              {metric.icon}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default MetricsCards;