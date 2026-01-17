// client/src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { isTokenExpired, clearAuthData } from "../utils/tokenUtils";

const ProtectedRoute = ({ children }) => {
  const { currentUser, login } = useAppContext();

  useEffect(() => {
    // If no user in context but exists in localStorage, set it in context
    if (!currentUser) {
      const savedUser = localStorage.getItem("user");
      const savedToken = localStorage.getItem("token");
      if (savedUser && savedToken) {
        if (isTokenExpired(savedToken)) {
          clearAuthData();
          return;
        }
        try {
          const user = JSON.parse(savedUser);
          login(user, savedToken);
        } catch (e) {
          clearAuthData();
        }
      }
    }
  }, [currentUser, login]);

  // Check both context and localStorage for both user and token
  const savedToken = localStorage.getItem("token");
  const isAuthenticated = (currentUser && savedToken && !isTokenExpired(savedToken)) || 
                         (localStorage.getItem("user") && savedToken && !isTokenExpired(savedToken));

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
