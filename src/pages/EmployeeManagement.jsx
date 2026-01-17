import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "../context/AppContext";
import axiosInstance from "../utils/axiosConfig";
import { useLocation } from "react-router-dom";
import Loader from "../components/Loader";

function EmployeeManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [selectedDocuments, setSelectedDocuments] = useState(null);
  const [toggleError, setToggleError] = useState(null);

  const { navigate, API_URL } = useAppContext();
  const location = useLocation();
 
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`${API_URL}/api/employees`);
      if (response.data?.success) {
        const data = response.data.data;
        const employeeArray = Array.isArray(data) ? data : data.employees || [];
  
        // Sort employees by createdAt (latest first)
        const sortedEmployees = employeeArray.sort(
          (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
        );         
        setEmployees(sortedEmployees);
      } else {
        throw new Error(response.data?.message || "Failed to load employees");
      }
    } catch (err) {
      setError(err.message || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchEmployees();
  }, [location.key]);

  useEffect(() => {
    document.body.style.overflow =
      selectedExperience || selectedSalary || selectedDocuments ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedExperience, selectedSalary, selectedDocuments]);

  // 🔍 Filter employees based on search
  const filteredEmployees = employees.filter((emp) =>
    emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.contact1?.includes(searchTerm) ||
    emp.contact2?.includes(searchTerm)
  );

  if (loading) return <Loader message="Loading employees..." />;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Employee Management
        </h2>
        <button
          onClick={() => navigate("/employees/add")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add New Employee
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6 bg-blue-gray-200/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-lg shadow-md p-6 border border-white/20 dark:border-gray-700/50">
        <div className="relative">
          <input
            type="text"
            placeholder="Search employees by name, email or phone..."
            className="w-full px-3 py-2 pl-10 border border-white/20 dark:border-gray-700/50 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-blue-gray-200/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-lg shadow-md border border-white/20 dark:border-gray-700/50">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            All Employees
          </h3>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">Loading...</p>
            </div>
          ) : filteredEmployees.length > 0 ? (
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pic</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">City</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aadhar</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">PAN</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Start</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Experience</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Salary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Documents</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {filteredEmployees.map((emp, index) => (
                  <tr key={emp._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    {/* ID */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white cursor-pointer" onClick={() => navigate(`/employees/add?id=${emp._id}`)}>
                      {emp.employee_id}
                    </td>
                  
                    {/* Name */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white cursor-pointer" onClick={() => navigate(`/employees/add?id=${emp._id}`)}>
                      <div className="font-medium">{emp.name}</div>
                    </td>
                  
                    {/* Contact */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white cursor-pointer" onClick={() => navigate(`/employees/add?id=${emp._id}`)}>
                      <div>
                        {emp.contact1}
                        {emp.contact2 && <div className="text-xs text-gray-500 dark:text-gray-400">{emp.contact2}</div>}
                      </div>
                    </td>
                  
                    {/* Email */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white cursor-pointer" onClick={() => navigate(`/employees/add?id=${emp._id}`)}>
                      {emp.email}
                    </td>
                  
                    {/* Profile */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm cursor-pointer" onClick={() => navigate(`/employees/add?id=${emp._id}`)}>
                      {emp.profile_image?.url ? (
                        <img 
                          src={emp.profile_image.url} 
                          alt="Profile" 
                          className="w-8 h-8 rounded-full object-cover" 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.parentElement.innerHTML = '<div class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center"><span class="text-xs text-gray-500 dark:text-gray-400">N/A</span></div>';
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                          <span className="text-xs text-gray-500 dark:text-gray-400">N/A</span>
                        </div>
                      )}
                    </td>
                  
                    {/* City */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white cursor-pointer" onClick={() => navigate(`/employees/add?id=${emp._id}`)}>
                      {emp.city || "N/A"}
                    </td>
                  
                    {/* Aadhaar */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-col">
                        <span className="text-gray-900 dark:text-white">{emp.aadhar_number || "N/A"}</span>
                        {emp.aadhar_document?.url && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(emp.aadhar_document.url, "_blank");
                            }}
                            className="mt-1 w-fit text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800"
                          >
                            View Aadhaar
                          </button>
                        )}
                      </div>
                    </td>

                    {/* PAN */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-col">
                        <span className="text-gray-900 dark:text-white">{emp.pan_number || "N/A"}</span>
                        {emp.pan_document?.url && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(emp.pan_document.url, "_blank");
                            }}
                            className="mt-1 w-fit text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800"
                          >
                            View PAN
                          </button>
                        )}
                      </div>
                    </td>
                  
                    {/* Work Start Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white cursor-pointer" onClick={() => navigate(`/employees/add?id=${emp._id}`)}>
                      {emp.work_start_date ? new Date(emp.work_start_date).toLocaleDateString() : "N/A"}
                    </td>
                  
                    {/* Employment Type */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white cursor-pointer" onClick={() => navigate(`/employees/add?id=${emp._id}`)}>
                      {emp.employment_type}
                    </td>
                  
                    {/* Employee Status */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm cursor-pointer" onClick={() => navigate(`/employees/add?id=${emp._id}`)}>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        emp.employee_status === "Active" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                        emp.employee_status === "On Leave" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}>
                        {emp.employee_status}
                      </span>
                    </td>
                  
                    {/* Experience Button */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedExperience(emp.work_experience || []);
                        }}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800"
                      >
                        View Experience
                      </button>
                    </td>
                    
                    {/* Salary Button */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSalary(emp.salary_details || {});
                        }}
                        className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full hover:bg-green-200 dark:hover:bg-green-800"
                      >
                        View Salary
                      </button>
                    </td>
                    
                    {/* Documents Button */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDocuments(emp.documents || {});
                        }}
                        className="px-2 py-1 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800"
                      >
                        View Documents
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No employees found</p>
            </div>
          )}
        </div>
      </div>

      {/* Error message for toggle */}
      {toggleError && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200">
          {toggleError}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {selectedExperience && (
          <Modal title="Work Experience" onClose={() => setSelectedExperience(null)}>
            {selectedExperience.length > 0 ? (
              <div className="space-y-4">
                {selectedExperience.map((exp, idx) => (
                  <div key={idx} className="border-b pb-3 last:border-0">
                    <p className="font-medium">{exp.company_name}</p>
                    <p className="text-gray-600">{exp.role}</p>
                    <p className="text-sm text-gray-500">{exp.duration}</p>
                    {exp.experience_letter?.url ? (
                      <a 
                        href={exp.experience_letter.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-blue-600 text-sm hover:underline inline-block mt-1"
                      >
                        View Experience Letter
                      </a>
                    ) : (
                      <p className="text-sm text-gray-500 mt-1">No experience letter</p>
                    )}
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-500">No experience details</p>}
          </Modal>
        )}

        {selectedSalary && (
          <Modal title="Salary Details" onClose={() => setSelectedSalary(null)}>
            <div className="space-y-2">
              <p><strong>Monthly Salary:</strong> {selectedSalary.monthly_salary ? `₹${selectedSalary.monthly_salary}` : "N/A"}</p>
              <p><strong>Account No:</strong> {selectedSalary.bank_account_number || "N/A"}</p>
              <p><strong>IFSC Code:</strong> {selectedSalary.ifsc_code || "N/A"}</p>
              <p><strong>Bank Name:</strong> {selectedSalary.bank_name || "N/A"}</p>
              <p><strong>PF Account:</strong> {selectedSalary.pf_account_number || "N/A"}</p>
            </div>
          </Modal>
        )}

        {selectedDocuments && (
          <Modal title="Documents" onClose={() => setSelectedDocuments(null)}>
            <div className="space-y-3">
              {selectedDocuments.resume?.url && <FileLink url={selectedDocuments.resume.url} label="Resume" />}
              {selectedDocuments.offer_letter?.url && <FileLink url={selectedDocuments.offer_letter.url} label="Offer Letter" />}
              {selectedDocuments.joining_letter?.url && <FileLink url={selectedDocuments.joining_letter.url} label="Joining Letter" />}
              {selectedDocuments.other_docs?.map((doc, idx) => (
                <FileLink key={idx} url={doc.url} label={`Document ${idx + 1}`} />
              ))}
              {(!selectedDocuments.resume?.url && 
                !selectedDocuments.offer_letter?.url && 
                !selectedDocuments.joining_letter?.url && 
                (!selectedDocuments.other_docs || selectedDocuments.other_docs.length === 0)) && (
                <p className="text-gray-500">No documents available</p>
              )}
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-blue-gray-200/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-white/20 dark:border-gray-700/50">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
);

const FileLink = ({ url, label }) => (
  <a 
    href={url} 
    target="_blank" 
    rel="noreferrer" 
    className="block p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600"
  >
    <span className="font-medium">{label}</span>
  </a>
);

export default EmployeeManagement;
