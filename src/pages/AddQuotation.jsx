import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from '../utils/axiosConfig';
import { motion } from "framer-motion";

const AddQuotation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [units, setUnits] = useState([]);

  const [formData, setFormData] = useState({
    quotationNumber: "",
    quotationDate: new Date().toISOString().split('T')[0],
    validUntil: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    customerGST: "",
    status: "Draft",
    notes: "",
    termsAndConditions: "",
    totalAmount: 0,
    isGSTQuotation: true,
    gstPercentage: 18,
    discountOnTotal: 0
  });

  const [items, setItems] = useState([
    {
      description: "",
      unit: "",
      quantity: 1,
      price: 0,
      discountPercentage: 0,
      amount: 0
    }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch units
        const unitsRes = await api.get('/api/units');
        if (unitsRes.data?.success) {
          setUnits(unitsRes.data.data || []);
        }

        if (id) {
          // Fetch existing quotation for editing
          const response = await api.get(`/api/quotations/${id}`);
          const quotation = response.data.data;
          
          setFormData({
            ...quotation,
            quotationDate: new Date(quotation.quotationDate).toISOString().split('T')[0],
            validUntil: new Date(quotation.validUntil).toISOString().split('T')[0]
          });
          setItems(quotation.items || []);
        } else {
          // Generate quotation number for new quotation
          try {
            const quotationRes = await api.get('/api/quotations/next-quotation-number');
            setFormData(prev => ({
              ...prev,
              quotationNumber: quotationRes.data.nextQuotationNumber
            }));
          } catch (err) {
            console.error('Failed to fetch next quotation number:', err);
            const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
            setFormData(prev => ({
              ...prev,
              quotationNumber: `QT/${currentMonth}/01`
            }));
          }

          // Set default valid until date (30 days from today)
          const validUntilDate = new Date();
          validUntilDate.setDate(validUntilDate.getDate() + 30);
          setFormData(prev => ({
            ...prev,
            validUntil: validUntilDate.toISOString().split('T')[0]
          }));
        }
      } catch (error) {
        setError("Failed to fetch data");
      }
    };

    fetchData();
  }, [id]);

  // Calculate totals whenever items or form data changes
  useEffect(() => {
    const baseAmount = items.reduce((acc, item) => acc + parseFloat(item.amount || 0), 0);
    const discountAmount = baseAmount * (parseFloat(formData.discountOnTotal || 0) / 100);
    const discountedAmount = baseAmount - discountAmount;
    const gstAmount = formData.isGSTQuotation ? discountedAmount * (parseFloat(formData.gstPercentage || 0) / 100) : 0;
    const total = discountedAmount + gstAmount;

    setFormData(prev => ({
      ...prev,
      totalAmount: Math.round(total * 100) / 100
    }));
  }, [items, formData.discountOnTotal, formData.gstPercentage, formData.isGSTQuotation]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;

    // Calculate amount for this item
    const qty = parseFloat(updatedItems[index].quantity) || 0;
    const price = parseFloat(updatedItems[index].price) || 0;
    const discount = parseFloat(updatedItems[index].discountPercentage) || 0;
    const amount = price * qty * (1 - discount / 100);
    updatedItems[index].amount = Math.round(amount * 100) / 100;

    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        description: "",
        unit: "",
        quantity: 1,
        price: 0,
        discountPercentage: 0,
        amount: 0
      }
    ]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      const updatedItems = items.filter((_, i) => i !== index);
      setItems(updatedItems);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...formData,
        items: items
      };

      if (id) {
        await api.put(`/api/quotations/${id}`, payload);
      } else {
        await api.post('/api/quotations', payload);
      }

      navigate('/quotations');
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save quotation");
    } finally {
      setLoading(false);
    }
  };

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
          onClick={() => navigate("/quotations")}
          className="mr-4 p-2 rounded-full bg-blue-gray-200/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 hover:bg-white/90 dark:hover:bg-gray-700/90 shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </motion.button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {id ? "Edit Quotation" : "Create New Quotation"}
        </h2>
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

      <motion.form
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        onSubmit={handleSubmit}
        className="bg-blue-gray-200/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6"
      >
        {/* GST Quotation Toggle */}
        <div className="mb-6 p-4 bg-white/50 dark:bg-gray-700/50 rounded-lg border border-white/20 dark:border-gray-700/50">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              name="isGSTQuotation"
              checked={formData.isGSTQuotation}
              onChange={handleChange}
              className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              GST Quotation {formData.isGSTQuotation ? '(Tax Quotation)' : '(Non-GST Quotation)'}
            </span>
          </label>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Quotation Number *
            </label>
            <input
              type="text"
              name="quotationNumber"
              value={formData.quotationNumber}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Quotation Date *
            </label>
            <input
              type="date"
              name="quotationDate"
              value={formData.quotationDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Valid Until *
            </label>
            <input
              type="date"
              name="validUntil"
              value={formData.validUntil}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>

        {/* Customer Information */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Customer Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
                placeholder="Client or company name"
                className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Customer Phone *
              </label>
              <input
                type="tel"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleChange}
                required
                placeholder="10-digit contact number"
                className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Customer Email
              </label>
              <input
                type="email"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleChange}
                placeholder="client@example.com"
                className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            {formData.isGSTQuotation && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Customer GSTIN
                </label>
                <input
                  type="text"
                  name="customerGST"
                  value={formData.customerGST}
                  onChange={handleChange}
                  placeholder="15-digit GST number"
                  className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Customer Address *
              </label>
              <textarea
                name="customerAddress"
                value={formData.customerAddress}
                onChange={handleChange}
                required
                rows={3}
                placeholder="Complete billing address"
                className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>
        </div>

        {/* Service/Product Details */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Service/Product Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse text-sm">
              <thead className="bg-gray-100/80 dark:bg-gray-700/80">
                <tr>
                  <th className="border border-white/20 dark:border-gray-700/50 px-3 py-2 text-left">Description</th>
                  <th className="border border-white/20 dark:border-gray-700/50 px-3 py-2 text-left">Unit</th>
                  <th className="border border-white/20 dark:border-gray-700/50 px-3 py-2 text-left">Qty</th>
                  <th className="border border-white/20 dark:border-gray-700/50 px-3 py-2 text-left">Price</th>
                  <th className="border border-white/20 dark:border-gray-700/50 px-3 py-2 text-left">Discount %</th>
                  <th className="border border-white/20 dark:border-gray-700/50 px-3 py-2 text-left">Amount</th>
                  <th className="border border-white/20 dark:border-gray-700/50 px-3 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-white/20 dark:border-gray-700/50 px-3 py-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        placeholder="Service/product description"
                        className="w-full px-2 py-1 border border-white/20 dark:border-gray-700/50 rounded bg-white dark:bg-gray-700 dark:text-white"
                      />
                    </td>
                    <td className="border border-white/20 dark:border-gray-700/50 px-3 py-2">
                      <input
                        type="text"
                        list={`units-list-${index}`}
                        value={item.unit}
                        onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                        placeholder="Unit"
                        className="w-full px-2 py-1 border border-white/20 dark:border-gray-700/50 rounded bg-white dark:bg-gray-700 dark:text-white"
                      />
                      <datalist id={`units-list-${index}`}>
                        {units.map((unit) => (
                          <option key={unit._id} value={unit.name} />
                        ))}
                      </datalist>
                    </td>
                    <td className="border border-white/20 dark:border-gray-700/50 px-3 py-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        min="1"
                        className="w-full px-2 py-1 border border-white/20 dark:border-gray-700/50 rounded bg-white dark:bg-gray-700 dark:text-white"
                      />
                    </td>
                    <td className="border border-white/20 dark:border-gray-700/50 px-3 py-2">
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                        min="0"
                        step="0.01"
                        className="w-full px-2 py-1 border border-white/20 dark:border-gray-700/50 rounded bg-white dark:bg-gray-700 dark:text-white"
                      />
                    </td>
                    <td className="border border-white/20 dark:border-gray-700/50 px-3 py-2">
                      <input
                        type="number"
                        value={item.discountPercentage}
                        onChange={(e) => handleItemChange(index, 'discountPercentage', e.target.value)}
                        min="0"
                        max="100"
                        className="w-full px-2 py-1 border border-white/20 dark:border-gray-700/50 rounded bg-white dark:bg-gray-700 dark:text-white"
                      />
                    </td>
                    <td className="border border-white/20 dark:border-gray-700/50 px-3 py-2 text-gray-800 dark:text-white">
                      ₹{item.amount.toFixed(2)}
                    </td>
                    <td className="border border-white/20 dark:border-gray-700/50 px-3 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
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
            onClick={addItem}
            className="mt-3 bg-gray-200/80 hover:bg-gray-300/80 text-gray-800 font-medium py-2 px-4 rounded-lg dark:bg-gray-700/80 dark:hover:bg-gray-600/80 dark:text-white"
          >
            + Add Item
          </button>
        </div>

        {/* Pricing Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Discount on Total (%)
            </label>
            <input
              type="number"
              name="discountOnTotal"
              value={formData.discountOnTotal}
              onChange={handleChange}
              min="0"
              max="100"
              className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {formData.isGSTQuotation && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                GST Percentage
              </label>
              <input
                type="number"
                name="gstPercentage"
                value={formData.gstPercentage}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          )}
        </div>

        {/* Notes and Terms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Additional notes or special instructions"
              className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Terms & Conditions
            </label>
            <textarea
              name="termsAndConditions"
              value={formData.termsAndConditions}
              onChange={handleChange}
              rows={4}
              placeholder="Payment terms, delivery conditions, etc."
              className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        {/* Total Amount Display */}
        <div className="text-right text-lg font-semibold dark:text-white mb-6">
          Total Amount: ₹{formData.totalAmount.toLocaleString()}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => navigate("/quotations")}
            className="px-4 py-2 rounded-lg bg-white/80 dark:bg-gray-700/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 hover:bg-white/90 dark:hover:bg-gray-600/90"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="px-4 py-2 border bg-gray-800/90 text-white rounded-lg hover:bg-gray-700/90 disabled:opacity-50 backdrop-blur-xl"
          >
            {loading ? (id ? "Updating..." : "Creating...") : (id ? "Update Quotation" : "Create Quotation")}
          </motion.button>
        </div>
      </motion.form>
    </div>
  );
};

export default AddQuotation;