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

// In-memory store for the CSRF token when cookies cannot be read directly (cross-origin production)
let csrfToken = null;

const extractCsrfToken = (headers) => {
  if (headers && headers['x-csrf-token']) {
    csrfToken = headers['x-csrf-token'];
  }
};

// Request interceptor to attach CSRF token
api.interceptors.request.use(
  (config) => {
    // Read from cookies first (works for same-origin, like localhost)
    // Fall back to in-memory variable (works cross-origin via exposed headers)
    const activeToken = getCookie('csrfToken') || csrfToken;
    if (activeToken) {
      config.headers['X-CSRF-Token'] = activeToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to extract CSRF token from headers
api.interceptors.response.use(
  (response) => {
    extractCsrfToken(response.headers);
    return response;
  },
  (error) => {
    if (error.response) {
      extractCsrfToken(error.response.headers);
    }
    return Promise.reject(error);
  }
);

export default api;

