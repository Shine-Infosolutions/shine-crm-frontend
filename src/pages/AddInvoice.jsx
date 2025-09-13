// src/pages/AddInvoice.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

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
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate("/invoices")} className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
            viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold">{id ? "Update Invoice" : "Add New Invoice"}</h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
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
          ].map(([label, name, type]) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
              <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${formErrors[name] ? "border-red-500" : ""}`}
              />
            </div>
          ))}
        </div>

        <h3 className="text-md font-semibold mb-2 text-blue-600 mt-8">Product Details</h3>
        <div className="overflow-x-auto mb-4">
          <table className="w-full table-auto border text-sm text-left">
            <thead className="bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
              <tr>
                {["Description", "Unit", "Qty", "Price", "Discount %", "Amount", "Action"].map((head) => (
                  <th key={head} className="border px-3 py-2">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody className="dark:bg-gray-800">
              {rows.map((row, i) => (
                <tr key={i}>
                  <td className="border px-3 py-2">
                    <input
                      type="text"
                      value={row.description}
                      onChange={(e) => handleRowChange(i, "description", e.target.value)}
                      className={`w-full px-2 py-1 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${rowErrors[i]?.description ? "border-red-500" : ""}`}
                    />
                  </td>
                  <td className="border px-3 py-2">
                    <select
                      value={row.unit}
                      onChange={(e) => handleRowChange(i, "unit", e.target.value)}
                      className="w-full px-2 py-1 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      {["Unit", "Pieces", "Kilograms", "Liters", "Pack", "Dozen"].map((u) => (
                        <option key={u}>{u}</option>
                      ))}
                    </select>
                  </td>
                  {["quantity", "price", "discountPercentage"].map((field) => (
                    <td key={field} className="border px-3 py-2">
                      <input
                        type="number"
                        value={row[field]}
                        onChange={(e) => handleRowChange(i, field, e.target.value)}
                        className={`w-full px-2 py-1 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${rowErrors[i]?.[field] ? "border-red-500" : ""}`}
                      />
                    </td>
                  ))}
                  <td className="border px-3 py-2 text-gray-800 dark:text-white">₹{row.amount}</td>
                  <td className="border px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeRow(i)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          onClick={addRow}
          className="mt-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
        >
          + Add Item
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GST Percentage</label>
            <input
              type="number"
              value={formData.amountDetails.gstPercentage}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  amountDetails: { ...formData.amountDetails, gstPercentage: e.target.value },
                })
              }
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <p className="text-xs mt-1 text-gray-500">CGST: {cgst}%, SGST: {sgst}%</p>
          </div>
        </div>

        <div className="mt-6 text-right text-lg font-semibold dark:text-white">
          Total Amount: ₹{totalAmount}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => navigate("/invoices")}
            className="px-4 py-2 mr-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700"
          >
            {id ? "Update Invoice" : "Create Invoice"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddInvoice;
