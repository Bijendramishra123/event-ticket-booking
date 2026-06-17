import React, { createContext, useState, useContext, useEffect } from 'react';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    // If no token, create a demo one
    if (!token) {
      const demoToken = 'demo_token_' + Date.now();
      localStorage.setItem('token', demoToken);
    }
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Create a default demo user
      const demoUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'demo@example.com',
        name: 'Demo User'
      };
      localStorage.setItem('user', JSON.stringify(demoUser));
      setUser(demoUser);
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token || 'demo_token_' + Date.now());
    setUser(userData);
  };

  const logout = () => {
    // Instead of removing, reset to demo user
    const demoUser = {
      _id: '507f1f77bcf86cd799439011',
      email: 'demo@example.com',
      name: 'Demo User'
    };
    const demoToken = 'demo_token_' + Date.now();
    localStorage.setItem('user', JSON.stringify(demoUser));
    localStorage.setItem('token', demoToken);
    setUser(demoUser);
    // Navigate to home
    window.location.href = '/';
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: true // Always authenticated for demo
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};