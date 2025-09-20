import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "../context/AppContext";
import axios from "axios";
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
      const response = await axios.get(`${API_URL}/api/employees`);
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
      console.error("Error fetching employees:", err);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-6 overflow-x-hidden"
      >
        {/* Search + Add Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="flex flex-col md:flex-row gap-4 mb-6"
        >
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search employees by name, email or phone..."
              className="w-full px-4 py-2 pl-10 bg-blue-gray-200/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {/* Search icon */}
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/employees/add")}
            className="bg-gray-800/80 backdrop-blur-md text-white px-4 py-2 rounded-lg hover:bg-gray-700/80 whitespace-nowrap shadow-lg border border-white/10"
          >
            Add New Employee
          </motion.button>
        </motion.div>

        {/* Table Container */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="overflow-x-auto bg-blue-gray-200/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-xl border border-white/20 dark:border-gray-700/50"
        >
          <div className="overflow-x-auto w-full">
            <table className="min-w-[1200px] w-full table-auto">
              <thead className="bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                <tr>
                  {[
                    "ID", "Name", "Contact", "Email", "Profile", "City", "Aadhar", "PAN",
                    "Work Start", "Emp. Type", "Status", "Experience", "Salary", "Documents"
                  ].map((heading) => (
                    <th key={heading} className="px-6 py-3 text-left">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-200/50 dark:divide-gray-600/50">
                {filteredEmployees.map((emp, index) => (
                  <motion.tr 
                    key={emp._id} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 + index * 0.03 }}
                    whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.1)", scale: 1.01 }}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 backdrop-blur-sm"
                  >
                    {/* ID */}
                    <td className="px-6 py-4 cursor-pointer" onClick={() => navigate(`/employees/add?id=${emp._id}`)}>
                      {emp.employee_id}
                    </td>
                  
                    {/* Name */}
                    <td className="px-6 py-4 cursor-pointer" onClick={() => navigate(`/employees/add?id=${emp._id}`)}>
                      {emp.name}
                    </td>
                  
                    {/* Contact */}
                    <td className="px-6 py-4 cursor-pointer" onClick={() => navigate(`/employees/add?id=${emp._id}`)}>
                      <div>
                        {emp.contact1}
                        {emp.contact2 && <div className="text-xs text-gray-500">{emp.contact2}</div>}
                      </div>
                    </td>
                  
                    {/* Email */}
                    <td className="px-6 py-4 cursor-pointer" onClick={() => navigate(`/employees/add?id=${emp._id}`)}>
                      {emp.email}
                    </td>
                  
                    {/* Profile */}
                    <td className="px-6 py-4 cursor-pointer" onClick={() => navigate(`/employees/add?id=${emp._id}`)}>
                      {emp.profile_image?.url ? (
                        <img 
                          src={emp.profile_image.url} 
                          alt="Profile" 
                          className="w-10 h-10 rounded-full object-cover" 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.parentElement.innerHTML = '<div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"><span class="text-xs text-gray-500">N/A</span></div>';
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-xs text-gray-500">N/A</span>
                        </div>
                      )}
                    </td>
                  
                    {/* City */}
                    <td className="px-6 py-4 cursor-pointer" onClick={() => navigate(`/employees/add?id=${emp._id}`)}>
                      {emp.city || "N/A"}
                    </td>
                  
                    {/* Aadhaar */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span>{emp.aadhar_number || "N/A"}</span>
                        {emp.aadhar_document?.url && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(emp.aadhar_document.url, "_blank");
                            }}
                            className="mt-1 w-fit text-xs bg-blue-400/80 backdrop-blur-sm text-white px-2 py-1 rounded hover:bg-blue-700/80 transition shadow-md"
                          >
                            View Aadhaar
                          </motion.button>
                        )}
                      </div>
                    </td>

                    {/* PAN */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span>{emp.pan_number || "N/A"}</span>
                        {emp.pan_document?.url && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(emp.pan_document.url, "_blank");
                            }}
                            className="mt-1 w-fit text-xs bg-blue-400/80 backdrop-blur-sm text-white px-2 py-1 rounded hover:bg-blue-700/80 transition shadow-md"
                          >
                            View PAN
                          </motion.button>
                        )}
                      </div>
                    </td>
                  
                    {/* Work Start Date */}
                    <td className="px-6 py-4 cursor-pointer" onClick={() => navigate(`/employees/add?id=${emp._id}`)}>
                      {emp.work_start_date ? new Date(emp.work_start_date).toLocaleDateString() : "N/A"}
                    </td>
                  
                    {/* Employment Type */}
                    <td className="px-6 py-4 cursor-pointer" onClick={() => navigate(`/employees/add?id=${emp._id}`)}>
                      {emp.employment_type}
                    </td>
                  
                    {/* Employee Status */}
                    <td className="px-6 py-4 cursor-pointer" onClick={() => navigate(`/employees/add?id=${emp._id}`)}>
                      <span className={`px-2 py-1 rounded text-xs font-medium backdrop-blur-sm
                        ${emp.employee_status === "Active" ? "bg-green-100/80 text-green-800" :
                          emp.employee_status === "On Leave" ? "bg-yellow-100/80 text-yellow-800" :
                            "bg-red-100/80 text-red-800"}`}>
                        {emp.employee_status}
                      </span>
                    </td>
                  
                    {/* View Buttons */}
                    {[
                      ["Experience", () => setSelectedExperience(emp.work_experience || [])],
                      ["Salary", () => setSelectedSalary(emp.salary_details || {})],
                      ["Docs", () => setSelectedDocuments(emp.documents || {})]
                    ].map(([label, handler]) => (
                      <td key={`${emp._id}-${label}`} className="px-6 py-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handler();
                          }}
                          className="text-blue-600 underline text-sm hover:text-blue-800"
                        >
                          View {label}
                        </motion.button>
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* No employees message */}
        {!loading && filteredEmployees.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="text-center py-4 text-gray-500 dark:text-gray-400"
          >
            No employees found
          </motion.div>
        )}

        {/* Error message for toggle */}
        {toggleError && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-red-100/80 backdrop-blur-sm text-red-700 rounded-lg border border-red-200/50"
          >
            {toggleError}
          </motion.div>
        )}

        {/* Modals */}
        <AnimatePresence>
          {selectedExperience && (
            <Modal title="Work Experience" onClose={() => setSelectedExperience(null)}>
              {selectedExperience.length > 0 ? (
                <div className="space-y-4">
                  {selectedExperience.map((exp, idx) => (
                    <motion.div 
                      key={idx} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="border-b pb-3 last:border-0"
                    >
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
                    </motion.div>
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
      </motion.div>
    </div>
  );
}

const Modal = ({ title, children, onClose }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center"
  >
    <motion.div 
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl text-black dark:text-white p-6 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto relative shadow-2xl border border-white/20 dark:border-gray-700/50"
    >
      <motion.button 
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClose} 
        className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-700/50"
      >
        ✕
      </motion.button>
      <h3 className="text-lg font-bold mb-4">{title}</h3>
      {children}
    </motion.div>
  </motion.div>
);

const FileLink = ({ url, label }) => (
  <motion.a 
    whileHover={{ scale: 1.02, x: 5 }}
    href={url} 
    target="_blank" 
    rel="noreferrer" 
    className="block p-3 border rounded-lg hover:bg-gray-50/50 dark:hover:bg-gray-700/50 backdrop-blur-sm border-white/20 dark:border-gray-700/50"
  >
    <span className="font-medium">{label}</span>
  </motion.a>
);

export default EmployeeManagement;