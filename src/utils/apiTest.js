// Frontend API Test Utility
// Use this in browser console to test API calls

const testAPI = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  
  async login(email = 'admin@shine.com', password = '123456') {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  },
  
  async testProtectedRoute() {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }
    
    try {
      const response = await fetch(`${this.baseURL}/api/employees`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        return data;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  },
  
  async testAxiosConfig() {
    // Test if axios config is working
    try {
      const api = (await import('./axiosConfig.js')).default;
      
      const response = await api.get('/api/employees');
      return response.data;
    } catch (error) {
      return null;
    }
  }
};

// Export for use in browser console
window.testAPI = testAPI;

export default testAPI;