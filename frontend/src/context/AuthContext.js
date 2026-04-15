// FILE: frontend/src/context/AuthContext.js
// Supports both real login (login function) and
// direct role navigation (loginAs function) which calls
// the real backend with default test credentials.
import { createContext, useContext, useState, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

// Default credentials per role — match what DataSeeder creates
const DEFAULT_CREDENTIALS = {
  PARENT:              { username: 'test@parent.lk',  password: '199012345678' },
  DOCUMENT_CONTROLLER: { username: 'dc@school.lk',    password: 'DocCtrl@2025' },
  JUDGE:               { username: 'judge_co',         password: 'Judge_CO@2025' },
  ADMIN:               { username: 'admin@school.lk',  password: 'Admin@2025'   },
};

function normalizeUserPayload(data) {
  if (!data || typeof data !== 'object') return data;
  const role = data.role != null ? String(data.role).toUpperCase() : '';
  return { ...data, role };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? normalizeUserPayload(JSON.parse(stored)) : null;
    } catch { return null; }
  });

  // Standard login with any credentials
  const login = useCallback(async (username, password) => {
    const { data } = await authApi.login(username, password);
    const payload = normalizeUserPayload(data);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(payload));
    flushSync(() => setUser(payload));
    return payload;
  }, []);

  // Direct login using default credentials for a role (for testing)
  const loginAs = useCallback(async (role) => {
    const creds = DEFAULT_CREDENTIALS[role];
    if (!creds) throw new Error(`No default credentials for role: ${role}`);
    const { data } = await authApi.login(creds.username, creds.password);
    const payload = normalizeUserPayload(data);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(payload));
    flushSync(() => setUser(payload));
    return payload;
  }, []);

  const logout = useCallback(() => {
    localStorage.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, loginAs, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}