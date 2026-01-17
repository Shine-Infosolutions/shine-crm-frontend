import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAppContext } from "../context/AppContext";
import Pagination from "../components/Pagination";
import api from '../utils/axiosConfig';
import Loader from "../components/Loader";

function LeadManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0, limit: 10 });
  const { navigate, API_URL, currentUser } = useAppContext();

  const deleteLead = async (leadId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await api.delete(`/api/leads/${leadId}`);
        setLeads(leads.filter(lead => lead._id !== leadId));
      } catch (error) {
        alert('Failed to delete lead');
      }
    }
  };

  const exportCSV = async () => {
    try {
      const employeeId = currentUser?._id || currentUser?.id;
      
      if (!employeeId) {
        alert('User ID not found. Please login again.');
        return;
      }
      
      // For admin users, export all leads. For regular users, filter by employeeId
      const url = currentUser?.isAdmin 
        ? '/api/leads/export/csv'
        : `/api/leads/export/csv?employeeId=${employeeId}`;
      
      const response = await api.get(url, {
        responseType: 'blob'
      });
      
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', 'leads.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Failed to export CSV');
    }
  };

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await api.get(`/api/leads?page=${currentPage}&limit=10`);
        if (response.data.success) {
          setLeads(response.data.data || []);
          setPagination(response.data.pagination || { total: 0, pages: 0, limit: 10 });
        } else {
          setLeads([]);
        }
      } catch (error) {
        setLeads([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeads();
  }, [currentPage]);
  

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

          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportCSV}
              className="bg-green-600/80 backdrop-blur-md text-white px-4 py-2 rounded-lg hover:bg-green-500/80 whitespace-nowrap shadow-lg border border-white/10"
            >
              Export CSV
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/leads/add")}
              className="bg-gray-800/80 backdrop-blur-md text-white px-4 py-2 rounded-lg hover:bg-gray-700/80 whitespace-nowrap shadow-lg border border-white/10"
            >
              Add New Lead
            </motion.button>
          </div>
        </motion.div>

        {/* Loader or Lead Cards */}
        {loading ? (
          <Loader message="Fetching leads..." />
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
          {filteredLeads.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredLeads.map((lead, index) => (
                <motion.div
                  key={lead._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/leads/add?id=${lead._id}`)}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg hover:shadow-xl border border-white/20 dark:border-gray-700/50 cursor-pointer transition-all duration-300 p-6"
                >
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {lead.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full shrink-0
                          ${
                            lead.status === "New"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : lead.status === "In Progress"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                              : lead.status === "Contacted"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                          }`}
                        >
                          {lead.status}
                        </span>
                        <button
                          onClick={(e) => deleteLead(lead._id, e)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Delete lead"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <svg className="w-4 h-4 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        <span className="truncate">{lead.number}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <svg className="w-4 h-4 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        <span className="truncate">{lead.email}</span>
                      </div>
                    </div>

                    {/* Interest Status */}
                    <div className="mb-4">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full
                        ${lead.isInterested 
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full mr-1 ${lead.isInterested ? "bg-green-500" : "bg-red-500"}`}></div>
                        {lead.isInterested ? 'Interested' : 'Not Interested'}
                      </span>
                    </div>

                    {/* Reference */}
                    {lead.reference && (
                      <div className="mb-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          <span className="font-medium">Reference: </span>
                          <span className="text-gray-700 dark:text-gray-300">{lead.reference}</span>
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {lead.notes && (
                      <div className="mb-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          <span className="font-medium">Notes: </span>
                          <span className="text-gray-700 dark:text-gray-300">{lead.notes.length > 50 ? `${lead.notes.substring(0, 50)}...` : lead.notes}</span>
                        </div>
                      </div>
                    )}

                    {/* Follow Up Info */}
                    <div className="mt-auto space-y-2 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex justify-between items-center">
                          <span>Follow Up:</span>
                          <span className="font-medium">
                            {lead.followUpDate ? new Date(lead.followUpDate).toLocaleDateString() : 'Not set'}
                          </span>
                        </div>
                        {lead.followUpStatus && (
                          <div className="flex justify-between items-center mt-1">
                            <span>Status:</span>
                            <span className="font-medium">{lead.followUpStatus}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center mt-1">
                          <span>Meeting:</span>
                          <span className="font-medium">
                            {lead.meetingDate ? new Date(lead.meetingDate).toLocaleDateString() : "Not Scheduled"}
                          </span>
                        </div>
                        {lead.clientRequestedCallDate && (
                          <div className="flex justify-between items-center mt-1">
                            <span>Client Call:</span>
                            <span className="font-medium">
                              {new Date(lead.clientRequestedCallDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="text-center py-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/50"
            >
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400 text-lg">No leads found matching your search.</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Try adjusting your search criteria or add a new lead.</p>
            </motion.div>
          )}
          </motion.div>
        )}
        
        {/* Pagination */}
        {!loading && pagination.pages > 1 && (
          <div className="mt-6">
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

export default LeadManagement;
