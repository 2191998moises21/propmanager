import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { BuildingOffice2Icon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/contexts/ToastContext';
import { authAPI } from '@/services/api';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { success, error: showError } = useToast();

  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      showError('Token de recuperación no válido');
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [searchParams, navigate, showError]);

  useEffect(() => {
    if (newPassword.length === 0) {
      setPasswordStrength('weak');
    } else if (newPassword.length < 8) {
      setPasswordStrength('weak');
    } else if (newPassword.length >= 8 && newPassword.length < 12) {
      setPasswordStrength('medium');
    } else if (newPassword.length >= 12 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword)) {
      setPasswordStrength('strong');
    } else {
      setPasswordStrength('medium');
    }
  }, [newPassword]);

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'strong':
        return 'bg-green-500';
    }
  };

  const getStrengthText = () => {
    switch (passwordStrength) {
      case 'weak':
        return 'Débil';
      case 'medium':
        return 'Media';
      case 'strong':
        return 'Fuerte';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      showError('Token de recuperación no válido');
      return;
    }

    if (newPassword.length < 8) {
      showError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      showError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);

    try {
      const result = await authAPI.resetPassword(token, newPassword);

      if (result.success) {
        success('Contraseña actualizada exitosamente. Redirigiendo al inicio de sesión...', '✅ ¡Listo!');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        showError(result.error || 'Error al restablecer la contraseña. El token puede haber expirado.');
      }
    } catch (err) {
      showError('Error de conexión. Por favor intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="text-center mb-8">
        <BuildingOffice2Icon className="w-16 h-16 text-primary mx-auto" />
        <h1 className="text-4xl font-bold text-primary mt-2">PropManager</h1>
        <p className="text-gray-600">Restablecer contraseña</p>
      </div>

      <Card className="max-w-md w-full !shadow-lg">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Nueva Contraseña</h2>
          <p className="text-sm text-gray-600 mb-6">
            Ingrese su nueva contraseña. Asegúrese de que sea segura y fácil de recordar.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                Nueva Contraseña
              </label>
              <div className="mt-1">
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Mínimo 8 caracteres"
                />
              </div>

              {newPassword.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Fortaleza de contraseña:</span>
                    <span className={`text-xs font-semibold ${
                      passwordStrength === 'weak' ? 'text-red-600' :
                      passwordStrength === 'medium' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {getStrengthText()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getStrengthColor()}`}
                      style={{
                        width: passwordStrength === 'weak' ? '33%' :
                               passwordStrength === 'medium' ? '66%' : '100%'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar Nueva Contraseña
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Repita su contraseña"
                />
              </div>

              {confirmPassword.length > 0 && (
                <div className="mt-2">
                  {newPassword === confirmPassword ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircleIcon className="w-4 h-4" />
                      <span className="text-xs">Las contraseñas coinciden</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600">
                      <ExclamationTriangleIcon className="w-4 h-4" />
                      <span className="text-xs">Las contraseñas no coinciden</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h3 className="text-xs font-semibold text-blue-900 mb-1">📝 Recomendaciones:</h3>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Mínimo 8 caracteres (12+ recomendado)</li>
                <li>• Incluya letras mayúsculas y minúsculas</li>
                <li>• Incluya números y caracteres especiales</li>
                <li>• No use información personal obvia</li>
              </ul>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || newPassword !== confirmPassword || newPassword.length < 8}
              >
                {isLoading ? 'Actualizando...' : 'Restablecer Contraseña'}
              </Button>
            </div>
          </form>
        </div>

        <div className="text-center py-4 bg-gray-50 border-t rounded-b-lg">
          <p className="text-sm text-gray-600">
            ¿Recordó su contraseña?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-blue-700">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};
