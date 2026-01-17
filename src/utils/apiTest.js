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
        console.log('✅ Login successful!', data);
        return data;
      } else {
        console.log('❌ Login failed:', data.message);
        return null;
      }
    } catch (error) {
      console.log('❌ Login error:', error);
      return null;
    }
  },
  
  async testProtectedRoute() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('❌ No token found. Please login first.');
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
        console.log('✅ Protected route access successful!', data);
        return data;
      } else {
        console.log('❌ Protected route access failed:', data.message);
        return null;
      }
    } catch (error) {
      console.log('❌ Protected route error:', error);
      return null;
    }
  },
  
  async testAxiosConfig() {
    // Test if axios config is working
    try {
      const api = (await import('./axiosConfig.js')).default;
      
      const response = await api.get('/api/employees');
      console.log('✅ Axios config working!', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ Axios config error:', error.response?.data || error.message);
      return null;
    }
  }
};

// Export for use in browser console
window.testAPI = testAPI;

export default testAPI;