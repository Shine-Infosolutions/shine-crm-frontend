import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toWords } from "number-to-words";
import { useReactToPrint } from "react-to-print";
import api from '../utils/axiosConfig';
import { motion } from "framer-motion";

const ViewQuotation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const componentRef = useRef(null);
  const [showNotesInQuotation, setShowNotesInQuotation] = useState(false);
  const [showHSN, setShowHSN] = useState(true);

  useEffect(() => {
    fetchQuotation();
  }, [id]);

  const fetchQuotation = async () => {
    try {
      const response = await api.get(`/api/quotations/${id}`);
      setQuotation(response.data.data);
    } catch (error) {
      setError("Failed to fetch quotation details");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    contentRef: componentRef,
    documentTitle: `Quotation-${quotation?.quotationNumber || "Quotation"}`,
    removeAfterPrint: true,
    pageStyle: `
      @page { size: A4 portrait; margin: 10mm; }
      @media print {
        html, body { margin:0; padding:0; -webkit-print-color-adjust:exact!important; print-color-adjust:exact!important; }
        #print-root { box-sizing:border-box; width:100%; height:auto; page-break-inside: avoid; }
        .no-print { display:none!important; }
        * { page-break-inside: avoid; }
        .page-break { page-break-before: always; }
        .quotation-watermark::before { -webkit-print-color-adjust:exact!important; print-color-adjust:exact!important; }
      }
    `,
  });

  const capitalizeWords = (str) =>
    str
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 dark:text-gray-400">{error || "Quotation not found"}</p>
          <button
            onClick={() => navigate('/quotations')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Quotations
          </button>
        </div>
      </div>
    );
  }

  const baseAmount = quotation.items?.reduce((acc, item) => acc + parseFloat(item.amount || 0), 0) || 0;
  const discountAmount = baseAmount * (parseFloat(quotation.discountOnTotal || 0) / 100);
  const discountedAmount = baseAmount - discountAmount;
  const gstAmount = quotation.isGSTQuotation ? discountedAmount * (parseFloat(quotation.gstPercentage || 0) / 100) : 0;
  const cgst = quotation.isGSTQuotation ? gstAmount / 2 : 0;
  const sgst = quotation.isGSTQuotation ? gstAmount / 2 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 p-2 sm:p-6 md:p-10 text-xs sm:text-sm">
      {/* Header with actions - hidden in print */}
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
            onClick={() => setShowNotesInQuotation(!showNotesInQuotation)}
          >
            📝 {showNotesInQuotation ? 'Hide Notes' : 'Show Notes'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="no-print bg-orange-600/90 text-white px-4 py-2 rounded-lg text-xs sm:text-sm backdrop-blur-xl hover:bg-orange-700/90 transition-all duration-0.3"
            onClick={() => setShowHSN(!showHSN)}
          >
            🔢 {showHSN ? 'Hide HSN/SAC' : 'Show HSN/SAC'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/quotations/edit/${id}`)}
            className="no-print bg-blue-600/90 text-white px-4 py-2 rounded-lg text-xs sm:text-sm backdrop-blur-xl hover:bg-blue-700/90 transition-all duration-0.3"
          >
            ✏️ Edit
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrint}
            className="no-print bg-green-600/90 text-white px-4 py-2 rounded-lg text-xs sm:text-sm backdrop-blur-xl hover:bg-green-700/90 transition-all duration-0.3"
          >
            🖨️ Print Quotation
          </motion.button>
        </div>
      </motion.div>

      {/* Quotation Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        ref={componentRef}
        id="print-root"
        className="overflow-x-auto"
      >
        <div className="border-2 border-black max-w-full mx-auto text-[0.65rem] sm:text-xs md:text-sm text-gray-800 bg-white print:bg-white" style={{maxWidth: '210mm', minHeight: 'auto', position: 'relative'}}>
          {/* Watermark */}
          <img
            src="/icon.png"
            alt=""
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '60%',
              opacity: 0.08,
              pointerEvents: 'none',
              zIndex: 999,
              userSelect: 'none',
            }}
          />
          <div style={{position: 'relative', zIndex: 1}}>
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="flex justify-between items-center py-2 border-b-2 border-black p-2 sm:p-4"
            >
              <div className="flex-1"></div>
              <h1 className="text-base sm:text-xl font-bold text-center">
                QUOTATION
              </h1>
              <div className="flex-1 text-right">
                <span className="text-xs sm:text-sm font-semibold">
                  ORIGINAL FOR RECIPIENT
                </span>
              </div>
            </motion.div>

            {/* Company Info & Quotation Details */}
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
                  {quotation.isGSTQuotation && <p className="text-xs">GSTIN: 09FTJPS4577P1ZD</p>}
                  <p className="text-xs">87a, Bankati chak, Raiganj road,Near Chhoti</p>
                  <p className="text-xs">Masjid, Gorakhpur</p>
                  <p className="text-xs">Gorakhpur, UTTAR PRADESH, 273001</p>
                  <p className="text-xs">Mobile: +91 7054284786, 9140427414</p>
                  <p className="text-xs">Email: info@shineinfosolutions.in</p>
                </div>
              </div>
              <div className="grid grid-cols-2">
                <div className="border-r-2 border-b-2 border-black p-2">
                  <p className="text-xs font-semibold">Quotation #:</p>
                  <p className="text-xs font-bold">{quotation.quotationNumber}</p>
                </div>
                <div className="border-b-2 border-black p-2">
                  <p className="text-xs font-semibold">Quotation Date:</p>
                  <p className="text-xs font-bold">{new Date(quotation.quotationDate).toLocaleDateString('en-GB')}</p>
                </div>
                <div className="border-r-2 border-black p-2">
                  <p className="text-xs font-semibold">Valid Until:</p>
                  <p className="text-xs font-bold">{new Date(quotation.validUntil).toLocaleDateString('en-GB')}</p>
                </div>
                <div className="p-2">
                  <p className="text-xs font-semibold">Status:</p>
                  <p className="text-xs font-bold">{quotation.status}</p>
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
              <p className="text-xs">Name: {quotation.customerName || 'Customer Name'}</p>
              {quotation.isGSTQuotation && quotation.customerGST && <p className="text-xs">GSTIN: {quotation.customerGST}</p>}
              <p className="text-xs">Address: {quotation.customerAddress}</p>
              <p className="text-xs">Phone: {quotation.customerPhone}</p>
              {quotation.customerEmail && <p className="text-xs">Email: {quotation.customerEmail}</p>}
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
                    <th className="border-b-2 border-r-2 border-black px-1 py-2 text-center font-semibold">Item/Service</th>
                    {showHSN && <th className="border-b-2 border-r-2 border-black px-1 py-2 text-center font-semibold">HSN/SAC</th>}
                    <th className="border-b-2 border-r-2 border-black px-1 py-2 text-center font-semibold">Rate/Item</th>
                    <th className="border-b-2 border-r-2 border-black px-1 py-2 text-center font-semibold">Qty</th>
                    <th className="border-b-2 border-r-2 border-black px-1 py-2 text-center font-semibold">{quotation.isGSTQuotation ? 'Taxable Value' : 'Value'}</th>
                    {quotation.isGSTQuotation && <th className="border-b-2 border-r-2 border-black px-1 py-2 text-center font-semibold">Tax Amount</th>}
                    <th className="border-b-2 px-1 py-2 text-center font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {quotation.items?.map((item, i) => {
                    const qty = parseFloat(item.quantity || 0);
                    const price = parseFloat(item.price || 0);
                    const discountPct = parseFloat(item.discountPercentage || 0);
                    const originalValue = Math.round((qty * price) * 100) / 100;
                    const discountAmount = Math.round((originalValue * discountPct / 100) * 100) / 100;
                    const taxableValue = Math.round((originalValue - discountAmount) * 100) / 100;
                    const gstRate = quotation.isGSTQuotation ? parseFloat(quotation.gstPercentage || 0) : 0;
                    const taxAmount = Math.round((taxableValue * (gstRate / 100)) * 100) / 100;

                    return (
                      <motion.tr 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.7 + i * 0.1 }}
                      >
                        <td className="border-b-2 border-r-2 border-black px-1 py-2 text-center">{i + 1}</td>
                        <td className="border-b-2 border-r-2 border-black px-1 py-2 text-center">{item.description}</td>
                        {showHSN && <td className="border-b-2 border-r-2 border-black px-1 py-2 text-center">{item.unit}</td>}
                        <td className="border-b-2 border-r-2 border-black px-1 py-2 text-center">₹{price.toFixed(2)}</td>
                        <td className="border-b-2 border-r-2 border-black px-1 py-2 text-center">{qty}</td>
                        <td className="border-b-2 border-r-2 border-black px-1 py-2 text-center">₹{taxableValue.toFixed(2)}</td>
                        {quotation.isGSTQuotation && <td className="border-b-2 border-r-2 border-black px-1 py-2 text-center">₹{taxAmount.toFixed(2)}</td>}
                        <td className="border-b-2 px-1 py-2 text-center">₹{parseFloat(item.amount).toFixed(2)}</td>
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
              {quotation.isGSTQuotation ? (
                <>
                  <p className="text-xs"><strong>Taxable Amount: ₹{discountedAmount.toFixed(2)}</strong></p>
                  <p className="text-xs"><strong>CGST {(quotation.gstPercentage / 2)}%: ₹{cgst.toFixed(2)}</strong></p>
                  <p className="text-xs"><strong>SGST {(quotation.gstPercentage / 2)}%: ₹{sgst.toFixed(2)}</strong></p>
                  <p className="text-sm font-bold mt-1"><strong>Total: ₹{quotation.totalAmount.toFixed(2)}</strong></p>
                </>
              ) : (
                <>
                  <p className="text-xs"><strong>Sub Total: ₹{baseAmount.toFixed(2)}</strong></p>
                  <p className="text-sm font-bold mt-1"><strong>Total: ₹{quotation.totalAmount.toFixed(2)}</strong></p>
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
              <p className="text-xs text-right"><strong>Total amount (in words):</strong> INR {capitalizeWords(toWords(Math.round(quotation.totalAmount)))} Only</p>
            </motion.div>

            {/* Notes Section */}
            {showNotesInQuotation && (quotation.notes || quotation.termsAndConditions) && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 1.05 }}
                className="border-b-2 border-black p-3"
              >
                {quotation.notes && (
                  <>
                    <p className="text-xs font-semibold mb-2">Notes:</p>
                    <div className="text-xs whitespace-pre-wrap mb-3">{quotation.notes}</div>
                  </>
                )}
                {quotation.termsAndConditions && (
                  <>
                    <p className="text-xs font-semibold mb-2">Terms & Conditions:</p>
                    <div className="text-xs whitespace-pre-wrap">{quotation.termsAndConditions}</div>
                  </>
                )}
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
                <p className="text-xs mb-8"><strong>Quotation Valid Until:</strong></p>
                <p className="text-xs">{new Date(quotation.validUntil).toLocaleDateString('en-GB')}</p>
                <p className="text-xs mt-8">For SHINE INFOSOLUTIONS</p>
                <div className="mt-8 mb-2">
                  <div className="w-24 h-12 border-b border-black ml-auto"></div>
                </div>
                <p className="text-xs">Authorised Signatory</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ViewQuotation;