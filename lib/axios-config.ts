'use client';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

// Create axios instance
const axiosInstance = axios.create();

// Function to handle logout
const handleLogout = async () => {
  try {
    // Call logout API to handle session cleanup on backend
    await axios.post('/api/admin/logout');
  } catch (error) {
    // Continue with logout even if API call fails
    console.error('Logout API error:', error);
  } finally {
    // Always remove token and redirect
    Cookies.remove('token');
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
};

// Response interceptor to handle 440 and 401 status codes
axiosInstance.interceptors.response.use(
  response => {
    // Return successful responses as-is
    return response;
  },
  error => {
    // Check if the request URL contains '/api' or starts with '/api'
    const requestUrl = error.config?.url || '';
    const isApiRoute =
      requestUrl.includes('/api') || requestUrl.startsWith('/api');

    if (isApiRoute && error.response) {
      const { status } = error.response;

      if (status === 440) {
        // Handle session timeout (440)
        toast.error('Session Timeout', {
          description: 'Your session has expired. Please login again.',
          className: 'destructive-toast',
          position: 'top-center',
          style: {
            backgroundColor: 'hsl(var(--destructive))',
            color: 'hsl(var(--destructive-foreground))',
            border: '1px solid hsl(var(--destructive))',
          },
        });
        handleLogout();
        return Promise.reject(error);
      }

      if (status === 401) {
        // Handle unauthorized (401)
        toast.error('Unauthorized', {
          description: 'Invalid token or access denied.',
          className: 'destructive-toast',
          position: 'top-center',
          style: {
            backgroundColor: 'hsl(var(--destructive))',
            color: 'hsl(var(--destructive-foreground))',
            border: '1px solid hsl(var(--destructive))',
          },
        });
        handleLogout();
        return Promise.reject(error);
      }
    }

    // For all other errors, just return the error
    return Promise.reject(error);
  }
);

export default axiosInstance;
