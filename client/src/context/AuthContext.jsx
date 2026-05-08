import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, validate stored token
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('skycast-token');
      if (!token) { setLoading(false); return; }
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.user);
      } catch (_) {
        localStorage.removeItem('skycast-token');
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  // Handle Google OAuth callback token
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token && window.location.pathname === '/auth/callback') {
      localStorage.setItem('skycast-token', token);
      api.get('/auth/me').then(({ data }) => {
        setUser(data.user);
        window.history.replaceState({}, '', '/');
      }).catch(() => {
        localStorage.removeItem('skycast-token');
      });
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('skycast-token', data.token);
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('skycast-token', data.token);
    setUser(data.user);
    return data;
  }, []);

  const demoLogin = useCallback(async () => {
    const { data } = await api.post('/auth/demo');
    localStorage.setItem('skycast-token', data.token);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('skycast-token');
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => prev ? { ...prev, ...updates } : prev);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, demoLogin, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
