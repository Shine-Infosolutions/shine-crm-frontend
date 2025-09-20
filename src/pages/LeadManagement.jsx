import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAppContext } from "../context/AppContext";
import axios from "axios";
import Loader from "../components/Loader";

function LeadManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  const { navigate, API_URL } = useAppContext();

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/leads`);
        const sortedLeads = (response.data || []).sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA;
        });
        setLeads(sortedLeads);
      } catch (error) {
        console.error("Error fetching leads:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchLeads();
  }, [API_URL]);
  

  const filteredLeads = leads.filter(
    (lead) =>
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.number?.includes(searchTerm)
  );

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
          Lead Management
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
              placeholder="Search leads by name, email or phone..."
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
            onClick={() => navigate("/leads/add")}
            className="bg-gray-800/80 backdrop-blur-md text-white px-4 py-2 rounded-lg hover:bg-gray-700/80 whitespace-nowrap shadow-lg border border-white/10"
          >
            Add New Lead
          </motion.button>
        </motion.div>

        {/* Loader or Lead Table */}
        {loading ? (
          <Loader message="Fetching leads..." />
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="bg-blue-gray-200/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-xl w-full border border-white/20 dark:border-gray-700/50"
          >
          {filteredLeads.length > 0 ? (
            <div className="overflow-x-auto w-full">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Follow Up
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-24">
                      Interested
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Meeting Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {filteredLeads.map((lead, index) => (
                    <motion.tr
                      key={lead._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                      whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.1)", scale: 1.01 }}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 cursor-pointer backdrop-blur-sm"
                      onClick={() => navigate(`/leads/add?id=${lead._id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">{lead.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>{lead.number}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {lead.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate">
                        {lead.address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${
                            lead.status === "New"
                              ? "bg-green-100 text-green-800"
                              : lead.status === "In Progress"
                              ? "bg-blue-100 text-blue-800"
                              : lead.status === "Contacted"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>{lead.followUpDate}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {lead.followUpStatus}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {lead.isInterested ? (
                          <span className="text-green-600">Yes</span>
                        ) : (
                          <span className="text-red-600">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {lead.meetingDate || "Not Scheduled"}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="text-center py-8"
            >
              <p className="text-gray-500 dark:text-gray-400">No leads found matching your search.</p>
            </motion.div>
          )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default LeadManagement;
