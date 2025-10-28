'use client';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

// Create axios instance with no-cache configuration
const axiosInstance = axios.create({
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  },
  // Additional axios config to prevent caching
  adapter: ['xhr', 'http', 'fetch'],
});

// Request interceptor to prevent caching
axiosInstance.interceptors.request.use(
  config => {
    // Ensure headers exist
    if (!config.headers) {
      config.headers = {} as any;
    }

    // Force no-cache headers on every request
    config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    config.headers['Pragma'] = 'no-cache';
    config.headers['Expires'] = '0';
    config.headers['If-Modified-Since'] = '0';

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Function to handle logout
const handleLogout = async (message: string, description: string) => {
  // Store the message in sessionStorage so it persists across redirect
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('auth_error_message', message);
    sessionStorage.setItem('auth_error_description', description);
  }

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
      // Small delay to ensure toast is visible before redirect
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
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
        const message = '🔒 Session Timeout';
        const description = 'Your session has expired. Please login again.';

        toast.warning(`${message}\n${description}`, {
          autoClose: 5000,
          position: 'top-center',
        });
        handleLogout(message, description);
        return Promise.reject(error);
      }

      if (status === 401) {
        // Handle unauthorized (401)
        const message = '⚠️ Unauthorized Access';
        const description =
          'Invalid token or access denied. Please login again.';

        toast.warning(`${message}\n${description}`, {
          autoClose: 5000,
          position: 'top-center',
          className: 'font-semibold !text-white [&_*]:!text-white',
        });
        handleLogout(message, description);
        return Promise.reject(error);
      }
    }

    // For all other errors, just return the error
    return Promise.reject(error);
  }
);

export default axiosInstance;
