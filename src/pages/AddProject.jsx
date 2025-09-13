import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAppContext } from "../context/AppContext";

function AddProject() {
  const navigate = useNavigate();
  const location = useLocation();
  const { API_URL } = useAppContext();
  const isEditing = location.state?.isEditing || false;
  const projectToEdit = location.state?.project || null;
  const [formData, setFormData] = useState({
    projectName: "",
    projectType: "",
    projectAmount: "",
    advanceAmount: "",
    clientName: "",
    clientContact: "",
    startDate: "",
    deadline: "",
    handoverDate: "",
    commissionTo: "",
    commissionAmount: "",
    domain: "",
    domainPurchaseDate: "",
    domainCost: "",
    domainExpiryDate: "",
    renewalDate: "",
    projectLink: "",
    sourceCodeLink: "",
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill form if editing
  useEffect(() => {
    if (isEditing && projectToEdit) {
      // Format dates for input fields
      const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
      };

      setFormData({
        projectName: projectToEdit.projectName || "",
        projectType: projectToEdit.projectType || "",
        projectAmount: projectToEdit.projectAmount || "",
        advanceAmount: projectToEdit.advanceAmount || "",
        clientName: projectToEdit.clientName || "",
        clientContact: projectToEdit.clientContact || "",
        startDate: formatDate(projectToEdit.startDate),
        deadline: formatDate(projectToEdit.deadline),
        handoverDate: formatDate(projectToEdit.handoverDate),
        commissionTo: projectToEdit.commissionTo || "",
        commissionAmount: projectToEdit.commissionAmount || "",
        domain: projectToEdit.domain || "",
        domainPurchaseDate: formatDate(projectToEdit.domainPurchaseDate),
        domainCost: projectToEdit.domainCost || "",
        domainExpiryDate: formatDate(projectToEdit.domainExpiryDate),
        renewalDate: formatDate(projectToEdit.renewalDate),
        projectLink: projectToEdit.projectLink || "",
        sourceCodeLink: projectToEdit.sourceCodeLink || "",
        email: projectToEdit.email || "",
        password: projectToEdit.password || "",
      });
    }
  }, [isEditing, projectToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveProject = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (isEditing) {
        // Update existing project
        await axios.put(
          `${API_URL}/api/projects/${projectToEdit._id}`,
          formData
        );
      } else {
        // Create new project
        await axios.post(`${API_URL}/api/projects`, formData);
      }

      navigate("/projects");
    } catch (err) {
      console.error("Error saving project:", err);
      setError(
        err.response?.data?.message ||
          "Failed to save project. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to validate handover date (must be today or in the past)
  // const validateHandoverDate = (date) => {
  //   if (!date) return true; // Empty date is valid (not set yet)

  //   const selectedDate = new Date(date);
  //   const today = new Date();

  //   // Reset time part for comparison
  //   today.setHours(0, 0, 0, 0);
  //   selectedDate.setHours(0, 0, 0, 0);

  //   // Return true if date is today or in the past
  //   return selectedDate <= today;
  // };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/projects")}
          className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
        <h2 className="text-2xl font-bold">Add New Project</h2>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <form className="space-y-6" onSubmit={saveProject}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Project Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Project Name
              </label>
              <input
                type="text"
                name="projectName"
                value={formData.projectName}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Project Type
              </label>
              <input
                type="text"
                name="projectType"
                value={formData.projectType}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Project Amount
              </label>
              <input
                type="number"
                name="projectAmount"
                value={formData.projectAmount}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Advance Amount
              </label>
              <input
                type="number"
                name="advanceAmount"
                value={formData.advanceAmount}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            {/* Client Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Client Name
              </label>
              <input
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Client Contact
              </label>
              <input
                type="text"
                name="clientContact"
                value={formData.clientContact}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            {/* Timeline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Deadline
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Handover Date
              </label>
              <input
                type="date"
                name="handoverDate"
                value={formData.handoverDate}
                onChange={handleChange}
                max={new Date().toISOString().split("T")[0]} // Restricts to today or earlier
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            {/* Commission */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Commission To
              </label>
              <input
                type="text"
                name="commissionTo"
                value={formData.commissionTo}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Commission Amount
              </label>
              <input
                type="number"
                name="commissionAmount"
                value={formData.commissionAmount}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            {/* Domain */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Domain
              </label>
              <input
                type="text"
                name="domain"
                value={formData.domain}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Domain Purchase Date
              </label>
              <input
                type="date"
                name="domainPurchaseDate"
                value={formData.domainPurchaseDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Domain Cost
              </label>
              <input
                type="number"
                name="domainCost"
                value={formData.domainCost}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Domain Expiry Date
              </label>
              <input
                type="date"
                name="domainExpiryDate"
                value={formData.domainExpiryDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Renewal Date
              </label>
              <input
                type="date"
                name="renewalDate"
                value={formData.renewalDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            {/* Links and Access */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Project Link
              </label>
              <input
                type="url"
                name="projectLink"
                value={formData.projectLink}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Source Code Link
              </label>
              <input
                type="url"
                name="sourceCodeLink"
                value={formData.sourceCodeLink}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate("/projects")}
              className="px-4 py-2 mr-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border  bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? isEditing
                  ? "Updating..."
                  : "Saving..."
                : isEditing
                ? "Update Project"
                : "Save Project"}{" "}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProject;
