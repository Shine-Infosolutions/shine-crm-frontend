import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAppContext } from "../context/AppContext";
import { motion } from "framer-motion";

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

  const formFields = [
    { label: "Project Name", name: "projectName", type: "text", required: true },
    { label: "Project Type", name: "projectType", type: "text" },
    { label: "Project Amount", name: "projectAmount", type: "number" },
    { label: "Advance Amount", name: "advanceAmount", type: "number" },
    { label: "Client Name", name: "clientName", type: "text", required: true },
    { label: "Client Contact", name: "clientContact", type: "text", maxLength: 10 },
    { label: "Start Date", name: "startDate", type: "date", required: true },
    { label: "Deadline", name: "deadline", type: "date" },
    { label: "Handover Date", name: "handoverDate", type: "date" },
    { label: "Commission To", name: "commissionTo", type: "text" },
    { label: "Commission Amount", name: "commissionAmount", type: "number" },
    { label: "Domain", name: "domain", type: "text" },
    { label: "Domain Purchase Date", name: "domainPurchaseDate", type: "date" },
    { label: "Domain Cost", name: "domainCost", type: "number" },
    { label: "Domain Expiry Date", name: "domainExpiryDate", type: "date" },
    { label: "Renewal Date", name: "renewalDate", type: "date" },
    { label: "Project Link", name: "projectLink", type: "url" },
    { label: "Source Code Link", name: "sourceCodeLink", type: "url" },
    { label: "Email", name: "email", type: "email" },
    { label: "Password", name: "password", type: "password" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center mb-6"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate("/projects")}
          className="mr-4 p-2 rounded-full bg-blue-gray-200/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 hover:bg-white/90 dark:hover:bg-gray-700/90 shadow-lg"
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
        </motion.button>
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="text-2xl font-bold text-gray-900 dark:text-white"
        >
          {isEditing ? "Edit Project" : "Add New Project"}
        </motion.h2>
      </motion.div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-red-100/80 text-red-700 rounded-lg backdrop-blur-xl border border-red-200/50"
        >
          {error}
        </motion.div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-blue-gray-200/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6"
      >
        <form className="space-y-6" onSubmit={saveProject}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {formFields.map((field, index) => (
              <motion.div
                key={field.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {field.label}
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={field.name === "clientContact" ? (e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData(prev => ({ ...prev, clientContact: value }));
                  } : handleChange}
                  pattern={field.name === "clientContact" ? "[0-9]{10}" : undefined}
                  maxLength={field.maxLength}
                  max={field.name === "handoverDate" ? formData.deadline || undefined : undefined}
                  placeholder={field.name === "clientContact" ? "Enter 10-digit phone number" : undefined}
                  className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 transition-all duration-0.3"
                  required={field.required}
                />
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 1.5 }}
            className="flex justify-end gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => navigate("/projects")}
              className="px-4 py-2 rounded-lg bg-white/80 dark:bg-gray-700/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 hover:bg-white/90 dark:hover:bg-gray-600/90 transition-all duration-0.3"
              disabled={isSubmitting}
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="px-4 py-2 border bg-gray-800/90 text-white rounded-lg hover:bg-gray-700/90 disabled:opacity-50 backdrop-blur-xl transition-all duration-0.3"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? isEditing
                  ? "Updating..."
                  : "Saving..."
                : isEditing
                ? "Update Project"
                : "Save Project"}
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}

export default AddProject;