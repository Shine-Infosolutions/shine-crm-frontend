import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isTokenExpired, clearAuthData } from "../utils/tokenUtils";

const AppContext = createContext();
const API_URL = "http://localhost:5000";

export function AppProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const savedDark = localStorage.getItem("darkMode");
    return savedDark !== null ? savedDark === "true" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    
    if (savedUser && savedToken) {
      if (isTokenExpired(savedToken)) {
        clearAuthData();
        navigate('/login');
        return;
      }
      
      try {
        setCurrentUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (error) {
        clearAuthData();
        navigate('/login');
      }
    }
  }, [navigate]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleDarkMode = () => setDarkMode(!darkMode);

  const login = (userData, authToken) => {
    setCurrentUser(userData);
    setToken(authToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", authToken);
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    clearAuthData();
    navigate('/login');
  };

  const getAuthHeaders = () => {
    const authToken = token || localStorage.getItem('token');
    if (!authToken) return {};
    
    if (isTokenExpired(authToken)) {
      logout();
      return {};
    }
    
    return { Authorization: `Bearer ${authToken}` };
  };

  const contextValue = {
    API_URL,
    sidebarOpen,
    currentUser,
    token,
    darkMode,
    navigate,
    toggleSidebar,
    toggleDarkMode,
    login,
    logout,
    getAuthHeaders,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}

export default AppContext;
