import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, getMe, setAuthToken, getAuthToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setStats(null);
      setLoading(false);
      return;
    }

    try {
      const data = await getMe();
      setUser(data.user);
      setStats(data.stats);
    } catch (err) {
      console.warn('Failed to fetch user session:', err);
      setAuthToken(null);
      setUser(null);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const handleLogin = async (email, password) => {
    const data = await apiLogin(email, password);
    setAuthToken(data.token);
    setUser(data.user);
    await fetchCurrentUser();
    return data.user;
  };

  const handleRegister = async (name, email, password) => {
    const data = await apiRegister(name, email, password);
    setAuthToken(data.token);
    setUser(data.user);
    await fetchCurrentUser();
    return data.user;
  };

  const handleLogout = () => {
    setAuthToken(null);
    setUser(null);
    setStats(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        stats,
        loading,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        refreshUser: fetchCurrentUser,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
