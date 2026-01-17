import React, { useEffect, useState, useRef } from "react";
import { useAppContext } from "../context/AppContext";
import api from "../utils/axiosConfig";
import Loader from "../components/Loader";
import DigitalSignature from "../components/DigitalSignature";
import { motion, AnimatePresence } from "framer-motion";

function ContractManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState('');
  const [savingContent, setSavingContent] = useState(false);
  const editorRef = useRef(null);
  const { navigate, API_URL, currentUser } = useAppContext();

  const isEmployee = currentUser?.role === "employee";

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const response = await api.get('/api/employees');
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
          .btn-container { 
            position: fixed; 
            top: 20px; 
            right: 20px; 
            display: flex;
            gap: 10px;
            z-index: 1000;
          }
          .btn { 
            background: #2563eb; 
            color: white; 
            border: none; 
            padding: 12px 24px; 
            border-radius: 6px; 
            cursor: pointer; 
            font-size: 14px; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .btn:hover { background: #1d4ed8; }
          .btn-success { background: #16a34a; }
          .btn-success:hover { background: #15803d; }
          .btn-secondary { background: #6b7280; }
          .btn-secondary:hover { background: #4b5563; }
          @media print { .btn-container { display: none !important; } }
          iframe { width: 100%; height: calc(100vh - 80px); border: none; }
          #editor-container { display: none; width: 100%; height: calc(100vh - 80px); padding: 20px; }
        </style>
      </head>
      <body>
        <div class="btn-container">
          <button class="btn" onclick="toggleEdit()" id="editBtn">✏️ Edit</button>
          <button class="btn btn-success" onclick="saveContent()" id="saveBtn" style="display:none;">💾 Save</button>
          <button class="btn btn-secondary" onclick="cancelEdit()" id="cancelBtn" style="display:none;">Cancel</button>
          <button class="btn" onclick="window.print()">🖨️ Print</button>
        </div>
        <iframe src="${API_URL}/api/employees/${id}/contract/preview" id="previewFrame"></iframe>
        <div id="editor-container"></div>
        
        <script>
          let isEditing = false;
          
          async function toggleEdit() {
            if (!isEditing) {
              try {
                let content;
                try {
                  const response = await fetch('${API_URL}/api/employees/${id}/contract/content');
                  if (response.status === 404) {
                    content = await getDefaultContent();
                  } else {
                    const data = await response.json();
                    content = data.success ? data.content : await getDefaultContent();
                  }
                } catch {
                  content = await getDefaultContent();
                }
                
                document.getElementById('previewFrame').style.display = 'none';
                document.getElementById('editor-container').style.display = 'block';
                document.getElementById('editBtn').style.display = 'none';
                document.getElementById('saveBtn').style.display = 'inline-block';
                document.getElementById('cancelBtn').style.display = 'inline-block';
                
                const editorDiv = document.getElementById('editor-container');
                editorDiv.innerHTML = \`
                  <div style="margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #ccc;">
                    <button onclick="document.execCommand('bold')" style="padding: 4px 12px; margin-right: 8px; background: #e5e7eb; border: none; border-radius: 4px; cursor: pointer;">B</button>
                    <button onclick="document.execCommand('italic')" style="padding: 4px 12px; margin-right: 8px; background: #e5e7eb; border: none; border-radius: 4px; cursor: pointer;">I</button>
                    <button onclick="document.execCommand('underline')" style="padding: 4px 12px; margin-right: 8px; background: #e5e7eb; border: none; border-radius: 4px; cursor: pointer;">U</button>
                  </div>
                  <div id="content-editor" contenteditable="true" style="min-height: calc(100vh - 150px); padding: 16px; border: 1px solid #ccc; border-radius: 4px; font-family: Arial, sans-serif; font-size: 14px; background: white;">\${content}</div>
                \`;
                
                isEditing = true;
              } catch (error) {
                alert('Failed to load content for editing');
              }
            }
          }
          
          async function saveContent() {
            const contentEditor = document.getElementById('content-editor');
            if (contentEditor) {
              try {
                const content = contentEditor.innerHTML;
                const response = await fetch('${API_URL}/api/employees/${id}/contract/content', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ editedContent: content })
                });
                
                if (response.ok) {
                  alert('Contract saved successfully!');
                  cancelEdit();
                  document.getElementById('previewFrame').src = '${API_URL}/api/employees/${id}/contract/preview?t=' + Date.now();
                } else {
                  alert('Failed to save contract');
                }
              } catch (error) {
                alert('Error saving contract');
              }
            }
          }
          
          function cancelEdit() {
            document.getElementById('previewFrame').style.display = 'block';
            document.getElementById('editor-container').style.display = 'none';
            document.getElementById('editBtn').style.display = 'inline-block';
            document.getElementById('saveBtn').style.display = 'none';
            document.getElementById('cancelBtn').style.display = 'none';
            isEditing = false;
          }
          
          async function getDefaultContent() {
            try {
              const response = await fetch('${API_URL}/api/employees/${id}');
              const data = await response.json();
              if (data.success) {
                const employee = data.data;
                const contract = employee.contract_agreement || {};
                return \`
                  <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; background: white;">
                    <div style="text-align: center; margin-bottom: 30px;">
                      <h1 style="color: #2563eb; margin-bottom: 10px;">EMPLOYMENT CONTRACT</h1>
                      <p style="color: #666;">SHINE INFOSOLUTIONS</p>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                      <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">Employee Information</h3>
                      <p><strong>Name:</strong> \${employee.name || 'N/A'}</p>
                      <p><strong>Employee ID:</strong> \${employee.employee_id || 'N/A'}</p>
                      <p><strong>Designation:</strong> \${employee.designation || 'N/A'}</p>
                      <p><strong>Job Title:</strong> \${contract.job_title || 'N/A'}</p>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                      <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">Contract Details</h3>
                      <p><strong>Contract Type:</strong> \${contract.contract_type || 'Full Time'}</p>
                      <p><strong>Start Date:</strong> \${contract.start_date ? new Date(contract.start_date).toLocaleDateString('en-GB') : 'N/A'}</p>
                      \${contract.end_date ? \`<p><strong>End Date:</strong> \${new Date(contract.end_date).toLocaleDateString('en-GB')}</p>\` : ''}
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                      <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">Working Hours & Location</h3>
                      <p><strong>Working Hours:</strong> \${contract.working_hours?.timing || '10 AM – 6 PM'}</p>
                      <p><strong>Days per Week:</strong> \${contract.working_hours?.days_per_week || 5}</p>
                      <p><strong>Work Location:</strong> \${contract.working_hours?.location || 'Office'}</p>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                      <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">Compensation</h3>
                      <p><strong>Monthly Salary:</strong> ₹\${contract.compensation?.monthly_salary || 0}</p>
                      <p><strong>Salary Payment Date:</strong> \${contract.compensation?.salary_date || '5th of each month'}</p>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                      <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">Terms & Conditions</h3>
                      <p><strong>Notice Period:</strong> \${contract.termination?.notice_period_days || 30} days</p>
                      <p>This contract is governed by the laws of India and any disputes shall be resolved through appropriate legal channels.</p>
                    </div>
                    
                    <div style="margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
                      <div>
                        <p><strong>Employee Signature:</strong></p>
                        <div style="border-bottom: 1px solid #000; height: 40px; margin-top: 20px;"></div>
                        <p style="margin-top: 5px;">Date: ___________</p>
                      </div>
                      <div>
                        <p><strong>Company Representative:</strong></p>
                        <div style="border-bottom: 1px solid #000; height: 40px; margin-top: 20px;"></div>
                        <p style="margin-top: 5px;">Date: ___________</p>
                      </div>
                    </div>
                  </div>
                \`;
              }
            } catch (error) {
              console.error('Error fetching employee data:', error);
            }
            return '<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6;"><h1>Employment Contract</h1><p>Unable to load contract content.</p></div>';
          }
          
          // Remove any existing TinyMCE instances on page load
          window.addEventListener('load', function() {
            if (typeof tinymce !== 'undefined') {
              tinymce.remove();
            }
          });
        </script>
      </body>
      </html>
    `);
    previewWindow.document.close();
  };

  const handleEditToggle = (employeeContract) => {
    if (!isEditing) {
      // Load contract content for editing
      api.get(`/api/employees/${employeeContract._id}/contract/content`)
        .then(data => {
          if (data.status === 404) {
            // Endpoint doesn't exist, use generated content
            setEditableContent(generateContractHTML(employeeContract));
            return;
          }
          return data.data;
        })
        .then(data => {
          if (data && data.success) {
            setEditableContent(data.content || generateContractHTML(employeeContract));
          } else if (data) {
            setEditableContent(generateContractHTML(employeeContract));
          }
        })
        .catch(() => setEditableContent(generateContractHTML(employeeContract)));
    }
    setIsEditing(!isEditing);
  };

  const generateContractHTML = (employeeContract) => {
    const contract = employeeContract.contract_agreement || {};
    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; background: white;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin-bottom: 10px;">EMPLOYMENT CONTRACT</h1>
          <p style="color: #666;">SHINE INFOSOLUTIONS</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">Employee Information</h3>
          <p><strong>Name:</strong> ${employeeContract.name || 'N/A'}</p>
          <p><strong>Employee ID:</strong> ${employeeContract.employee_id || 'N/A'}</p>
          <p><strong>Designation:</strong> ${employeeContract.designation || 'N/A'}</p>
          <p><strong>Job Title:</strong> ${contract.job_title || 'N/A'}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">Contract Details</h3>
          <p><strong>Contract Type:</strong> ${contract.contract_type || 'Full Time'}</p>
          <p><strong>Start Date:</strong> ${contract.start_date ? new Date(contract.start_date).toLocaleDateString('en-GB') : 'N/A'}</p>
          ${contract.end_date ? `<p><strong>End Date:</strong> ${new Date(contract.end_date).toLocaleDateString('en-GB')}</p>` : ''}
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">Working Hours & Location</h3>
          <p><strong>Working Hours:</strong> ${contract.working_hours?.timing || '10 AM – 6 PM'}</p>
          <p><strong>Days per Week:</strong> ${contract.working_hours?.days_per_week || 5}</p>
          <p><strong>Work Location:</strong> ${contract.working_hours?.location || 'Office'}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">Compensation</h3>
          <p><strong>Monthly Salary:</strong> ₹${contract.compensation?.monthly_salary || 0}</p>
          <p><strong>Salary Payment Date:</strong> ${contract.compensation?.salary_date || '5th of each month'}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">Terms & Conditions</h3>
          <p><strong>Notice Period:</strong> ${contract.termination?.notice_period_days || 30} days</p>
          <p>This contract is governed by the laws of India and any disputes shall be resolved through appropriate legal channels.</p>
        </div>
        
        <div style="margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
          <div>
            <p><strong>Employee Signature:</strong></p>
            <div style="border-bottom: 1px solid #000; height: 40px; margin-top: 20px;"></div>
            <p style="margin-top: 5px;">Date: ___________</p>
          </div>
          <div>
            <p><strong>Company Representative:</strong></p>
            <div style="border-bottom: 1px solid #000; height: 40px; margin-top: 20px;"></div>
            <p style="margin-top: 5px;">Date: ___________</p>
          </div>
        </div>
      </div>
    `;
  };

  const saveEditedContent = async (employeeId) => {
    setSavingContent(true);
    try {
      const response = await api.put(`/api/employees/${employeeId}/contract/content`, {
        editedContent: editableContent
      });
      
      alert('Contract content saved successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Error saving contract content');
    }
    setSavingContent(false);
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

      const apiResponse = await api.put(
        `/api/employees/${employeeContract._id}/contract/update`,
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
        {isEditing ? (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white/90 backdrop-blur-xl rounded-xl p-6 shadow-lg"
          >
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Edit Contract Content</h3>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => saveEditedContent(employeeContract._id)}
                  disabled={savingContent}
                  className="px-4 py-2 bg-blue-600/90 text-white rounded-lg hover:bg-blue-700/90 transition-all duration-0.3"
                >
                  {savingContent ? '💾 Saving...' : '💾 Save'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-600/90 text-white rounded-lg hover:bg-gray-700/90 transition-all duration-0.3"
                >
                  Cancel
                </motion.button>
              </div>
            </div>
            
            <div className="mb-4 flex gap-2 border-b pb-2">
              <button onClick={() => document.execCommand('bold')} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">B</button>
              <button onClick={() => document.execCommand('italic')} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">I</button>
              <button onClick={() => document.execCommand('underline')} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">U</button>
            </div>
            <div
              ref={editorRef}
              contentEditable
              className="min-h-[600px] p-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              dangerouslySetInnerHTML={{ __html: editableContent }}
              onInput={(e) => setEditableContent(e.target.innerHTML)}
              style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontSize: '14px' }}
            />
          </motion.div>
        ) : (
          <motion.iframe
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            src={`${API_URL}/api/employees/${employeeContract._id}/contract/preview`}
            className="w-full h-screen border-0 rounded-xl shadow-xl bg-white/80 backdrop-blur-xl"
            title="Contract Preview"
          />
        )}

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
          className="mt-6 flex gap-3"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleEditToggle(employeeContract)}
            className="bg-blue-600/90 text-white px-6 py-2 rounded-lg hover:bg-blue-700/90 backdrop-blur-xl flex items-center transition-all duration-0.3"
          >
            {isEditing ? '📝 Exit Edit' : '✏️ Edit Contract'}
          </motion.button>
          
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