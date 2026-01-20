import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import api from '../utils/axiosConfig';
import Loader from "../components/Loader";
import Pagination from "../components/Pagination";

function ProjectManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0, limit: 10 });
  const navigate = useNavigate();
  const { API_URL } = useAppContext();

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
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
  

  // Calculate status based on project type
  const calculateProjectMetrics = (project) => {
    if (project.projectType === 'ONE_TIME') {
      // Status-based overrides
      if (project.status === 'Completed') return { status: 'Completed' };
      if (project.status === 'Cancelled') return { status: 'Cancelled' };
      if (project.status === 'On Hold') return { status: 'On Hold' };
      
      const start = new Date(project.oneTimeProject?.startDate);
      const expected = new Date(project.oneTimeProject?.expectedDeliveryDate);
      const today = new Date();
      
      if (!start || !expected || isNaN(start.getTime()) || isNaN(expected.getTime())) {
        return { status: 'Planning' };
      }
      
      if (today < start) return { status: 'Not Started' };
      if (today > expected) return { status: 'Overdue' };
      
      return { status: 'In Progress' };
    } else {
      // Recurring project logic
      const contractEnd = new Date(project.recurringProject?.contractEndDate);
      const today = new Date();
      
      if (project.status === 'Cancelled') return { status: 'Cancelled' };
      if (project.status === 'Completed') return { status: 'Completed' };
      if (project.status === 'On Hold') return { status: 'On Hold' };
      
      if (contractEnd && !isNaN(contractEnd.getTime()) && today > contractEnd) {
        return { status: 'Contract Expired' };
      }
      
      return { status: 'Active Service' };
    }
  };

  // Add calculated metrics to each project
  const projectsWithMetrics = projects.map((project) => {
    const { status } = calculateProjectMetrics(project);
    return { ...project, calculatedStatus: status };
  });

  // Get unique status values for filter options
  const uniqueStatuses = [...new Set(projects.map(project => project.status))].filter(Boolean).sort();

  // Filter projects based on search term and status
  const filteredProjects = projectsWithMetrics.filter((project) => {
    const matchesSearch =
      project.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.clientContact && project.clientContact.includes(searchTerm));

    const matchesStatus = statusFilter === "all" || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const deleteProject = async (projectId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await api.delete(`/api/projects/${projectId}`);
        setProjects(projects.filter(project => project._id !== projectId));
      } catch (error) {
        alert('Failed to delete project');
      }
    }
  };

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

        {/* Search Bar and Add Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex flex-col md:flex-row gap-4 mb-6"
        >
          <div className="relative flex-grow">
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

          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/projects/add")}
            className="bg-gray-800/80 backdrop-blur-md text-white px-4 py-2 rounded-lg hover:bg-gray-700/80 whitespace-nowrap shadow-lg border border-white/10"
          >
            Add New Project
          </motion.button>
        </motion.div>

        {/* Status Filter Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="flex flex-wrap justify-center sm:justify-start gap-2 mb-6"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition backdrop-blur-sm ${
              statusFilter === "all"
                ? "bg-blue-600/80 text-white shadow-lg"
                : "bg-gray-200/80 text-gray-700 hover:bg-gray-300/80 shadow-md"
            }`}
            onClick={() => setStatusFilter("all")}
          >
            All Status
          </motion.button>
          {uniqueStatuses.map((status) => (
            <motion.button
              key={status}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition backdrop-blur-sm ${
                statusFilter === status
                  ? "bg-blue-600/80 text-white shadow-lg"
                  : "bg-gray-200/80 text-gray-700 hover:bg-gray-300/80 shadow-md"
              }`}
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </motion.button>
          ))}
        </motion.div>

        {/* Loader or Project Cards */}
        {loading ? (
          <Loader message="Fetching projects..." />
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProjects.map((project, index) => (
                  <motion.div
                    key={project._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.25 + index * 0.05 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/projects/add?id=${project._id}`)}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg hover:shadow-xl border border-white/20 dark:border-gray-700/50 cursor-pointer transition-all duration-300 p-6"
                  >
                    <div className="flex flex-col h-full">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {project.projectName}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full shrink-0
                            ${
                              project.status === "Completed" || project.status === "Close"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                : project.status === "Progress" || project.status === "Active" || project.status === "Start"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : project.status === "Hold" || project.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                            }`}
                          >
                            {project.status}
                          </span>
                          <button
                            onClick={(e) => deleteProject(project._id, e)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Delete project"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Client Info */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <svg className="w-4 h-4 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          <span className="truncate">{project.clientName}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <svg className="w-4 h-4 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                          <span className="truncate">{project.clientContact}</span>
                        </div>
                      </div>

                      {/* Project Type */}
                      <div className="mb-4">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full
                          ${project.projectType === 'ONE_TIME' 
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" 
                            : "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400"
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full mr-1 ${project.projectType === 'ONE_TIME' ? "bg-purple-500" : "bg-indigo-500"}`}></div>
                          {project.projectType === 'ONE_TIME' ? 'One-Time Project' : 'Recurring Service'}
                        </span>
                      </div>

                      {/* Financial/Timeline Info */}
                      <div className="mt-auto space-y-2 pt-4 border-t border-gray-200 dark:border-gray-600">
                        {project.projectType === 'ONE_TIME' ? (
                          <>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              <div className="flex justify-between items-center">
                                <span>Total Amount:</span>
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                  ₹{project.oneTimeProject?.totalAmount ? parseFloat(project.oneTimeProject.totalAmount).toLocaleString('en-IN') : '0'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center mt-1">
                                <span>Paid:</span>
                                <span className="font-medium text-green-600">
                                  ₹{project.oneTimeProject?.paidAmount ? parseFloat(project.oneTimeProject.paidAmount).toLocaleString('en-IN') : '0'}
                                </span>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              <div className="flex justify-between items-center">
                                <span>Timeline:</span>
                                <span className="font-medium">
                                  {project.oneTimeProject?.startDate ? new Date(project.oneTimeProject.startDate).toLocaleDateString() : 'TBD'} - {project.oneTimeProject?.expectedDeliveryDate ? new Date(project.oneTimeProject.expectedDeliveryDate).toLocaleDateString() : 'TBD'}
                                </span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              <div className="flex justify-between items-center">
                                <span>Billing:</span>
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                  {project.recurringProject?.billingCycle || 'Monthly'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center mt-1">
                                <span>Amount:</span>
                                <span className="font-medium text-green-600">
                                  ₹{project.recurringProject?.recurringAmount ? parseFloat(project.recurringProject.recurringAmount).toLocaleString('en-IN') : '0'}
                                </span>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              <div className="flex justify-between items-center">
                                <span>Service:</span>
                                <span className="font-medium">
                                  {project.recurringProject?.serviceType || 'Not specified'}
                                </span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.25 }}
                className="text-center py-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/50"
              >
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400 text-lg">No projects found matching your search.</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Try adjusting your search criteria or add a new project.</p>
              </motion.div>
            )}
          </motion.div>
        )}

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


      </motion.div>
    </div>
  );
}

export default ProjectManagement;
