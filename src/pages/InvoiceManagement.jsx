// src/pages/InvoiceManagement.jsx
import React, { useState, useEffect } from "react";
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
    <div className="p-6 overflow-x-hidden">
      {/* Search + Add */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full md:w-1/2">
          <input
            type="text"
            placeholder="Search by invoice number or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <button
          onClick={() => navigate("/invoices/add")}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
        >
          + New Invoice
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
        <table className="min-w-[900px] w-full table-auto">
          <thead className="bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
            <tr>
              {["Invoice #", "Customer", "Date","Due Date", "Amount", "Actions"].map((heading) => (
                <th key={heading} className="px-6 py-3 text-left">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-200 dark:divide-gray-600">
            {filtered.map((inv) => (
              <tr
                key={inv._id}
                className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
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
                  <Link
                    to={`/invoices/view/${inv._id}`}
                    className="text-green-600 underline"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDelete(inv._id)}
                    className="text-red-600 underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center p-6 text-gray-500">
                  No invoices found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceManagement;
