import React, { useState, useEffect, useCallback, useMemo, memo, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import api from '../utils/axiosConfig';
import EmployeeAttendanceWidget from './EmployeeAttendanceWidget';

// Lazy load heavy components
const EmployeeModal = lazy(() => import('./EmployeeModal'));

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let dashboardCache = {
  data: null,
  timestamp: null,
  promise: null
};

// Constants moved outside component to prevent recreation
const STATUS_COLORS = {
  'completed': 'bg-green-500',
  'in_progress': 'bg-blue-500',
  'pending': 'bg-yellow-500',
  'assigned': 'bg-purple-500'
};

const AVATAR_COLORS = [
  'from-blue-500 to-purple-600',
  'from-green-500 to-teal-600',
  'from-orange-500 to-red-600',
  'from-purple-500 to-pink-600',
  'from-indigo-500 to-blue-600',
  'from-yellow-500 to-orange-600',
  'from-pink-500 to-rose-600',
  'from-teal-500 to-cyan-600'
];

// Memoized EmployeeAvatar component
const EmployeeAvatar = memo(({ employee, index, onClick }) => {
  const initials = employee.name ? employee.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  return (
    <motion.div
      key={employee._id || index}
      whileHover={{ scale: 1.1, y: -1 }}
      onClick={() => onClick(employee)}
      className={`w-10 h-10 rounded-full bg-gradient-to-br ${AVATAR_COLORS[index % AVATAR_COLORS.length]} border-2 border-white/50 backdrop-blur-sm shadow-lg flex items-center justify-center text-white text-sm font-medium cursor-pointer`}
    >
      {initials}
    </motion.div>
  );
});

// Standardized animation variants
const rowVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

// Loading skeleton component
const LoadingSkeleton = ({ className }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className={`bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse ${className}`}
  />
);

const Dashboard = memo(function Dashboard() {
  const { navigate, currentUser } = useAppContext();
  const [dashboardData, setDashboardData] = useState({
    totalLeads: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalEmployees: 0,
    totalRevenue: 0,
    employees: [],
    projects: [],
    leads: [],
    recentTasks: [],
    upcomingAutoRenewals: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // First-visit animation control
  const shouldAnimate = useMemo(() => !sessionStorage.getItem('dashSeen'), []);

  useEffect(() => {
    sessionStorage.setItem('dashSeen', 'true');
  }, []);

  // Memoized calculations using new API data structure
  const memoizedMetrics = useMemo(() => {
    const analytics = dashboardData.analytics;
    if (!analytics) return {
      leadToProjectRate: 0,
      completionRate: 0,
      averageProjectValue: 0,
      monthlyGrowthRate: 0
    };

    const totalLeads = analytics.leads?.total || 0;
    const totalProjects = analytics.projects?.total || 0;
    const completedProjects = analytics.projects?.completed || 0;
    const expectedRevenue = analytics.revenue?.expected || 0;
    const thisMonthRevenue = analytics.revenue?.thisMonth || 0;

    const leadToProjectRate = totalLeads > 0
      ? Math.round((totalProjects / totalLeads) * 100)
      : 0;
    const completionRate = totalProjects > 0
      ? Math.round((completedProjects / totalProjects) * 100)
      : 0;
    const averageProjectValue = totalProjects > 0
      ? Math.round(expectedRevenue / totalProjects)
      : 0;
    const monthlyGrowthRate = expectedRevenue > 0
      ? Math.round((thisMonthRevenue / expectedRevenue) * 100)
      : 0;

    return { leadToProjectRate, completionRate, averageProjectValue, monthlyGrowthRate };
  }, [dashboardData.analytics]);

  // Memoized growth rate calculation
  const growthRate = useMemo(() => {
    const thisMonth = dashboardData.analytics?.monthlyEarnings?.currentMonth?.total || 0;
    const lastMonth = dashboardData.analytics?.monthlyEarnings?.previousMonth?.total || 0;
    if (lastMonth === 0 && thisMonth > 0) return '+100%';
    if (lastMonth === 0 && thisMonth === 0) return '0%';
    const growth = ((thisMonth - lastMonth) / lastMonth * 100).toFixed(1);
    return `${growth > 0 ? '+' : ''}${growth}%`;
  }, [dashboardData.analytics]);

  // Project status counts
  const projectStatusCounts = useMemo(() => {
    const projects = dashboardData.analytics?.projects;
    if (!projects) {
      return { active: 0, pending: 0, completed: 0, onHold: 0, cancelled: 0 };
    }
    return {
      active: projects.active || 0,
      pending: 0,
      completed: projects.completed || 0,
      onHold: projects.onHold || 0,
      cancelled: 0
    };
  }, [dashboardData.analytics]);

  // Optimized task status counts - single loop instead of multiple filters
  const taskStatusCounts = useMemo(() => {
    const counts = { completed: 0, inProgress: 0, pending: 0, overdue: 0 };
    (dashboardData.recentTasks || []).forEach(task => {
      const status = task.status?.toLowerCase();
      if (!status) return;
      if (['completed', 'complete', 'done'].includes(status)) counts.completed++;
      else if (['in_progress', 'in progress', 'progress', 'active'].includes(status)) counts.inProgress++;
      else if (['pending', 'assigned'].includes(status)) counts.pending++;
      else if (['overdue', 'delayed'].includes(status)) counts.overdue++;
    });
    return counts;
  }, [dashboardData.recentTasks]);

  const fetchDashboardData = useCallback(async (forceRefresh = false) => {
    // Check cache first
    const now = Date.now();
    if (!forceRefresh && dashboardCache.data && dashboardCache.timestamp &&
        (now - dashboardCache.timestamp) < CACHE_DURATION) {
      setDashboardData(dashboardCache.data);
      setLoading(false);
      return;
    }

    // Return existing promise if already loading
    if (dashboardCache.promise && !forceRefresh) {
      return dashboardCache.promise;
    }

    setLoading(true);

    dashboardCache.promise = (async () => {
      try {
        // Call the 3 new optimized APIs in parallel
        const [businessRes, alertsRes, activityRes] = await Promise.all([
          api.get('/api/dashboard/business-metrics'),
          api.get('/api/dashboard/alerts'),
          api.get('/api/dashboard/recent-activity')
        ]);

        const businessData = businessRes.data.data;
        const alertsData = alertsRes.data.data;
        const activityData = activityRes.data.data;

        const newDashboardData = {
          totalLeads: businessData.leads?.total || 0,
          activeProjects: businessData.projects?.active || 0,
          completedProjects: businessData.projects?.completed || 0,
          totalEmployees: activityData.totalEmployees || 0,
          totalRevenue: businessData.revenue?.expected || 0,
          employees: activityData.recentEmployees || [],
          leads: activityData.recentLeads || [],
          recentTasks: activityData.recentTasks || [],
          projects: businessData.projects || {},
          upcomingAutoRenewals: alertsData.upcomingBilling || [],
          analytics: {
            revenue: businessData.revenue,
            projects: businessData.projects,
            leads: businessData.leads,
            invoices: businessData.invoices,
            alerts: alertsData,
            recentData: activityData,
            // Add compatibility data for existing frontend
            monthlyEarnings: businessData.monthlyEarnings,
            revenueBreakdown: businessData.revenueBreakdown,
            money: {
              expectedRevenue: businessData.revenue?.expected || 0,
              totalInvoiceValue: businessData.invoices?.amount || 0
            }
          }
        };

        // Cache the data
        dashboardCache.data = newDashboardData;
        dashboardCache.timestamp = now;

        setDashboardData(newDashboardData);

      } catch (error) {
        console.error('Dashboard data fetch error:', error);
        // Keep existing data on error
      } finally {
        setLoading(false);
        dashboardCache.promise = null;
      }
    })();

    return dashboardCache.promise;
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-4 sm:p-6"
      >
        {/* Header */}
        <motion.div
          initial={shouldAnimate ? { opacity: 0, x: -20 } : { opacity: 1, x: 0 }}
          animate={{ opacity: 1, x: 0 }}
          transition={shouldAnimate ? { duration: 0.3 } : { duration: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Dashboard Overview
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Monitor your business performance and key metrics
            </p>
          </div>

          {/* Team Avatars */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Refresh Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchDashboardData(true)}
              disabled={loading}
              className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{loading ? 'Loading...' : 'Refresh'}</span>
            </motion.button>

            <div className="flex -space-x-2">
              {dashboardData.employees.slice(0, 4).map((employee, index) => (
                <EmployeeAvatar
                  key={employee._id || index}
                  employee={employee}
                  index={index}
                  onClick={setSelectedEmployee}
                />
              ))}
              {dashboardData.totalEmployees > 4 && (
                <div className="w-10 h-10 rounded-full bg-gray-500/80 backdrop-blur-sm border-2 border-white/50 shadow-lg flex items-center justify-center text-white text-xs font-medium">
                  +{dashboardData.totalEmployees - 4}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Row 1: First 4 cards */}
        <motion.div
          variants={rowVariants}
          initial={shouldAnimate ? "hidden" : "show"}
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Show attendance widget for employees */}
          {currentUser?.role === 'employee' && (
            <motion.div variants={cardVariants} className="lg:col-span-2">
              <EmployeeAttendanceWidget />
            </motion.div>
          )}
          
          <motion.div variants={cardVariants} whileHover={{ y: -2, scale: 1.02 }} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-lg p-4 sm:p-5 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Projects</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{dashboardData.activeProjects}</p>
                <p className="text-xs text-gray-500 mt-1">{dashboardData.completedProjects} completed</p>
              </div>
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div variants={cardVariants} whileHover={{ y: -2, scale: 1.02 }} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-lg p-4 sm:p-5 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Revenue</p>
                <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">₹{(dashboardData.analytics?.revenue?.thisMonth || dashboardData.totalRevenue || 0).toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">This month</p>
              </div>
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div variants={cardVariants} whileHover={{ y: -2, scale: 1.02 }} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-lg p-4 sm:p-5 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Team</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{dashboardData.totalEmployees}</p>
                <p className="text-xs text-gray-500 mt-1">{(dashboardData.employees || []).filter(e => e.employee_status === 'Active').length} active</p>
              </div>
              <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 515 0z" />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div variants={cardVariants} whileHover={{ y: -2, scale: 1.02 }} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-lg p-4 sm:p-5 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Clients</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{dashboardData.totalLeads}</p>
                <p className="text-xs text-gray-500 mt-1">Total leads</p>
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Row 2: Next 4 cards */}
        <motion.div
          variants={rowVariants}
          initial={shouldAnimate ? "hidden" : "show"}
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Monthly Earnings & Revenue Trend - Merged Card */}
          <motion.div variants={cardVariants} whileHover={{ y: -2, scale: 1.02 }} className="bg-gradient-to-br from-emerald-50/80 to-blue-50/80 dark:from-emerald-900/20 dark:to-blue-900/20 backdrop-blur-md rounded-lg p-5 shadow-lg border border-emerald-200/50">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <svg className="w-4 h-4 text-emerald-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Monthly Earnings & Trend
            </h4>
            <div className="space-y-3">
              <div className="bg-emerald-100/50 dark:bg-emerald-900/30 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">This Month Total</span>
                  <span className="text-xl font-bold text-emerald-800 dark:text-emerald-300">₹{(dashboardData.analytics?.monthlyEarnings?.currentMonth?.total || 0).toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/50 dark:bg-gray-800/50 rounded p-2">
                    <span className="text-emerald-600 dark:text-emerald-400 block">Recurring</span>
                    <span className="font-bold text-emerald-800 dark:text-emerald-300">₹{(dashboardData.analytics?.monthlyEarnings?.currentMonth?.recurring || 0).toLocaleString()}</span>
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 rounded p-2">
                    <span className="text-emerald-600 dark:text-emerald-400 block">One-time</span>
                    <span className="font-bold text-emerald-800 dark:text-emerald-300">₹{(dashboardData.analytics?.monthlyEarnings?.currentMonth?.oneTime || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-100/50 dark:bg-blue-900/30 rounded p-2">
                  <span className="text-xs text-blue-700 dark:text-blue-400 block">Previous Month</span>
                  <span className="text-sm font-bold text-blue-800 dark:text-blue-300">₹{(dashboardData.analytics?.monthlyEarnings?.previousMonth?.total || 0).toLocaleString()}</span>
                </div>
                <div className="bg-purple-100/50 dark:bg-purple-900/30 rounded p-2">
                  <span className="text-xs text-purple-700 dark:text-purple-400 block">Growth Rate</span>
                  <span className="text-sm font-bold text-purple-800 dark:text-purple-300">
                    {growthRate}
                  </span>
                </div>
              </div>
              <div className="bg-yellow-100/50 dark:bg-yellow-900/30 rounded-lg p-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-yellow-700 dark:text-yellow-400">Outstanding Due</span>
                  <span className="text-sm font-bold text-yellow-800 dark:text-yellow-300">₹{(dashboardData.analytics?.monthlyEarnings?.actualPayments?.dueAmount || 0).toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mt-1">
                  <div className="text-yellow-600 dark:text-yellow-400">
                    One-time: ₹{(dashboardData.analytics?.monthlyEarnings?.actualPayments?.oneTimeDue || 0).toLocaleString()}
                  </div>
                  <div className="text-yellow-600 dark:text-yellow-400">
                    Auto-renewal: ₹{(dashboardData.analytics?.monthlyEarnings?.actualPayments?.autoRenewalRevenue || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={cardVariants} whileHover={{ y: -2, scale: 1.02 }} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-lg p-5 shadow-lg border border-white/20">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Payments & Revenue
            </h4>
            <div className="space-y-3">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200/50">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">Total Paid</span>
                  <span className="text-lg font-bold text-green-800 dark:text-green-300">₹{(dashboardData.analytics?.monthlyEarnings?.actualPayments?.totalPaid || 0).toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                  <div className="text-green-600 dark:text-green-400">
                    One-time: ₹{(dashboardData.analytics?.revenueBreakdown?.projectTypeWise?.ONE_TIME?.paid || 0).toLocaleString()}
                  </div>
                  <div className="text-green-600 dark:text-green-400">
                    Recurring: ₹{(dashboardData.analytics?.revenueBreakdown?.projectTypeWise?.RECURRING?.paid || 0).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200/50">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-red-700 dark:text-red-400">Due</span>
                  <span className="text-lg font-bold text-red-800 dark:text-red-300">₹{(dashboardData.analytics?.monthlyEarnings?.actualPayments?.dueAmount || 0).toLocaleString()}</span>
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t">
                <h5 className="text-xs font-medium text-gray-700 dark:text-gray-400">Revenue Type</h5>
                {(() => {
                  const analytics = dashboardData.analytics;
                  if (!analytics?.revenueBreakdown?.projectTypeWise) {
                    return <p className="text-xs text-gray-500">No data</p>;
                  }
                  const recurring = analytics.revenueBreakdown.projectTypeWise.RECURRING;
                  const oneTime = analytics.revenueBreakdown.projectTypeWise.ONE_TIME;

                  return [
                    { type: 'Recurring', amount: (recurring?.due || recurring?.monthly || 0), color: 'text-purple-600' },
                    { type: 'One Time', amount: (oneTime?.total || 0), color: 'text-indigo-600' }
                  ].map((item, index) => (
                    <div key={item.type} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{item.type}</span>
                      <span className={`text-sm font-bold ${item.color}`}>
                        ₹{item.amount.toLocaleString()}
                      </span>
                    </div>
                  ));
                })(
                )}
              </div>
            </div>
          </motion.div>

          <motion.div variants={cardVariants} whileHover={{ y: -2, scale: 1.02 }} className="bg-gradient-to-br from-yellow-50/80 to-orange-50/80 dark:from-yellow-900/20 dark:to-orange-900/20 backdrop-blur-md rounded-lg p-4 sm:p-5 shadow-lg border border-yellow-200/50">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Expected</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-yellow-600">This Month</span>
                <span className="text-xs sm:text-sm font-bold">₹{(dashboardData.analytics?.monthlyEarnings?.currentMonth?.total || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-green-600">Next Month</span>
                <span className="text-xs sm:text-sm font-bold">₹{(dashboardData.analytics?.monthlyEarnings?.actualPayments?.recurringDue || 0).toLocaleString()}</span>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded p-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-orange-600 font-medium">This Year (All)</span>
                  <span className="text-xs sm:text-sm font-bold">₹{(() => {
                    const oneTime = dashboardData.analytics?.revenueBreakdown?.projectTypeWise?.ONE_TIME?.total || 0;
                    const recurring = dashboardData.analytics?.revenueBreakdown?.projectTypeWise?.RECURRING?.monthly || 0;
                    return (oneTime + (recurring * 12)).toLocaleString();
                  })()}</span>
                </div>
                <div className="text-xs text-orange-600 mt-1">One-time + Recurring</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded p-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-purple-600 font-medium">Recurring Only</span>
                  <span className="text-xs sm:text-sm font-bold">₹{((dashboardData.analytics?.revenueBreakdown?.projectTypeWise?.RECURRING?.monthly || 0) * 12).toLocaleString()}</span>
                </div>
                <div className="text-xs text-purple-600 mt-1">Sustainable income</div>
              </div>
            </div>
          </motion.div>

          {/* Business Overview - Redesigned */}
          <motion.div variants={cardVariants} whileHover={{ y: -2, scale: 1.02 }} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-lg p-5 shadow-lg border border-white/20">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Business Overview
            </h4>
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <h5 className="text-xs font-medium text-gray-700 dark:text-gray-400 mb-3">Projects Status</h5>
                <div className="flex justify-between items-center">
                  <div className="text-center">
                    <span className="text-lg font-bold text-green-600">{projectStatusCounts.active}</span>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Active</p>
                  </div>
                  <div className="text-center">
                    <span className="text-lg font-bold text-blue-600">{projectStatusCounts.completed}</span>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Done</p>
                  </div>
                  <div className="text-center">
                    <span className="text-lg font-bold text-orange-600">{projectStatusCounts.onHold}</span>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Hold</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-start">
                <div className="flex-1 mr-3">
                  <h5 className="text-xs font-medium text-orange-700 dark:text-orange-400 mb-2">Next Meeting</h5>
                  {(dashboardData.analytics?.alerts?.upcomingMeetings || []).slice(0, 1).map((meeting, index) => {
                    const meetingDate = new Date(meeting.meetingDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
                    return (
                      <div key={index} className="bg-orange-50 dark:bg-orange-900/20 rounded p-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white block truncate">{meeting.leadName}</span>
                        <span className="text-xs text-orange-600">{meetingDate}</span>
                      </div>
                    );
                  })}
                  {(dashboardData.analytics?.alerts?.upcomingMeetings || []).length === 0 && (
                    <p className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-700/50 rounded p-2">No meetings</p>
                  )}
                </div>
                <div className="flex-1">
                  <h5 className="text-xs font-medium text-green-700 dark:text-green-400 mb-2">Invoices</h5>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded p-2">
                    <div className="text-center">
                      <span className="text-lg font-bold text-green-600">{dashboardData.analytics?.invoices?.total || 0}</span>
                      <p className="text-xs text-green-600">Total</p>
                    </div>
                    <div className="text-xs text-green-600 text-center mt-1">
                      ₹{(dashboardData.analytics?.invoices?.amount || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-red-600 text-center mt-1">
                      {dashboardData.analytics?.invoices?.overdue || 0} overdue
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Row 3: Last 3 cards */}
        <motion.div
          variants={rowVariants}
          initial={shouldAnimate ? "hidden" : "show"}
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          <motion.div variants={cardVariants} whileHover={{ y: -2 }} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-lg p-5 shadow-lg border border-white/20">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Performance</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mb-2 mx-auto">
                  {memoizedMetrics.leadToProjectRate}%
                </div>
                <p className="text-sm text-blue-600">Lead Conv.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold mb-2 mx-auto">
                  {memoizedMetrics.completionRate}%
                </div>
                <p className="text-sm text-green-600">Completion</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={cardVariants} whileHover={{ y: -2 }} className="bg-gradient-to-br from-orange-50/80 to-red-50/80 dark:from-orange-900/20 dark:to-red-900/20 backdrop-blur-md rounded-lg p-5 shadow-lg border border-orange-200/50">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <svg className="w-4 h-4 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Domains & Renewals
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h5 className="text-xs font-medium text-orange-700 dark:text-orange-400 mb-2">Domain Expiries</h5>
                {(dashboardData.analytics?.alerts?.domainExpiries || []).slice(0, 2).map((domain, index) => {
                  const expiryDate = new Date(domain.expiryDate);
                  const today = new Date();
                  const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
                  const isExpiring = daysLeft <= 30;
                  return (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400 truncate">{domain.projectName || 'Project'}</span>
                      <span className={`text-sm font-bold ${isExpiring ? 'text-red-600' : 'text-green-600'}`}>
                        {daysLeft > 0 ? `${daysLeft}d` : 'Expired'}
                      </span>
                    </div>
                  );
                })}
                {(dashboardData.analytics?.alerts?.domainExpiries || []).length === 0 && (
                  <p className="text-sm text-gray-500">No domain expiries</p>
                )}
              </div>
              <div className="space-y-2">
                <h5 className="text-xs font-medium text-orange-700 dark:text-orange-400 mb-2">Auto Renewals</h5>
                {(dashboardData.analytics?.alerts?.upcomingBilling || []).slice(0, 2).map((renewal, index) => {
                  const billingDate = new Date(renewal.billingDate);
                  const today = new Date();
                  const daysUntilRenewal = Math.ceil((billingDate - today) / (1000 * 60 * 60 * 24));
                  const isUrgent = daysUntilRenewal <= 7;
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-900 dark:text-white truncate">{renewal.projectName}</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          isUrgent ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                        }`}>
                          {daysUntilRenewal}d
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">₹{renewal.amount?.toLocaleString()}</div>
                    </div>
                  );
                })}
                {(dashboardData.analytics?.alerts?.upcomingBilling || []).length === 0 && (
                  <p className="text-sm text-gray-500">No auto renewals</p>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div variants={cardVariants} whileHover={{ y: -2 }} className="bg-gradient-to-br from-purple-50/80 to-pink-50/80 dark:from-purple-900/20 dark:to-pink-900/20 backdrop-blur-md rounded-lg p-5 shadow-lg border border-purple-200/50">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <svg className="w-4 h-4 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 515 0z" />
              </svg>
              Employees & Tasks
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h5 className="text-xs font-medium text-purple-700 dark:text-purple-400 mb-2">Employees</h5>
                <div className="flex justify-between">
                  <span className="text-sm text-green-600">Active</span>
                  <span className="text-sm font-bold">{(dashboardData.employees || []).filter(e => e.employee_status === 'Active').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Inactive</span>
                  <span className="text-sm font-bold">{(dashboardData.employees || []).filter(e => e.employee_status !== 'Active').length}</span>
                </div>
                <div className="flex justify-between border-t pt-1">
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-400">Total</span>
                  <span className="text-sm font-bold">{dashboardData.totalEmployees}</span>
                </div>
              </div>
              <div className="space-y-2">
                <h5 className="text-xs font-medium text-purple-700 dark:text-purple-400 mb-2">Tasks</h5>
                <div className="flex justify-between">
                  <span className="text-sm text-green-600">Completed</span>
                  <span className="text-sm font-bold">{taskStatusCounts.completed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-600">In Progress</span>
                  <span className="text-sm font-bold">{taskStatusCounts.inProgress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-yellow-600">Pending</span>
                  <span className="text-sm font-bold">{taskStatusCounts.pending}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-red-600">Overdue</span>
                  <span className="text-sm font-bold">{taskStatusCounts.overdue}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Employee Details Modal */}
      <AnimatePresence>
        {selectedEmployee && (
          <Suspense fallback={null}>
            <EmployeeModal
              selectedEmployee={selectedEmployee}
              setSelectedEmployee={setSelectedEmployee}
            />
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  )
});

export default Dashboard;