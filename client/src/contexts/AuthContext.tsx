import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  changePassword: (oldPassword: string, newPassword: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = 'ginza_crm_auth';
const PASSWORD_KEY = 'ginza_crm_password';
const DEFAULT_PASSWORD = 'ginza2026';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem(STORAGE_KEY) === 'true';
  });

  const getPassword = useCallback(() => {
    return localStorage.getItem(PASSWORD_KEY) || DEFAULT_PASSWORD;
  }, []);

  const login = useCallback((password: string) => {
    if (password === getPassword()) {
      setIsAuthenticated(true);
      sessionStorage.setItem(STORAGE_KEY, 'true');
      return true;
    }
    return false;
  }, [getPassword]);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  const changePassword = useCallback((oldPassword: string, newPassword: string) => {
    if (oldPassword === getPassword()) {
      localStorage.setItem(PASSWORD_KEY, newPassword);
      return true;
    }
    return false;
  }, [getPassword]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
