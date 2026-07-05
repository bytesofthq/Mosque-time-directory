import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'https://mosque-time-directory-backend.onrender.com/api';
export const BACKEND_URL = API_URL.replace(/\/api$/, '');

// Create custom axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
