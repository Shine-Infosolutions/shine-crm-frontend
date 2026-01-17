import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "../context/AppContext";
import { useLocation } from "react-router-dom";

import api from '../utils/axiosConfig';
const AddLead = () => {
  const { API_URL, navigate } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();
  const [isEditMode, setIsEditMode] = useState(false);
  const [leadId, setLeadId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    number: "",
    email: "",
    address: "",
    status: "New",
    followUpDate: "",
    followUpStatus: "Not Started",
    isInterested: false,
    meetingDate: "",
    clientRequestedCallDate: "",
    notes: "",
    reference: "",
  });

  // Check if we're in edit mode by looking for an ID in the URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get("id");

    if (id) {
      setIsEditMode(true);
      setLeadId(id);
      fetchLeadData(id);
    }
  }, [location]);

  // Fetch lead data if in edit mode
  const fetchLeadData = async (id) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/leads/${id}`);
      const data = response.data;

      if (response.status !== 200) {
        throw new Error(response.data?.message || "Failed to fetch lead data");
      }

      // Format dates for form inputs
      const formattedData = {
        ...data,
        followUpDate: data.followUpDate
          ? new Date(data.followUpDate).toISOString().split("T")[0]
          : "",
        meetingDate: data.meetingDate
          ? new Date(data.meetingDate).toISOString().split("T")[0]
          : "",
        clientRequestedCallDate: data.clientRequestedCallDate
          ? new Date(data.clientRequestedCallDate).toISOString().split("T")[0]
          : "",
      };

      setFormData(formattedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = isEditMode
        ? `${API_URL}/api/leads/${leadId}`
        : `${API_URL}/api/leads`;

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = response.data;

      if (!response.ok) {
        throw new Error(
          data.message || `Failed to ${isEditMode ? "update" : "add"} lead`
        );
      }

      navigate("/leads");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="flex items-center mb-6"
        >
          <motion.button
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/leads")}
            className="mr-4 p-2 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50 backdrop-blur-sm"
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{isEditMode ? "Edit Lead" : "Add New Lead"}</h2>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-red-100/80 backdrop-blur-sm text-red-700 rounded-lg border border-red-200/50"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.form
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-blue-gray-200/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20 dark:border-gray-700/50"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-white/20 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                name="number"
                value={formData.number}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-white/20 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.25 }}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-white/20 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-white/20 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="In Progress">In Progress</option>
                <option value="Qualified">Qualified</option>
              </select>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.35 }}
              className="md:col-span-2"
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-white/20 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Follow Up Date
              </label>
              <input
                type="date"
                name="followUpDate"
                value={formData.followUpDate}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-white/20 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.45 }}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Follow Up Status
              </label>
              <select
                name="followUpStatus"
                value={formData.followUpStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-white/20 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
              >
                <option value="Not Started">Not Started</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Meeting Date
              </label>
              <input
                type="date"
                name="meetingDate"
                value={formData.meetingDate}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-white/20 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.55 }}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Interest Level
              </label>
              <select
                name="isInterested"
                value={formData.isInterested}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-white/20 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
              >
                <option value={true}>Interested</option>
                <option value={false}>Not Interested</option>
              </select>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Client Requested Call Date
              </label>
              <input
                type="date"
                name="clientRequestedCallDate"
                value={formData.clientRequestedCallDate}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-white/20 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.62 }}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reference
              </label>
              <input
                type="text"
                name="reference"
                value={formData.reference}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-white/20 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
                placeholder="How did they hear about us?"
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.67 }}
              className="md:col-span-2"
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-white/20 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md resize-vertical"
                placeholder="Add any additional notes about this lead..."
              />
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.72 }}
            className="mt-6 flex justify-end space-x-3"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => navigate("/leads")}
              className="px-4 py-2 bg-gray-500/80 backdrop-blur-sm rounded-lg shadow-lg text-sm font-medium text-white hover:bg-gray-600/80 border border-white/10"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-gray-800/80 backdrop-blur-sm text-white rounded-lg hover:bg-gray-700/80 disabled:opacity-50 shadow-lg border border-white/10"
            >
              {loading ? "Saving..." : isEditMode ? "Update Lead" : "Save Lead"}
            </motion.button>
          </motion.div>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default AddLead;
