import React, { useState } from 'react';
import {
  WrenchScrewdriverIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  KeyIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSuperAdmin } from '@/contexts/SuperAdminContext';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/ui/Toast';
import { Owner, Tenant, LogAction } from '@/types';

export const SupportTools: React.FC = () => {
  const { owners, tenants, properties, contracts, payments, tickets } = useApp();
  const { login } = useAuth();
  const { addActivityLog } = useSuperAdmin();
  const { toasts, removeToast, success, warning, error } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<(Owner | Tenant) & { type: 'owner' | 'tenant' } | null>(null);

  // Combine all users for search
  const allUsers = [
    ...owners.map((o) => ({ ...o, type: 'owner' as const })),
    ...tenants.map((t) => ({ ...t, type: 'tenant' as const })),
  ];

  const filteredUsers = allUsers.filter(
    (user) =>
      user.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImpersonate = (user: (Owner | Tenant) & { type: 'owner' | 'tenant' }) => {
    if (!confirm(`¿Estás seguro de que quieres impersonar a ${user.nombre_completo}?`)) {
      return;
    }

    // Log the impersonation action
    addActivityLog({
      userId: 'sa1', // SuperAdmin ID
      userType: 'superadmin',
      userName: 'Admin Sistema',
      accion: LogAction.UpdateUser,
      descripcion: `Impersonó al usuario: ${user.nombre_completo} (${user.type})`,
      detalles: { targetUserId: user.id, targetUserType: user.type },
    });

    // Login as the selected user
    if (user.type === 'owner') {
      login({ type: 'owner', data: user as Owner });
    } else {
      login({ type: 'tenant', data: user as Tenant });
    }

    success(`Ahora estás viendo como ${user.nombre_completo}`);
  };

  const handleResetPassword = (user: (Owner | Tenant) & { type: 'owner' | 'tenant' }) => {
    if (!confirm(`¿Resetear contraseña para ${user.nombre_completo}?`)) {
      return;
    }

    // Log the password reset
    addActivityLog({
      userId: 'sa1',
      userType: 'superadmin',
      userName: 'Admin Sistema',
      accion: LogAction.UpdateUser,
      descripcion: `Reseteo contraseña del usuario: ${user.nombre_completo}`,
      detalles: { targetUserId: user.id },
    });

    success(`Contraseña reseteada para ${user.nombre_completo}. Email de recuperación enviado.`);
  };

  const getUserStats = (user: (Owner | Tenant) & { type: 'owner' | 'tenant' }) => {
    if (user.type === 'owner') {
      const userProperties = properties.filter((p) => p.ownerId === user.id);
      const userContracts = contracts.filter((c) =>
        userProperties.some((p) => p.id === c.propertyId)
      );
      const userPayments = payments.filter((pay) =>
        userProperties.some((p) => p.id === pay.propertyId)
      );
      const userTickets = tickets.filter((t) =>
        userProperties.some((p) => p.id === t.propertyId)
      );

      return {
        properties: userProperties.length,
        contracts: userContracts.length,
        payments: userPayments.length,
        tickets: userTickets.length,
      };
    } else {
      const userContracts = contracts.filter((c) => c.tenantId === user.id);
      const userPayments = payments.filter((p) => p.tenantId === user.id);
      const userTickets = tickets.filter((t) => t.reportedBy === user.id);

      return {
        properties: userContracts.length,
        contracts: userContracts.length,
        payments: userPayments.length,
        tickets: userTickets.length,
      };
    }
  };

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <WrenchScrewdriverIcon className="w-8 h-8" />
          Herramientas de Soporte
        </h1>
        <p className="text-red-100">
          Impersonación, diagnóstico y soporte técnico para usuarios
        </p>
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
        <div className="flex items-start gap-3">
          <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">Precaución con Impersonación</h3>
            <p className="text-sm text-yellow-700 mt-1">
              La impersonación te permitirá ver la aplicación como el usuario seleccionado. Todas
              las acciones realizadas serán registradas. Usa esta herramienta solo para soporte
              técnico autorizado.
            </p>
          </div>
        </div>
      </div>

      {/* User Search */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MagnifyingGlassIcon className="w-6 h-6 text-primary" />
          Buscar Usuario
        </h2>

        <div className="relative mb-6">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {searchTerm && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => {
                const stats = getUserStats(user);
                return (
                  <div
                    key={`${user.type}-${user.id}`}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <img
                          src={user.fotoUrl}
                          alt={user.nombre_completo}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">
                              {user.nombre_completo}
                            </h3>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                user.type === 'owner'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {user.type === 'owner' ? 'Propietario' : 'Inquilino'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-xs text-gray-500">ID: {user.id}</p>

                          <div className="mt-2 flex gap-4 text-xs text-gray-600">
                            <span>📊 {stats.properties} propiedades</span>
                            <span>📄 {stats.contracts} contratos</span>
                            <span>💰 {stats.payments} pagos</span>
                            <span>🎫 {stats.tickets} tickets</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Ver Detalles
                        </button>
                        <button
                          onClick={() => handleImpersonate(user)}
                          className="px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1"
                        >
                          <ArrowRightOnRectangleIcon className="w-4 h-4" />
                          Impersonar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <UserCircleIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No se encontraron usuarios</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected User Details */}
      {selectedUser && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <UserCircleIcon className="w-6 h-6 text-purple-600" />
              Detalles del Usuario
            </h2>
            <button
              onClick={() => setSelectedUser(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              Cerrar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={selectedUser.fotoUrl}
                  alt={selectedUser.nombre_completo}
                  className="w-20 h-20 rounded-full"
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedUser.nombre_completo}
                  </h3>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                  <p className="text-xs text-gray-500">Teléfono: {selectedUser.telefono}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">ID de Usuario</p>
                  <p className="font-mono text-sm">{selectedUser.id}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">Tipo de Usuario</p>
                  <p className="font-semibold">
                    {selectedUser.type === 'owner' ? 'Propietario' : 'Inquilino'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Estadísticas</h3>
              {(() => {
                const stats = getUserStats(selectedUser);
                return (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-600">Propiedades</p>
                      <p className="text-2xl font-bold text-blue-900">{stats.properties}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-green-600">Contratos</p>
                      <p className="text-2xl font-bold text-green-900">{stats.contracts}</p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <p className="text-xs text-yellow-600">Pagos</p>
                      <p className="text-2xl font-bold text-yellow-900">{stats.payments}</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-xs text-purple-600">Tickets</p>
                      <p className="text-2xl font-bold text-purple-900">{stats.tickets}</p>
                    </div>
                  </div>
                );
              })()}

              <div className="mt-6 space-y-2">
                <button
                  onClick={() => handleImpersonate(selectedUser)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  Impersonar Usuario
                </button>
                <button
                  onClick={() => handleResetPassword(selectedUser)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <KeyIcon className="w-5 h-5" />
                  Resetear Contraseña
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <CheckCircleIcon className="w-8 h-8 mb-2" />
          <p className="text-2xl font-bold">{allUsers.length}</p>
          <p className="text-green-100">Usuarios Totales</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <UserCircleIcon className="w-8 h-8 mb-2" />
          <p className="text-2xl font-bold">{owners.length}</p>
          <p className="text-blue-100">Propietarios Activos</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <UserCircleIcon className="w-8 h-8 mb-2" />
          <p className="text-2xl font-bold">{tenants.length}</p>
          <p className="text-purple-100">Inquilinos Activos</p>
        </div>
      </div>
    </div>
  );
};
