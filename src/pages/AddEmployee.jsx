import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "../context/AppContext";
import { useLocation } from "react-router-dom";
import axiosInstance from "../utils/axiosConfig";

const AddEmployee = () => {
  const { API_URL, navigate } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();
  const [isEditMode, setIsEditMode] = useState(false);
  const [employeeId, setEmployeeId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    profile_image: null,
    password: "",
    contact1: "",
    contact2: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    aadhar_number: "",
    aadhar_document: null,
    pan_number: "",
    pan_document: null,
    work_start_date: "",
    tenure: "",
    employment_type: "Full Time",
    is_current_employee: true,
    designation: "",
    department: "",
    reporting_manager: "",
    employee_status: "Active",
    salary_details: {
      monthly_salary: "",
      bank_account_number: "",
      ifsc_code: "",
      bank_name: "",
      pf_account_number: "",
    },
    work_experience: [],
    documents: { 
      resume: null,
      offer_letter: null,
      joining_letter: null,
      other_docs: [] 
    },
    notes: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get("id");
    if (id) {
      setIsEditMode(true);
      setEmployeeId(id);
      fetchEmployeeData(id);
    }
  }, [location]);

  const fetchEmployeeData = async (id) => {
    setLoading(true);
    try {
      const resp = await axiosInstance.get(`${API_URL}/api/employees/${id}`);
      if (!resp.data.success) throw new Error(resp.data.message);
      const data = resp.data.data;
      setFormData({
        name: data.name || "",
        work_start_date: data.work_start_date?.slice(0,10) || "",
        profile_image: data.profile_image || null,
        password: "",
        contact1: data.contact1 || "",
        contact2: data.contact2 || "",
        email: data.email || "",
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        pincode: data.pincode || "",
        aadhar_number: data.aadhar_number || "",
        aadhar_document: data.aadhar_document || null,
        pan_number: data.pan_number || "",
        pan_document: data.pan_document || null,
        tenure: data.tenure || "",
        employment_type: data.employment_type || "Full Time",
        is_current_employee: data.is_current_employee ?? true,
        designation: data.designation || "",
        department: data.department || "",
        reporting_manager: data.reporting_manager || "",
        employee_status: data.employee_status || "Active",
        salary_details: {
          monthly_salary: data.salary_details?.monthly_salary || "",
          bank_account_number: data.salary_details?.bank_account_number || "",
          ifsc_code: data.salary_details?.ifsc_code || "",
          bank_name: data.salary_details?.bank_name || "",
          pf_account_number: data.salary_details?.pf_account_number || "",
        },
        work_experience: (data.work_experience || []).map(exp => ({
          company_name: exp.company_name || "",
          role: exp.role || "",
          duration: exp.duration || "",
          experience_letter: exp.experience_letter || null,
        })),
        documents: {
          resume: data.documents?.resume || null,
          offer_letter: data.documents?.offer_letter || null,
          joining_letter: data.documents?.joining_letter || null,
          other_docs: data.documents?.other_docs || []
        },
        notes: data.notes || "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleExperienceChange = (i, e) => {
    const { name, value, files } = e.target;
    setFormData(prev => {
      const updatedExperience = [...prev.work_experience];
      updatedExperience[i] = {
        ...updatedExperience[i],
        [name]: files ? files[0] : value
      };
      return { ...prev, work_experience: updatedExperience };
    });
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      work_experience: [...prev.work_experience, { 
        company_name: '', 
        role: '', 
        duration: '', 
        experience_letter: null 
      }]
    }));
  };

  const removeExperience = (i) => {
    setFormData(prev => ({
      ...prev,
      work_experience: prev.work_experience.filter((_, idx) => idx !== i)
    }));
  };

  const handleDocumentChange = (docType, e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docType]: file
      }
    }));
  };

  const handleOtherDocsChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        other_docs: [...prev.documents.other_docs, ...files]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
  
    const fd = new FormData();
    const payload = { ...formData };
    
    // Remove file references from payload
    ['profile_image', 'aadhar_document', 'pan_document'].forEach(f => delete payload[f]);
    
    // Remove experience letter files from payload
    payload.work_experience = payload.work_experience.map(({ experience_letter, ...rest }) => rest);
    
    // Remove document files from payload
    payload.documents = {
      ...payload.documents,
      resume: payload.documents.resume?.url || null,
      offer_letter: payload.documents.offer_letter?.url || null,
      joining_letter: payload.documents.joining_letter?.url || null,
      other_docs: payload.documents.other_docs
        .filter(doc => typeof doc === 'string' || doc.url)
        .map(doc => doc.url ? { url: doc.url, public_id: doc.public_id } : doc)
    };
    
    // Stringify and append employee data
    fd.append('employeeData', JSON.stringify(payload));
  
    // Append main files
    if (formData.profile_image instanceof File) {
      fd.append('profile_image', formData.profile_image);
    }
    
    if (formData.aadhar_document instanceof File) {
      fd.append('aadhar_document', formData.aadhar_document);
    }
    
    if (formData.pan_document instanceof File) {
      fd.append('pan_document', formData.pan_document);
    }
    
    // FIXED: Append experience letters with same field name
    formData.work_experience.forEach(exp => {
      if (exp.experience_letter instanceof File) {
        fd.append('experience_letter', exp.experience_letter); // SAME FIELD NAME
      }
    });
    
    // Append document files
    ['resume', 'offer_letter', 'joining_letter'].forEach(docType => {
      const doc = formData.documents[docType];
      if (doc instanceof File) {
        fd.append(docType, doc);
      }
    });
    
    // Append other documents
    formData.documents.other_docs.forEach(doc => {
      if (doc instanceof File) {
        fd.append('other_docs', doc);
      }
    });
  
    try {
      const res = isEditMode 
        ? await axiosInstance.put(`${API_URL}/api/employees/${employeeId}`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
        : await axiosInstance.post(`${API_URL}/api/employees`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
      
      if (!res.data.success) {
        throw new Error(res.data.message || 'Failed to save employee');
      }
      
      navigate('/employees');
    } catch (err) {
      setError(err.message || 'An error occurred while saving');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-6"
      >
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="flex items-center mb-6"
        >
          <motion.button
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/employees")}
            className="mr-4 p-2 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50 backdrop-blur-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </motion.button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditMode ? "Edit Employee" : "Add New Employee"}
          </h2>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-red-100/80 backdrop-blur-sm text-red-700 rounded-lg border border-red-200/50"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.form
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-blue-gray-200/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20 dark:border-gray-700/50"
          encType="multipart/form-data"
        >
          <div className="space-y-8">
            {/* Personal Information Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-white">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-white/20 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Profile Image
                  </label>
                  <input
                    type="file"
                    name="profile_image"
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-white/20 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
                    accept="image/*"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password {!isEditMode && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={isEditMode ? "Leave blank to keep current password" : ""}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-white/20 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
                    required={!isEditMode}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Primary Contact
                  </label>
                  <input
                    type="text"
                    name="contact1"
                    value={formData.contact1}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-white/20 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Alternate Contact
                  </label>
                  <input
                    type="text"
                    name="contact2"
                    value={formData.contact2}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-white/20 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-white/20 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-white/20 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Aadhar Number
                  </label>
                  <input
                    type="text"
                    name="aadhar_number"
                    value={formData.aadhar_number}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-white/20 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Aadhar Document
                  </label>
                  <input
                    type="file"
                    name="aadhar_document"
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-white/20 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    PAN Number
                  </label>
                  <input
                    type="text"
                    name="pan_number"
                    value={formData.pan_number}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-white/20 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    PAN Document
                  </label>
                  <input
                    type="file"
                    name="pan_document"
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-white/20 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>
              </div>
            </motion.div>

            {/* Employment Details Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-white">
                Employment Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Work Start Date
                  </label>
                  <input
                    type="date"
                    name="work_start_date"
                    value={formData.work_start_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-white/20 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Employment Type
                  </label>
                  <select
                    name="employment_type"
                    value={formData.employment_type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-white/20 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
                  >
                    <option value="Intern">Intern</option>
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Consultant">Consultant</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-white/20 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Employee Status
                  </label>
                  <select
                    name="employee_status"
                    value={formData.employee_status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-white/20 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Resigned">Resigned</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Documents Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25 }}
            >
              <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-white">
                Documents
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Resume
                  </label>
                  <input
                    type="file"
                    onChange={(e) => handleDocumentChange('resume', e)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-white/20 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
                    accept=".pdf,.doc,.docx"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Offer Letter
                  </label>
                  <input
                    type="file"
                    onChange={(e) => handleDocumentChange('offer_letter', e)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-white/20 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
                    accept=".pdf,.doc,.docx"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Joining Letter
                  </label>
                  <input
                    type="file"
                    onChange={(e) => handleDocumentChange('joining_letter', e)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-white/20 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
                    accept=".pdf,.doc,.docx"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Other Documents
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={handleOtherDocsChange}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-white/20 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </div>
              </div>
            </motion.div>

            {/* Work Experience Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-white">
                Work Experience
              </h3>
              {formData.work_experience.map((exp, index) => (
                <div key={index} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        name="company_name"
                        value={exp.company_name}
                        onChange={(e) => handleExperienceChange(index, e)}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-white/20 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Role
                      </label>
                      <input
                        type="text"
                        name="role"
                        value={exp.role}
                        onChange={(e) => handleExperienceChange(index, e)}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-white/20 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Duration
                      </label>
                      <input
                        type="text"
                        name="duration"
                        value={exp.duration}
                        onChange={(e) => handleExperienceChange(index, e)}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-white/20 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Experience Letter
                      </label>
                      <input
                        type="file"
                        name="experience_letter"
                        onChange={(e) => handleExperienceChange(index, e)}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-white/20 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
                        accept=".pdf,.doc,.docx"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExperience(index)}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addExperience}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Experience
              </button>
            </motion.div>

            {/* Salary Details Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.35 }}
            >
              <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-white">
                Salary Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Monthly Salary
                  </label>
                  <input
                    type="number"
                    name="salary_details.monthly_salary"
                    value={formData.salary_details.monthly_salary}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-white/20 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bank Account Number
                  </label>
                  <input
                    type="text"
                    name="salary_details.bank_account_number"
                    value={formData.salary_details.bank_account_number}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-white/20 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    name="salary_details.ifsc_code"
                    value={formData.salary_details.ifsc_code}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-white/20 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    name="salary_details.bank_name"
                    value={formData.salary_details.bank_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-white/20 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    PF Account Number
                  </label>
                  <input
                    type="text"
                    name="salary_details.pf_account_number"
                    value={formData.salary_details.pf_account_number}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-white/20 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
                  />
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
            className="mt-8 flex justify-end space-x-3"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => navigate("/employees")}
              className="px-4 py-2 bg-gray-500/80 backdrop-blur-sm rounded-lg shadow-lg text-sm font-medium text-white hover:bg-gray-600/80 border border-white/10"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-gray-800/80 backdrop-blur-sm text-white rounded-lg hover:bg-gray-700/80 disabled:opacity-50 shadow-lg border border-white/10"
            >
              {loading
                ? "Saving..."
                : isEditMode
                ? "Update Employee"
                : "Add Employee"}
            </motion.button>
          </motion.div>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default AddEmployee;
