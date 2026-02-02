import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string; errors?: any[] }>) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth state
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }

    // Format error message
    const message = error.response?.data?.error || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;
