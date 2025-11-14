import React, { useState } from 'react';
import {
  MagnifyingGlassIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  XCircleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useApp } from '@/contexts/AppContext';
import { useSuperAdmin } from '@/contexts/SuperAdminContext';
import { useToast } from '@/hooks/useToast';
import { Owner, Tenant, UserStatus } from '@/types';
import { ToastContainer } from '@/components/ui/Toast';

type UserType = 'owner' | 'tenant';

interface UserRowProps {
  user: Owner | Tenant;
  userType: UserType;
  onStatusChange: (userId: string, userType: UserType, status: UserStatus) => void;
  onDelete: (userId: string, userType: UserType) => void;
}

const UserRow: React.FC<UserRowProps> = ({ user, userType, onStatusChange, onDelete }) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <img
            src={user.fotoUrl}
            alt={user.nombre_completo}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-medium text-gray-900">{user.nombre_completo}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            userType === 'owner'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {userType === 'owner' ? 'Propietario' : 'Inquilino'}
        </span>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm text-gray-900">{user.telefono}</p>
      </td>
      <td className="px-6 py-4">
        <select
          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          defaultValue="activo"
          onChange={(e) => onStatusChange(user.id, userType, e.target.value as UserStatus)}
        >
          <option value={UserStatus.Activo}>Activo</option>
          <option value={UserStatus.Suspendido}>Suspendido</option>
          <option value={UserStatus.Inactivo}>Inactivo</option>
        </select>
      </td>
      <td className="px-6 py-4">
        <div className="flex gap-2">
          {!showConfirmDelete ? (
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar usuario"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onDelete(user.id, userType);
                  setShowConfirmDelete(false);
                }}
                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
              >
                Confirmar
              </button>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

export const UsersManagement: React.FC = () => {
  const { owners, tenants } = useApp();
  const { updateUserStatus, deleteUser } = useSuperAdmin();
  const { toasts, removeToast, success, error } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'owner' | 'tenant'>('all');

  // Combine and filter users
  const allUsers = [
    ...owners.map((o) => ({ ...o, userType: 'owner' as UserType })),
    ...tenants.map((t) => ({ ...t, userType: 'tenant' as UserType })),
  ];

  const filteredUsers = allUsers.filter((user) => {
    const matchesSearch =
      user.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      filterType === 'all' ||
      (filterType === 'owner' && user.userType === 'owner') ||
      (filterType === 'tenant' && user.userType === 'tenant');

    return matchesSearch && matchesType;
  });

  const handleStatusChange = (userId: string, userType: UserType, status: UserStatus) => {
    updateUserStatus(userId, userType, status);
    success(`Estado de usuario actualizado a ${status}`);
  };

  const handleDelete = (userId: string, userType: UserType) => {
    deleteUser(userId, userType);
    error(`Usuario ${userType === 'owner' ? 'propietario' : 'inquilino'} eliminado`);
  };

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <UserCircleIcon className="w-8 h-8 text-primary" />
              Gestión de Usuarios
            </h1>
            <p className="text-gray-600 mt-1">
              Administra todos los usuarios de la plataforma
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Usuarios</p>
              <p className="text-2xl font-bold text-primary">{allUsers.length}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos ({allUsers.length})
            </button>
            <button
              onClick={() => setFilterType('owner')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'owner'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Propietarios ({owners.length})
            </button>
            <button
              onClick={() => setFilterType('tenant')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'tenant'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Inquilinos ({tenants.length})
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <UserRow
                    key={`${user.userType}-${user.id}`}
                    user={user}
                    userType={user.userType}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <UserCircleIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No se encontraron usuarios</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <ShieldCheckIcon className="w-8 h-8 mb-2" />
          <p className="text-2xl font-bold">{owners.length}</p>
          <p className="text-blue-100">Propietarios</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <UserCircleIcon className="w-8 h-8 mb-2" />
          <p className="text-2xl font-bold">{tenants.length}</p>
          <p className="text-green-100">Inquilinos</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <XCircleIcon className="w-8 h-8 mb-2" />
          <p className="text-2xl font-bold">{filteredUsers.length}</p>
          <p className="text-purple-100">Resultados Filtrados</p>
        </div>
      </div>
    </div>
  );
};
