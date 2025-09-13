// src/pages/CreateInvoice.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { toWords } from "number-to-words";
import { useReactToPrint } from "react-to-print";
import { useAppContext } from "../context/AppContext";
import Loader from "../components/Loader";

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
    contentRef: componentRef,                 // ← add this
    documentTitle: `Invoice-${invoice?.invoiceNumber || "Invoice"}`,
    removeAfterPrint: true,
    onAfterPrint: () => console.log("🖨️ Printed successfully"),
    pageStyle: `
      @page { size: A4; margin: 5mm; }
      @media print {
        html, body { margin:0; padding:24px; -webkit-print-color-adjust:exact!important; print-color-adjust:exact!important; }
        #print-root, #root { box-sizing:border-box; }
        .no-print { display:none!important; }
      }
    `,
  });

  if (loading) return <Loader />;
  if (error) return <div>{error}</div>;
  if (!invoice) return <div>No invoice data found</div>;

  return (
    <div className="bg-white p-2 sm:p-6 md:p-10 text-xs sm:text-sm">
      <div className="mb-4 text-right">
      <button
          className="no-print bg-blue-600 text-white px-4 py-2 rounded text-xs sm:text-sm"
          disabled={!invoice}
          onClick={handlePrint}
        >
          🖨️ Print Invoice
        </button>
      </div>

      <div ref={componentRef} id="print-root" className="overflow-x-auto">
        <div className="border-2 border-black max-w-full md:max-w-5xl mx-auto text-[0.65rem] sm:text-xs md:text-sm text-gray-800">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center py-2 border-b-2 border-black p-2 sm:p-4">
            <h1 className="text-base sm:text-xl text-blue-600 font-bold">
              T A X&nbsp;I N V O I C E
            </h1>
            <span className="text-xs sm:text-base font-semibold text-gray-800">
              ORIGINAL FOR RECIPIENT
            </span>
          </div>

          {/* Company & Invoice Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 border-b-2 border-black">
            <div className="flex items-start gap-2 p-2">
              <img src="/icon.png" alt="Logo" className="w-20 h-16 object-contain" />
              <div>
                <p className="text-base sm:text-lg font-bold text-gray-900">SHINE INFOSOLUTIONS</p>
                <p className="text-gray-800">GSTIN: <strong>09FTJPS4577P1ZD</strong></p>
                <p className="text-gray-800">87a, Bankati chak, Raiganj road, Near Chhoti Masjid, Gorakhpur</p>
                <p className="text-gray-800">Gorakhpur, UTTAR PRADESH, 273001</p>
                <p className="text-gray-800"><strong>Mobile:</strong> +91 7054284786, 9140427414</p>
                <p className="text-gray-800"><strong>Email:</strong> info@shineinfosolutions.in</p>
              </div>
            </div>
            <div className="grid grid-cols-2 border border-black text-xs sm:text-sm font-semibold text-gray-800">
              <div className="border-r border-b border-black p-2">
                <p>Invoice #:</p>
                <p className="font-bold">{invoice.invoiceNumber}</p>
              </div>
              <div className="border-b border-black p-2">
                <p>Invoice Date:</p>
                <p className="font-bold">{invoice.invoiceDate?.split("T")[0]}</p>
              </div>
              <div className="border-r border-black p-2">
                <p>Place of Supply:</p>
                <p className="font-bold">{invoice.customerAddress}</p>
              </div>
              <div className="p-2">
                <p>Due Date:</p>
                <p className="font-bold">{new Date(invoice.dueDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2">
            <div className="border-black p-2 text-gray-800">
              <p><strong>Customer Details:</strong></p>
              <p>GSTIN: {invoice.customerGST}</p>
              <p>Billing Address: {invoice.customerAddress}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="min-w-[600px] w-full border-2 border-black text-gray-800">
              <thead>
                <tr>
                  <th className="border px-2 py-1">#</th>
                  <th className="border px-2 py-1">Item</th>
                  <th className="border px-2 py-1">HSN/ SAC</th>
                  <th className="border px-2 py-1">Rate / Item</th>
                  <th className="border px-2 py-1">Qty</th>
                  <th className="border px-2 py-1">Value</th>
                  {hasAnyDiscount && <th className="border px-2 py-1">Discount</th>}
                  {/* <th className="border px-2 py-1">Tax</th> */}
                  <th className="border px-2 py-1">Amount</th>
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
                    <tr key={i}>
                      <td className="border px-2 py-1 text-center">{i + 1}</td>
                      <td className="border px-2 py-1">{p.description}</td>
                      <td className="border px-2 py-1">{p.unit}</td>
                      <td className="border px-2 py-1">₹{price.toFixed(2)}</td>
                      <td className="border px-2 py-1">{qty}</td>
                      <td className="border px-2 py-1">₹{originalValue.toFixed(2)}</td>
                      {hasAnyDiscount && (
                        <td className="border px-2 py-1">₹{discountAmount.toFixed(2)}</td>
                      )}
                      {/* <td className="border px-2 py-1">₹{taxAmount.toFixed(2)}</td> */}
                      <td className="border px-2 py-1">₹{p.amount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="p-2 text-xs font-bold text-gray-800">
            Total Items / Qty: {invoice.productDetails.length} / {totalQty}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 border-t-2 border-black p-1 text-gray-800">
            <div />
            <div className="text-center">
              <p><strong>Taxable Amount: ₹</strong> {baseAmount.toFixed(2)}</p>
              <p><strong>CGST {gstRate / 2}%: ₹</strong> {cgstAmount}</p>
              <p><strong>SGST {gstRate / 2}%: ₹</strong> {sgstAmount}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 border-t-2 border-black text-gray-800">
            <div />
            <h2 className="font-bold p-2 text-right">TOTAL: ₹{totalAmount}</h2>
          </div>

          <div className="p-2 border-t-2 border-black text-right text-gray-800">
            <strong>Total amount (in words):</strong> INR {capitalizeWords(toWords(totalAmount))} only
          </div>

          {/* Bank Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-black text-gray-800">
            <div className="p-4">
              <p className="font-bold mb-1">Bank Details:</p>
              <p><strong>Bank:</strong> HDFC Bank</p>
              <p><strong>Account #:</strong> 50200068337918</p>
              <p><strong>IFSC Code:</strong> HDFC0004331</p>
              <p><strong>Branch:</strong> GEETA PRESS</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoice;
