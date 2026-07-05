import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, ...userData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      const message = error.response?.data?.message || 'Login failed. Please check credentials.';
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const register = async (formData) => {
    try {
      const response = await api.post('/auth/register-mosque', formData);
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Registration failed:', error);
      const message = error.response?.data?.message || 'Registration failed. Please check inputs.';
      return { success: false, message };
    }
  };

  const updateProfileState = (updatedUser) => {
    // Update local storage and context state
    const currentToken = localStorage.getItem('token');
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, updateProfileState }}>
      {children}
    </AuthContext.Provider>
  );
};
