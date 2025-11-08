import { createContext, useState, useCallback } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback((userData) => {
    setUser(userData.user);
    setToken(userData.token);
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData.user));
    setError(null);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, logout, setLoading, setError }}>
      {children}
    </AuthContext.Provider>
  );
}
