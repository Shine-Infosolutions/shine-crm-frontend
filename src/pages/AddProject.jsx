import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from '../utils/axiosConfig';
import { useAppContext } from "../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";

function AddProject() {
  const navigate = useNavigate();
  const location = useLocation();
  const { API_URL } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [projectId, setProjectId] = useState(null);
  const [projectToEdit, setProjectToEdit] = useState(null);
  
  const [formData, setFormData] = useState({
    // Common fields
    projectName: "",
    projectType: "",
    clientId: "",
    clientName: "", // Backward compatibility
    clientContact: "", // Backward compatibility
    assignedManager: "",
    assignedTeam: [],
    status: "Active",
    priority: "Medium",
    notes: "",
    isLeadProject: false,
    
    // One-time project fields
    oneTimeProject: {
      scope: "",
      totalAmount: "",
      advanceAmount: "",
      paidAmount: "",
      startDate: "",
      expectedDeliveryDate: "",
      finalHandoverDate: "",
      sourceCodeLink: "",
      deploymentDetails: "",
      warrantyPeriod: "",
      paymentMilestones: [],
    },
    
    // Recurring project fields
    recurringProject: {
      serviceType: "",
      billingCycle: "",
      recurringAmount: "",
      contractStartDate: "",
      contractEndDate: "",
      autoRenew: false,
      nextBillingDate: "",
      billingStatus: "Active",
      lastInvoiceId: "",
      missedBillingCount: 0,
      autoInvoice: false,
      slaDeliverables: "",
      billingHistory: [],
    },
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);

  // Check if we're in edit mode by looking for an ID in the URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get("id");

    if (id) {
      setIsEditing(true);
      setProjectId(id);
      fetchProjectData(id);
    } else {
      // Check for legacy state-based editing
      const legacyIsEditing = location.state?.isEditing || false;
      const legacyProject = location.state?.project || null;
      
      if (legacyIsEditing && legacyProject) {
        setIsEditing(true);
        setProjectId(legacyProject._id);
        setProjectToEdit(legacyProject);
      }
    }
  }, [location]);

  // Fetch project data if in edit mode
  const fetchProjectData = async (id) => {
    try {
      setIsSubmitting(true);
      const response = await api.get(`/api/projects/${id}`);
      const data = response.data;

      if (!data) {
        throw new Error("Failed to fetch project data");
      }

      setProjectToEdit(data);
    } catch (err) {
      setError(err.message || "Failed to load project data");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch employees and clients
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [employeesRes, clientsRes] = await Promise.all([
          api.get('/api/employees'),
          api.get('/api/leads')
        ]);
        setEmployees(employeesRes.data.data || []);
        setClients(clientsRes.data.data || []);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    fetchData();
  }, []);

  // Pre-fill form if editing
  useEffect(() => {
    if (isEditing && projectToEdit) {
      const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toISOString().split("T")[0];
      };

      setFormData({
        projectName: projectToEdit.projectName || "",
        projectType: projectToEdit.projectType || "",
        clientId: projectToEdit.clientId || "",
        clientName: projectToEdit.clientName || "",
        clientContact: projectToEdit.clientContact || "",
        assignedManager: projectToEdit.assignedManager || "",
        assignedTeam: projectToEdit.assignedTeam || [],
        status: projectToEdit.status || "Active",
        priority: projectToEdit.priority || "Medium",
        notes: projectToEdit.notes || "",
        isLeadProject: projectToEdit.isLeadProject || false,
        
        oneTimeProject: {
          scope: projectToEdit.oneTimeProject?.scope || "",
          totalAmount: projectToEdit.oneTimeProject?.totalAmount || "",
          advanceAmount: projectToEdit.oneTimeProject?.advanceAmount || "",
          paidAmount: projectToEdit.oneTimeProject?.paidAmount || "",
          startDate: formatDate(projectToEdit.oneTimeProject?.startDate),
          expectedDeliveryDate: formatDate(projectToEdit.oneTimeProject?.expectedDeliveryDate),
          finalHandoverDate: formatDate(projectToEdit.oneTimeProject?.finalHandoverDate),
          sourceCodeLink: projectToEdit.oneTimeProject?.sourceCodeLink || "",
          deploymentDetails: projectToEdit.oneTimeProject?.deploymentDetails || "",
          warrantyPeriod: projectToEdit.oneTimeProject?.warrantyPeriod || "",
          paymentMilestones: projectToEdit.oneTimeProject?.paymentMilestones || [],
        },
        
        recurringProject: {
          serviceType: projectToEdit.recurringProject?.serviceType || "",
          billingCycle: projectToEdit.recurringProject?.billingCycle || "",
          recurringAmount: projectToEdit.recurringProject?.recurringAmount || "",
          contractStartDate: formatDate(projectToEdit.recurringProject?.contractStartDate),
          contractEndDate: formatDate(projectToEdit.recurringProject?.contractEndDate),
          autoRenew: projectToEdit.recurringProject?.autoRenew || false,
          nextBillingDate: formatDate(projectToEdit.recurringProject?.nextBillingDate),
          billingStatus: projectToEdit.recurringProject?.billingStatus || "Active",
          lastInvoiceId: projectToEdit.recurringProject?.lastInvoiceId || "",
          missedBillingCount: projectToEdit.recurringProject?.missedBillingCount || 0,
          autoInvoice: projectToEdit.recurringProject?.autoInvoice || false,
          slaDeliverables: projectToEdit.recurringProject?.slaDeliverables || "",
          billingHistory: projectToEdit.recurringProject?.billingHistory || [],
        },
      });
    }
  }, [isEditing, projectToEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'isLeadProject' && checked) {
      // Reset client fields when switching to lead project
      setFormData(prev => ({
        ...prev,
        [name]: checked,
        clientId: "",
        clientName: "",
        clientContact: ""
      }));
    } else if (name === 'clientId' && formData.isLeadProject) {
      // Auto-fill lead data when selecting a lead
      const selectedLead = clients.find(client => client._id === value);
      if (selectedLead) {
        setFormData(prev => ({
          ...prev,
          clientId: value,
          clientName: selectedLead.name,
          clientContact: selectedLead.number
        }));
      }
    } else if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: type === 'checkbox' ? checked : value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const saveProject = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Clean data based on project type
      const submitData = {
        projectName: formData.projectName,
        projectType: formData.projectType,
        assignedManager: formData.assignedManager,
        assignedTeam: formData.assignedTeam,
        status: formData.status,
        priority: formData.priority,
        notes: formData.notes,
        // Backward compatibility
        clientName: formData.clientName,
        clientContact: formData.clientContact,
      };

      // Only include clientId if it's not empty
      if (formData.clientId) {
        submitData.clientId = formData.clientId;
      }

      if (formData.projectType === 'ONE_TIME') {
        if (!formData.oneTimeProject.totalAmount) {
          setError("Total amount is required for one-time projects");
          return;
        }
        submitData.oneTimeProject = formData.oneTimeProject;
        submitData.recurringProject = undefined;
      } else if (formData.projectType === 'RECURRING') {
        if (!formData.recurringProject.recurringAmount) {
          setError("Recurring amount is required for recurring projects");
          return;
        }
        submitData.recurringProject = formData.recurringProject;
        submitData.oneTimeProject = undefined;
      }

      let projectResponse;
      if (isEditing && projectId) {
        projectResponse = await api.put(`/api/projects/${projectId}`, submitData);
      } else {
        projectResponse = await api.post(`/api/projects`, submitData);
      }

      // Auto create invoice if Auto Invoice is checked for recurring projects
      if (formData.projectType === 'RECURRING' && formData.recurringProject.autoInvoice) {
        try {
          // Get client data from lead if available
          let clientData = {
            name: formData.clientName,
            phone: formData.clientContact,
            email: 'client@example.com',
            address: 'N/A'
          };

          if (formData.clientId) {
            const clientResponse = await api.get(`/api/leads/${formData.clientId}`);
            if (clientResponse.data) {
              clientData = {
                name: clientResponse.data.name,
                phone: clientResponse.data.number,
                email: clientResponse.data.email || 'client@example.com',
                address: clientResponse.data.address || 'N/A'
              };
            }
          }

          const invoiceData = {
            isGSTInvoice: false,
            invoiceDate: new Date().toISOString(),
            dueDate: formData.recurringProject.nextBillingDate || new Date().toISOString(),
            customerName: clientData.name,
            customerAddress: clientData.address,
            customerPhone: clientData.phone,
            customerEmail: clientData.email,
            productDetails: [{
              description: `${formData.projectName} - ${formData.recurringProject.serviceType || 'Service'} (${formData.recurringProject.billingCycle || 'Monthly'})`,
              unit: 'Service',
              quantity: 1,
              price: formData.recurringProject.recurringAmount || 0,
              amount: formData.recurringProject.recurringAmount || 0
            }],
            amountDetails: {
              totalAmount: formData.recurringProject.recurringAmount || 0
            }
          };
          
          await api.post('/api/invoices/create', invoiceData);
        } catch (invoiceError) {
          console.error('Failed to create auto invoice:', invoiceError);
        }
      }

      navigate("/projects");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save project. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
          onClick={() => navigate("/projects")}
          className="mr-4 p-2 rounded-full bg-blue-gray-200/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 hover:bg-white/90 dark:hover:bg-gray-700/90 shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </motion.button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditing ? "Edit Project" : "Add New Project"}
        </h2>
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
        <form className="space-y-6" onSubmit={saveProject}>
          {/* Common Fields */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Project Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name *</label>
                <input
                  type="text"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleChange}
                  placeholder="Enter descriptive project title"
                  className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Type *</label>
                <select
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50"
                  required
                >
                  <option value="">Select project type</option>
                  <option value="ONE_TIME">One-Time Project</option>
                  <option value="RECURRING">Recurring Service</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50"
                >
                  {formData.projectType === 'ONE_TIME' ? (
                    <>
                      <option value="Pending">Pending</option>
                      <option value="Start">Start</option>
                      <option value="Progress">Progress</option>
                      <option value="Completed">Completed</option>
                    </>
                  ) : (
                    <>
                      <option value="Active">Active</option>
                      <option value="Hold">Hold</option>
                      <option value="Close">Close</option>
                    </>
                  )}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Additional project notes or requirements"
                className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          {/* Client & Ownership */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Client & Ownership</h3>
            
            {/* Is Lead Project Checkbox */}
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isLeadProject"
                  checked={formData.isLeadProject}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Is Lead Project</span>
              </label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {formData.isLeadProject ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Lead *</label>
                  <select
                    name="clientId"
                    value={formData.clientId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50"
                    required
                  >
                    <option value="">Select lead</option>
                    {clients.map(client => (
                      <option key={client._id} value={client._id}>{client.name} - {client.number}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client Name *</label>
                    <input
                      type="text"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleChange}
                      placeholder="Client or company name"
                      className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client Contact *</label>
                    <input
                      type="text"
                      name="clientContact"
                      value={formData.clientContact}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setFormData(prev => ({ ...prev, clientContact: value }));
                      }}
                      placeholder="10-digit phone number"
                      className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50"
                      required
                    />
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assigned Manager *</label>
                <select
                  name="assignedManager"
                  value={formData.assignedManager}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50"
                  required
                >
                  <option value="">Select manager</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Dynamic Fields Based on Project Type */}
          <AnimatePresence mode="wait">
            {formData.projectType === 'ONE_TIME' && (
              <motion.div
                key="one-time"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">One-Time Project Details</h3>
                
                {/* Financial Section */}
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="text-md font-medium mb-3 text-green-800 dark:text-green-400">Financial Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Amount *</label>
                      <input
                        type="number"
                        name="oneTimeProject.totalAmount"
                        value={formData.oneTimeProject.totalAmount}
                        onChange={handleChange}
                        placeholder="Total project cost in ₹"
                        className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Advance Amount</label>
                      <input
                        type="number"
                        name="oneTimeProject.advanceAmount"
                        value={formData.oneTimeProject.advanceAmount}
                        onChange={handleChange}
                        placeholder="Advance received in ₹"
                        className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Paid Amount</label>
                      <input
                        type="number"
                        name="oneTimeProject.paidAmount"
                        value={formData.oneTimeProject.paidAmount}
                        onChange={handleChange}
                        placeholder="Total amount paid in ₹"
                        className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                  </div>
                  
                  {formData.oneTimeProject.totalAmount && formData.oneTimeProject.paidAmount && (
                    <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                      <span className="font-medium text-blue-800 dark:text-blue-400">
                        Pending Amount: ₹{(parseFloat(formData.oneTimeProject.totalAmount) - parseFloat(formData.oneTimeProject.paidAmount)).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Project Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Scope</label>
                    <textarea
                      name="oneTimeProject.scope"
                      value={formData.oneTimeProject.scope}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Detailed project scope and requirements"
                      className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                    <input
                      type="date"
                      name="oneTimeProject.startDate"
                      value={formData.oneTimeProject.startDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expected Delivery</label>
                    <input
                      type="date"
                      name="oneTimeProject.expectedDeliveryDate"
                      value={formData.oneTimeProject.expectedDeliveryDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Final Handover</label>
                    <input
                      type="date"
                      name="oneTimeProject.finalHandoverDate"
                      value={formData.oneTimeProject.finalHandoverDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source Code Link</label>
                    <input
                      type="url"
                      name="oneTimeProject.sourceCodeLink"
                      value={formData.oneTimeProject.sourceCodeLink}
                      onChange={handleChange}
                      placeholder="https://github.com/repo-link"
                      className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deployment Details</label>
                    <input
                      type="text"
                      name="oneTimeProject.deploymentDetails"
                      value={formData.oneTimeProject.deploymentDetails}
                      onChange={handleChange}
                      placeholder="Hosting provider, server details"
                      className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Warranty Period</label>
                    <input
                      type="text"
                      name="oneTimeProject.warrantyPeriod"
                      value={formData.oneTimeProject.warrantyPeriod}
                      onChange={handleChange}
                      placeholder="e.g., 6 months, 1 year"
                      className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {formData.projectType === 'RECURRING' && (
              <motion.div
                key="recurring"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recurring Service Details</h3>
                
                {/* Financial Section */}
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="text-md font-medium mb-3 text-blue-800 dark:text-blue-400">Billing Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recurring Amount *</label>
                      <input
                        type="number"
                        name="recurringProject.recurringAmount"
                        value={formData.recurringProject.recurringAmount}
                        onChange={handleChange}
                        placeholder="Monthly/Quarterly/Yearly amount"
                        className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Billing Cycle</label>
                      <select
                        name="recurringProject.billingCycle"
                        value={formData.recurringProject.billingCycle}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50"
                      >
                        <option value="">Select billing cycle</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Yearly">Yearly</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Billing Status</label>
                      <select
                        name="recurringProject.billingStatus"
                        value={formData.recurringProject.billingStatus}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50"
                      >
                        <option value="Active">Active</option>
                        <option value="Paused">Paused</option>
                        <option value="Stopped">Stopped</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service Type</label>
                    <select
                      name="recurringProject.serviceType"
                      value={formData.recurringProject.serviceType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="">Select service type</option>
                      <option value="SMM">Social Media Management</option>
                      <option value="SEO">SEO Services</option>
                      <option value="Maintenance">Website Maintenance</option>
                      <option value="Ads">Digital Advertising</option>
                      <option value="Content">Content Creation</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contract Start</label>
                    <input
                      type="date"
                      name="recurringProject.contractStartDate"
                      value={formData.recurringProject.contractStartDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contract End</label>
                    <input
                      type="date"
                      name="recurringProject.contractEndDate"
                      value={formData.recurringProject.contractEndDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Next Billing Date</label>
                    <input
                      type="date"
                      name="recurringProject.nextBillingDate"
                      value={formData.recurringProject.nextBillingDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  
                  {isEditing && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Invoice ID</label>
                      <input
                        type="text"
                        name="recurringProject.lastInvoiceId"
                        value={formData.recurringProject.lastInvoiceId}
                        onChange={handleChange}
                        placeholder="INV-2024-001"
                        className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                  )}
                  
                  {isEditing && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Missed Billing Count</label>
                      <input
                        type="number"
                        name="recurringProject.missedBillingCount"
                        value={formData.recurringProject.missedBillingCount}
                        onChange={handleChange}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="recurringProject.autoRenew"
                        checked={formData.recurringProject.autoRenew}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Auto Renew</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="recurringProject.autoInvoice"
                        checked={formData.recurringProject.autoInvoice}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Auto Invoice</span>
                    </label>
                  </div>
                  
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SLA & Deliverables</label>
                    <textarea
                      name="recurringProject.slaDeliverables"
                      value={formData.recurringProject.slaDeliverables}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Service level agreements and expected deliverables"
                      className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-end gap-3 pt-6">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => navigate("/projects")}
              className="px-4 py-2 rounded-lg bg-white/80 dark:bg-gray-700/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 hover:bg-white/90 dark:hover:bg-gray-600/90"
              disabled={isSubmitting}
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="px-4 py-2 border bg-gray-800/90 text-white rounded-lg hover:bg-gray-700/90 disabled:opacity-50 backdrop-blur-xl"
              disabled={isSubmitting || !formData.projectType}
            >
              {isSubmitting
                ? isEditing
                  ? "Updating..."
                  : "Saving..."
                : isEditing
                ? "Update Project"
                : "Save Project"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default AddProject;
