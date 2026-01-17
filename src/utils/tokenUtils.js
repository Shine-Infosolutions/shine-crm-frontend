// Token validation and management utilities

export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const [, payload] = token.split('.');
    const decodedPayload = JSON.parse(atob(payload));
    return decodedPayload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const getTokenPayload = (token) => {
  if (!token) return null;
  
  try {
    const [, payload] = token.split('.');
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

export const clearAuthData = () => {
  const keysToRemove = ['token', 'user'];
  keysToRemove.forEach(key => localStorage.removeItem(key));
};

export const getStoredToken = () => localStorage.getItem('token');

export const getStoredUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};