import React, { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';

const MetricsCards = lazy(() => import('./MetricsCards'));
const ProjectWorkflow = lazy(() => import('./ProjectWorkflow'));
const BottomSection = lazy(() => import('./BottomSection'));

const LoadingSkeleton = ({ className }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className={`bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse ${className}`}
  />
);

const LazyDashboard = ({ dashboardData, loading, navigate, selectedEmployee, setSelectedEmployee }) => {
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor your business performance and key metrics</p>
          </div>
          
          {/* Team Avatars */}
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-2">
              {dashboardData.employees.map((employee, index) => {
                const initials = employee.name ? employee.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
                const colors = ['from-blue-400 to-purple-500', 'from-green-400 to-blue-500', 'from-purple-400 to-pink-500', 'from-yellow-400 to-red-500'];
                return (
                  <motion.div 
                    key={employee._id || index}
                    whileHover={{ scale: 1.15, y: -2 }}
                    onClick={() => setSelectedEmployee(employee)}
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${colors[index % colors.length]} border-2 border-white/50 backdrop-blur-sm shadow-lg flex items-center justify-center text-white text-sm font-medium cursor-pointer`}
                  >
                    {initials}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Lazy Loaded Sections */}
        <Suspense fallback={<LoadingSkeleton className="h-32 mb-8" />}>
          <MetricsCards dashboardData={dashboardData} loading={loading} />
        </Suspense>

        <Suspense fallback={<LoadingSkeleton className="h-96 mb-8" />}>
          <ProjectWorkflow dashboardData={dashboardData} navigate={navigate} />
        </Suspense>

        <Suspense fallback={<LoadingSkeleton className="h-64" />}>
          <BottomSection dashboardData={dashboardData} />
        </Suspense>
      </motion.div>
    </div>
  );
};

export default LazyDashboard;