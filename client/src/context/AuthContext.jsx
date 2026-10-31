import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('mec_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('mec_token') || null);
  const [loading, setLoading] = useState(false);

  const login = async ({ email, password, role, accessPath = 'learner' }) => {
    setLoading(true);
    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, role, accessPath })
      });
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('mec_user', JSON.stringify(data.user));
      localStorage.setItem('mec_token', data.token);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = (demoUser) => {
    setUser(demoUser);
    const mockToken = `mec_tok_${demoUser.id}_demo`;
    setToken(mockToken);
    localStorage.setItem('mec_user', JSON.stringify(demoUser));
    localStorage.setItem('mec_token', mockToken);
    return demoUser;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('mec_user');
    localStorage.removeItem('mec_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, demoLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
