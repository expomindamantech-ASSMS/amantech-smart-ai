// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, logOut, checkSubscription } from '../services/parseService';
import { ADMIN_EMAIL } from '../config/back4app';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    const current = getCurrentUser();
    if (current) {
      setUser(current);
      setSubscription(checkSubscription(current));
    }
    setLoading(false);
  }, []);

  const refreshUser = () => {
    const current = getCurrentUser();
    if (current) {
      setUser(current);
      setSubscription(checkSubscription(current));
    } else {
      setUser(null);
      setSubscription(null);
    }
  };

  const logout = async () => {
    await logOut();
    setUser(null);
    setSubscription(null);
  };

  const isAdmin = user?.get('email') === ADMIN_EMAIL || user?.get('isAdmin');

  return (
    <AuthContext.Provider value={{ user, loading, subscription, isAdmin, refreshUser, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
