import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import axios from "axios";
import { motion } from "framer-motion";

import api from '../utils/axiosConfig';
const ContractFormPage = () => {
  const { id } = useParams();
  const { API_URL } = useAppContext();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [contract, setContract] = useState({
    job_title: "",
    contract_type: "Full Time",
    start_date: "",
    end_date: "",
    working_hours: {
      timing: "10 AM – 6 PM",
      days_per_week: 5,
      location: "Office",
    },
    compensation: {
      monthly_salary: 0,
      salary_date: "5th",
    },
    termination: {
      notice_period_days: 30,
    },
    acceptance: {
      accepted: false,
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState('');
  const [savingContent, setSavingContent] = useState(false);

  // Format date to YYYY-MM-DD for input fields
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Format date to DD MMM YYYY for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const day = String(date.getDate()).padStart(2, "0");
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const handleDownload = async () => {
    try {
      const response = await api.get(
        `/api/employees/${id}/contract/download`,
        { responseType: "blob" }
      );

      // Create blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${employee.name}_contract.pdf`);
      document.body.appendChild(link);
      link.click();
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      setError("Failed to download contract");
    }
  };

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await api.get(`/api/employees/${id}`);
        const data = response.data.data;
        setEmployee(data);

        if (data.contract_agreement) {
          setContract({
            ...data.contract_agreement,
            start_date: formatDateForInput(data.contract_agreement.start_date),
            end_date: formatDateForInput(data.contract_agreement.end_date),
            effective_date: formatDateForInput(
              data.contract_agreement.effective_date
            ),
          });
        }
      } catch (error) {
        console.error("Error fetching employee:", error);
        setError("Failed to load employee data");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (
      name.startsWith("working_hours.") ||
      name.startsWith("compensation.") ||
      name.startsWith("termination.")
    ) {
      const [parent, child] = name.split(".");
      setContract((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]:
            name.endsWith("days_per_week") ||
            name.endsWith("notice_period_days")
              ? parseInt(value)
              : value,
        },
      }));
    } else {
      setContract((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.put(
        `/api/employees/${id}/contract/update`,
        contract
      );
      navigate("/contracts");
    } catch (error) {
      console.error("Error updating contract:", error);
      setError("Failed to update contract. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    const token = localStorage.getItem('token');
    const url = `${API_URL}/api/employees/${id}/contract/preview${token ? `?token=${token}` : ''}`;
    window.open(url, "_blank");
  };

  const handleEditToggle = () => {
    if (!isEditing) {
      // Load contract content for editing
      api.get(`/api/employees/${id}/contract/content`)
        .then(res => res.data)
        .then(data => {
          if (data.success) {
            setEditableContent(data.content || generateContractHTML());
          } else {
            setEditableContent(generateContractHTML());
          }
        })
        .catch(() => setEditableContent(generateContractHTML()));
    }
    setIsEditing(!isEditing);
  };

  const generateContractHTML = () => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin-bottom: 10px;">EMPLOYMENT CONTRACT</h1>
          <p style="color: #666;">SHINE INFOSOLUTIONS</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">Employee Information</h3>
          <p><strong>Name:</strong> ${employee?.name || 'N/A'}</p>
          <p><strong>Employee ID:</strong> ${employee?.employee_id || 'N/A'}</p>
          <p><strong>Designation:</strong> ${employee?.designation || 'N/A'}</p>
          <p><strong>Job Title:</strong> ${contract.job_title || 'N/A'}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">Contract Details</h3>
          <p><strong>Contract Type:</strong> ${contract.contract_type}</p>
          <p><strong>Start Date:</strong> ${contract.start_date ? formatDateForDisplay(contract.start_date) : 'N/A'}</p>
          ${contract.end_date ? `<p><strong>End Date:</strong> ${formatDateForDisplay(contract.end_date)}</p>` : ''}
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">Working Hours & Location</h3>
          <p><strong>Working Hours:</strong> ${contract.working_hours?.timing || 'N/A'}</p>
          <p><strong>Days per Week:</strong> ${contract.working_hours?.days_per_week || 'N/A'}</p>
          <p><strong>Work Location:</strong> ${contract.working_hours?.location || 'N/A'}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">Compensation</h3>
          <p><strong>Monthly Salary:</strong> ₹${contract.compensation?.monthly_salary || 0}</p>
          <p><strong>Salary Payment Date:</strong> ${contract.compensation?.salary_date || 'N/A'}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">Terms & Conditions</h3>
          <p><strong>Notice Period:</strong> ${contract.termination?.notice_period_days || 30} days</p>
          <p>This contract is governed by the laws of India and any disputes shall be resolved through appropriate legal channels.</p>
        </div>
        
        <div style="margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
          <div>
            <p><strong>Employee Signature:</strong></p>
            <div style="border-bottom: 1px solid #000; height: 40px; margin-top: 20px;"></div>
            <p style="margin-top: 5px;">Date: ___________</p>
          </div>
          <div>
            <p><strong>Company Representative:</strong></p>
            <div style="border-bottom: 1px solid #000; height: 40px; margin-top: 20px;"></div>
            <p style="margin-top: 5px;">Date: ___________</p>
          </div>
        </div>
      </div>
    `;
  };

  const saveEditedContent = async () => {
    setSavingContent(true);
    try {
      const response = await api.put(`/api/employees/${id}/contract/content`, {
        editedContent: editableContent
      });
      
      if (response.data.success) {
        alert('Contract content saved successfully!');
      } else {
        alert('Failed to save contract content');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Error saving contract content');
    }
    setSavingContent(false);
  };

  const handleAccept = async () => {
    if (
      window.confirm(
        "Mark this contract as accepted? This action cannot be undone."
      )
    ) {
      try {
        await api.patch(`/api/employees/${id}/contract/accept`);
        setContract((prev) => ({
          ...prev,
          acceptance: {
            ...prev.acceptance,
            accepted: true,
            accepted_at: new Date(),
          },
        }));
      } catch (error) {
        console.error("Error accepting contract:", error);
        setError("Failed to accept contract");
      }
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
        <div className="p-6 text-center text-gray-700 dark:text-gray-300">Loading employee data...</div>
      </div>
    );
  if (!employee)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
        <div className="p-6 text-center text-gray-700 dark:text-gray-300">Employee not found</div>
      </div>
    );

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
          onClick={() => navigate("/contracts")}
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
          Employee Contract
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="p-4 bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-xl rounded-lg border border-white/20 dark:border-gray-700/50"
          >
            <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Employee Information</h3>
            <p className="mb-1 text-gray-700 dark:text-gray-300">
              <span className="font-medium">Name:</span> {employee.name}
            </p>
            <p className="mb-1 text-gray-700 dark:text-gray-300">
              <span className="font-medium">ID:</span> {employee.employee_id}
            </p>
            <p className="mb-1 text-gray-700 dark:text-gray-300">
              <span className="font-medium">Designation:</span>{" "}
              {employee.designation}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-medium">Employment Type:</span>{" "}
              {employee.employment_type}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="p-4 bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-xl rounded-lg border border-white/20 dark:border-gray-700/50"
          >
            <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Contract Status</h3>
            {contract.acceptance?.accepted ? (
              <div className="text-green-600 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Accepted on{" "}
                {contract.acceptance.accepted_at
                  ? formatDateForDisplay(contract.acceptance.accepted_at)
                  : "Unknown date"}
              </div>
            ) : (
              <div className="text-yellow-600 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Pending acceptance
              </div>
            )}
          </motion.div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contract Type & Dates */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {[
              { label: "Job Title", name: "job_title", type: "text", value: contract.job_title },
              { label: "Contract Type", name: "contract_type", type: "select", value: contract.contract_type },
              { label: "Start Date", name: "start_date", type: "date", value: contract.start_date }
            ].map((field, index) => (
              <motion.div
                key={field.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {field.label}
                </label>
                {field.type === "select" ? (
                  <motion.select
                    whileFocus={{ scale: 1.02 }}
                    name={field.name}
                    value={field.value || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 transition-all duration-0.3"
                    required
                  >
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Intern">Intern</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Consultant">Consultant</option>
                    <option value="Contract">Contract</option>
                  </motion.select>
                ) : (
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type={field.type}
                    name={field.name}
                    value={field.value || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 transition-all duration-0.3"
                    required
                  />
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* End Date (conditional) */}
          {["Intern", "Freelance", "Contract"].includes(contract.contract_type) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Date
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="date"
                  name="end_date"
                  value={contract.end_date || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 transition-all duration-0.3"
                  required
                />
              </div>
            </motion.div>
          )}

          {/* Working Hours */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
            className="border-t border-gray-200/50 dark:border-gray-700/50 pt-4"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Working Hours & Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Working Hours", name: "working_hours.timing", value: contract.working_hours?.timing },
                { label: "Days per Week", name: "working_hours.days_per_week", type: "number", value: contract.working_hours?.days_per_week, min: 1, max: 7 },
                { label: "Work Location", name: "working_hours.location", value: contract.working_hours?.location }
              ].map((field, index) => (
                <motion.div
                  key={field.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {field.label}
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type={field.type || "text"}
                    name={field.name}
                    value={field.value || ""}
                    onChange={handleChange}
                    min={field.min}
                    max={field.max}
                    className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 transition-all duration-0.3"
                    required
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Compensation */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.9 }}
            className="border-t border-gray-200/50 dark:border-gray-700/50 pt-4"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Compensation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "Monthly Salary (₹)", name: "compensation.monthly_salary", type: "number", value: contract.compensation?.monthly_salary, min: 0 },
                { label: "Salary Payment Date", name: "compensation.salary_date", value: contract.compensation?.salary_date, placeholder: "e.g. 5th of each month" }
              ].map((field, index) => (
                <motion.div
                  key={field.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 1.0 + index * 0.1 }}
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {field.label}
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type={field.type || "text"}
                    name={field.name}
                    value={field.value || ""}
                    onChange={handleChange}
                    min={field.min}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 transition-all duration-0.3"
                    required
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Termination */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 1.1 }}
            className="border-t border-gray-200/50 dark:border-gray-700/50 pt-4"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Termination
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 1.2 }}
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notice Period (days)
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="number"
                  name="termination.notice_period_days"
                  value={contract.termination?.notice_period_days || 30}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 transition-all duration-0.3"
                  required
                />
              </motion.div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 1.3 }}
            className="flex justify-end space-x-3 pt-6 border-t border-gray-200/50 dark:border-gray-700/50"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => navigate("/contracts")}
              className="px-4 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-700/80 backdrop-blur-xl hover:bg-white/90 dark:hover:bg-gray-600/90 transition-all duration-0.3"
            >
              Cancel
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={handleEditToggle}
              className="px-4 py-2 bg-green-600/90 text-white rounded-lg hover:bg-green-700/90 backdrop-blur-xl flex items-center transition-all duration-0.3"
            >
              {isEditing ? '📝 Exit Edit' : '✏️ Edit Content'}
            </motion.button>
            
            {isEditing && (
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={saveEditedContent}
                disabled={savingContent}
                className="px-4 py-2 bg-purple-600/90 text-white rounded-lg hover:bg-purple-700/90 backdrop-blur-xl flex items-center transition-all duration-0.3"
              >
                {savingContent ? '💾 Saving...' : '💾 Save Content'}
              </motion.button>
            )}
            
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={handlePreview}
              className="px-4 py-2 bg-blue-600/90 text-white rounded-lg hover:bg-blue-700/90 backdrop-blur-xl flex items-center transition-all duration-0.3"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
              Preview
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-600/90 text-white rounded-lg hover:bg-blue-700/90 backdrop-blur-xl flex items-center transition-all duration-0.3"
            >
              Download Contract
            </motion.button>

            {!contract.acceptance?.accepted && (
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handleAccept}
                className="px-4 py-2 bg-purple-600/90 text-white rounded-lg hover:bg-purple-700/90 backdrop-blur-xl flex items-center transition-all duration-0.3"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Mark as Accepted
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-gray-800/90 text-white rounded-lg hover:bg-gray-700/90 disabled:opacity-50 backdrop-blur-xl flex items-center transition-all duration-0.3"
            >
              {saving ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Save Contract
                </>
              )}
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
      
      {/* Rich Text Editor Modal */}
      {isEditing && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Contract Content</h3>
                <button
                  onClick={handleEditToggle}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4 flex gap-2 border-b pb-2">
                <button onClick={() => document.execCommand('bold')} className="px-3 py-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">B</button>
                <button onClick={() => document.execCommand('italic')} className="px-3 py-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">I</button>
                <button onClick={() => document.execCommand('underline')} className="px-3 py-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">U</button>
                <button onClick={() => document.execCommand('justifyLeft')} className="px-3 py-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Left</button>
                <button onClick={() => document.execCommand('justifyCenter')} className="px-3 py-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Center</button>
                <button onClick={() => document.execCommand('justifyRight')} className="px-3 py-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Right</button>
              </div>
              
              <div
                contentEditable
                className="min-h-[500px] max-h-[60vh] overflow-y-auto p-4 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                dangerouslySetInnerHTML={{ __html: editableContent }}
                onInput={(e) => setEditableContent(e.target.innerHTML)}
                style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px' }}
              />
              
              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={handleEditToggle}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEditedContent}
                  disabled={savingContent}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {savingContent ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ContractFormPage;