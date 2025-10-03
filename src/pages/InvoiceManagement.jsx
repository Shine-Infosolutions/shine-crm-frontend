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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Invoice Management
        </h2>
        <button
          onClick={() => navigate("/invoices/add")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + New Invoice
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6 bg-blue-gray-200/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-lg shadow-md p-6 border border-white/20 dark:border-gray-700/50">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by invoice number or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 pl-10 border border-white/20 dark:border-gray-700/50 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 text-red-700 bg-red-100 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div className="bg-blue-gray-200/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-lg shadow-md border border-white/20 dark:border-gray-700/50">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            All Invoices
          </h3>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center">Loading...</div>
          ) : filtered.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 dark:bg-gray-700">
                  {["Invoice #", "Customer", "Date", "Due Date", "Amount", "Actions"].map((heading) => (
                    <th key={heading} className="text-left py-3 px-4">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => (
                  <tr key={inv._id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4 font-medium cursor-pointer" onClick={() => navigate(`/invoices/view/${inv._id}`)}>
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 cursor-pointer" onClick={() => navigate(`/invoices/view/${inv._id}`)}>
                      {inv.customerName}
                    </td>
                    <td className="py-3 px-4 cursor-pointer" onClick={() => navigate(`/invoices/view/${inv._id}`)}>
                      {new Date(inv.invoiceDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 cursor-pointer" onClick={() => navigate(`/invoices/view/${inv._id}`)}>
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-semibold cursor-pointer" onClick={() => navigate(`/invoices/view/${inv._id}`)}>
                      ₹ {inv.amountDetails.totalAmount}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Link
                          to={`/invoices/view/${inv._id}`}
                          className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDelete(inv._id)}
                          className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-gray-500">No invoices found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceManagement;