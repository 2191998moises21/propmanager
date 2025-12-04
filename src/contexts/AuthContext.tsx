import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Owner, Tenant, SuperAdmin } from '@/types';
import { STORAGE_KEYS } from '@/utils/constants';
import { authAPI, clearAuthTokens, getRefreshToken } from '@/services/api';

export type User =
  | { type: 'owner'; data: Owner }
  | { type: 'tenant'; data: Tenant }
  | { type: 'superadmin'; data: SuperAdmin };

interface AuthContextType {
  currentUser: User | null;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (userData: Owner | Tenant | SuperAdmin) => void;
  isAuthenticated: boolean;
  isOwner: boolean;
  isTenant: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // Try to restore session from localStorage
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  const login = useCallback((user: User) => {
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();

    // Call backend to revoke refresh token
    if (refreshToken) {
      try {
        await authAPI.logout(refreshToken);
      } catch (error) {
        console.error('Error during logout:', error);
        // Continue with logout even if backend call fails
      }
    }

    // Clear local state and tokens
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    clearAuthTokens();
  }, []);

  const updateUser = useCallback((userData: Owner | Tenant | SuperAdmin) => {
    setCurrentUser((prev) => {
      if (!prev) return null;

      const updated = { ...prev, data: userData };
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updated));
      return updated as User;
    });
  }, []);

  const value: AuthContextType = {
    currentUser,
    login,
    logout,
    updateUser,
    isAuthenticated: currentUser !== null,
    isOwner: currentUser?.type === 'owner',
    isTenant: currentUser?.type === 'tenant',
    isSuperAdmin: currentUser?.type === 'superadmin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
