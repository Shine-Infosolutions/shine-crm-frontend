// src/pages/InvoiceManagement.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import axios from "axios";
import Loader from "../components/Loader"; 

const InvoiceManagement = () => {
  const { API_URL } = useAppContext();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 

  const fetchInvoices = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/invoices/all`);
      if (res.data?.success) {
        const sorted = (res.data.data || []).sort((a, b) => {
          const aDate = new Date(a.created_at || parseInt(a._id.substring(0, 8), 16) * 1000);
          const bDate = new Date(b.created_at || parseInt(b._id.substring(0, 8), 16) * 1000);
          return bDate - aDate;
        });
        setInvoices(sorted);
      } else {
        throw new Error(res.data?.message || "Failed to load invoices");
      }
    } catch (err) {
      console.error("Error fetching invoices:", err);
      setError(err.message || "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await axios.delete(`${API_URL}/api/invoices/delete/${id}`);
        fetchInvoices();
      } catch (err) {
        alert("Failed to delete invoice");
      }
    }
  };

  const filtered = invoices.filter(
    (inv) =>
      inv.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loader message="Loading invoices..." />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-6 overflow-x-hidden"
      >
        {/* Search + Add */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6"
        >
          <div className="relative w-full md:w-1/2">
            <input
              type="text"
              placeholder="Search by invoice number or customer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-blue-gray-200/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/invoices/add")}
            className="bg-gray-800/80 backdrop-blur-md text-white px-4 py-2 rounded-lg hover:bg-gray-700/80 shadow-lg border border-white/10"
          >
            + New Invoice
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-4 text-red-700 bg-red-100/80 backdrop-blur-sm rounded-lg border border-red-200/50"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="overflow-x-auto bg-blue-gray-200/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-xl border border-white/20 dark:border-gray-700/50"
        >
          <table className="min-w-[900px] w-full table-auto">
            <thead className="bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
              <tr>
                {["Invoice #", "Customer", "Date","Due Date", "Amount", "Actions"].map((heading) => (
                  <th key={heading} className="px-6 py-3 text-left">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-200/50 dark:divide-gray-600/50">
              {filtered.map((inv, index) => (
                <motion.tr
                  key={inv._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.15 + index * 0.03 }}
                  whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.1)", scale: 1.01 }}
                  className="hover:bg-gray-100/50 dark:hover:bg-gray-700/50 cursor-pointer backdrop-blur-sm"
                  onClick={() => navigate(`/invoices/edit/${inv._id}`)}
                >
                  <td className="px-6 py-4">{inv.invoiceNumber}</td>
                  <td className="px-6 py-4">{inv.customerName}</td>
                  <td className="px-6 py-4">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{new Date(inv.dueDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-semibold">₹ {inv.amountDetails.totalAmount}</td>
                  <td
                    className="px-6 py-4 flex gap-3 text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to={`/invoices/view/${inv._id}`}
                        className="text-green-600 underline hover:text-green-800"
                      >
                        View
                      </Link>
                    </motion.div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(inv._id)}
                      className="text-red-600 underline hover:text-red-800"
                    >
                      Delete
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center p-6 text-gray-500 dark:text-gray-400">
                    No invoices found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default InvoiceManagement;