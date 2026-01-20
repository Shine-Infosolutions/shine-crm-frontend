import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from '../utils/axiosConfig';
import { motion, AnimatePresence } from "framer-motion";

const ProjectInfo = React.memo(({ formData, handleChange }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name *</label>
      <input type="text" name="projectName" value={formData.projectName || ""} onChange={handleChange} placeholder="Enter project title" className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50" required />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Type *</label>
      <select name="projectType" value={formData.projectType || ""} onChange={handleChange} className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50" required>
        <option value="">Select project type</option>
        <option value="ONE_TIME">One-Time Project</option>
        <option value="RECURRING">Recurring Service</option>
      </select>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
      <select name="status" value={formData.status || ""} onChange={handleChange} className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50">
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
      <select name="priority" value={formData.priority || ""} onChange={handleChange} className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50">
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
        <option value="Critical">Critical</option>
      </select>
    </div>
  </div>
));

const ClientSection = React.memo(({ formData, handleChange, clients, setFormData }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {formData.isLeadProject ? (
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Lead *</label>
        <select name="clientId" value={formData.clientId || ""} onChange={handleChange} className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50" required>
          <option value="">Select lead</option>
          {clients.map(client => (<option key={client._id} value={client._id}>{client.name} - {client.number}</option>))}
        </select>
      </div>
    ) : (
      <>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client Name *</label>
          <input type="text" name="clientName" value={formData.clientName || ""} onChange={handleChange} placeholder="Client name" className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client Contact *</label>
          <input type="text" name="clientContact" value={formData.clientContact || ""} onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '').slice(0, 10);
            setFormData(prev => ({ ...prev, clientContact: value }));
          }} placeholder="10-digit phone" className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50" required />
        </div>
      </>
    )}
  </div>
));

function AddProject() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [projectId, setProjectId] = useState(null);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  
  const initialFormData = useMemo(() => ({
    projectName: "", projectType: "", clientId: "", clientName: "", clientContact: "",
    assignedManager: "", assignedTeam: [], status: "Active", priority: "Medium",
    notes: "", isLeadProject: false,
    oneTimeProject: {
      scope: "", totalAmount: "", advanceAmount: "", paidAmount: "",
      startDate: "", expectedDeliveryDate: "", finalHandoverDate: "",
      sourceCodeLink: "", deploymentDetails: "", warrantyPeriod: "", autoInvoice: false, lastInvoiceId: "",
      domainName: "", domainProvider: "", domainExpiryDate: ""
    },
    recurringProject: {
      serviceType: [], billingCycle: "", recurringAmount: "",
      contractStartDate: "", contractEndDate: "", nextBillingDate: "",
      billingStatus: "Active", autoInvoice: false, slaDeliverables: "", lastInvoiceId: "",
      socialMediaConfig: { platforms: [], deliverables: { posts: 0, reels: 0, stories: 0 } }
    }
  }), []);
  
  const [formData, setFormData] = useState(initialFormData);

  const fetchData = useCallback(async () => {
    try {
      const [employeesRes, clientsRes] = await Promise.all([
        api.get('/api/employees'),
        api.get('/api/leads')
      ]);
      setEmployees(employeesRes.data.data || []);
      setClients(clientsRes.data.data || []);
    } catch (err) {
      setError("Failed to fetch data");
    }
  }, []);

  const fetchProjectData = useCallback(async (id) => {
    try {
      setIsSubmitting(true);
      const response = await api.get(`/api/projects/${id}`);
      if (!response.data) throw new Error("Failed to fetch project data");
      setProjectToEdit(response.data);
    } catch (err) {
      setError(err.message || "Failed to load project data");
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get("id");
    if (id) {
      setIsEditing(true);
      setProjectId(id);
      fetchProjectData(id);
    } else if (location.state?.isEditing && location.state?.project) {
      setIsEditing(true);
      setProjectId(location.state.project._id);
      setProjectToEdit(location.state.project);
    }
    fetchData();
  }, [location, fetchProjectData, fetchData]);

  useEffect(() => {
    if (!isEditing || !projectToEdit) return;
    const formatDate = (dateString) => dateString ? new Date(dateString).toISOString().split("T")[0] : "";
    setFormData({
      ...initialFormData,
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
        ...initialFormData.oneTimeProject,
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
        autoInvoice: projectToEdit.oneTimeProject?.autoInvoice || false,
        lastInvoiceId: projectToEdit.oneTimeProject?.lastInvoiceId || "",
        domainName: projectToEdit.oneTimeProject?.domainName || "",
        domainProvider: projectToEdit.oneTimeProject?.domainProvider || "",
        domainExpiryDate: formatDate(projectToEdit.oneTimeProject?.domainExpiryDate)
      },
      recurringProject: {
        ...initialFormData.recurringProject,
        serviceType: Array.isArray(projectToEdit.recurringProject?.serviceType) 
          ? projectToEdit.recurringProject.serviceType 
          : (projectToEdit.recurringProject?.serviceType ? [projectToEdit.recurringProject.serviceType] : []),
        billingCycle: projectToEdit.recurringProject?.billingCycle || "",
        recurringAmount: projectToEdit.recurringProject?.recurringAmount || "",
        contractStartDate: formatDate(projectToEdit.recurringProject?.contractStartDate),
        contractEndDate: formatDate(projectToEdit.recurringProject?.contractEndDate),
        nextBillingDate: formatDate(projectToEdit.recurringProject?.nextBillingDate),
        billingStatus: projectToEdit.recurringProject?.billingStatus || "Active",
        autoInvoice: projectToEdit.recurringProject?.autoInvoice || false,
        slaDeliverables: projectToEdit.recurringProject?.slaDeliverables || "",
        lastInvoiceId: projectToEdit.recurringProject?.lastInvoiceId || "",
        socialMediaConfig: {
          platforms: projectToEdit.recurringProject?.socialMediaConfig?.platforms || [],
          deliverables: {
            posts: projectToEdit.recurringProject?.socialMediaConfig?.deliverables?.posts || 0,
            reels: projectToEdit.recurringProject?.socialMediaConfig?.deliverables?.reels || 0,
            stories: projectToEdit.recurringProject?.socialMediaConfig?.deliverables?.stories || 0
          }
        }
      }
    });
  }, [isEditing, projectToEdit, initialFormData]);

  // Optimized handlers
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'isLeadProject' && checked) {
      setFormData(prev => ({ ...prev, [name]: checked, clientId: "", clientName: "", clientContact: "" }));
    } else if (name === 'clientId' && formData.isLeadProject) {
      const selectedLead = clients.find(client => client._id === value);
      if (selectedLead) {
        setFormData(prev => ({
          ...prev, clientId: value, clientName: selectedLead.name, clientContact: selectedLead.number
        }));
      }
    } else if (name.includes('.')) {
      const parts = name.split('.');
      const finalValue = type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || 0 : value);
      
      setFormData(prev => {
        const newData = { ...prev };
        let current = newData;
        for (let i = 0; i < parts.length - 1; i++) {
          current[parts[i]] = { ...current[parts[i]] };
          current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = finalValue;
        
        // Auto-calculate next billing date when contract start date changes
        if (name === 'recurringProject.contractStartDate' || name === 'recurringProject.billingCycle') {
          const startDate = name === 'recurringProject.contractStartDate' ? value : newData.recurringProject.contractStartDate;
          const billingCycle = name === 'recurringProject.billingCycle' ? value : newData.recurringProject.billingCycle || 'Monthly';
          
          if (startDate) {
            const start = new Date(startDate);
            let nextBilling = new Date(start);
            
            switch (billingCycle) {
              case 'Monthly':
                nextBilling.setMonth(nextBilling.getMonth() + 1);
                break;
              case 'Quarterly':
                nextBilling.setMonth(nextBilling.getMonth() + 3);
                break;
              case 'Yearly':
                nextBilling.setFullYear(nextBilling.getFullYear() + 1);
                break;
              default:
                nextBilling.setMonth(nextBilling.getMonth() + 1);
            }
            
            newData.recurringProject.nextBillingDate = nextBilling.toISOString().split('T')[0];
          }
        }
        
        return newData;
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  }, [formData.isLeadProject, clients]);

  const handleServiceTypeChange = useCallback((serviceType, checked) => {
    setFormData(prev => ({
      ...prev,
      recurringProject: {
        ...prev.recurringProject,
        serviceType: checked 
          ? [...prev.recurringProject.serviceType, serviceType]
          : prev.recurringProject.serviceType.filter(t => t !== serviceType)
      }
    }));
  }, []);

  const handlePlatformChange = useCallback((platform, checked) => {
    setFormData(prev => ({
      ...prev,
      recurringProject: {
        ...prev.recurringProject,
        socialMediaConfig: {
          ...prev.recurringProject.socialMediaConfig,
          platforms: checked 
            ? [...prev.recurringProject.socialMediaConfig.platforms, platform]
            : prev.recurringProject.socialMediaConfig.platforms.filter(p => p !== platform)
        }
      }
    }));
  }, []);

  const saveProject = useCallback(async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const submitData = {
        projectName: formData.projectName,
        projectType: formData.projectType,
        assignedManager: formData.assignedManager,
        assignedTeam: formData.assignedTeam,
        status: formData.status,
        priority: formData.priority,
        notes: formData.notes,
        clientName: formData.clientName,
        clientContact: formData.clientContact,
        ...(formData.clientId && { clientId: formData.clientId })
      };

      if (formData.projectType === 'ONE_TIME') {
        if (!formData.oneTimeProject.totalAmount) {
          setError("Total amount is required for one-time projects");
          return;
        }
        submitData.oneTimeProject = formData.oneTimeProject;
      } else if (formData.projectType === 'RECURRING') {
        if (!formData.recurringProject.recurringAmount) {
          setError("Recurring amount is required for recurring projects");
          return;
        }
        
        // Ensure socialMediaConfig is properly included
        submitData.recurringProject = {
          ...formData.recurringProject,
          socialMediaConfig: {
            platforms: formData.recurringProject.socialMediaConfig.platforms || [],
            deliverables: {
              posts: formData.recurringProject.socialMediaConfig.deliverables.posts || 0,
              reels: formData.recurringProject.socialMediaConfig.deliverables.reels || 0,
              stories: formData.recurringProject.socialMediaConfig.deliverables.stories || 0
            }
          }
        };
        
        if (formData.recurringProject.serviceType.includes('Social Media')) {
          const socialConfig = submitData.recurringProject.socialMediaConfig;
          if (!socialConfig.platforms?.length) {
            setError("At least one social media platform is required for Social Media projects");
            return;
          }
          const totalDeliverables = (socialConfig.deliverables.posts || 0) + 
            (socialConfig.deliverables.reels || 0) + (socialConfig.deliverables.stories || 0);
          if (totalDeliverables === 0) {
            setError("At least one deliverable must be greater than 0 for Social Media projects");
            return;
          }
        }
      }
      
      console.log('Submitting data:', JSON.stringify(submitData, null, 2));
      
      const response = isEditing && projectId 
        ? await api.put(`/api/projects/${projectId}`, submitData)
        : await api.post(`/api/projects`, submitData);

      if (!response.data?.success) {
        throw new Error('Invalid response from server');
      }

      // Handle auto-invoice for RECURRING projects
      if (formData.projectType === 'RECURRING' && formData.recurringProject.autoInvoice) {
        try {
          const invoiceData = {
            isGSTInvoice: false,
            invoiceDate: new Date().toISOString(),
            dueDate: formData.recurringProject.nextBillingDate || new Date().toISOString(),
            customerName: formData.clientName,
            customerAddress: 'N/A',
            customerPhone: formData.clientContact,
            customerEmail: 'client@example.com',
            productDetails: [{
              description: `${formData.projectName} - ${formData.recurringProject.serviceType.join(', ') || 'Service'} (${formData.recurringProject.billingCycle || 'Monthly'})`,
              unit: 'Service', quantity: 1,
              price: formData.recurringProject.recurringAmount || 0,
              amount: formData.recurringProject.recurringAmount || 0
            }],
            amountDetails: { totalAmount: formData.recurringProject.recurringAmount || 0 }
          };

          console.log('Invoice check - isEditing:', isEditing, 'lastInvoiceId:', formData.recurringProject?.lastInvoiceId);
          console.log('Full recurringProject data:', formData.recurringProject);
          
          if (isEditing && formData.recurringProject?.lastInvoiceId) {
            // Update existing invoice
            console.log('Updating existing invoice:', formData.recurringProject.lastInvoiceId);
            await api.put(`/api/invoices/${formData.recurringProject.lastInvoiceId}`, invoiceData);
          } else if (!isEditing || (isEditing && !projectToEdit?.recurringProject?.autoInvoice)) {
            // Create new invoice for new project OR when enabling auto-invoice for first time
            console.log('Creating new invoice');
            const invoiceResponse = await api.post('/api/invoices/create', invoiceData);
            if (invoiceResponse.data?.invoice?._id) {
              // Update project with invoice ID
              const targetProjectId = isEditing ? projectId : response.data.project._id;
              await api.put(`/api/projects/${targetProjectId}`, {
                'recurringProject.lastInvoiceId': invoiceResponse.data.invoice._id
              });
            }
          }
        } catch (invoiceError) {
          console.error('Invoice error:', invoiceError);
        }
      }

      // Handle auto-invoice for ONE_TIME projects
      if (formData.projectType === 'ONE_TIME' && formData.oneTimeProject.autoInvoice) {
        // Create invoice if: new project OR editing and checking auto-invoice for first time OR updating existing invoice
        if (!isEditing || (isEditing && formData.oneTimeProject?.lastInvoiceId) || (isEditing && !projectToEdit?.oneTimeProject?.autoInvoice)) {
          try {
            const invoiceData = {
              isGSTInvoice: false,
              invoiceDate: new Date().toISOString(),
              dueDate: formData.oneTimeProject.expectedDeliveryDate || new Date().toISOString(),
              customerName: formData.clientName,
              customerAddress: 'N/A',
              customerPhone: formData.clientContact,
              customerEmail: 'client@example.com',
              productDetails: [{
                description: `${formData.projectName} - One-Time Project`,
                unit: 'Project', quantity: 1,
                price: formData.oneTimeProject.totalAmount || 0,
                amount: formData.oneTimeProject.totalAmount || 0
              }],
              amountDetails: { totalAmount: formData.oneTimeProject.totalAmount || 0 }
            };

            if (isEditing && formData.oneTimeProject?.lastInvoiceId) {
              // Update existing invoice
              console.log('Updating existing invoice:', formData.oneTimeProject.lastInvoiceId);
              await api.put(`/api/invoices/${formData.oneTimeProject.lastInvoiceId}`, invoiceData);
            } else {
              // Create new invoice
              console.log('Creating new invoice');
              const invoiceResponse = await api.post('/api/invoices/create', invoiceData);
              if (invoiceResponse.data?.invoice?._id) {
                // Update project with invoice ID
                const targetProjectId = isEditing ? projectId : response.data.project._id;
                await api.put(`/api/projects/${targetProjectId}`, {
                  'oneTimeProject.lastInvoiceId': invoiceResponse.data.invoice._id
                });
              }
            }
          } catch (invoiceError) {
            console.error('Invoice error:', invoiceError);
          }
        } else {
          console.log('Skipping invoice creation for existing project to prevent duplicates');
        }
      }
      
      navigate("/projects");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isEditing, projectId, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex items-center mb-6">
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => navigate("/projects")} className="mr-4 p-2 rounded-full bg-blue-gray-200/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 hover:bg-white/90 dark:hover:bg-gray-700/90 shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </motion.button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{isEditing ? "Edit Project" : "Add New Project"}</h2>
      </motion.div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 bg-red-100/80 text-red-700 rounded-lg backdrop-blur-xl border border-red-200/50">
          {error}
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }} className="bg-blue-gray-200/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6">
        <form className="space-y-6" onSubmit={saveProject}>
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Project Information</h3>
            <ProjectInfo formData={formData} handleChange={handleChange} employees={employees} />
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
              <textarea name="notes" value={formData.notes || ""} onChange={handleChange} rows={3} placeholder="Additional project notes or requirements" className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50" />
            </div>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Client & Ownership</h3>
            <div className="mb-4">
              <label className="flex items-center">
                <input type="checkbox" name="isLeadProject" checked={formData.isLeadProject} onChange={handleChange} className="mr-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Is Lead Project</span>
              </label>
            </div>
            <ClientSection formData={formData} handleChange={handleChange} clients={clients} setFormData={setFormData} />
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assigned Manager *</label>
                <select name="assignedManager" value={formData.assignedManager || ""} onChange={handleChange} className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50" required>
                  <option value="">Select manager</option>
                  {employees.map(emp => (<option key={emp._id} value={emp._id}>{emp.name}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assigned Team</label>
                <select multiple name="assignedTeam" value={formData.assignedTeam || []} onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  setFormData(prev => ({ ...prev, assignedTeam: values }));
                }} className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 h-24">
                  {employees.map(emp => (<option key={emp._id} value={emp._id}>{emp.name}</option>))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple team members</p>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {formData.projectType === 'ONE_TIME' && (
              <motion.div key="onetime" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">One-Time Project Details</h3>
                
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="text-md font-medium mb-3 text-green-800 dark:text-green-400">Project Scope & Financials</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Scope</label>
                      <textarea name="oneTimeProject.scope" value={formData.oneTimeProject.scope || ""} onChange={handleChange} rows={3} placeholder="Detailed project scope and requirements" className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500/50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Amount *</label>
                      <input type="number" name="oneTimeProject.totalAmount" value={formData.oneTimeProject.totalAmount || ""} onChange={handleChange} placeholder="Total project cost" className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500/50" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Advance Amount</label>
                      <input type="number" name="oneTimeProject.advanceAmount" value={formData.oneTimeProject.advanceAmount || ""} onChange={handleChange} placeholder="Advance payment received" className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500/50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Paid Amount</label>
                      <input type="number" name="oneTimeProject.paidAmount" value={formData.oneTimeProject.paidAmount || ""} onChange={handleChange} placeholder="Total amount paid" className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500/50" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                      <input type="date" name="oneTimeProject.startDate" value={formData.oneTimeProject.startDate || ""} onChange={handleChange} className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500/50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expected Delivery Date</label>
                      <input type="date" name="oneTimeProject.expectedDeliveryDate" value={formData.oneTimeProject.expectedDeliveryDate || ""} onChange={handleChange} className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500/50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Final Handover Date</label>
                      <input type="date" name="oneTimeProject.finalHandoverDate" value={formData.oneTimeProject.finalHandoverDate || ""} onChange={handleChange} className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500/50" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source Code Link</label>
                      <input type="url" name="oneTimeProject.sourceCodeLink" value={formData.oneTimeProject.sourceCodeLink || ""} onChange={handleChange} placeholder="GitHub, GitLab, etc." className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500/50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Warranty Period</label>
                      <input type="text" name="oneTimeProject.warrantyPeriod" value={formData.oneTimeProject.warrantyPeriod || ""} onChange={handleChange} placeholder="e.g., 6 months, 1 year" className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500/50" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deployment Details</label>
                      <textarea name="oneTimeProject.deploymentDetails" value={formData.oneTimeProject.deploymentDetails || ""} onChange={handleChange} rows={2} placeholder="Server details, hosting information, etc." className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500/50" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Domain Name</label>
                      <input type="text" name="oneTimeProject.domainName" value={formData.oneTimeProject.domainName || ""} onChange={handleChange} placeholder="example.com" className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500/50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Domain Provider</label>
                      <input type="text" name="oneTimeProject.domainProvider" value={formData.oneTimeProject.domainProvider || ""} onChange={handleChange} placeholder="GoDaddy, Namecheap, etc." className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500/50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Domain Expiry Date</label>
                      <input type="date" name="oneTimeProject.domainExpiryDate" value={formData.oneTimeProject.domainExpiryDate || ""} onChange={handleChange} className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500/50" />
                    </div>
                    <div>
                      <label className="flex items-center mt-6">
                        <input type="checkbox" name="oneTimeProject.autoInvoice" checked={formData.oneTimeProject.autoInvoice} onChange={handleChange} className="mr-2" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto Generate Invoice</span>
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            {formData.projectType === 'RECURRING' && (
              <motion.div key="recurring" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recurring Service Details</h3>
                
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="text-md font-medium mb-3 text-blue-800 dark:text-blue-400">Billing Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recurring Amount *</label>
                      <input type="number" name="recurringProject.recurringAmount" value={formData.recurringProject.recurringAmount || ""} onChange={handleChange} placeholder="Monthly/Quarterly/Yearly amount" className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Billing Cycle</label>
                      <select name="recurringProject.billingCycle" value={formData.recurringProject.billingCycle || ""} onChange={handleChange} className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50">
                        <option value="">Select billing cycle</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Yearly">Yearly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Billing Status</label>
                      <select name="recurringProject.billingStatus" value={formData.recurringProject.billingStatus || ""} onChange={handleChange} className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50">
                        <option value="Active">Active</option>
                        <option value="Paused">Paused</option>
                        <option value="Stopped">Stopped</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contract Start Date</label>
                      <input type="date" name="recurringProject.contractStartDate" value={formData.recurringProject.contractStartDate || ""} onChange={handleChange} className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contract End Date</label>
                      <input 
                        type="date" 
                        name="recurringProject.contractEndDate" 
                        value={formData.recurringProject.contractEndDate || ""} 
                        onChange={handleChange} 
                        disabled={formData.recurringProject.serviceType.includes('Social Media') || formData.recurringProject.serviceType.includes('GNB SEO')}
                        className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Next Billing Date</label>
                      <input type="date" name="recurringProject.nextBillingDate" value={formData.recurringProject.nextBillingDate || ""} onChange={handleChange} className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SLA Deliverables</label>
                      <textarea name="recurringProject.slaDeliverables" value={formData.recurringProject.slaDeliverables || ""} onChange={handleChange} rows={3} placeholder="Service level agreement and deliverables" className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50" />
                    </div>
                    <div>
                      <label className="flex items-center mt-6">
                        <input type="checkbox" name="recurringProject.autoInvoice" checked={formData.recurringProject.autoInvoice} onChange={handleChange} className="mr-2" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto Generate Invoice</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                {formData.recurringProject.serviceType.includes('Social Media') && (
                  <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                    <h4 className="text-md font-medium mb-3 text-purple-800 dark:text-purple-400">Social Media Configuration</h4>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Platforms * (Select at least one)</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {['Instagram', 'Facebook', 'LinkedIn', 'Twitter/X'].map(platform => (
                          <label key={platform} className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                            <input type="checkbox" checked={formData.recurringProject.socialMediaConfig.platforms.includes(platform)} onChange={(e) => handlePlatformChange(platform, e.target.checked)} className="mr-2 text-purple-600 focus:ring-purple-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{platform}</span>
                          </label>
                        ))}
                      </div>
                      {formData.recurringProject.socialMediaConfig.platforms.length === 0 && (
                        <p className="text-xs text-red-500 mt-1">Please select at least one platform</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Monthly Deliverables * (At least one must be greater than 0)</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {['posts', 'reels', 'stories'].map(type => (
                          <div key={type}>
                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{type.charAt(0).toUpperCase() + type.slice(1)} per month</label>
                            <input type="number" name={`recurringProject.socialMediaConfig.deliverables.${type}`} value={formData.recurringProject.socialMediaConfig.deliverables[type] || 0} onChange={handleChange} min="0" max="100" className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500/50" />
                          </div>
                        ))}
                      </div>
                      {((formData.recurringProject.socialMediaConfig.deliverables.posts || 0) + (formData.recurringProject.socialMediaConfig.deliverables.reels || 0) + (formData.recurringProject.socialMediaConfig.deliverables.stories || 0)) === 0 && (
                        <p className="text-xs text-red-500 mt-1">At least one deliverable must be greater than 0</p>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service Types</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Social Media', 'GNB SEO', 'Website Maintenance', 'Other'].map(serviceType => (
                        <label key={serviceType} className="flex items-center p-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                          <input type="checkbox" checked={formData.recurringProject.serviceType.includes(serviceType)} onChange={(e) => handleServiceTypeChange(serviceType, e.target.checked)} className="mr-2" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{serviceType}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-end gap-3 pt-6">
            <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} type="button" onClick={() => navigate("/projects")} className="px-4 py-2 rounded-lg bg-white/80 dark:bg-gray-700/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 hover:bg-white/90 dark:hover:bg-gray-600/90" disabled={isSubmitting}>
              Cancel
            </motion.button>
            <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} type="submit" className="px-4 py-2 border bg-gray-800/90 text-white rounded-lg hover:bg-gray-700/90 disabled:opacity-50 backdrop-blur-xl" disabled={isSubmitting || !formData.projectType}>
              {isSubmitting ? (isEditing ? "Updating..." : "Saving...") : (isEditing ? "Update Project" : "Save Project")}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default AddProject;