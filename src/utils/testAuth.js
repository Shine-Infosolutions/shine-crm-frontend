// Test authentication
export const testAuth = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  console.log('=== AUTH TEST ===');
  console.log('Token exists:', !!token);
  console.log('Token value:', token?.substring(0, 50) + '...');
  console.log('User exists:', !!user);
  console.log('User value:', user);
  
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Token payload:', payload);
      console.log('Token expired:', payload.exp * 1000 < Date.now());
    } catch (e) {
      console.log('Invalid token format');
    }
  }
};

// Run test immediately
testAuth();