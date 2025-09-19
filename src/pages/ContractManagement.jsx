import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import axios from "axios";
import Loader from "../components/Loader";
import DigitalSignature from "../components/DigitalSignature";
import { motion, AnimatePresence } from "framer-motion";

function ContractManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const { navigate, API_URL, currentUser } = useAppContext();

  const isEmployee = currentUser?.role === "employee";

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/employees`);
        let contractData = response.data.data || [];

        if (isEmployee) {
          contractData = contractData.filter(
            (emp) => emp._id === currentUser.id
          );
        }

        const sorted = contractData.sort(
          (a, b) =>
            new Date(b.created_at || b._id.toString().substring(0, 8)) -
            new Date(a.created_at || a._id.toString().substring(0, 8))
        );
        setContracts(sorted);
      } catch (error) {
        console.error("Error fetching contracts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContracts();
  }, [currentUser]);

  const filteredContracts = contracts.filter((emp) =>
    (emp.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePreview = (id) => {
    const previewWindow = window.open('', '_blank');
    previewWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Contract Preview</title>
        <style>
          body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
          .print-btn { 
            position: fixed; 
            top: 20px; 
            right: 20px; 
            background: #2563eb; 
            color: white; 
            border: none; 
            padding: 12px 24px; 
            border-radius: 6px; 
            cursor: pointer; 
            font-size: 14px; 
            z-index: 1000;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .print-btn:hover { background: #1d4ed8; }
          @media print { .print-btn { display: none !important; } }
          iframe { width: 100%; height: calc(100vh - 80px); border: none; }
        </style>
      </head>
      <body>
        <button class="print-btn" onclick="window.print()">🖨️ Print Contract</button>
        <iframe src="${API_URL}/api/employees/${id}/contract/preview"></iframe>
      </body>
      </html>
    `);
    previewWindow.document.close();
  };

  const handleDownload = (id, name) => {
    window.open(`${API_URL}/api/employees/${id}/contract/preview?download=1`, '_blank');
  };

  const handleCreateForEmployee = (id) => {
    setShowDropdown(false);
    navigate(`/contracts/create/${id}`);
  };

  const handleSaveSignature = async (signatureData) => {
    try {
      const employeeContract = filteredContracts[0];
      console.log("Saving signature for:", employeeContract.name);
      console.log("Signature data:", signatureData.substring(0, 50) + "...");

      // Convert base64 to blob
      const response = await fetch(signatureData);
      const blob = await response.blob();

      // Create FormData
      const formData = new FormData();
      formData.append("signature", blob, "signature.png");
      formData.append("signed_date", new Date().toISOString());
      formData.append("employee_name", employeeContract.name);

      const apiResponse = await axios.put(
        `${API_URL}/api/employees/${employeeContract._id}/contract/update`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Backend response:", apiResponse.data);

      if (apiResponse.data.success) {
        setContracts((prev) =>
          prev.map((emp) =>
            emp._id === employeeContract._id
              ? {
                  ...emp,
                  signature: signatureData,
                  signed_date: new Date().toISOString(),
                }
              : emp
          )
        );
        setShowSignature(false);

        const iframe = document.querySelector(
          'iframe[title="Contract Preview"]'
        );
        if (iframe) {
          iframe.src = `${API_URL}/api/employees/${
            employeeContract._id
          }/contract/preview?t=${Date.now()}`;
        }

        alert("Contract signed successfully!");
      }
    } catch (error) {
      console.error("Error saving signature:", error);
      alert("Failed to save signature. Please try again.");
    }
  };

  if (loading) return <Loader message="Loading contracts..." />;

  if (isEmployee && filteredContracts.length > 0) {
    const employeeContract = filteredContracts[0];
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 p-6">
        <motion.iframe
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          src={`${API_URL}/api/employees/${employeeContract._id}/contract/preview`}
          className="w-full h-screen border-0 rounded-xl shadow-xl bg-white/80 backdrop-blur-xl"
          title="Contract Preview"
        />

        {employeeContract.signature && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mt-4 p-4 bg-green-50/80 border border-green-200/50 rounded-xl backdrop-blur-xl"
          >
            <p className="text-green-800 mb-2">
              ✅ Signature saved successfully!
            </p>
            <img
              src={employeeContract.signature}
              alt="Saved signature"
              className="h-16 border rounded"
            />
          </motion.div>
        )}

        {!employeeContract.signature && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="mt-6 p-4 bg-yellow-50/80 dark:bg-yellow-900/80 rounded-xl backdrop-blur-xl border border-yellow-200/50 dark:border-yellow-700/50"
          >
            <p className="text-yellow-800 dark:text-yellow-200 mb-3">
              Please sign your contract to complete the agreement.
            </p>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSignature(true)}
              className="bg-blue-600/90 text-white px-6 py-2 rounded-lg hover:bg-blue-700/90 backdrop-blur-xl transition-all duration-0.3"
            >
              Sign Contract
            </motion.button>
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="mt-6"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              handleDownload(employeeContract._id, employeeContract.name)
            }
            className="bg-green-600/90 text-white px-6 py-2 rounded-lg hover:bg-green-700/90 backdrop-blur-xl flex items-center transition-all duration-0.3"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            Download Contract
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {showSignature && (
            <DigitalSignature
              onSave={handleSaveSignature}
              onCancel={() => setShowSignature(false)}
              employeeName={employeeContract.name}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4"
      >
        <motion.input
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          whileFocus={{ scale: 1.02 }}
          type="text"
          placeholder="Search contracts by employee name..."
          className="w-full md:w-1/2 px-4 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white/80 dark:bg-gray-700/80 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white transition-all duration-0.3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {!isEmployee && (
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDropdown(!showDropdown)}
              className="bg-gray-800/90 text-white px-4 py-2 rounded-lg hover:bg-gray-700/90 backdrop-blur-xl flex items-center transition-all duration-0.3"
            >
              + Create Contract
              <svg
                className={`ml-2 w-4 h-4 transition-transform duration-0.3 ${
                  showDropdown ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </motion.button>

            <AnimatePresence>
              {showDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-60 bg-white/80 dark:bg-gray-700/80 backdrop-blur-xl rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto border border-white/20 dark:border-gray-600/50"
                >
                  <div className="p-2 text-sm text-gray-500 dark:text-gray-300 border-b border-gray-200/50 dark:border-gray-600/50">
                    Select an employee:
                  </div>
                  {contracts.map((emp, index) => (
                    <motion.div
                      key={emp._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      onClick={() => handleCreateForEmployee(emp._id)}
                      className="px-4 py-2 hover:bg-gray-100/50 dark:hover:bg-gray-600/50 cursor-pointer flex justify-between items-center transition-colors duration-0.3"
                    >
                      <span className="text-gray-900 dark:text-white">
                        {emp.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {emp.employee_id}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-blue-gray-200/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-xl border border-white/20 dark:border-gray-700/50 w-full"
      >
        {filteredContracts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-xl">
                <tr>
                  <th className="px-12 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Employee ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Contract Status
                  </th>
                  <th className="px-16 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-gray-600/50">
                {filteredContracts.map((emp, index) => (
                  <motion.tr
                    key={emp._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors duration-0.3"
                  >
                    <td
                      className="px-6 py-4 whitespace-nowrap text-blue-600 hover:underline cursor-pointer"
                      onClick={() => navigate(`/contracts/edit/${emp._id}`)}
                    >
                      {emp.name}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-blue-600 hover:underline cursor-pointer"
                      onClick={() => navigate(`/contracts/edit/${emp._id}`)}
                    >
                      {emp.employee_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {emp.signature ? (
                        <span className="text-green-600 font-medium">
                          Signed
                        </span>
                      ) : emp.contract_agreement?.acceptance?.accepted ? (
                        <span className="text-blue-600 font-medium">
                          Accepted
                        </span>
                      ) : (
                        <span className="text-red-600 font-medium">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePreview(emp._id)}
                        className="text-blue-600 hover:underline transition-colors duration-0.3"
                      >
                        Preview
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDownload(emp._id, emp.name)}
                        className="text-green-600 hover:underline transition-colors duration-0.3"
                      >
                        Download
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="text-center py-6 text-gray-500 dark:text-gray-400"
          >
            {isEmployee ? "No contract found." : "No contracts found."}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default ContractManagement;