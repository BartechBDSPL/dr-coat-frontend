'use client';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

const axiosInstance = axios.create({
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  },

  adapter: ['xhr', 'http', 'fetch'],
});

axiosInstance.interceptors.request.use(
  config => {
    if (!config.headers) {
      config.headers = {} as any;
    }

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

const handleLogout = async (message: string, description: string) => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('auth_error_message', message);
    sessionStorage.setItem('auth_error_description', description);
  }

  try {
    await axios.post('/api/admin/logout');
  } catch (error) {
    console.error('Logout API error:', error);
  } finally {
    Cookies.remove('token');
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
    }
  }
};

axiosInstance.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    const requestUrl = error.config?.url || '';
    const isApiRoute =
      requestUrl.includes('/api') || requestUrl.startsWith('/api');

    if (isApiRoute && error.response) {
      const { status } = error.response;

      if (status === 440) {
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

    return Promise.reject(error);
  }
);

export default axiosInstance;
