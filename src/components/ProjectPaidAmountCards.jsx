import React, { useState, useEffect } from 'react';

const ProjectPaidAmountCards = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaidAmountDetails();
  }, []);

  const fetchPaidAmountDetails = async () => {
    try {
      const response = await fetch('/api/dashboard/project-paid-details');
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching paid amount details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const { oneTimeProjects, recurringProjects, summary } = data;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Collected (All Projects)</p>
              <p className="text-2xl font-bold text-green-700 mt-2">
                {formatCurrency(summary.totalCollectedAllTypes)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                From {summary.totalProjectsAllTypes} projects
              </p>
            </div>
            <div className="text-green-600">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pending (All Projects)</p>
              <p className="text-2xl font-bold text-orange-700 mt-2">
                {formatCurrency(summary.totalPendingAllTypes)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Across all project types</p>
            </div>
            <div className="text-orange-600">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-2xl font-bold text-blue-700 mt-2">
                {summary.totalProjectsAllTypes}
              </p>
              <div className="flex gap-2 mt-2">
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                  {oneTimeProjects.totalProjects} One-time
                </span>
                <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                  {recurringProjects.totalProjects} Recurring
                </span>
              </div>
            </div>
            <div className="text-blue-600">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* One-Time Projects Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="text-blue-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold">One-Time Projects</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-lg font-semibold">{formatCurrency(oneTimeProjects.totalAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Collected</p>
                <p className="text-lg font-semibold text-green-600">{formatCurrency(oneTimeProjects.totalCollected)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Payment Completion</span>
                <span className="font-medium">{oneTimeProjects.paymentCompletionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${oneTimeProjects.paymentCompletionRate}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div>
                <p className="text-xs text-gray-500">Direct Payments</p>
                <p className="font-medium text-green-600">{formatCurrency(oneTimeProjects.totalPaid)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Advance Payments</p>
                <p className="font-medium text-blue-600">{formatCurrency(oneTimeProjects.totalAdvance)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Pending Amount</p>
                <p className="font-medium text-orange-600">{formatCurrency(oneTimeProjects.pendingAmount)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Project Status</p>
                <div className="flex gap-1">
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                    {oneTimeProjects.activeProjects} Active
                  </span>
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                    {oneTimeProjects.completedProjects} Done
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recurring Projects Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="text-purple-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Recurring Projects</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Billed</p>
                <p className="text-lg font-semibold">{formatCurrency(recurringProjects.totalBilledAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Collected</p>
                <p className="text-lg font-semibold text-green-600">{formatCurrency(recurringProjects.totalPaidBills)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Collection Rate</span>
                <span className="font-medium">{recurringProjects.recurringCollectionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${recurringProjects.recurringCollectionRate}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div>
                <p className="text-xs text-gray-500">Monthly Revenue</p>
                <p className="font-medium text-purple-600">{formatCurrency(recurringProjects.totalRecurringAmount)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Pending Bills</p>
                <p className="font-medium text-orange-600">{formatCurrency(recurringProjects.pendingBills)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Billing Cycles</p>
                <div className="flex gap-1">
                  <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                    {recurringProjects.monthlyProjects} Monthly
                  </span>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    {recurringProjects.yearlyProjects} Yearly
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500">Active Projects</p>
                <p className="font-medium text-green-600">{recurringProjects.activeProjects}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPaidAmountCards;