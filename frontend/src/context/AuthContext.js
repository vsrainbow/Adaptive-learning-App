import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: localStorage.getItem('token'),
    user: null,
    loading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          setAuth({ token: token, user: decoded.user, loading: false });
          api.defaults.headers.common['x-auth-token'] = token;
        }
      } catch (e) {
        console.error('Invalid token');
        logout();
      }
    } else {
      setAuth({ token: null, user: null, loading: false });
    }
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    api.defaults.headers.common['x-auth-token'] = token;
    setAuth({ token, user, loading: false });
  };

  const register = async (username, password, role) => {
    const res = await api.post('/auth/register', { username, password, role });
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    api.defaults.headers.common['x-auth-token'] = token;
    setAuth({ token, user, loading: false });
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['x-auth-token'];
    setAuth({ token: null, user: null, loading: false });
  };

  return (
    <AuthContext.Provider value={{ auth, login, register, logout }}>
      {!auth.loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;