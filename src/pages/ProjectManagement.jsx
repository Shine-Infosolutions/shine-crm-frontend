import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import api from '../utils/axiosConfig';
import Loader from "../components/Loader";
import Pagination from "../components/Pagination";

function ProjectManagement() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState([]);
  const [projectFilter, setProjectFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0, limit: 10 });
  const navigate = useNavigate();
  const { API_URL } = useAppContext();

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Update progress for all active projects first
        await api.put('/api/projects/update-progress');
        
        const response = await api.get(`/api/projects?page=${currentPage}&limit=10`);
        if (response.data.success) {
          setProjects(response.data.data || []);
          setPagination(response.data.pagination || { total: 0, pages: 0, limit: 10 });
        } else {
          const sortedProjects = (response.data || []).sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA;
          });
          setProjects(sortedProjects);
        }
        setLoading(false);
      } catch (err) {
        setError("Failed to load projects. Please try again.");
        setLoading(false);
      }
    };
  
    fetchProjects();
  }, [currentPage]);
  

  // Calculate progress and status based on project type
  const calculateProjectMetrics = (project) => {
    // Use stored progress from database
    const progress = project.progress || 0;
    
    if (project.projectType === 'ONE_TIME') {
      // Status-based overrides
      if (project.status === 'Completed') return { progress: 100, status: 'Completed' };
      if (project.status === 'Cancelled') return { progress, status: 'Cancelled' };
      if (project.status === 'On Hold') return { progress, status: 'On Hold' };
      
      const start = new Date(project.oneTimeProject?.startDate);
      const expected = new Date(project.oneTimeProject?.expectedDeliveryDate);
      const today = new Date();
      
      if (!start || !expected || isNaN(start.getTime()) || isNaN(expected.getTime())) {
        return { progress: 0, status: 'Planning' };
      }
      
      if (today < start) return { progress: 0, status: 'Not Started' };
      if (today > expected && progress < 100) return { progress, status: 'Overdue' };
      
      return { progress, status: 'In Progress' };
    } else {
      // Recurring project logic
      const contractEnd = new Date(project.recurringProject?.contractEndDate);
      const today = new Date();
      
      if (project.status === 'Cancelled') return { progress: 0, status: 'Cancelled' };
      if (project.status === 'Completed') return { progress: 100, status: 'Completed' };
      if (project.status === 'On Hold') return { progress: 50, status: 'On Hold' };
      
      if (contractEnd && !isNaN(contractEnd.getTime()) && today > contractEnd) {
        return { progress: 100, status: 'Contract Expired' };
      }
      
      return { progress: 75, status: 'Active Service' };
    }
  };

  // Add calculated metrics to each project
  const projectsWithMetrics = projects.map((project) => {
    const { progress, status } = calculateProjectMetrics(project);
    return { ...project, progress, calculatedStatus: status };
  });

  // Filter projects based on search term
  const filteredProjects = projectsWithMetrics.filter((project) => {
    const matchesSearch =
      project.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.clientContact && project.clientContact.includes(searchTerm));

    const matchesFilter =
      projectFilter === "all" ||
      (projectFilter === "active" && ['Active', 'In Progress', 'Active Service', 'Not Started', 'Planning'].includes(project.calculatedStatus)) ||
      (projectFilter === "completed" && ['Completed', 'Contract Expired'].includes(project.calculatedStatus));

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-6"
      >
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="text-2xl font-bold mb-6 text-gray-900 dark:text-white"
        >
          Project Management
        </motion.h2>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-6 relative z-0"
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Search by project name, client name or phone..."
              className="w-full px-4 py-2 pl-10 bg-blue-gray-200/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-blue-gray-200/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-xl p-6 mb-6 border border-white/20 dark:border-gray-700/50"
        >
          <div className="mb-4 flex flex-col gap-3">
            {/* Add Project Button at Top Right */}
            <div className="flex justify-center sm:justify-end">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/projects/add")}
                className="bg-gray-800/80 backdrop-blur-md text-white px-5 py-2 rounded-lg hover:bg-gray-700/80 transition shadow-lg border border-white/10"
              >
                Add New Project
              </motion.button>
            </div>

            {/* Filter Buttons in One Line Below */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition backdrop-blur-sm ${
                  projectFilter === "all"
                    ? "bg-blue-600/80 text-white shadow-lg"
                    : "bg-gray-200/80 text-gray-700 hover:bg-gray-300/80 shadow-md"
                }`}
                onClick={() => setProjectFilter("all")}
              >
                All Projects
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition backdrop-blur-sm ${
                  projectFilter === "active"
                    ? "bg-blue-600/80 text-white shadow-lg"
                    : "bg-gray-200/80 text-gray-700 hover:bg-gray-300/80 shadow-md"
                }`}
                onClick={() => setProjectFilter("active")}
              >
                Active Projects
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition backdrop-blur-sm ${
                  projectFilter === "completed"
                    ? "bg-blue-600/80 text-white shadow-lg"
                    : "bg-gray-200/80 text-gray-700 hover:bg-gray-300/80 shadow-md"
                }`}
                onClick={() => setProjectFilter("completed")}
              >
                Completed Projects
              </motion.button>
            </div>
          </div>

          {loading ? (
            <Loader message="Fetching projects..." />
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className={`border backdrop-blur-md rounded-xl p-4 cursor-pointer transition shadow-lg ${
                    project._id === selectedProject
                      ? "ring-2 ring-blue-500 bg-blue-50/80 border-blue-500/50 dark:bg-blue-900/30"
                      : "bg-white/70 dark:bg-gray-800/70 border-white/20 dark:border-gray-700/50 hover:bg-gray-100/80 dark:hover:bg-gray-700/80"
                  }`}
                  onClick={() => {
                    if (project._id !== selectedProject) {
                      setSelectedProject(project._id);
                    }
                  }}
                >
                  <h4 className="font-bold">{project.projectName}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Client: {project.clientName}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    {project.projectType === 'ONE_TIME' ? 'One-Time Project' : 'Recurring Service'}
                  </p>
                  <div className="mt-2 flex justify-between">
                    <span className="text-sm">Progress: {project.progress}%</span>
                    <span
                      className={`text-sm ${
                        project.calculatedStatus === "Completed" || project.calculatedStatus === "Contract Expired"
                          ? "text-blue-600"
                          : project.calculatedStatus === "In Progress" || project.calculatedStatus === "Active Service"
                          ? "text-green-600"
                          : project.calculatedStatus === "On Hold"
                          ? "text-orange-500"
                          : project.calculatedStatus === "Overdue"
                          ? "text-red-600"
                          : "text-gray-500"
                      }`}
                    >
                      {project.calculatedStatus}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                    <div
                      className={`${
                        project.calculatedStatus === "Completed" || project.calculatedStatus === "Contract Expired"
                          ? "bg-blue-600"
                          : project.calculatedStatus === "In Progress" || project.calculatedStatus === "Active Service"
                          ? "bg-green-600"
                          : project.calculatedStatus === "On Hold"
                          ? "bg-orange-500"
                          : project.calculatedStatus === "Overdue"
                          ? "bg-red-500"
                          : "bg-gray-400"
                      } h-2.5 rounded-full`}
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {project.projectType === 'ONE_TIME' 
                      ? `${project.oneTimeProject?.startDate ? new Date(project.oneTimeProject.startDate).toLocaleDateString() : 'TBD'} to ${project.oneTimeProject?.expectedDeliveryDate ? new Date(project.oneTimeProject.expectedDeliveryDate).toLocaleDateString() : 'TBD'}`
                      : `${project.recurringProject?.billingCycle || 'Monthly'} • ₹${project.recurringProject?.recurringAmount ? parseFloat(project.recurringProject.recurringAmount).toLocaleString('en-IN') : '0'}`
                    }
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="text-center py-8"
            >
              <p className="text-gray-500 dark:text-gray-400">No projects found matching your search.</p>
            </motion.div>
          )}
        </motion.div>

        {/* Pagination */}
        {!loading && pagination.pages > 1 && (
          <div className="mb-6">
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.pages}
              onPageChange={setCurrentPage}
              itemsPerPage={pagination.limit}
              totalItems={pagination.total}
            />
          </div>
        )}

        {/* Project Details Section - Shows when a project is selected */}
        <AnimatePresence>
          {selectedProject !== null && (
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ duration: 0.3, type: "spring", damping: 25, stiffness: 300 }}
              className="bg-blue-gray-200/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-xl p-6 mb-6 border border-white/20 dark:border-gray-700/50"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Project Details</h3>
                <div className="flex space-x-2">
                  <select
                    value={projectsWithMetrics.find(p => p._id === selectedProject)?.status || 'Active'}
                    onChange={async (e) => {
                      try {
                        await api.put(`/api/projects/${selectedProject}`, { status: e.target.value });
                        setProjects(prev => prev.map(p => p._id === selectedProject ? { ...p, status: e.target.value } : p));
                        // Refresh projects to get updated progress
                        const response = await api.get(`/api/projects?page=${currentPage}&limit=10`);
                        if (response.data.success) {
                          setProjects(response.data.data || []);
                        }
                      } catch (err) {
                        console.error('Failed to update status:', err);
                      }
                    }}
                    className="px-3 py-1 text-sm border rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      const project = projectsWithMetrics.find(
                        (p) => p._id === selectedProject
                      );
                      navigate("/projects/add", {
                        state: { project, isEditing: true },
                      });
                    }}
                    className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50/50 dark:hover:bg-blue-900/20 backdrop-blur-sm"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </motion.button>
                </div>
              </div>

              {projectsWithMetrics
                .filter((p) => p._id === selectedProject)
                .map((project) => (
                  <div
                    key={project._id}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4"
                  >
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Project Info</p>
                      <p className="font-medium">{project.projectName}</p>
                      <p className="text-sm">{project.projectType === 'ONE_TIME' ? 'One-Time Project' : 'Recurring Service'}</p>
                      <p className="text-sm">Status: {project.status}</p>
                      <p className="text-sm">Priority: {project.priority}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Client</p>
                      <p className="font-medium">{project.clientName}</p>
                      <p className="text-sm">{project.clientContact}</p>
                    </div>

                    {project.projectType === 'ONE_TIME' ? (
                      <>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Project Cost</p>
                          <p className="font-medium">₹{project.oneTimeProject?.totalAmount ? parseFloat(project.oneTimeProject.totalAmount).toLocaleString('en-IN') : '0'}</p>
                          <p className="text-sm">Paid: ₹{project.oneTimeProject?.paidAmount ? parseFloat(project.oneTimeProject.paidAmount).toLocaleString('en-IN') : '0'}</p>
                          <p className="text-sm">Pending: ₹{project.oneTimeProject?.totalAmount && project.oneTimeProject?.paidAmount ? (parseFloat(project.oneTimeProject.totalAmount) - parseFloat(project.oneTimeProject.paidAmount)).toLocaleString('en-IN') : '0'}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Timeline</p>
                          <p className="text-sm">
                            Start: {project.oneTimeProject?.startDate ? new Date(project.oneTimeProject.startDate).toLocaleDateString() : 'Not set'}
                          </p>
                          <p className="text-sm">
                            Expected: {project.oneTimeProject?.expectedDeliveryDate ? new Date(project.oneTimeProject.expectedDeliveryDate).toLocaleDateString() : 'Not set'}
                          </p>
                          <p className="text-sm">
                            Handover: {project.oneTimeProject?.finalHandoverDate ? new Date(project.oneTimeProject.finalHandoverDate).toLocaleDateString() : 'Not set'}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Delivery Details</p>
                          {project.oneTimeProject?.sourceCodeLink && (
                            <a href={project.oneTimeProject.sourceCodeLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline block">
                              Source Code
                            </a>
                          )}
                          <p className="text-sm">{project.oneTimeProject?.deploymentDetails || 'Not specified'}</p>
                          <p className="text-sm">Warranty: {project.oneTimeProject?.warrantyPeriod || 'Not specified'}</p>
                        </div>

                        <div className="md:col-span-2 lg:col-span-3">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Project Scope</p>
                          <p className="text-sm">{project.oneTimeProject?.scope || 'Not specified'}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Service Details</p>
                          <p className="font-medium">{project.recurringProject?.serviceType || 'Not specified'}</p>
                          <p className="text-sm">{project.recurringProject?.billingCycle || 'Monthly'} billing</p>
                          <p className="text-sm">₹{project.recurringProject?.recurringAmount ? parseFloat(project.recurringProject.recurringAmount).toLocaleString('en-IN') : '0'}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Contract Period</p>
                          <p className="text-sm">
                            Start: {project.recurringProject?.contractStartDate ? new Date(project.recurringProject.contractStartDate).toLocaleDateString() : 'Not set'}
                          </p>
                          <p className="text-sm">
                            End: {project.recurringProject?.contractEndDate ? new Date(project.recurringProject.contractEndDate).toLocaleDateString() : 'Not set'}
                          </p>
                          <p className="text-sm">
                            Auto Renew: {project.recurringProject?.autoRenew ? 'Yes' : 'No'}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Billing Info</p>
                          <p className="text-sm">
                            Next Billing: {project.recurringProject?.nextBillingDate ? new Date(project.recurringProject.nextBillingDate).toLocaleDateString() : 'Not set'}
                          </p>
                          <p className="text-sm">
                            Last Invoice: {project.recurringProject?.lastInvoiceId || 'None'}
                          </p>
                          <p className="text-sm">
                            Missed Count: {project.recurringProject?.missedBillingCount || 0}
                          </p>
                          <p className="text-sm">
                            Auto Invoice: {project.recurringProject?.autoInvoice ? 'Yes' : 'No'}
                          </p>
                        </div>

                        <div className="md:col-span-2 lg:col-span-3">
                          <p className="text-sm text-gray-500 dark:text-gray-400">SLA & Deliverables</p>
                          <p className="text-sm">{project.recurringProject?.slaDeliverables || 'Not specified'}</p>
                        </div>
                      </>
                    )}

                    {project.notes && (
                      <div className="md:col-span-2 lg:col-span-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Notes</p>
                        <p className="text-sm">{project.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default ProjectManagement;
