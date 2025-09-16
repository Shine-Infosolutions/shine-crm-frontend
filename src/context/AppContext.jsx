import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AppContext = createContext();

const API_URL = "https://shine-crm-backend.vercel.app";

export function AppProvider({ children }) {
  // State variables for the admin dashboard
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const savedDark = localStorage.getItem("darkMode");
    if (savedDark !== null) return savedDark === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const navigate = useNavigate();

  // Check for saved user and theme on initial load
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  // Apply or remove dark class on <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // Functions to manipulate state
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleDarkMode = () => setDarkMode(!darkMode);

  const login = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("user");
  };

  // Values to be provided to consumers
  const contextValue = {
    API_URL,
    // State
    sidebarOpen,
    currentUser,
    darkMode,
    // Functions
    navigate,
    toggleSidebar,
    toggleDarkMode,
    login,
    logout,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}

// Custom hook for using the context
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}

export default AppContext;
