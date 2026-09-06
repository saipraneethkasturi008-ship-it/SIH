import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('vm_token');

        // No token means there is no authenticated session
        if (!token) {
          setUser(null);
          return;
        }

        const res = await authService.getCurrentUser();

        if (res && res.user) {
          setUser(res.user);
        } else {
          // Token exists but session is no longer valid
          localStorage.removeItem('vm_token');
          localStorage.removeItem('vm_user');
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to restore user session:', err);

        localStorage.removeItem('vm_token');
        localStorage.removeItem('vm_user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    const res = await authService.login(credentials);

    if (res && res.user) {
      setUser(res.user);
    }

    return res;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);

    if (res && res.user) {
      setUser(res.user);
    }

    return res;
  };

  const logout = () => {
    localStorage.removeItem('vm_token');
    localStorage.removeItem('vm_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);