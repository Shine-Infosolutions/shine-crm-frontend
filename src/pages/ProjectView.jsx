import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';
import Loader from '../components/Loader';

function ProjectView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const [projectRes, employeesRes] = await Promise.all([
          api.get(`/api/projects/${id}`),
          api.get('/api/employees')
        ]);
        setProject(projectRes.data.data || projectRes.data);
        setEmployees(employeesRes.data.data || employeesRes.data || []);
        setLoading(false);
      } catch (error) {setLoading(false);
      }
    };

    if (id) {
      fetchProjectData();
    }
  }, [id]);

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp._id === employeeId);
    return employee ? employee.name : 'Unknown Employee';
  };

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString('en-GB') : 'Not set';
  };

  const formatCurrency = (amount) => {
    return amount ? `₹${amount.toLocaleString()}` : '₹0';
  };

  if (loading) {
    return <Loader message="Loading project details..." />;
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Project Not Found</h2>
          <button
            onClick={() => navigate('/projects')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {project.projectName}
          </h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate(`/projects/add?id=${project._id}`)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm sm:text-base"
            >
              Edit Project
            </button>
            <button
              onClick={() => navigate('/projects')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm sm:text-base"
            >
              Back to Projects
            </button>
          </div>
        </div>

        {/* Project Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Basic Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/50 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Project Type</label>
                <p className="text-gray-900 dark:text-white font-medium">Recurring Service</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</label>
                <p className="text-gray-900 dark:text-white font-medium">Active</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Priority</label>
                <p className="text-gray-900 dark:text-white font-medium">Medium</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Created</label>
                <p className="text-gray-900 dark:text-white">21/01/2026</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Updated</label>
                <p className="text-gray-900 dark:text-white">21/01/2026</p>
              </div>
            </div>
          </motion.div>

          {/* Client Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/50 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Client Information</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</label>
                <p className="text-gray-900 dark:text-white font-medium">{project.clientName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Contact</label>
                <p className="text-gray-900 dark:text-white">{project.clientContact}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                <p className="text-gray-900 dark:text-white">{project.clientEmail}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">GST Number</label>
                <p className="text-gray-900 dark:text-white">{project.clientGST || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Address</label>
                <p className="text-gray-900 dark:text-white text-sm">{project.clientAddress}</p>
              </div>
            </div>
          </motion.div>

          {/* Team & Management */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/50 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Team & Management</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Project Manager</label>
                <p className="text-gray-900 dark:text-white font-medium">{getEmployeeName(project.assignedManager)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Team Members</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {project.assignedTeam && project.assignedTeam.length > 0 ? (
                    project.assignedTeam.map((memberId, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        {getEmployeeName(memberId)}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">No team members assigned</span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Notes */}
          {project.notes && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="lg:col-span-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/50 p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Project Notes</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{project.notes}</p>
            </motion.div>
          )}
        </div>

        {/* Project Specific Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.35 }}
          className="mt-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/50 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            {project.projectType === 'ONE_TIME' ? 'One-Time Project Details' : 'Recurring Service Details'}
          </h2>

          {project.projectType === 'ONE_TIME' ? (
            <div className="space-y-6">
              {/* Financial Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <label className="text-sm font-medium text-green-600 dark:text-green-400">Total Amount</label>
                  <p className="text-2xl font-bold text-green-800 dark:text-green-200">{formatCurrency(project.oneTimeProject?.totalAmount)}</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <label className="text-sm font-medium text-blue-600 dark:text-blue-400">Paid Amount</label>
                  <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{formatCurrency(project.oneTimeProject?.paidAmount)}</p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <label className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Advance Amount</label>
                  <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">{formatCurrency(project.oneTimeProject?.advanceAmount)}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <label className="text-sm font-medium text-red-600 dark:text-red-400">Pending Amount</label>
                  <p className="text-2xl font-bold text-red-800 dark:text-red-200">
                    {formatCurrency((project.oneTimeProject?.totalAmount || 0) - (project.oneTimeProject?.paidAmount || 0))}
                  </p>
                </div>
              </div>

              {/* Project Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Start Date</label>
                  <p className="text-gray-900 dark:text-white font-medium">{formatDate(project.oneTimeProject?.startDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Expected Delivery</label>
                  <p className="text-gray-900 dark:text-white font-medium">{formatDate(project.oneTimeProject?.expectedDeliveryDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Final Handover</label>
                  <p className="text-gray-900 dark:text-white font-medium">{formatDate(project.oneTimeProject?.finalHandoverDate)}</p>
                </div>
              </div>

              {/* Project Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Project Scope</label>
                  <p className="text-gray-900 dark:text-white mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    {project.oneTimeProject?.scope || 'No scope defined'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Warranty Period</label>
                  <p className="text-gray-900 dark:text-white font-medium">{project.oneTimeProject?.warrantyPeriod || 'Not specified'}</p>
                </div>
              </div>

              {/* Technical Details */}
              {(project.oneTimeProject?.sourceCodeLink || project.oneTimeProject?.deploymentDetails || project.oneTimeProject?.domainName) && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Technical Details</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {project.oneTimeProject?.sourceCodeLink && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Source Code</label>
                        <p className="text-blue-600 dark:text-blue-400 break-all">{project.oneTimeProject.sourceCodeLink}</p>
                      </div>
                    )}
                    {project.oneTimeProject?.deploymentDetails && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Deployment</label>
                        <p className="text-gray-900 dark:text-white">{project.oneTimeProject.deploymentDetails}</p>
                      </div>
                    )}
                    {project.oneTimeProject?.domainName && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Domain</label>
                        <p className="text-gray-900 dark:text-white">{project.oneTimeProject.domainName}</p>
                        <p className="text-sm text-gray-500">Provider: {project.oneTimeProject?.domainProvider || 'Not specified'}</p>
                        <p className="text-sm text-gray-500">Expires: {formatDate(project.oneTimeProject?.domainExpiryDate)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Milestones */}
              {project.oneTimeProject?.paymentMilestones && project.oneTimeProject.paymentMilestones.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Milestones</h3>
                  <div className="overflow-x-auto -mx-6 px-6">
                    <table className="w-full text-xs sm:text-sm min-w-[600px]">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Title</th>
                          <th className="text-left py-2">Amount</th>
                          <th className="text-left py-2">Due Date</th>
                          <th className="text-left py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {project.oneTimeProject.paymentMilestones.map((milestone, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2">{milestone.title}</td>
                            <td className="py-2">{formatCurrency(milestone.amount)}</td>
                            <td className="py-2">{formatDate(milestone.dueDate)}</td>
                            <td className="py-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                milestone.status === 'Paid' ? 'bg-green-100 text-green-800' :
                                milestone.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {milestone.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Service Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <label className="text-sm font-medium text-purple-600 dark:text-purple-400">Recurring Amount</label>
                  <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">{formatCurrency(project.recurringProject?.recurringAmount)}</p>
                  <p className="text-sm text-purple-600 dark:text-purple-400">{project.recurringProject?.billingCycle || 'Monthly'}</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <label className="text-sm font-medium text-blue-600 dark:text-blue-400">Next Billing</label>
                  <p className="text-lg font-bold text-blue-800 dark:text-blue-200">{formatDate(project.recurringProject?.nextBillingDate)}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <label className="text-sm font-medium text-green-600 dark:text-green-400">Billing Status</label>
                  <p className="text-lg font-bold text-green-800 dark:text-green-200">{project.recurringProject?.billingStatus || 'Active'}</p>
                </div>
              </div>

              {/* Service Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Service Types</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {project.recurringProject?.serviceType?.map((service, index) => (
                      <span key={index} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                        {service}
                      </span>
                    )) || <span className="text-gray-500">No services specified</span>}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Contract Period</label>
                  <p className="text-gray-900 dark:text-white mt-1">
                    {formatDate(project.recurringProject?.contractStartDate)} - {formatDate(project.recurringProject?.contractEndDate)}
                  </p>
                </div>
              </div>

              {/* Auto Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Auto Invoice</label>
                  <p className="text-gray-900 dark:text-white font-medium">{project.recurringProject?.autoInvoice ? 'Enabled' : 'Disabled'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Auto Renew</label>
                  <p className="text-gray-900 dark:text-white font-medium">{project.recurringProject?.autoRenew ? 'Enabled' : 'Disabled'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Missed Billings</label>
                  <p className="text-gray-900 dark:text-white font-medium">{project.recurringProject?.missedBillingCount || 0}</p>
                </div>
              </div>

              {/* SLA Deliverables */}
              {project.recurringProject?.slaDeliverables && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">SLA Deliverables</label>
                  <p className="text-gray-900 dark:text-white mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    {project.recurringProject.slaDeliverables}
                  </p>
                </div>
              )}

              {/* Social Media Configuration */}
              {project.recurringProject?.socialMediaConfig && project.recurringProject.serviceType?.includes('Social Media') && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Social Media Configuration</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Platforms</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {project.recurringProject.socialMediaConfig.platforms?.map((platform, index) => (
                          <span key={index} className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm font-medium">
                            {platform}
                          </span>
                        )) || <span className="text-gray-500">No platforms selected</span>}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Deliverables</label>
                      <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-2">
                        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">{project.recurringProject.socialMediaConfig.deliverables?.posts || 0}</p>
                          <p className="text-sm text-blue-600">Posts</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">{project.recurringProject.socialMediaConfig.deliverables?.reels || 0}</p>
                          <p className="text-sm text-green-600">Reels</p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <p className="text-2xl font-bold text-purple-600">{project.recurringProject.socialMediaConfig.deliverables?.stories || 0}</p>
                          <p className="text-sm text-purple-600">Stories</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Billing History */}
              {project.recurringProject?.billingHistory && project.recurringProject.billingHistory.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Billing History</h3>
                  <div className="overflow-x-auto -mx-6 px-6">
                    <table className="w-full text-xs sm:text-sm min-w-[600px]">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Invoice ID</th>
                          <th className="text-left py-2">Amount</th>
                          <th className="text-left py-2">Billed On</th>
                          <th className="text-left py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {project.recurringProject.billingHistory.map((billing, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2 font-mono text-xs">{billing.invoiceId}</td>
                            <td className="py-2">{formatCurrency(billing.amount)}</td>
                            <td className="py-2">{formatDate(billing.billedOn)}</td>
                            <td className="py-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                billing.status === 'Paid' ? 'bg-green-100 text-green-800' :
                                billing.status === 'Failed' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {billing.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default ProjectView;