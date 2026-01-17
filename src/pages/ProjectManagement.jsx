import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import api from '../utils/axiosConfig';
import Loader from "../components/Loader";

function ProjectManagement() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState([]);
  const [projectFilter, setProjectFilter] = useState("all");
  const navigate = useNavigate();
  const { API_URL } = useAppContext();

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get('/api/projects');
        const sortedProjects = (response.data || []).sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA;
        });
        setProjects(sortedProjects);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Failed to load projects. Please try again.");
        setLoading(false);
      }
    };
  
    fetchProjects();
  }, []);
  

  // Calculate progress based on start date and deadline only
  const calculateProgress = (startDate, handOverDate, deadline) => {
    const start = new Date(startDate);
    const today = new Date();
    const end = new Date(deadline);
    
    // If project hasn't started yet
    if (today <= start) return 0;
    
    // If past deadline, show 100%
    if (today >= end) return 100;

    // Calculate time-based progress between start and deadline
    const totalTime = end.getTime() - start.getTime();
    const elapsedTime = today.getTime() - start.getTime();
    
    const percentage = (elapsedTime / totalTime) * 100;
    return Math.round(Math.max(0, Math.min(100, percentage)));
  };

  // Determine project status based on progress and handover date
  const getProjectStatus = (startDate, handOverDate, deadline) => {
    // If end date is provided, project is completed
    if (handOverDate && handOverDate.trim() !== "") {
      return "Completed";
    }

    const start = new Date(startDate);
    const targetDate = new Date(deadline);
    const today = new Date();

    // If project hasn't started yet
    if (today < start) {
      return "Not Started";
    }

    // If project is past deadline but not marked as completed
    if (today > targetDate) {
      return "Overdue";
    }

    return "On Track";
  };

  // Add calculated progress and status to each project
  const projectsWithProgress = projects.map((project) => {
    const progress = calculateProgress(
      project.startDate,
      project.handoverDate,
      project.deadline
    );
    const status = getProjectStatus(
      project.startDate,
      project.handoverDate,
      project.deadline
    );
    const isCompleted = project.handoverDate && project.handoverDate !== "";
    return { ...project, progress, status, isCompleted };
  });

  // Filter projects based on search term
  const filteredProjects = projectsWithProgress.filter((project) => {
    const matchesSearch =
      project.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.clientContact && project.clientContact.includes(searchTerm));

    const matchesFilter =
      projectFilter === "all" ||
      (projectFilter === "active" && project.progress <= 99.9) ||
      (projectFilter === "completed" && project.progress === 100);

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
                  <div className="mt-2 flex justify-between">
                    <span className="text-sm">Progress: {project.progress}%</span>
                    <span
                      className={`text-sm ${
                        project.status === "Completed"
                          ? "text-blue-600"
                          : project.status === "On Track"
                          ? "text-green-600"
                          : project.status === "Approaching Deadline"
                          ? "text-orange-500"
                          : project.status === "Overdue"
                          ? "text-red-600"
                          : "text-gray-500"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                    <div
                      className={`${
                        project.status === "Completed"
                          ? "bg-blue-600"
                          : project.status === "On Track"
                          ? "bg-green-600"
                          : project.status === "Approaching Deadline"
                          ? "bg-orange-500"
                          : project.status === "Overdue"
                          ? "bg-red-500"
                          : "bg-gray-400"
                      } h-2.5 rounded-full`}
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {new Date(project.startDate).toLocaleDateString()} to{" "}
                    {new Date(
                      project.deadline || project.handoverDate
                    ).toLocaleDateString()}
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
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      const project = projectsWithProgress.find(
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

              {projectsWithProgress
                .filter((p) => p._id === selectedProject)
                .map((project) => (
                  <div
                    key={project._id}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4"
                  >
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Project Info
                      </p>
                      <p className="font-medium">{project.projectName}</p>
                      <p className="text-sm">{project.projectType}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Client
                      </p>
                      <p className="font-medium">{project.clientName}</p>
                      <p className="text-sm">{project.clientContact}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Project Amount
                      </p>
                      <p className="font-medium">₹{parseFloat(project.projectAmount || 0).toLocaleString('en-IN')}</p>
                      <p className="text-sm">Advance: ₹{parseFloat(project.advanceAmount || 0).toLocaleString('en-IN')}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Timeline
                      </p>
                      <p className="text-sm">
                        Start: {new Date(project.startDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm">
                        Deadline:{" "}
                        {project.deadline
                          ? new Date(project.deadline).toLocaleDateString()
                          : "Not set"}
                      </p>
                      <p className="text-sm">
                        Handover:{" "}
                        {project.handoverDate
                          ? new Date(project.handoverDate).toLocaleDateString()
                          : "Not set"}
                      </p>
                      <p className="text-sm font-medium mt-1">
                        Progress: {project.progress}% ({project.status})
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Commission
                      </p>
                      <p className="font-medium">
                        {project.commissionTo || "Not specified"}
                      </p>
                      <p className="text-sm">₹{parseFloat(project.commissionAmount || 0).toLocaleString('en-IN')}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Domain Details
                      </p>
                      <p className="font-medium">
                        {project.domain || "Not specified"}
                      </p>
                      {project.domainPurchaseDate && (
                        <p className="text-sm">
                          Purchase:{" "}
                          {new Date(
                            project.domainPurchaseDate
                          ).toLocaleDateString()}
                        </p>
                      )}
                      {project.domainCost && (
                        <p className="text-sm">Cost: ₹{parseFloat(project.domainCost || 0).toLocaleString('en-IN')}</p>
                      )}
                      {project.domainExpiryDate && (
                        <p className="text-sm">
                          Expires:{" "}
                          {new Date(project.domainExpiryDate).toLocaleDateString()}
                        </p>
                      )}
                      {project.renewalDate && (
                        <p className="text-sm">
                          Renewal:{" "}
                          {new Date(project.renewalDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Access
                      </p>
                      <p className="text-sm">
                        Email: {project.email || "Not specified"}
                      </p>
                      <p className="text-sm">
                        Password: {project.password ? "••••••••" : "Not specified"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Links
                      </p>
                      <div className="mt-1">
                        {project.projectLink ? (
                          <a
                            href={project.projectLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline block"
                          >
                            Live Site
                          </a>
                        ) : (
                          <p className="text-sm">Live Site: Not specified</p>
                        )}
                        {project.sourceCodeLink ? (
                          <a
                            href={project.sourceCodeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline block"
                          >
                            Source Code
                          </a>
                        ) : (
                          <p className="text-sm">Source Code: Not specified</p>
                        )}
                      </div>
                    </div>
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