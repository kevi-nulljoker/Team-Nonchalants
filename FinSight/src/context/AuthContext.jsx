import React, { createContext, useState, useEffect } from 'react';

// Create the context
export const AuthContext = createContext();

// API base URL from environment variable
const API_URL = (
  import.meta.env.VITE_AUTH_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_TARGET ||
  'http://127.0.0.1:8001'
).replace(/\/$/, '');

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    localStorage.getItem('token') || localStorage.getItem('auth_token')
  );
  const [loading, setLoading] = useState(true);

  // On mount, if token exists, optionally fetch user profile
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        // Optionally verify token with backend and get user info
        // For now, we can just set a placeholder – you can expand this later
        // For example: decode token or call /me endpoint
        // Since we don't have a /me endpoint, we'll just set a basic user object from localStorage
        const storedEmail = localStorage.getItem('userEmail') || localStorage.getItem('auth_email');
        const storedName = localStorage.getItem('auth_name');
        if (storedEmail) {
          setUser({ email: storedEmail, name: storedName || '' });
        }
      } catch (error) {
        console.error('Failed to load user', error);
        // If token invalid, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('auth_email');
        localStorage.removeItem('auth_user_id');
        localStorage.removeItem('auth_name');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [token]);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }
      // Store token and email
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('auth_email', email);
      setToken(data.access_token);
      setUser({ email, id: data.user_id });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Register function
  const register = async (email, password, name) => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Registration failed');
      }
      // After registration, you could automatically log them in, but we'll let them go to login
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('auth_email');
    localStorage.removeItem('auth_user_id');
    localStorage.removeItem('auth_name');
    setToken(null);
    setUser(null);
  };

  // Value object to provide to consumers
  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
