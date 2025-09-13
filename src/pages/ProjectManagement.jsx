import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import axios from "axios";
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
        const response = await axios.get(`${API_URL}/api/projects`);
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
  

  // Calculate progress based on start date, handover date, and current date
  const calculateProgress = (startDate, handOverDate, deadline) => {
    const start = new Date(startDate);
    const today = new Date();

    // If end date is provided, project is completed
    if (handOverDate && handOverDate.trim() !== "") {
      return 100;
    }

    // If project hasn't started yet
    if (today < start) return 0;

    const handover = new Date(deadline);

    // If project is already past handover date
    if (today > handover) return 100;

    // Calculate progress percentage based on time elapsed between start and handover
    const totalDuration = handover - start;
    const elapsedDuration = today - start;
    const progress = Math.round((elapsedDuration / totalDuration) * 100);

    return progress;
  };

  // Determine project status based on progress and handover date
  const getProjectStatus = (startDate, handOverDate, deadline) => {
    // If end date is provided, project is completed
    if (handOverDate && handOverDate.trim() !== "") {
      return "Completed";
    }

    const start = new Date(startDate);
    const handover = new Date(deadline);
    const today = new Date();

    // If project hasn't started yet
    if (today < start) {
      return "Not Started";
    }

    // If project is past handover date but not marked as completed
    if (today > handover) {
      return "Overdue";
    }

    // Calculate days remaining until handover
    const daysRemaining = Math.ceil((handover - today) / (1000 * 60 * 60 * 24));
    const totalDays = Math.ceil((handover - start) / (1000 * 60 * 60 * 24));
    const percentRemaining = (daysRemaining / totalDays) * 100;

    // If less than 20% of time remains until handover
    if (percentRemaining < 20) {
      return "Approaching Deadline";
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
      (projectFilter === "active" && !project.isCompleted) ||
      (projectFilter === "completed" && project.isCompleted);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Project Management</h2>
      {/* Search Bar */}
      <div className="mb-6 relative z-0">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by project name, client name or phone..."
            className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div className="mb-4 flex flex-col gap-3">
  {/* Add Project Button at Top Right */}
  <div className="flex justify-center sm:justify-end">
  <button
    onClick={() => navigate("/projects/add")}
    className="bg-gray-800 text-white px-5 py-2 rounded-lg hover:bg-gray-700 transition"
  >
    Add New Project
  </button>
</div>

  {/* Filter Buttons in One Line Below */}
  <div className="flex flex-wrap justify-center sm:justify-start gap-2">
    <button
      className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
        projectFilter === "all"
          ? "bg-blue-600 text-white"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
      }`}
      onClick={() => setProjectFilter("all")}
    >
      All Projects
    </button>
    <button
      className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
        projectFilter === "active"
          ? "bg-blue-600 text-white"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
      }`}
      onClick={() => setProjectFilter("active")}
    >
      Active Projects
    </button>
    <button
      className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
        projectFilter === "completed"
          ? "bg-blue-600 text-white"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
      }`}
      onClick={() => setProjectFilter("completed")}
    >
      Completed Projects
    </button>
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
            {filteredProjects.map((project) => (
              <div
                key={project._id}
                className={`border rounded-lg p-4 cursor-pointer transition ${
                  project._id === selectedProject
                    ? "ring-2 ring-blue-500 bg-blue-50 border-blue-500 dark:bg-blue-900/30"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
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
              </div>
            ))}
          </div>
         ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No projects found matching your search.</p>
          </div>
        )}
      </div>

      {/* Project Details Section - Shows when a project is selected */}
      {selectedProject !== null && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Project Details</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  const project = projectsWithProgress.find(
                    (p) => p._id === selectedProject
                  );
                  navigate("/projects/add", {
                    state: { project, isEditing: true },
                  });
                }}
                className="text-blue-500 hover:text-blue-700"
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
              </button>
              {/* <button
                onClick={() => setSelectedProject(null)}
                className="text-gray-500 hover:text-gray-700"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button> */}
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
                  <p className="font-medium">${project.projectAmount}</p>
                  <p className="text-sm">Advance: ${project.advanceAmount}</p>
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
                  <p className="text-sm">${project.commissionAmount || 0}</p>
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
                    <p className="text-sm">Cost: ${project.domainCost}</p>
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
        </div>
      )}
    </div>
  );
}

export default ProjectManagement;
