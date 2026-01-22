// src/pages/CreateInvoice.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { toWords } from "number-to-words";
import { useReactToPrint } from "react-to-print";
import { useAppContext } from "../context/AppContext";
import Loader from "../components/Loader";
import { motion } from "framer-motion";


import api from '../utils/axiosConfig';
const CreateInvoice = () => {
  const { id } = useParams();
  const { API_URL } = useAppContext();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNotesEditor, setShowNotesEditor] = useState(false);
  const [showNotesInInvoice, setShowNotesInInvoice] = useState(false);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const componentRef = useRef(null);


  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await api.get(`/api/invoices/mono/${id}`);
        const data = response.data;
        if (data.success) {
          setInvoice(data.data);
          setNotes(data.data.notes || '');

        } else {
          setError("Invoice not found");
        }
      } catch {
        setError("Error fetching invoice");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id, API_URL]);





  const capitalizeWords = (str) =>
    str
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const isGSTInvoice = invoice?.isGSTInvoice !== false; // Default to true for backward compatibility
  const gstRate = isGSTInvoice ? Number(invoice?.amountDetails?.gstPercentage || 0) : 0;
  const totalAmount = Math.round(Number(invoice?.amountDetails?.totalAmount || 0));
  const baseAmount = isGSTInvoice ? Math.round((totalAmount / (1 + gstRate / 100)) * 100) / 100 : totalAmount;
  const cgstAmount = isGSTInvoice ? (Math.round((baseAmount * (gstRate / 2 / 100)) * 100) / 100).toFixed(2) : '0.00';
  const sgstAmount = isGSTInvoice ? (Math.round((baseAmount * (gstRate / 2 / 100)) * 100) / 100).toFixed(2) : '0.00';


  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    contentRef: componentRef,
    documentTitle: `Invoice-${invoice?.invoiceNumber || "Invoice"}`,
    removeAfterPrint: true,
    pageStyle: `
      @page { size: A4 portrait; margin: 10mm; }
      @media print {
        html, body { margin:0; padding:0; -webkit-print-color-adjust:exact!important; print-color-adjust:exact!important; }
        #print-root { box-sizing:border-box; width:100%; height:auto; page-break-inside: avoid; }
        .no-print { display:none!important; }
        * { page-break-inside: avoid; }
        .page-break { page-break-before: always; }
      }
    `,
  });

  if (loading) return <Loader />;
  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-red-100/80 text-red-700 p-6 rounded-xl backdrop-blur-xl border border-red-200/50"
      >
        {error}
      </motion.div>
    </div>
  );
  if (!invoice) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-100/80 text-gray-700 p-6 rounded-xl backdrop-blur-xl border border-gray-200/50"
      >
        No invoice data found
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 p-2 sm:p-6 md:p-10 text-xs sm:text-sm">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-4 text-right"
      >
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="no-print bg-purple-600/90 text-white px-4 py-2 rounded-lg text-xs sm:text-sm backdrop-blur-xl hover:bg-purple-700/90 transition-all duration-0.3"
            onClick={() => setShowNotesInInvoice(!showNotesInInvoice)}
          >
            📝 {showNotesInInvoice ? 'Hide Notes' : 'Show Notes'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="no-print bg-green-600/90 text-white px-4 py-2 rounded-lg text-xs sm:text-sm backdrop-blur-xl hover:bg-green-700/90 transition-all duration-0.3"
            onClick={() => setShowNotesEditor(!showNotesEditor)}
          >
            ✏️ {showNotesEditor ? 'Close Editor' : 'Edit Notes'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="no-print bg-blue-600/90 text-white px-4 py-2 rounded-lg text-xs sm:text-sm backdrop-blur-xl hover:bg-blue-700/90 transition-all duration-0.3"
            disabled={!invoice}
            onClick={handlePrint}
          >
            🖨️ Print Invoice
          </motion.button>
        </div>
      </motion.div>


        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          ref={componentRef} 
          id="print-root" 
          className="overflow-x-auto"
        >
        <div className="border-2 border-black max-w-full mx-auto text-[0.65rem] sm:text-xs md:text-sm text-gray-800 bg-white print:bg-white" style={{maxWidth: '210mm', minHeight: 'auto'}}>
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="flex justify-between items-center py-2 border-b-2 border-black p-2 sm:p-4"
          >
            <div className="flex-1"></div>
            <h1 className="text-base sm:text-xl font-bold text-center">
              {isGSTInvoice ? 'TAX INVOICE' : 'INVOICE'}
            </h1>
            <div className="flex-1 text-right">
              <span className="text-xs sm:text-sm font-semibold">
                ORIGINAL FOR RECIPIENT
              </span>
            </div>
          </motion.div>

          {/* Company Info & Invoice Details */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="grid grid-cols-2 border-b-2 border-black"
          >
            <div className="flex items-start gap-2 p-3 border-r-2 border-black">
              <img src="/icon.png" alt="Logo" className="w-30 h-34 object-contain" />
              <div>
                <p className="text-sm font-bold">SHINE INFOSOLUTIONS</p>
                {isGSTInvoice && <p className="text-xs">GSTIN: 09FTJPS4577P1ZD</p>}
                <p className="text-xs">87a, Bankati chak, Raiganj road,Near Chhoti</p>
                <p className="text-xs">Masjid, Gorakhpur</p>
                <p className="text-xs">Gorakhpur, UTTAR PRADESH, 273001</p>
                <p className="text-xs">Mobile: +91 7054284786, 9140427414</p>
                <p className="text-xs">Email: info@shineinfosolutions.in</p>
              </div>
            </div>
            <div className="grid grid-cols-2">
              <div className="border-r-2 border-b-2 border-black p-2">
                <p className="text-xs font-semibold">Invoice #:</p>
                <p className="text-xs font-bold">{invoice.invoiceNumber}</p>
              </div>
              <div className="border-b-2 border-black p-2">
                <p className="text-xs font-semibold">Invoice Date:</p>
                <p className="text-xs font-bold">{new Date(invoice.invoiceDate).toLocaleDateString('en-GB')}</p>
              </div>
              <div className="border-r-2 border-black p-2">
                <p className="text-xs font-semibold">Place of Supply:</p>
                <p className="text-xs font-bold">{invoice.customerAddress}</p>
              </div>
              <div className="p-2">
                <p className="text-xs font-semibold">Due Date:</p>
                <p className="text-xs font-bold">{new Date(invoice.dueDate).toLocaleDateString('en-GB')}</p>
              </div>
            </div>
          </motion.div>

          {/* Customer Details */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="border-b-2 border-black p-3"
          >
            <p className="text-xs font-semibold mb-1">Customer Details:</p>
            <p className="text-xs">Name: {invoice.customerName || 'Customer Name'}</p>
            {isGSTInvoice && <p className="text-xs">GSTIN: {invoice.customerGST}</p>}
            <p className="text-xs">Billing Address: {invoice.customerAddress}</p>
          </motion.div>

          {/* Items Table */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            className="overflow-x-auto"
          >
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  <th className="border-b-2 border-r-2 border-black px-1 py-2 text-center font-semibold">#</th>
                  <th className="border-b-2 border-r-2 border-black px-1 py-2 text-center font-semibold">Item</th>
                  <th className="border-b-2 border-r-2 border-black px-1 py-2 text-center font-semibold">HSN/SAC</th>
                  <th className="border-b-2 border-r-2 border-black px-1 py-2 text-center font-semibold">Rate/Item</th>
                  <th className="border-b-2 border-r-2 border-black px-1 py-2 text-center font-semibold">Qty</th>
                  <th className="border-b-2 border-r-2 border-black px-1 py-2 text-center font-semibold">{isGSTInvoice ? 'Taxable Value' : 'Value'}</th>
                  {isGSTInvoice && <th className="border-b-2 border-r-2 border-black px-1 py-2 text-center font-semibold">Tax Amount</th>}
                  <th className="border-b-2 px-1 py-2 text-center font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.productDetails.map((p, i) => {
                  const qty = parseFloat(p.quantity || 0);
                  const price = parseFloat(p.price || 0);
                  const discountPct = parseFloat(p.discountPercentage || 0);
                  const originalValue = Math.round((qty * price) * 100) / 100;
                  const discountAmount = Math.round((originalValue * discountPct / 100) * 100) / 100;
                  const taxableValue = Math.round((originalValue - discountAmount) * 100) / 100;
                  const taxAmount = Math.round((taxableValue * (gstRate / 100)) * 100) / 100;

                  return (
                    <motion.tr 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.7 + i * 0.1 }}
                    >
                      <td className="border-b-2 border-r-2 border-black px-1 py-2 text-center">{i + 1}</td>
                      <td className="border-b-2 border-r-2 border-black px-1 py-2 text-center">{p.description}</td>
                      <td className="border-b-2 border-r-2 border-black px-1 py-2 text-center">{p.unit}</td>
                      <td className="border-b-2 border-r-2 border-black px-1 py-2 text-center">₹{price.toFixed(2)}</td>
                      <td className="border-b-2 border-r-2 border-black px-1 py-2 text-center">{qty}</td>
                      <td className="border-b-2 border-r-2 border-black px-1 py-2 text-center">₹{taxableValue.toFixed(2)}</td>
                      {isGSTInvoice && <td className="border-b-2 border-r-2 border-black px-1 py-2 text-center">₹{taxAmount.toFixed(2)}</td>}
                      <td className="border-b-2 px-1 py-2 text-center">₹{(Math.round(parseFloat(p.amount) * 100) / 100).toFixed(2)}</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </motion.div>

          {/* Tax Summary */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.8 }}
            className="border-b-2 border-black p-2 text-right"
          >
            {isGSTInvoice ? (
              <>
                <p className="text-xs"><strong>Taxable Amount: ₹{baseAmount.toFixed(2)}</strong></p>
                <p className="text-xs"><strong>CGST {gstRate / 2}%: ₹{cgstAmount}</strong></p>
                <p className="text-xs"><strong>SGST {gstRate / 2}%: ₹{sgstAmount}</strong></p>
                <p className="text-sm font-bold mt-1"><strong>Total: ₹{totalAmount}</strong></p>
              </>
            ) : (
              <>
                <p className="text-xs"><strong>Sub Total: ₹{baseAmount.toFixed(2)}</strong></p>
                <p className="text-sm font-bold mt-1"><strong>Total: ₹{totalAmount}</strong></p>
              </>
            )}
          </motion.div>

          {/* Amount in Words */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 1.0 }}
            className="border-b-2 border-black p-2"
          >
            <p className="text-xs text-right"><strong>Total amount (in words):</strong> INR {capitalizeWords(toWords(Math.round(totalAmount)))} Only</p>
          </motion.div>

          {/* Notes Section */}
          {showNotesInInvoice && notes && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 1.05 }}
              className="border-b-2 border-black p-3"
            >
              <p className="text-xs font-semibold mb-2">Notes:</p>
              <div className="text-xs whitespace-pre-wrap">{notes}</div>
            </motion.div>
          )}

          {/* Payment Terms & Signature */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 1.1 }}
            className="grid grid-cols-2"
          >
            <div className="border-r-2 border-black p-3">
              <p className="text-xs font-semibold mb-2">Bank Details:</p>
              <p className="text-xs"><strong>Bank:</strong> HDFC Bank</p>
              <p className="text-xs"><strong>Account #:</strong> 50200068337918</p>
              <p className="text-xs"><strong>IFSC Code:</strong> HDFC0004331</p>
              <p className="text-xs"><strong>Branch:</strong> GEETA PRESS</p>
            </div>
            <div className="p-3 text-right">
              <p className="text-xs mb-8"><strong>Amount Payable:</strong></p>
              <p className="text-xs mt-8">For SHINE INFOSOLUTIONS</p>
              <div className="mt-8 mb-2">
                <div className="w-24 h-12 border-b border-black ml-auto"></div>
              </div>
              <p className="text-xs">Authorised Signatory</p>
            </div>
          </motion.div>
        </div>
        </motion.div>

      {/* Notes Editor Modal */}
      {showNotesEditor && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 no-print"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Notes</h3>
              <button
                onClick={() => setShowNotesEditor(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your notes here..."
              className="w-full min-h-[300px] p-4 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              style={{ 
                fontFamily: 'Helvetica, Arial, sans-serif', 
                fontSize: '14px',
                direction: 'ltr',
                textAlign: 'left'
              }}
              dir="ltr"
            />
            
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowNotesEditor(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setSaving(true);
                  try {
                    const response = await api.put(`/api/invoices/${id}/notes`, { notes });
                    if (response.data.success) {
                      setInvoice(prev => ({ ...prev, notes }));
                    }
                  } catch (error) {
                  }
                  setShowNotesEditor(false);
                  setShowNotesInInvoice(true);
                  setSaving(false);
                }}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default CreateInvoice;
