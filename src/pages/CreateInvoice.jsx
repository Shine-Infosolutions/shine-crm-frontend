// src/pages/CreateInvoice.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { toWords } from "number-to-words";
import { useReactToPrint } from "react-to-print";
import { useAppContext } from "../context/AppContext";
import Loader from "../components/Loader";
import { motion } from "framer-motion";
// Removed TinyMCE import to avoid API key issues

const CreateInvoice = () => {
  const { id } = useParams();
  const { API_URL } = useAppContext();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState('');
  const [saving, setSaving] = useState(false);
  const componentRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await fetch(`${API_URL}/api/invoices/mono/${id}`);
        const data = await response.json();
        if (data.success) {
          setInvoice(data.data);
          setEditableContent(generateInvoiceHTML(data.data));
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

  const generateInvoiceHTML = (invoiceData) => {
    const gstRate = Number(invoiceData?.amountDetails?.gstPercentage || 0);
    const totalAmount = Number(invoiceData?.amountDetails?.totalAmount || 0);
    const baseAmount = totalAmount / (1 + gstRate / 100);
    const cgstAmount = (baseAmount * (gstRate / 2 / 100)).toFixed(2);
    const sgstAmount = (baseAmount * (gstRate / 2 / 100)).toFixed(2);
    
    return `
      <div style="border: 2px solid black; font-size: 12px; background: white;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 2px solid black;">
          <div></div>
          <h1 style="font-size: 20px; font-weight: bold; text-align: center;">TAX INVOICE</h1>
          <div style="text-align: right;"><span style="font-size: 14px; font-weight: bold;">ORIGINAL FOR RECIPIENT</span></div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; border-bottom: 2px solid black;">
          <div style="display: flex; gap: 8px; padding: 12px; border-right: 2px solid black;">
            <img src="/icon.png" alt="Logo" style="width: 64px; height: 48px; object-fit: contain;" />
            <div>
              <p style="font-size: 14px; font-weight: bold;">SHINE INFOSOLUTIONS</p>
              <p>GSTIN: 09FTJPS4577P1ZD</p>
              <p>87a, Bankati chak, Raiganj road,Near Chhoti</p>
              <p>Masjid, Gorakhpur</p>
              <p>Gorakhpur, UTTAR PRADESH, 273001</p>
              <p>Mobile: +91 7054284786, 9140427414</p>
              <p>Email: info@shineinfosolutions.in</p>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr;">
            <div style="border-right: 2px solid black; border-bottom: 2px solid black; padding: 8px;">
              <p style="font-weight: bold;">Invoice #:</p>
              <p style="font-weight: bold;">${invoiceData.invoiceNumber}</p>
            </div>
            <div style="border-bottom: 2px solid black; padding: 8px;">
              <p style="font-weight: bold;">Invoice Date:</p>
              <p style="font-weight: bold;">${new Date(invoiceData.invoiceDate).toLocaleDateString('en-GB')}</p>
            </div>
            <div style="border-right: 2px solid black; padding: 8px;">
              <p style="font-weight: bold;">Place of Supply:</p>
              <p style="font-weight: bold;">${invoiceData.customerAddress}</p>
            </div>
            <div style="padding: 8px;">
              <p style="font-weight: bold;">Due Date:</p>
              <p style="font-weight: bold;">${new Date(invoiceData.dueDate).toLocaleDateString('en-GB')}</p>
            </div>
          </div>
        </div>
        
        <div style="border-bottom: 2px solid black; padding: 12px;">
          <p style="font-weight: bold; margin-bottom: 4px;">Customer Details:</p>
          <p>GSTIN: ${invoiceData.customerGST}</p>
          <p>Billing Address: ${invoiceData.customerAddress}</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr>
              <th style="border-bottom: 2px solid black; border-right: 2px solid black; padding: 8px; text-align: center; font-weight: bold;">#</th>
              <th style="border-bottom: 2px solid black; border-right: 2px solid black; padding: 8px; text-align: center; font-weight: bold;">Item</th>
              <th style="border-bottom: 2px solid black; border-right: 2px solid black; padding: 8px; text-align: center; font-weight: bold;">HSN/SAC</th>
              <th style="border-bottom: 2px solid black; border-right: 2px solid black; padding: 8px; text-align: center; font-weight: bold;">Rate/Item</th>
              <th style="border-bottom: 2px solid black; border-right: 2px solid black; padding: 8px; text-align: center; font-weight: bold;">Qty</th>
              <th style="border-bottom: 2px solid black; border-right: 2px solid black; padding: 8px; text-align: center; font-weight: bold;">Taxable Value</th>
              <th style="border-bottom: 2px solid black; border-right: 2px solid black; padding: 8px; text-align: center; font-weight: bold;">Tax Amount</th>
              <th style="border-bottom: 2px solid black; padding: 8px; text-align: center; font-weight: bold;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${invoiceData.productDetails.map((p, i) => {
              const qty = parseFloat(p.quantity || 0);
              const price = parseFloat(p.price || 0);
              const discountPct = parseFloat(p.discountPercentage || 0);
              const originalValue = qty * price;
              const discountAmount = (originalValue * discountPct) / 100;
              const taxableValue = originalValue - discountAmount;
              const taxAmount = taxableValue * (gstRate / 100);
              
              return `
                <tr>
                  <td style="border-bottom: 2px solid black; border-right: 2px solid black; padding: 8px; text-align: center;">${i + 1}</td>
                  <td style="border-bottom: 2px solid black; border-right: 2px solid black; padding: 8px; text-align: center;">${p.description}</td>
                  <td style="border-bottom: 2px solid black; border-right: 2px solid black; padding: 8px; text-align: center;">${p.unit}</td>
                  <td style="border-bottom: 2px solid black; border-right: 2px solid black; padding: 8px; text-align: center;">₹${price.toFixed(2)}</td>
                  <td style="border-bottom: 2px solid black; border-right: 2px solid black; padding: 8px; text-align: center;">${qty}</td>
                  <td style="border-bottom: 2px solid black; border-right: 2px solid black; padding: 8px; text-align: center;">₹${taxableValue.toFixed(2)}</td>
                  <td style="border-bottom: 2px solid black; border-right: 2px solid black; padding: 8px; text-align: center;">₹${taxAmount.toFixed(2)}</td>
                  <td style="border-bottom: 2px solid black; padding: 8px; text-align: center;">₹${p.amount}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        
        <div style="border-bottom: 2px solid black; padding: 8px; text-align: right;">
          <p><strong>Taxable Amount: ₹${baseAmount.toFixed(2)}</strong></p>
          <p><strong>CGST ${gstRate / 2}%: ₹${cgstAmount}</strong></p>
          <p><strong>SGST ${gstRate / 2}%: ₹${sgstAmount}</strong></p>
          <p style="font-size: 14px; font-weight: bold; margin-top: 4px;"><strong>Total: ₹${totalAmount}</strong></p>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr;">
          <div style="border-right: 2px solid black; padding: 12px;">
            <p style="font-weight: bold; margin-bottom: 8px;">Bank Details:</p>
            <p><strong>Bank:</strong> HDFC Bank</p>
            <p><strong>Account #:</strong> 50200068337918</p>
            <p><strong>IFSC Code:</strong> HDFC0004331</p>
            <p><strong>Branch:</strong> GEETA PRESS</p>
          </div>
          <div style="padding: 12px; text-align: right;">
            <p style="margin-bottom: 32px;"><strong>Amount Payable:</strong></p>
            <p style="margin-top: 32px;">For SHINE INFOSOLUTIONS</p>
            <div style="margin-top: 32px; margin-bottom: 8px;">
              <div style="width: 96px; height: 48px; border-bottom: 1px solid black; margin-left: auto;"></div>
            </div>
            <p>Authorised Signatory</p>
          </div>
        </div>
      </div>
    `;
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const saveEditedContent = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/invoices/${id}/content`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ editedContent: editableContent }),
      });
      
      if (response.ok) {
        alert('Invoice content saved successfully!');
      } else {
        alert('Failed to save invoice content');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Error saving invoice content');
    }
    setSaving(false);
  };

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
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="no-print bg-green-600/90 text-white px-4 py-2 rounded-lg text-xs sm:text-sm backdrop-blur-xl hover:bg-green-700/90 transition-all duration-0.3"
            onClick={handleEditToggle}
          >
            {isEditing ? '📝 Exit Edit' : '✏️ Edit'}
          </motion.button>
          {isEditing && (
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="no-print bg-purple-600/90 text-white px-4 py-2 rounded-lg text-xs sm:text-sm backdrop-blur-xl hover:bg-purple-700/90 transition-all duration-0.3"
              onClick={saveEditedContent}
              disabled={saving}
            >
              {saving ? '💾 Saving...' : '💾 Save'}
            </motion.button>
          )}
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

      {isEditing ? (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white/90 backdrop-blur-xl rounded-xl p-6 shadow-lg"
        >
          <div className="mb-4 flex gap-2 border-b pb-2">
            <button onClick={() => document.execCommand('bold')} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">B</button>
            <button onClick={() => document.execCommand('italic')} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">I</button>
            <button onClick={() => document.execCommand('underline')} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">U</button>
          </div>
          <div
            ref={editorRef}
            contentEditable
            className="min-h-[600px] p-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            dangerouslySetInnerHTML={{ __html: editableContent }}
            onInput={(e) => setEditableContent(e.target.innerHTML)}
            style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontSize: '14px' }}
          />
        </motion.div>
      ) : (
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
      )}
    </div>
  );
};

export default CreateInvoice;