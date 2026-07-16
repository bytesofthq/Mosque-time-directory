import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }

      try {
        const response = await api.get('/auth/profile');
        const existingUser = savedUser ? JSON.parse(savedUser) : {};
        const updatedData = { ...response.data, token: existingUser.token };
        setUser(updatedData);
        localStorage.setItem('user', JSON.stringify(updatedData));
      } catch (error) {
        console.error('Session check failed or expired:', error);
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username, password, keepMeSignedIn = true) => {
    try {
      const response = await api.post('/auth/login', { 
        username: username.trim(), 
        password, 
        keepMeSignedIn 
      });
      const userData = response.data;

      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      const message = error.response?.data?.message || 'Login failed. Please check credentials.';
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Server logout failed:', error);
    } finally {
      localStorage.removeItem('user');
      setUser(null);
    }
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
    try {
      const savedUser = localStorage.getItem('user');
      const existingUser = savedUser ? JSON.parse(savedUser) : {};
      const merged = { ...updatedUser, token: existingUser.token };
      localStorage.setItem('user', JSON.stringify(merged));
      setUser(merged);
    } catch (e) {
      console.error('Error updating profile state:', e);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, updateProfileState }}>
      {children}
    </AuthContext.Provider>
  );
};

