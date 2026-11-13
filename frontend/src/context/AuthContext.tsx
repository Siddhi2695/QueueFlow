import React, { createContext, useContext, useState, useEffect } from 'react';
import { Manager } from '../types';
import { authService } from '../services/auth.service';

interface AuthContextType {
  manager: Manager | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name?: string; currentPassword?: string; newPassword?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [manager, setManager] = useState<Manager | null>(() => {
    const saved = localStorage.getItem('queueflow_manager');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('queueflow_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('queueflow_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          setManager(res.data.manager);
          localStorage.setItem('queueflow_manager', JSON.stringify(res.data.manager));
        } catch (err) {
          console.error('Session validation failed:', err);
          logout();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    const { manager: newManager, token: newToken } = response.data;
    setManager(newManager);
    setToken(newToken);
    localStorage.setItem('queueflow_token', newToken);
    localStorage.setItem('queueflow_manager', JSON.stringify(newManager));
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await authService.register(name, email, password);
    const { manager: newManager, token: newToken } = response.data;
    setManager(newManager);
    setToken(newToken);
    localStorage.setItem('queueflow_token', newToken);
    localStorage.setItem('queueflow_manager', JSON.stringify(newManager));
  };

  const logout = () => {
    setManager(null);
    setToken(null);
    localStorage.removeItem('queueflow_token');
    localStorage.removeItem('queueflow_manager');
  };

  const updateProfile = async (data: { name?: string; currentPassword?: string; newPassword?: string }) => {
    const res = await authService.updateProfile(data);
    setManager(res.data.manager);
    localStorage.setItem('queueflow_manager', JSON.stringify(res.data.manager));
  };

  return (
    <AuthContext.Provider
      value={{
        manager,
        token,
        isAuthenticated: !!token && !!manager,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

