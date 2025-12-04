import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BuildingOffice2Icon, UsersIcon, ShieldCheckIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/contexts/ToastContext';
import { authAPI } from '@/services/api';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [role, setRole] = useState<'owner' | 'tenant' | 'superadmin'>('owner');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      showError('Por favor ingrese su correo electrónico');
      return;
    }

    setIsLoading(true);

    try {
      const result = await authAPI.forgotPassword(email, role);

      if (result.success) {
        success(
          'Si el correo existe en nuestro sistema, recibirás un enlace de recuperación en unos minutos',
          '✉️ Revisa tu correo'
        );
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        showError(result.error || 'Error al procesar la solicitud');
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
        <p className="text-gray-600">Recuperación de contraseña</p>
      </div>

      <Card className="max-w-md w-full !shadow-lg">
        <div className="p-6">
          <div className="mb-6">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Volver al inicio de sesión
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">¿Olvidó su contraseña?</h2>
          <p className="text-sm text-gray-600 mb-6">
            Ingrese su correo electrónico y le enviaremos un enlace para restablecer su contraseña.
          </p>

          <div className="flex border-b border-gray-200 mb-6">
            <button
              type="button"
              onClick={() => setRole('owner')}
              className={`flex-1 py-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1 sm:gap-2 transition-colors ${
                role === 'owner'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <BuildingOffice2Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              Propietario
            </button>
            <button
              type="button"
              onClick={() => setRole('tenant')}
              className={`flex-1 py-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1 sm:gap-2 transition-colors ${
                role === 'tenant'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <UsersIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              Inquilino
            </button>
            <button
              type="button"
              onClick={() => setRole('superadmin')}
              className={`flex-1 py-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1 sm:gap-2 transition-colors ${
                role === 'superadmin'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ShieldCheckIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo Electrónico
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </div>

            <div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
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

      <div className="mt-6 max-w-md w-full">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Información importante:</h3>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• El enlace de recuperación expirará en 1 hora</li>
            <li>• Revise su carpeta de spam si no recibe el correo</li>
            <li>• Si no tiene cuenta, contacte al administrador</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
