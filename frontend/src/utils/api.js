import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'https://mosque-time-directory-backend.onrender.com/api';
export const BACKEND_URL = API_URL.replace(/\/api$/, '');

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

// Create custom axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with requests
});

// Request interceptor to attach CSRF token
api.interceptors.request.use(
  (config) => {
    const csrfToken = getCookie('csrfToken');
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

