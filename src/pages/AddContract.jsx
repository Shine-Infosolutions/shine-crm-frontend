import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import axios from 'axios';

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
        const response = await axios.get(`${API_URL}/api/employees/${employeeId}`);
        const data = response.data.data;
        setEmployee(data);
        
        // Pre-fill form with employee data
        setContract(prev => ({
          ...prev,
          job_title: data.designation || '',
          start_date: formatDateForInput(data.work_start_date) || formatDateForInput(new Date()),
          effective_date: formatDateForInput(data.work_start_date) || formatDateForInput(new Date()),
          compensation: {
            ...prev.compensation,
            monthly_salary: data.salary_details?.monthly_salary || 0
          }
        }));
      } catch (error) {
        console.error('Error fetching employee:', error);
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
      // Update the employee with the new contract
      await axios.put(`${API_URL}/api/employees/${employeeId}/contract/update`, contract);
      
      // Redirect to contracts page
      navigate('/contracts');
    } catch (error) {
      console.error('Error creating contract:', error);
      setError('Failed to create contract. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    window.open(`${API_URL}/api/employees/${employeeId}/contract/preview`, '_blank');
  };

  const handleDownload = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/employees/${employeeId}/contract/download`,
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
       console.error('Download failed:', error);
       setError('Failed to download contract');
     }
   };

  if (loading) return <div className="p-6 text-center">Loading employee data...</div>;
  if (!employee) return <div className="p-6 text-center">Employee not found</div>;

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/contracts')}
          className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
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
        </button>
        <h2 className="text-2xl font-bold">Create Contract for {employee.name}</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Company Details Section */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-xl font-semibold mb-4">Company Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  name="company.name"
                  value={contract.company.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Address
                </label>
                <input
                  type="text"
                  name="company.address"
                  value={contract.company.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contact Phone
                </label>
                <input
                  type="text"
                  name="company.contact.phone"
                  value={contract.company.contact.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  name="company.contact.email"
                  value={contract.company.contact.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Employee Details Section */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-xl font-semibold mb-4">Employee Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={employee.name}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white cursor-not-allowed"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Employee ID
                </label>
                <input
                  type="text"
                  value={employee.employee_id}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white cursor-not-allowed"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={employee.address}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white cursor-not-allowed"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Effective Date
                </label>
                <input
                  type="date"
                  name="effective_date"
                  value={contract.effective_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Position & Responsibilities Section */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-xl font-semibold mb-4">Position & Responsibilities</h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Job Title
                </label>
                <input
                  type="text"
                  name="job_title"
                  value={contract.job_title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Employment Type Section */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-xl font-semibold mb-4">Type of Employment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Employment Type
                </label>
                <select
                  name="contract_type"
                  value={contract.contract_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Intern">Intern</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Consultant">Consultant</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={contract.start_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              {['Intern', 'Freelance', 'Contract'].includes(contract.contract_type) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={contract.end_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Working Hours & Location Section */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-xl font-semibold mb-4">Working Hours & Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Working Hours
                </label>
                <input
                  type="text"
                  name="working_hours.timing"
                  value={contract.working_hours.timing}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Days per Week
                </label>
                <input
                  type="number"
                  name="working_hours.days_per_week"
                  value={contract.working_hours.days_per_week}
                  onChange={handleChange}
                  min="1"
                  max="7"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Work Location
                </label>
                <input
                  type="text"
                  name="working_hours.location"
                  value={contract.working_hours.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Compensation Section */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-xl font-semibold mb-4">Compensation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monthly Salary (₹)
                </label>
                <input
                  type="number"
                  name="compensation.monthly_salary"
                  value={contract.compensation.monthly_salary}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Salary Payment Date
                </label>
                <input
                  type="text"
                  name="compensation.salary_date"
                  value={contract.compensation.salary_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  placeholder="e.g. 5th of each month"
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Termination Section */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-xl font-semibold mb-4">Termination</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notice Period (days)
                </label>
                <input
                  type="number"
                  name="termination.notice_period_days"
                  value={contract.termination.notice_period_days}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-gray-200 dark:border-gray-700">
          <div className="mt-2 sm:mt-10">
  <div className="border-gray-200 dark:border-gray-700 pt-3">
    <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
      
      {/* Cancel Button */}
      <button
        type="button"
        onClick={() => navigate('/contracts')}
        className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        Cancel
      </button>

      {/* Preview Button */}
      <button
        type="button"
        onClick={handlePreview}
        className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
        </svg>
        Preview
      </button>

      {/* Download Button */}
      <button
        type="button"
        onClick={handleDownload}
        className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
        Download
      </button>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={saving}
        className="w-full sm:w-auto px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 flex items-center justify-center"
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
      </button>
    </div>
  </div>
</div>

</div>

        </form>
      </div>
    </div>
  );
};

export default AddContract;