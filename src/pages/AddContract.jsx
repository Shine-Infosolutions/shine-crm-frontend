import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { motion } from 'framer-motion';
import api from '../utils/axiosConfig';

const AddContract = () => {
  const { id: employeeId } = useParams();
  const { API_URL } = useAppContext();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [contract, setContract] = useState({
    company: {
      name: "Shine Infosolutions",
      address: "Gorakhpur UP",
      contact: {
        phone: "9876567897",
        email: "shineinfo@gmail.com"
      }
    },
    effective_date: '',
    job_title: '',
    contract_type: 'Full Time',
    start_date: '',
    end_date: '',
    working_hours: {
      timing: '10 AM – 6 PM',
      days_per_week: 6,
      location: 'Head Office Gorahpur'
    },
    compensation: {
      monthly_salary: 0,
      salary_date: '5th'
    },
    termination: {
      notice_period_days: 30
    },
    acceptance: {
      accepted: false
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Format date to YYYY-MM-DD for input fields
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await api.get(`/api/employees/${employeeId}`);
        const data = response.data.data;
        setEmployee(data);
        
        // Reset contract state first, then pre-fill with fresh employee data
        setContract({
          company: {
            name: "Shine Infosolutions",
            address: "Gorakhpur UP",
            contact: {
              phone: "9876567897",
              email: "shineinfo@gmail.com"
            }
          },
          effective_date: formatDateForInput(data.work_start_date) || formatDateForInput(new Date()),
          job_title: data.designation || '',
          contract_type: data.employment_type || 'Full Time',
          start_date: formatDateForInput(data.work_start_date) || formatDateForInput(new Date()),
          end_date: '',
          working_hours: {
            timing: '10 AM – 6 PM',
            days_per_week: 6,
            location: 'Head Office Gorahpur'
          },
          compensation: {
            monthly_salary: data.salary_details?.monthly_salary || 0,
            salary_date: '5th'
          },
          termination: {
            notice_period_days: 30
          },
          acceptance: {
            accepted: false
          }
        });
      } catch (error) {
        setError('Failed to load employee data');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [employeeId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested objects
    if (name.includes('.')) {
      const [parent, child, subChild] = name.split('.');
      
      if (subChild) {
        // Three-level nesting (e.g., company.contact.phone)
        setContract(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: {
              ...prev[parent][child],
              [subChild]: value
            }
          }
        }));
      } else {
        // Two-level nesting (e.g., working_hours.timing)
        setContract(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: name.endsWith('days_per_week') || name.endsWith('notice_period_days') 
              ? parseInt(value) 
              : value
          }
        }));
      }
    } else {
      // Top-level fields
      setContract(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      // Send the complete contract data to replace existing
      const response = await api.put(`/api/employees/${employeeId}/contract/update`, contract);
      
      if (response.data.success) {
        navigate('/contracts');
      }
    } catch (error) {
      setError('Failed to create contract. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    const token = localStorage.getItem('token');
    const url = `${API_URL}/api/employees/${employeeId}/contract/preview${token ? `?token=${token}` : ''}`;
    window.open(url, '_blank');
  };

  const handleDownload = async () => {
    try {
      const response = await api.get(
        `/api/employees/${employeeId}/contract/download`,
        { responseType: 'blob' }
      );
      
      // Create blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${employee.name}_contract.pdf`);
      document.body.appendChild(link);
      link.click();
       // Clean up
       window.URL.revokeObjectURL(url);
       document.body.removeChild(link);
     } catch (error) {
       setError('Failed to download contract');
     }
   };

  if (loading) return <div className="p-6 text-center">Loading employee data...</div>;
  if (!employee) return <div className="p-6 text-center">Employee not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center mb-6"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/contracts')}
          className="mr-4 p-2 rounded-full bg-blue-gray-200/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 hover:bg-white/90 dark:hover:bg-gray-700/90 shadow-lg"
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
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="text-2xl font-bold text-gray-900 dark:text-white"
        >
          Create Contract for {employee.name}
        </motion.h2>
      </motion.div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-red-100/80 text-red-700 rounded-lg backdrop-blur-xl border border-red-200/50"
        >
          {error}
        </motion.div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-blue-gray-200/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6"
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Company Details Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="border-b border-gray-200/50 dark:border-gray-700/50 pb-6"
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Company Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: "Company Name", name: "company.name", type: "text", value: contract.company.name },
                { label: "Company Address", name: "company.address", type: "text", value: contract.company.address },
                { label: "Contact Phone", name: "company.contact.phone", type: "text", value: contract.company.contact.phone },
                { label: "Contact Email", name: "company.contact.email", type: "email", value: contract.company.contact.email }
              ].map((field, index) => (
                <motion.div
                  key={field.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {field.label}
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type={field.type}
                    name={field.name}
                    value={field.value}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 transition-all duration-0.3"
                    required
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* Employee Details Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="border-b border-gray-200/50 dark:border-gray-700/50 pb-6"
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Employee Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: "Full Name", value: employee.name, readOnly: true },
                { label: "Employee ID", value: employee.employee_id, readOnly: true },
                { label: "Address", value: employee.address, readOnly: true },
                { label: "Effective Date", name: "effective_date", type: "date", value: contract.effective_date }
              ].map((field, index) => (
                <motion.div
                  key={field.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {field.label}
                  </label>
                  <motion.input
                    whileFocus={!field.readOnly ? { scale: 1.02 } : {}}
                    type={field.type || "text"}
                    name={field.name}
                    value={field.value || ''}
                    onChange={field.readOnly ? undefined : handleChange}
                    readOnly={field.readOnly}
                    className={`w-full px-4 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg backdrop-blur-sm dark:text-white transition-all duration-0.3 ${
                      field.readOnly 
                        ? 'bg-white dark:bg-gray-700 cursor-not-allowed' 
                        : 'bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500/50'
                    }`}
                    required={!field.readOnly}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* Position & Responsibilities Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
            className="border-b border-gray-200/50 dark:border-gray-700/50 pb-6"
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Position & Responsibilities</h3>
            <div className="grid grid-cols-1 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.8 }}
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Job Title
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="text"
                  name="job_title"
                  value={contract.job_title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 transition-all duration-0.3"
                  required
                />
              </motion.div>
            </div>
          </motion.div>
          
          {/* Employment Type Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.9 }}
            className="border-b border-gray-200/50 dark:border-gray-700/50 pb-6"
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Type of Employment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 1.0 }}
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Employment Type
                </label>
                <motion.select
                  whileFocus={{ scale: 1.02 }}
                  name="contract_type"
                  value={contract.contract_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 transition-all duration-0.3"
                  required
                >
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Intern">Intern</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Consultant">Consultant</option>
                  <option value="Contract">Contract</option>
                </motion.select>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 1.1 }}
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="date"
                  name="start_date"
                  value={contract.start_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 transition-all duration-0.3"
                  required
                />
              </motion.div>
              
              {['Intern', 'Freelance', 'Contract'].includes(contract.contract_type) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 1.2 }}
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="date"
                    name="end_date"
                    value={contract.end_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 transition-all duration-0.3"
                    required
                  />
                </motion.div>
              )}
            </div>
          </motion.div>
          
          {/* Working Hours & Location Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 1.3 }}
            className="border-b border-gray-200/50 dark:border-gray-700/50 pb-6"
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Working Hours & Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Working Hours", name: "working_hours.timing", value: contract.working_hours.timing },
                { label: "Days per Week", name: "working_hours.days_per_week", type: "number", value: contract.working_hours.days_per_week, min: 1, max: 7 },
                { label: "Work Location", name: "working_hours.location", value: contract.working_hours.location }
              ].map((field, index) => (
                <motion.div
                  key={field.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 1.4 + index * 0.1 }}
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {field.label}
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type={field.type || "text"}
                    name={field.name}
                    value={field.value}
                    onChange={handleChange}
                    min={field.min}
                    max={field.max}
                    className="w-full px-4 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 transition-all duration-0.3"
                    required
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* Compensation Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 1.5 }}
            className="border-b border-gray-200/50 dark:border-gray-700/50 pb-6"
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Compensation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: "Monthly Salary (₹)", name: "compensation.monthly_salary", type: "number", value: contract.compensation.monthly_salary, min: 0 },
                { label: "Salary Payment Date", name: "compensation.salary_date", value: contract.compensation.salary_date, placeholder: "e.g. 5th of each month" }
              ].map((field, index) => (
                <motion.div
                  key={field.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 1.6 + index * 0.1 }}
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {field.label}
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type={field.type || "text"}
                    name={field.name}
                    value={field.value}
                    onChange={handleChange}
                    min={field.min}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 transition-all duration-0.3"
                    required
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* Termination Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 1.7 }}
            className="border-b border-gray-200/50 dark:border-gray-700/50 pb-6"
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Termination</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 1.8 }}
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notice Period (days)
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="number"
                  name="termination.notice_period_days"
                  value={contract.termination.notice_period_days}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 transition-all duration-0.3"
                  required
                />
              </motion.div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 1.9 }}
            className="mt-4 pt-4 border-gray-200/50 dark:border-gray-700/50"
          >
            <div className="mt-2 sm:mt-10">
              <div className="border-gray-200/50 dark:border-gray-700/50 pt-3">
                <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
                  
                  {/* Cancel Button */}
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => navigate('/contracts')}
                    className="w-full sm:w-auto px-4 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50/70 dark:hover:bg-gray-600/70 transition-all duration-0.3"
                  >
                    Cancel
                  </motion.button>

                  {/* Preview Button */}
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={handlePreview}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600/90 text-white rounded-lg hover:bg-blue-700/90 backdrop-blur-sm flex items-center justify-center transition-all duration-0.3"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Preview
                  </motion.button>

                  {/* Download Button */}
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={handleDownload}
                    className="w-full sm:w-auto px-4 py-2 bg-green-600/90 text-white rounded-lg hover:bg-green-700/90 backdrop-blur-sm flex items-center justify-center transition-all duration-0.3"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Download
                  </motion.button>

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto px-4 py-2 bg-gray-800/90 text-white rounded-lg hover:bg-gray-700/90 disabled:opacity-50 backdrop-blur-sm flex items-center justify-center transition-all duration-0.3"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Contract...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Create Contract
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddContract;
