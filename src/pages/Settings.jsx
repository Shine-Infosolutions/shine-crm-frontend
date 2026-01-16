import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { motion } from "framer-motion";

function Settings() {
  const { currentUser, API_URL, getAuthHeaders } = useAppContext();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    profile: {
      name: currentUser?.name || "",
      email: currentUser?.email || "",
      phone: currentUser?.contact1 || "",
      role: currentUser?.role || ""
    },
    preferences: {
      theme: localStorage.getItem("theme") || "light",
      notifications: true,
      autoCheckout: true,
      workingHours: 9
    },
    security: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  const tabs = [
    { id: "profile", name: "Profile", icon: "👤" },
    { id: "preferences", name: "Preferences", icon: "⚙️" },
    { id: "security", name: "Security", icon: "🔒" },
    { id: "backup", name: "Backup", icon: "💾" }
  ];

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/employees/${currentUser._id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify(settings.profile)
      });
      
      if (response.ok) {
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile");
      }
    } catch (error) {
      alert("Error updating profile: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = (theme) => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  };

  const handleSavePreferences = () => {
    localStorage.setItem("theme", settings.preferences.theme);
    localStorage.setItem("autoCheckout", settings.preferences.autoCheckout);
    localStorage.setItem("workingHours", settings.preferences.workingHours);
    applyTheme(settings.preferences.theme);
    alert("Preferences saved successfully!");
  };

  const handleThemeChange = (theme) => {
    handleInputChange("preferences", "theme", theme);
    applyTheme(theme);
  };

  useEffect(() => {
    // Initialize theme on component mount
    applyTheme(settings.preferences.theme);
  }, []);

  const handleChangePassword = async () => {
    if (settings.security.newPassword !== settings.security.confirmPassword) {
      alert("New passwords don't match!");
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/settings/change-password`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          currentPassword: settings.security.currentPassword,
          newPassword: settings.security.newPassword
        })
      });
      
      if (response.ok) {
        alert("Password changed successfully!");
        setSettings(prev => ({
          ...prev,
          security: { currentPassword: "", newPassword: "", confirmPassword: "" }
        }));
      } else {
        alert("Failed to change password");
      }
    } catch (error) {
      alert("Error changing password: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackupData = async (dataType) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/settings/backup/${dataType}`, {
        method: "GET",
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${dataType}-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        alert(`${dataType} backup downloaded successfully!`);
      } else {
        alert(`Failed to backup ${dataType}`);
      }
    } catch (error) {
      alert(`Error backing up ${dataType}: ` + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFullBackup = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/backup/full`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${currentUser?.token}` }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `crm-full-backup-${new Date().toISOString().split('T')[0]}.zip`;
        a.click();
        URL.revokeObjectURL(url);
        alert("Full backup downloaded successfully!");
      } else {
        alert("Failed to create full backup");
      }
    } catch (error) {
      alert("Error creating full backup: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCloudBackup = async (provider) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/backup/cloud/${provider}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentUser?.token}` 
        },
        body: JSON.stringify({ userId: currentUser?.id })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (data.authUrl) {
          // Open OAuth window for cloud provider authentication
          const authWindow = window.open(data.authUrl, 'cloudAuth', 'width=500,height=600');
          
          // Listen for auth completion
          const checkClosed = setInterval(() => {
            if (authWindow.closed) {
              clearInterval(checkClosed);
              alert(`Backup to ${provider} initiated. Check your ${provider} account.`);
            }
          }, 1000);
        } else {
          alert(`Backup to ${provider} completed successfully!`);
        }
      } else {
        alert(data.message || `Failed to backup to ${provider}`);
      }
    } catch (error) {
      alert(`Error backing up to ${provider}: ` + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Settings</h2>

        {/* Tabs */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/50 mb-6">
          <div className="flex border-b border-gray-200/50 dark:border-gray-700/50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/20"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={settings.profile.name}
                      onChange={(e) => handleInputChange("profile", "name", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={settings.profile.email}
                      onChange={(e) => handleInputChange("profile", "email", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={settings.profile.phone}
                      onChange={(e) => handleInputChange("profile", "phone", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Role
                    </label>
                    <input
                      type="text"
                      value={settings.profile.role}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                    />
                  </div>
                </div>
                
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Profile"}
                </button>
              </motion.div>
            )}

            {/* Preferences Tab */}
            {activeTab === "preferences" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Preferences</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Choose your preferred theme</p>
                    </div>
                    <select
                      value={settings.preferences.theme}
                      onChange={(e) => handleThemeChange(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700/50"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Notifications</label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Receive system notifications</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.preferences.notifications}
                      onChange={(e) => handleInputChange("preferences", "notifications", e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto Checkout</label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Automatically checkout after working hours</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.preferences.autoCheckout}
                      onChange={(e) => handleInputChange("preferences", "autoCheckout", e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Working Hours</label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Daily working hours for auto checkout</p>
                    </div>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={settings.preferences.workingHours}
                      onChange={(e) => handleInputChange("preferences", "workingHours", parseInt(e.target.value))}
                      className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700/50"
                    />
                  </div>
                </div>
                
                <button
                  onClick={handleSavePreferences}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Preferences
                </button>
              </motion.div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Change Password</h3>
                
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={settings.security.currentPassword}
                      onChange={(e) => handleInputChange("security", "currentPassword", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700/50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={settings.security.newPassword}
                      onChange={(e) => handleInputChange("security", "newPassword", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700/50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={settings.security.confirmPassword}
                      onChange={(e) => handleInputChange("security", "confirmPassword", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700/50"
                    />
                  </div>
                </div>
                
                <button
                  onClick={handleChangePassword}
                  disabled={loading || !settings.security.currentPassword || !settings.security.newPassword}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? "Changing..." : "Change Password"}
                </button>
              </motion.div>
            )}

            {/* Backup Tab */}
            {activeTab === "backup" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Data Backup & Export</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Individual Backups */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">Individual Data Backup</h4>
                    
                    {[
                      { type: "employees", label: "Employee Data", desc: "Export all employee information" },
                      { type: "leads", label: "Lead Data", desc: "Export all leads and prospects" },
                      { type: "projects", label: "Project Data", desc: "Export all project information" },
                      { type: "attendance", label: "Attendance Records", desc: "Export attendance data" },
                      { type: "invoices", label: "Invoice Data", desc: "Export all invoices" },
                      { type: "contracts", label: "Contract Data", desc: "Export all contracts" }
                    ].map((item) => (
                      <div key={item.type} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50/50 dark:bg-gray-700/50">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                        </div>
                        <button
                          onClick={() => handleBackupData(item.type)}
                          disabled={loading}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                        >
                          Export
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {/* Full Backup */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">Complete System Backup</h4>
                    
                    <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
                      <div className="mb-4">
                        <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                      </div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">Full CRM Backup</h5>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Download a complete backup of all CRM data including employees, leads, projects, and more.
                      </p>
                      <button
                        onClick={handleFullBackup}
                        disabled={loading}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium mb-4"
                      >
                        {loading ? "Creating Backup..." : "Download Full Backup"}
                      </button>
                    </div>
                    
                    {/* Cloud Backup Options */}
                    <div className="space-y-3">
                      <h5 className="font-medium text-gray-900 dark:text-white">Cloud Backup</h5>
                      
                      <div className="grid grid-cols-1 gap-3">
                        <button
                          onClick={() => handleCloudBackup('googledrive')}
                          disabled={loading}
                          className="flex items-center justify-center space-x-3 w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6.28 3l5.72 10 5.72-10zm7.44 11L9 24l-5.72-10zm0 0L24 14l-5.72-10z"/>
                          </svg>
                          <span>Backup to Google Drive</span>
                        </button>
                        
                        <button
                          onClick={() => handleCloudBackup('onedrive')}
                          disabled={loading}
                          className="flex items-center justify-center space-x-3 w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M5.5 15.5h13c2.5 0 4.5-2 4.5-4.5s-2-4.5-4.5-4.5c-.3 0-.6 0-.9.1C16.4 3.6 14.4 2 12 2S7.6 3.6 6.4 6.6c-.3-.1-.6-.1-.9-.1C3 6.5 1 8.5 1 11s2 4.5 4.5 4.5z"/>
                          </svg>
                          <span>Backup to OneDrive</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <div>
                          <h6 className="font-medium text-yellow-800 dark:text-yellow-200">Backup Guidelines</h6>
                          <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-1 space-y-1">
                            <li>• Regular backups are recommended weekly</li>
                            <li>• Store backups in secure locations</li>
                            <li>• Cloud backups require authentication</li>
                            <li>• Verify backup integrity periodically</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Settings;