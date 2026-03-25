// ================================================================
//  FILE: frontend/src/context/AuthContext.js
//
//  This is React's "global state" for login.
//  Any component can call useAuth() to get the current user,
//  or call login() / logout().
// ================================================================
import { createContext, useContext, useState, useCallback } from 'react';
import { authApi } from '../services/api';

// Create the context
const AuthContext = createContext(null);

// ── Provider: wraps the whole app ────────────────────────────
export function AuthProvider({ children }) {

  // Load user from localStorage on page refresh
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // ── LOGIN ─────────────────────────────────────────────────
  const login = useCallback(async (username, password) => {
    const { data } = await authApi.login(username, password);

    // Save token and user info to localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));

    setUser(data);
    return data;
  }, []);

  // ── LOGOUT ────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook: use this in any component ──────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}