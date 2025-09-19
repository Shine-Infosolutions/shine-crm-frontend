// src/pages/AddInvoice.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { motion } from "framer-motion";

const AddInvoice = () => {
  const { id } = useParams();
  const { API_URL } = useAppContext();
  const navigate = useNavigate();

  const [formErrors, setFormErrors] = useState({});
  const [rowErrors, setRowErrors] = useState([]);

  const [formData, setFormData] = useState({
    customerGST: "",
    invoiceDate: "",
    dueDate: "",
    customerName: "",
    invoiceNumber: "",
    customerAddress: "",
    customerPhone: "",
    customerEmail: "",
    dispatchThrough: "",
    customerAadhar: "",
    productDetails: [],
    amountDetails: {
      gstPercentage: 18,
      discountOnTotal: 0,
      totalAmount: 0,
    },
  });

  const [rows, setRows] = useState([
    {
      description: "",
      unit: "Unit",
      quantity: "",
      price: "",
      discountPercentage: "",
      amount: "",
    },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (id) {
          const res = await axios.get(`${API_URL}/api/invoices/mono/${id}`);
          const data = res.data.data;
          if (!data) throw new Error("Invoice not found");

          const formatDate = (isoDate) =>
            isoDate ? new Date(isoDate).toISOString().split("T")[0] : "";

          setFormData((prev) => ({
            ...prev,
            ...data,
            invoiceDate: formatDate(data.invoiceDate),
            dueDate: formatDate(data.dueDate),
          }));
          setRows(data.productDetails || []);
        } else {
          const res = await axios.get(`${API_URL}/api/invoices/next-invoice-number`);
          setFormData((prev) => ({
            ...prev,
            invoiceNumber: res.data.nextInvoiceNumber,
          }));
        }
      } catch (err) {
        console.error("Invoice fetch error:", err);
        alert("Failed to fetch invoice.");
      }
    };

    fetchData();
  }, [id, API_URL]);

  useEffect(() => {
    const baseAmount = rows.reduce(
      (acc, item) => acc + parseFloat(item.amount || 0),
      0
    );
    const gstPct = parseFloat(formData.amountDetails.gstPercentage || 0);
    const discPct = parseFloat(formData.amountDetails.discountOnTotal || 0);
    const discountedBase = parseFloat(
      (baseAmount * (1 - discPct / 100)).toFixed(2)
    );
    const gstAmount = parseFloat(
      (discountedBase * (gstPct / 100)).toFixed(2)
    );
    const total = parseFloat((discountedBase + gstAmount).toFixed(2));

    setFormData((prev) => ({
      ...prev,
      amountDetails: {
        ...prev.amountDetails,
        totalAmount: total,
      },
    }));
  }, [
    rows,
    formData.amountDetails.gstPercentage,
    formData.amountDetails.discountOnTotal,
  ]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRowChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;

    const qty = parseFloat(updated[index].quantity) || 0;
    const price = parseFloat(updated[index].price) || 0;
    const discount = parseFloat(updated[index].discountPercentage) || 0;
    const amount = price * qty * (1 - discount / 100);
    updated[index].amount = amount.toFixed(2);
    setRows(updated);
  };

  const addRow = () => {
    setRows([
      ...rows,
      {
        description: "",
        unit: "Unit",
        quantity: "",
        price: "",
        discountPercentage: "",
        amount: "",
      },
    ]);
  };

  const removeRow = (index) => {
    const updated = [...rows];
    updated.splice(index, 1);
    setRows(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const errors = {};
    const rowErrs = [];
  
    const requiredFields = [
      "customerName", "invoiceDate", "dueDate", "invoiceNumber",
      "customerAddress", "customerPhone", "customerEmail", "customerGST"
    ];
    requiredFields.forEach((field) => {
      if (!formData[field]?.trim()) errors[field] = true;
    });
  
    let hasRowError = false;
  
    rows.forEach((row, i) => {
      const rowError = {};
      if (!row.description?.trim()) rowError.description = true;
      if (!row.quantity || parseFloat(row.quantity) <= 0) rowError.quantity = true;
      if (!row.price || parseFloat(row.price) <= 0) rowError.price = true;
  
      if (Object.keys(rowError).length > 0) hasRowError = true;
      rowErrs.push(rowError);
    });
  
    setFormErrors(errors);
    setRowErrors(rowErrs);
  
    if (Object.keys(errors).length > 0 || hasRowError) return;
  
    const payload = {
      ...formData,
      productDetails: rows,
      amountDetails: {
        ...formData.amountDetails,
        totalAmount: parseFloat(formData.amountDetails.totalAmount).toFixed(2),
      },
    };
  
    try {
      if (id) {
        await axios.put(`${API_URL}/api/invoices/update/${id}`, payload);
      } else {
        await axios.post(`${API_URL}/api/invoices/create`, payload);
      }
      navigate("/invoices");
    } catch (err) {
      console.error("Submit failed:", err);
      alert("Failed to save invoice.");
    }
  };
  

  const gstRate = parseFloat(formData.amountDetails.gstPercentage || 0);
  const cgst = (gstRate / 2).toFixed(2);
  const sgst = (gstRate / 2).toFixed(2);
  const totalAmount = formData.amountDetails.totalAmount || 0;

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
          onClick={() => navigate("/invoices")} 
          className="mr-4 p-2 rounded-full bg-blue-gray-200/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 hover:bg-white/90 dark:hover:bg-gray-700/90 shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
            viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </motion.button>
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="text-2xl font-bold text-gray-900 dark:text-white"
        >
          {id ? "Update Invoice" : "Add New Invoice"}
        </motion.h2>
      </motion.div>

      <motion.form 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        onSubmit={handleSubmit} 
        className="bg-blue-gray-200/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            ["Invoice Date", "invoiceDate", "date"],
            ["Due Date", "dueDate", "date"],
            ["Customer Name", "customerName", "text"],
            ["Invoice Number", "invoiceNumber", "text"],
            ["Customer Address", "customerAddress", "text"],
            ["Customer Phone", "customerPhone", "tel"],
            ["Customer Email", "customerEmail", "email"],
            ["Dispatch Through", "dispatchThrough", "text"],
            ["Customer GSTIN", "customerGST", "text"],
            ["Customer Aadhar", "customerAadhar", "text"],
          ].map(([label, name, type], index) => (
            <motion.div 
              key={name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 transition-all duration-0.3 ${
                  formErrors[name] ? "border-red-500" : "border-white/20 dark:border-gray-700/50"
                }`}
              />
            </motion.div>
          ))}
        </div>

        <motion.h3 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.8 }}
          className="text-md font-semibold mb-2 text-blue-600 mt-8"
        >
          Product Details
        </motion.h3>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.9 }}
          className="overflow-x-auto mb-4"
        >
          <table className="w-full table-auto border text-sm text-left bg-blue-gray-200/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-lg">
            <thead className="bg-gray-100/80 dark:bg-gray-700/80 dark:text-gray-300 backdrop-blur-xl">
              <tr>
                {["Description", "Unit", "Qty", "Price", "Discount %", "Amount", "Action"].map((head) => (
                  <th key={head} className="border border-white/20 dark:border-gray-700/50 px-3 py-2">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody className="dark:bg-gray-800/80">
              {rows.map((row, i) => (
                <motion.tr 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 1.0 + i * 0.1 }}
                >
                  <td className="border border-white/20 dark:border-gray-700/50 px-3 py-2">
                    <motion.input
                      whileFocus={{ scale: 1.02 }}
                      type="text"
                      value={row.description}
                      onChange={(e) => handleRowChange(i, "description", e.target.value)}
                      className={`w-full px-2 py-1 border rounded-md bg-white dark:bg-gray-700 dark:text-white transition-all duration-0.3 ${
                        rowErrors[i]?.description ? "border-red-500" : "border-white/20 dark:border-gray-700/50"
                      }`}
                    />
                  </td>
                  <td className="border border-white/20 dark:border-gray-700/50 px-3 py-2">
                    <motion.select
                      whileFocus={{ scale: 1.02 }}
                      value={row.unit}
                      onChange={(e) => handleRowChange(i, "unit", e.target.value)}
                      className="w-full px-2 py-1 border border-white/20 dark:border-gray-700/50 rounded-md bg-white dark:bg-gray-700 dark:text-white transition-all duration-0.3"
                    >
                      {["Unit", "Pieces", "Kilograms", "Liters", "Pack", "Dozen"].map((u) => (
                        <option key={u}>{u}</option>
                      ))}
                    </motion.select>
                  </td>
                  {["quantity", "price", "discountPercentage"].map((field) => (
                    <td key={field} className="border border-white/20 dark:border-gray-700/50 px-3 py-2">
                      <motion.input
                        whileFocus={{ scale: 1.02 }}
                        type="number"
                        value={row[field]}
                        onChange={(e) => handleRowChange(i, field, e.target.value)}
                        className={`w-full px-2 py-1 border rounded-md bg-white dark:bg-gray-700 dark:text-white transition-all duration-0.3 ${
                          rowErrors[i]?.[field] ? "border-red-500" : "border-white/20 dark:border-gray-700/50"
                        }`}
                      />
                    </td>
                  ))}
                  <td className="border border-white/20 dark:border-gray-700/50 px-3 py-2 text-gray-800 dark:text-white">₹{row.amount}</td>
                  <td className="border border-white/20 dark:border-gray-700/50 px-3 py-2 text-center">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => removeRow(i)}
                      className="text-red-600 hover:text-red-800 font-medium transition-colors duration-0.3"
                    >
                      Remove
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={addRow}
          className="mt-3 bg-gray-200/80 hover:bg-gray-300/80 text-gray-800 font-medium py-2 px-4 rounded-lg backdrop-blur-xl dark:bg-gray-700/80 dark:hover:bg-gray-600/80 dark:text-white transition-all duration-0.3"
        >
          + Add Item
        </motion.button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 1.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GST Percentage</label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="number"
              value={formData.amountDetails.gstPercentage}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  amountDetails: { ...formData.amountDetails, gstPercentage: e.target.value },
                })
              }
              className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 transition-all duration-0.3"
            />
            <p className="text-xs mt-1 text-gray-500">CGST: {cgst}%, SGST: {sgst}%</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 1.3 }}
          className="mt-6 text-right text-lg font-semibold dark:text-white"
        >
          Total Amount: ₹{totalAmount}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 1.4 }}
          className="mt-6 flex justify-end gap-3"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => navigate("/invoices")}
            className="px-4 py-2 rounded-lg bg-white/80 dark:bg-gray-700/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 hover:bg-white/90 dark:hover:bg-gray-600/90 transition-all duration-0.3"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-800/90 hover:bg-gray-700/90 backdrop-blur-xl transition-all duration-0.3"
          >
            {id ? "Update Invoice" : "Create Invoice"}
          </motion.button>
        </motion.div>
      </motion.form>
    </div>
  );
};

export default AddInvoice;