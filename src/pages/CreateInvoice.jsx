// src/pages/CreateInvoice.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { toWords } from "number-to-words";
import { useReactToPrint } from "react-to-print";
import { useAppContext } from "../context/AppContext";
import Loader from "../components/Loader";
import { motion } from "framer-motion";

const CreateInvoice = () => {
  const { id } = useParams();
  const { API_URL } = useAppContext();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const componentRef = useRef(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await fetch(`${API_URL}/api/invoices/mono/${id}`);
        const data = await response.json();
        if (data.success) {
          setInvoice(data.data);
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

  const gstRate = Number(invoice?.amountDetails?.gstPercentage || 0);
  const totalAmount = Number(invoice?.amountDetails?.totalAmount || 0);
  const baseAmount = totalAmount / (1 + gstRate / 100);
  const cgstAmount = (baseAmount * (gstRate / 2 / 100)).toFixed(2);
  const sgstAmount = (baseAmount * (gstRate / 2 / 100)).toFixed(2);
  const totalQty =
    invoice?.productDetails?.reduce((acc, p) => acc + Number(p.quantity || 0), 0) || 0;

  const hasAnyDiscount =
    invoice?.productDetails?.some(
      (p) => parseFloat(p.discountPercentage || 0) > 0
    ) || false;

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    contentRef: componentRef,
    documentTitle: `Invoice-${invoice?.invoiceNumber || "Invoice"}`,
    removeAfterPrint: true,
    onAfterPrint: () => console.log("🖨️ Printed successfully"),
    pageStyle: `
      @page { size: A4 portrait; margin: 5mm; }
      @media print {
        html, body { margin:0; padding:24px; -webkit-print-color-adjust:exact!important; print-color-adjust:exact!important; }
        #print-root, #root { box-sizing:border-box; }
        .no-print { display:none!important; }
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
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="no-print bg-blue-600/90 text-white px-4 py-2 rounded-lg text-xs sm:text-sm backdrop-blur-xl hover:bg-blue-700/90 transition-all duration-0.3"
          disabled={!invoice}
          onClick={handlePrint}
        >
          🖨️ Print Invoice
        </motion.button>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        ref={componentRef} 
        id="print-root" 
        className="overflow-x-auto"
      >
        <div className="border-2 border-black max-w-full md:max-w-5xl mx-auto text-[0.65rem] sm:text-xs md:text-sm text-gray-800 bg-white/90 backdrop-blur-xl">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="flex justify-between items-center py-2 border-b-2 border-black p-2 sm:p-4"
          >
            <div className="flex-1"></div>
            <h1 className="text-base sm:text-xl font-bold text-center">
              TAX INVOICE
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
              <img src="/icon.png" alt="Logo" className="w-16 h-12 object-contain" />
              <div>
                <p className="text-sm font-bold">SHINE INFOSOLUTIONS</p>
                <p className="text-xs">GSTIN: 09FTJPS4577P1ZD</p>
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
            <p className="text-xs">GSTIN: {invoice.customerGST}</p>
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
                  <th className="border-b-2 border-r-2 border-black px-1 py-2 text-center font-semibold">Taxable Value</th>
                  <th className="border-b-2 border-r-2 border-black px-1 py-2 text-center font-semibold">Tax Amount</th>
                  <th className="border-b-2 px-1 py-2 text-center font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.productDetails.map((p, i) => {
                  const qty = parseFloat(p.quantity || 0);
                  const price = parseFloat(p.price || 0);
                  const discountPct = parseFloat(p.discountPercentage || 0);
                  const originalValue = qty * price;
                  const discountAmount = (originalValue * discountPct) / 100;
                  const taxableValue = originalValue - discountAmount;
                  const taxAmount = taxableValue * (gstRate / 100);

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
                      <td className="border-b-2 border-r-2 border-black px-1 py-2 text-center">₹{taxAmount.toFixed(2)}</td>
                      <td className="border-b-2 px-1 py-2 text-center">₹{p.amount}</td>
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
            <p className="text-xs"><strong>Taxable Amount: ₹{baseAmount.toFixed(2)}</strong></p>
            <p className="text-xs"><strong>CGST {gstRate / 2}%: ₹{cgstAmount}</strong></p>
            <p className="text-xs"><strong>SGST {gstRate / 2}%: ₹{sgstAmount}</strong></p>
            <p className="text-sm font-bold mt-1"><strong>Total: ₹{totalAmount}</strong></p>
          </motion.div>

          {/* Amount in Words */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 1.0 }}
            className="border-b-2 border-black p-2"
          >
            <p className="text-xs text-right"><strong>Total amount (in words):</strong> INR {capitalizeWords(toWords(totalAmount))} Only</p>
          </motion.div>

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
    </div>
  );
};

export default CreateInvoice;