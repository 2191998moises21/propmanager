import { useState, useCallback } from 'react';
import { useAuth, User } from '@/contexts/AuthContext';
import { Owner, Tenant } from '@/types';
import { authAPI, setAuthToken, setRefreshToken } from '@/services/api';
import { ERROR_MESSAGES } from '@/utils/constants';

interface UseLoginReturn {
  login: (
    email: string,
    password: string,
    role: 'owner' | 'tenant' | 'superadmin'
  ) => Promise<boolean>;
  register: (ownerData: Omit<Owner, 'id' | 'fotoUrl'>, password: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook for handling authentication
 * Communicates with backend API for real authentication
 */
export const useLogin = (): UseLoginReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login: setAuthUser } = useAuth();

  const login = useCallback(
    async (
      email: string,
      password: string,
      role: 'owner' | 'tenant' | 'superadmin'
    ): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        // Call backend API
        const response = await authAPI.login(email, password, role);

        if (response.success && response.data) {
          // Store access token and refresh token
          setAuthToken(response.data.token);
          if (response.data.refreshToken) {
            setRefreshToken(response.data.refreshToken);
          }

          // Create user object
          const user: User = {
            type: role,
            data: response.data.user as Owner | Tenant,
          };

          setAuthUser(user);
          return true;
        } else {
          setError(response.error || ERROR_MESSAGES.INVALID_CREDENTIALS);
          return false;
        }
      } catch (err) {
        setError(ERROR_MESSAGES.GENERIC_ERROR);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [setAuthUser]
  );

  const register = useCallback(
    async (ownerData: Omit<Owner, 'id' | 'fotoUrl'>, password: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        // Call backend API
        const response = await authAPI.registerOwner({
          ...ownerData,
          password,
        });

        if (response.success && response.data) {
          // Store access token and refresh token
          setAuthToken(response.data.token);
          if (response.data.refreshToken) {
            setRefreshToken(response.data.refreshToken);
          }

          // Create user object
          const user: User = {
            type: 'owner',
            data: response.data.user as Owner,
          };

          setAuthUser(user);
          return true;
        } else {
          setError(response.error || 'Error al registrar usuario');
          return false;
        }
      } catch (err) {
        setError(ERROR_MESSAGES.GENERIC_ERROR);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [setAuthUser]
  );

  return {
    login,
    register,
    isLoading,
    error,
  };
};
