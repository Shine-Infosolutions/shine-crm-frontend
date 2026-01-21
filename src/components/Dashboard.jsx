import React, { useState, useEffect, useCallback, useMemo, memo, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import api from '../utils/axiosConfig';

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

const AVATAR_COLORS = ['from-blue-400 to-purple-500', 'from-green-400 to-blue-500', 'from-purple-400 to-pink-500', 'from-yellow-400 to-red-500'];

// Loading skeleton component
const LoadingSkeleton = ({ className }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className={`bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse ${className}`}
  />
);

const Dashboard = memo(function Dashboard() {
  const { navigate } = useAppContext();
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

  // Memoized calculations using analytics data (single source of truth)
  const memoizedMetrics = useMemo(() => {
    const analytics = dashboardData.analytics;
    if (!analytics) return {
      leadToProjectRate: 0,
      completionRate: 0,
      averageProjectValue: 0,
      monthlyGrowthRate: 0
    };

    const leadToProjectRate = analytics.leadsFunnel.totalLeads > 0
      ? Math.round((analytics.projectsMetrics.totalProjects / analytics.leadsFunnel.totalLeads) * 100)
      : 0;
    const completionRate = analytics.projectsMetrics.totalProjects > 0
      ? Math.round((analytics.projectsMetrics.completedProjects / analytics.projectsMetrics.totalProjects) * 100)
      : 0;
    const averageProjectValue = analytics.projectsMetrics.totalProjects > 0
      ? Math.round(analytics.money.expectedRevenue / analytics.projectsMetrics.totalProjects)
      : 0;
    const monthlyGrowthRate = analytics.money.expectedRevenue > 0
      ? Math.round((analytics.money.thisMonthRevenue / analytics.money.expectedRevenue) * 100)
      : 0;

    return { leadToProjectRate, completionRate, averageProjectValue, monthlyGrowthRate };
  }, [dashboardData.analytics]);

  // Project status counts
  const projectStatusCounts = useMemo(() => {
    const analytics = dashboardData.analytics;
    if (!analytics?.revenueBreakdown?.projectStatusWise) {
      return { active: 0, pending: 0, completed: 0, onHold: 0, cancelled: 0 };
    }
    return {
      active: analytics.revenueBreakdown.projectStatusWise.active || 0,
      pending: 0, // Not in API response
      completed: analytics.revenueBreakdown.projectStatusWise.completed || 0,
      onHold: analytics.revenueBreakdown.projectStatusWise.onHold || 0,
      cancelled: 0 // Not in API response
    };
  }, [dashboardData.analytics]);

  // Task status counts
  const taskStatusCounts = useMemo(() => {
    const tasks = dashboardData.recentTasks || [];
    console.log('Tasks data:', tasks); // Debug log
    
    return {
      completed: tasks.filter(task => 
        task.status?.toLowerCase() === 'completed' || 
        task.status?.toLowerCase() === 'complete' ||
        task.status?.toLowerCase() === 'done'
      ).length,
      inProgress: tasks.filter(task => 
        task.status?.toLowerCase() === 'in_progress' || 
        task.status?.toLowerCase() === 'in progress' ||
        task.status?.toLowerCase() === 'progress' ||
        task.status?.toLowerCase() === 'active'
      ).length,
      pending: tasks.filter(task => 
        task.status?.toLowerCase() === 'pending' ||
        task.status?.toLowerCase() === 'assigned'
      ).length,
      overdue: tasks.filter(task => 
        task.status?.toLowerCase() === 'overdue' ||
        task.status?.toLowerCase() === 'delayed'
      ).length
    };
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
        // Single analytics endpoint call
        const analyticsRes = await api.get('/api/dashboard/analytics');
        const analytics = analyticsRes.data.data;

        // Get upcoming auto-renewals
        const autoRenewalsRes = await api.get('/api/dashboard/upcoming-auto-renewals');
        const upcomingAutoRenewals = autoRenewalsRes.data.data || [];

        const newDashboardData = {
          totalLeads: analytics.leadsFunnel?.totalLeads || 0,
          activeProjects: analytics.projectsMetrics?.activeProjects || 0,
          completedProjects: analytics.projectsMetrics?.completedProjects || 0,
          totalEmployees: analytics.summary?.totalEmployees || 0,
          totalRevenue: analytics.money?.expectedRevenue || 0,
          employees: analytics.recentData?.employees || [],
          leads: analytics.recentData?.leads || [],
          recentTasks: analytics.recentData?.tasks || [],
          projects: analytics.recentData?.projects || [],
          upcomingAutoRenewals: upcomingAutoRenewals,
          analytics: analytics
        };

        // Cache the data
        dashboardCache.data = newDashboardData;
        dashboardCache.timestamp = now;

        setDashboardData(newDashboardData);

      } catch (error) {

        // Try to get auto-renewals separately if main call fails
        try {
          const autoRenewalsRes = await api.get('/api/dashboard/upcoming-auto-renewals');
          setDashboardData(prev => ({
            ...prev,
            upcomingAutoRenewals: autoRenewalsRes.data.data || []
          }));
        } catch (autoRenewalError) {
          // Ignore auto-renewal errors
        }

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
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4"
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
            className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4"
          >
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
              {dashboardData.employees.slice(0, 4).map((employee, index) => {
                const initials = employee.name ? employee.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
                return (
                  <motion.div
                    key={employee._id || index}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: 0.1 + index * 0.03 }}
                    whileHover={{ scale: 1.1, y: -1 }}
                    onClick={() => setSelectedEmployee(employee)}
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${AVATAR_COLORS[index]} border-2 border-white/50 backdrop-blur-sm shadow-lg flex items-center justify-center text-white text-sm font-medium cursor-pointer`}
                  >
                    {initials}
                  </motion.div>
                );
              })}
              {dashboardData.totalEmployees > 4 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: 0.2 }}
                  className="w-10 h-10 rounded-full bg-gray-500/80 backdrop-blur-sm border-2 border-white/50 shadow-lg flex items-center justify-center text-white text-xs font-medium"
                >
                  +{dashboardData.totalEmployees - 4}
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Row 1: Projects, Revenue, Team, Clients */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <motion.div whileHover={{ y: -2, scale: 1.02 }} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-lg p-4 sm:p-5 shadow-lg border border-white/20">
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

          <motion.div whileHover={{ y: -2, scale: 1.02 }} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-lg p-4 sm:p-5 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Revenue</p>
                <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">₹{(dashboardData.analytics?.monthlyEarnings?.currentMonth?.total || dashboardData.totalRevenue || 0).toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">This month</p>
              </div>
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -2, scale: 1.02 }} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-lg p-4 sm:p-5 shadow-lg border border-white/20">
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

          <motion.div whileHover={{ y: -2, scale: 1.02 }} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-lg p-4 sm:p-5 shadow-lg border border-white/20">
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

        {/* Row 2: Monthly Earnings, Payments, Expected, Projects Status */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Monthly Earnings Card - Enhanced */}
          <motion.div whileHover={{ y: -2, scale: 1.02 }} className="bg-gradient-to-br from-emerald-50/80 to-green-50/80 dark:from-emerald-900/20 dark:to-green-900/20 backdrop-blur-md rounded-lg p-5 shadow-lg border border-emerald-200/50">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <svg className="w-4 h-4 text-emerald-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Monthly Earnings
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
              <div className="flex justify-between text-xs">
                <div className="text-center">
                  <span className="text-gray-600 dark:text-gray-400 block">Previous</span>
                  <span className="font-bold">₹{(dashboardData.analytics?.monthlyEarnings?.previousMonth?.total || 0).toLocaleString()}</span>
                </div>
                <div className="text-center">
                  <span className="text-gray-600 dark:text-gray-400 block">Next Expected</span>
                  <span className="font-bold">₹{(dashboardData.analytics?.monthlyEarnings?.nextMonthExpected?.total || 0).toLocaleString()}</span>
                </div>
              </div>
              <div className="bg-yellow-100/50 dark:bg-yellow-900/30 rounded-lg p-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-yellow-700 dark:text-yellow-400">Outstanding Due</span>
                  <span className="text-sm font-bold text-yellow-800 dark:text-yellow-300">₹{(dashboardData.analytics?.monthlyEarnings?.actualPayments?.dueAmount || 0).toLocaleString()}</span>
                </div>
                <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  Net amount after advance
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -2, scale: 1.02 }} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-lg p-5 shadow-lg border border-white/20">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Payments
            </h4>
            <div className="space-y-3">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200/50">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">Total Paid</span>
                  <span className="text-lg font-bold text-green-800 dark:text-green-300">₹{(dashboardData.analytics?.monthlyEarnings?.actualPayments?.totalPaid || 0).toLocaleString()}</span>
                </div>
                <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Includes ₹{(dashboardData.analytics?.monthlyEarnings?.actualPayments?.advanceAmount || 0).toLocaleString()} advance + ₹{(dashboardData.analytics?.monthlyEarnings?.currentMonth?.recurring || 0).toLocaleString()} recurring
                </div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200/50">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-red-700 dark:text-red-400">Due</span>
                  <span className="text-lg font-bold text-red-800 dark:text-red-300">₹{(dashboardData.analytics?.monthlyEarnings?.actualPayments?.dueAmount || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -2, scale: 1.02 }} className="bg-gradient-to-br from-yellow-50/80 to-orange-50/80 dark:from-yellow-900/20 dark:to-orange-900/20 backdrop-blur-md rounded-lg p-5 shadow-lg border border-yellow-200/50">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Expected</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-yellow-600">This Month</span>
                <span className="text-sm font-bold">₹{(dashboardData.analytics?.monthlyEarnings?.currentMonth?.total || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-green-600">Next Month</span>
                <span className="text-sm font-bold">₹{(dashboardData.analytics?.monthlyEarnings?.nextMonthExpected?.total || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-orange-600">This Year</span>
                <span className="text-sm font-bold">₹{((dashboardData.analytics?.monthlyEarnings?.currentMonth?.total || 0) + (dashboardData.analytics?.monthlyEarnings?.nextMonthExpected?.total || 0) * 11).toLocaleString()}</span>
              </div>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -2, scale: 1.02 }} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-lg p-5 shadow-lg border border-white/20">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Projects Status</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-green-600">Active</span>
                <span className="text-sm font-bold">{projectStatusCounts.active}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-blue-600">Completed</span>
                <span className="text-sm font-bold">{projectStatusCounts.completed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-orange-600">Hold</span>
                <span className="text-sm font-bold">{projectStatusCounts.onHold}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Row 3: Performance, Meetings, Employees, Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <motion.div whileHover={{ y: -2 }} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-lg p-5 shadow-lg border border-white/20">
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

          <motion.div whileHover={{ y: -2 }} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-lg p-5 shadow-lg border border-white/20">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Meetings</h4>
            <div className="space-y-2">
              {(dashboardData.analytics?.alerts?.upcomingMeetings || []).slice(0, 3).map((meeting, index) => {
                const meetingDate = new Date(meeting.meetingDate).toLocaleDateString();
                return (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div className="flex-1">
                      <span className="text-sm text-gray-900 dark:text-white truncate block">{meeting.leadName}</span>
                      <span className="text-sm text-gray-500">{meetingDate}</span>
                    </div>
                  </div>
                );
              })}
              {(dashboardData.analytics?.alerts?.upcomingMeetings || []).length === 0 && (
                <p className="text-sm text-gray-500">No upcoming meetings</p>
              )}
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-lg p-5 shadow-lg border border-white/20">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Employees</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-green-600">Active</span>
                <span className="text-sm font-bold">{(dashboardData.employees || []).filter(e => e.employee_status === 'Active').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-red-600">Inactive</span>
                <span className="text-sm font-bold">{(dashboardData.employees || []).filter(e => e.employee_status !== 'Active').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-blue-600">Total</span>
                <span className="text-sm font-bold">{dashboardData.totalEmployees}</span>
              </div>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-lg p-5 shadow-lg border border-white/20">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Tasks</h4>
            <div className="space-y-2">
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
          </motion.div>
        </motion.div>

        {/* Row 4: Invoices, Domains, Auto Renewals */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          <motion.div whileHover={{ y: -2 }} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-lg p-5 shadow-lg border border-white/20">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Invoices</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-green-600">Sent</span>
                <span className="text-sm font-bold">{dashboardData.analytics?.invoiceMetrics?.totalInvoices || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-blue-600">Total Amount</span>
                <span className="text-sm font-bold">₹{(dashboardData.analytics?.invoiceMetrics?.totalInvoiceAmount || dashboardData.analytics?.money?.totalInvoiceValue || dashboardData.analytics?.summary?.totalInvoiceAmount || 0).toLocaleString()}</span>
              </div>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-lg p-5 shadow-lg border border-white/20">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Domains</h4>
            <div className="space-y-2">
              {(dashboardData.analytics?.alerts?.domainExpiries || []).slice(0, 3).map((domain, index) => {
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
                <p className="text-sm text-gray-500">No domain data</p>
              )}
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} className="bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-900/20 dark:to-emerald-900/20 backdrop-blur-md rounded-lg p-5 shadow-lg border border-green-200/50">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Auto Renewals
            </h4>
            <div className="space-y-2 max-h-20 overflow-y-auto">
              {dashboardData.upcomingAutoRenewals.slice(0, 3).map((renewal, index) => {
                const isUrgent = renewal.daysUntilRenewal <= 7;
                return (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex-1">
                      <span className="text-sm text-gray-900 dark:text-white truncate block">{renewal.projectName}</span>
                      <span className="text-xs text-gray-500">₹{renewal.amount?.toLocaleString()}</span>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      isUrgent ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {renewal.daysUntilRenewal}d
                    </span>
                  </div>
                );
              })}
              {dashboardData.upcomingAutoRenewals.length === 0 && (
                <p className="text-sm text-gray-500">No upcoming renewals</p>
              )}
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