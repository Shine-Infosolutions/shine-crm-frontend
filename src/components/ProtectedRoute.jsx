// client/src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAppContext } from "../context/AppContext";

const ProtectedRoute = ({ children }) => {
  const { currentUser, login } = useAppContext();

  useEffect(() => {
    // If no user in context but exists in localStorage, set it in context
    if (!currentUser) {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          login(user);
        } catch (e) {
          localStorage.removeItem("user");
        }
      }
    }
  }, [currentUser, login]);

  // Check both context and localStorage
  const isAuthenticated = currentUser || localStorage.getItem("user");

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
