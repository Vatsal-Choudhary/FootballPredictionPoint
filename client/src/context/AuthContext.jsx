import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('wc_token'));
  const [loading, setLoading] = useState(true);

  const storeToken = useCallback((t) => {
    setToken(t);
    if (t) {
      localStorage.setItem('wc_token', t);
    } else {
      localStorage.removeItem('wc_token');
    }
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    client
      .get('/auth/me')
      .then((res) => {
        setUser(res.data.user);
      })
      .catch(() => {
        storeToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token, storeToken]);

  const login = async (email, password) => {
    const res = await client.post('/auth/login', { email, password });
    storeToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (username, email, password) => {
    const res = await client.post('/auth/register', { username, email, password });
    storeToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    storeToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
