import { useState, useCallback } from 'react';
import { useAuth, User } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { Owner } from '@/types';
import { generateId } from '@/utils/id';

interface UseLoginReturn {
  login: (email: string, password: string, role: 'owner' | 'tenant') => Promise<boolean>;
  register: (ownerData: Omit<Owner, 'id' | 'fotoUrl'>, password: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook for handling authentication
 * This is a simplified version for demo purposes
 * In production, this should communicate with a real backend API
 */
export const useLogin = (): UseLoginReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login: setAuthUser } = useAuth();
  const { owners, tenants, addOwner } = useApp();

  const login = useCallback(
    async (email: string, _password: string, role: 'owner' | 'tenant'): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (role === 'owner') {
          const owner = owners.find((o) => o.email.toLowerCase() === email.toLowerCase());
          if (owner) {
            // TODO: In production, verify password with backend
            // For now, we're accepting any password for demo purposes
            const user: User = { type: 'owner', data: owner };
            setAuthUser(user);
            return true;
          }
        } else {
          const tenant = tenants.find((t) => t.email.toLowerCase() === email.toLowerCase());
          if (tenant) {
            // TODO: In production, verify password with backend
            const user: User = { type: 'tenant', data: tenant };
            setAuthUser(user);
            return true;
          }
        }

        setError('Credenciales inválidas. Por favor, intente de nuevo.');
        return false;
      } catch (err) {
        setError('Error al iniciar sesión. Por favor, intente de nuevo.');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [owners, tenants, setAuthUser]
  );

  const register = useCallback(
    async (
      ownerData: Omit<Owner, 'id' | 'fotoUrl'>,
      _password: string
    ): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Check if email already exists
        if (owners.some((o) => o.email.toLowerCase() === ownerData.email.toLowerCase())) {
          setError('El correo electrónico ya está en uso.');
          return false;
        }

        // TODO: In production, hash password and send to backend
        // For now, we're just creating the owner
        const newOwner = addOwner(ownerData);
        const user: User = { type: 'owner', data: newOwner };
        setAuthUser(user);
        return true;
      } catch (err) {
        setError('Error al registrarse. Por favor, intente de nuevo.');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [owners, addOwner, setAuthUser]
  );

  return {
    login,
    register,
    isLoading,
    error,
  };
};
