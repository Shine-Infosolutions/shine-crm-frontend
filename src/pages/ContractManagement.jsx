import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import axios from "axios";
import Loader from "../components/Loader";
import DigitalSignature from "../components/DigitalSignature";

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
    window.open(`${API_URL}/api/employees/${id}/contract/preview`, "_blank");
  };

  const handleDownload = (id, name) => {
    navigate(`/contracts/download/${id}`);
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
      <div className="p-6">
        <iframe
          src={`${API_URL}/api/employees/${employeeContract._id}/contract/preview`}
          className="w-full h-screen border-0 rounded-lg"
          title="Contract Preview"
        />

        {employeeContract.signature && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
            <p className="text-green-800 mb-2">
              ✅ Signature saved successfully!
            </p>
            <img
              src={employeeContract.signature}
              alt="Saved signature"
              className="h-16 border rounded"
            />
          </div>
        )}

        {!employeeContract.signature && (
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
            <p className="text-yellow-800 dark:text-yellow-200 mb-3">
              Please sign your contract to complete the agreement.
            </p>
            <button
              onClick={() => setShowSignature(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Sign Contract
            </button>
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={() =>
              handleDownload(employeeContract._id, employeeContract.name)
            }
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 flex items-center"
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
          </button>
        </div>

        {showSignature && (
          <DigitalSignature
            onSave={handleSaveSignature}
            onCancel={() => setShowSignature(false)}
            employeeName={employeeContract.name}
          />
        )}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <input
          type="text"
          placeholder="Search contracts by employee name..."
          className="w-full md:w-1/2 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {!isEmployee && (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center"
            >
              + Create Contract
              <svg
                className={`ml-2 w-4 h-4 transition-transform ${
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
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-gray-700 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-600">
                <div className="p-2 text-sm text-gray-500 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                  Select an employee:
                </div>
                {contracts.map((emp) => (
                  <div
                    key={emp._id}
                    onClick={() => handleCreateForEmployee(emp._id)}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer flex justify-between items-center"
                  >
                    <span className="text-gray-900 dark:text-white">
                      {emp.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {emp.employee_id}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md w-full">
        {filteredContracts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-100 dark:bg-gray-700">
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
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {filteredContracts.map((emp) => (
                  <tr
                    key={emp._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
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
                      <button
                        onClick={() => handlePreview(emp._id)}
                        className="text-blue-600 hover:underline"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => handleDownload(emp._id, emp.name)}
                        className="text-green-600 hover:underline"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            {isEmployee ? "No contract found." : "No contracts found."}
          </div>
        )}
      </div>
    </div>
  );
}

export default ContractManagement;
