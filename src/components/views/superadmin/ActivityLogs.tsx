import React, { useState, useMemo } from 'react';
import {
  ClockIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { useSuperAdmin } from '@/contexts/SuperAdminContext';
import { LogAction } from '@/types';

const actionLabels: Record<LogAction, string> = {
  [LogAction.Login]: 'Inicio de sesión',
  [LogAction.Logout]: 'Cierre de sesión',
  [LogAction.CreateProperty]: 'Crear propiedad',
  [LogAction.UpdateProperty]: 'Actualizar propiedad',
  [LogAction.DeleteProperty]: 'Eliminar propiedad',
  [LogAction.CreateContract]: 'Crear contrato',
  [LogAction.UpdatePayment]: 'Actualizar pago',
  [LogAction.CreateTicket]: 'Crear ticket',
  [LogAction.UpdateUser]: 'Actualizar usuario',
  [LogAction.UpdateUserStatus]: 'Cambiar estado usuario',
  [LogAction.DeleteUser]: 'Eliminar usuario',
  [LogAction.SystemConfig]: 'Configuración sistema',
};

const actionColors: Record<LogAction, string> = {
  [LogAction.Login]: 'bg-green-100 text-green-800',
  [LogAction.Logout]: 'bg-gray-100 text-gray-800',
  [LogAction.CreateProperty]: 'bg-blue-100 text-blue-800',
  [LogAction.UpdateProperty]: 'bg-yellow-100 text-yellow-800',
  [LogAction.DeleteProperty]: 'bg-red-100 text-red-800',
  [LogAction.CreateContract]: 'bg-purple-100 text-purple-800',
  [LogAction.UpdatePayment]: 'bg-indigo-100 text-indigo-800',
  [LogAction.CreateTicket]: 'bg-orange-100 text-orange-800',
  [LogAction.UpdateUser]: 'bg-cyan-100 text-cyan-800',
  [LogAction.UpdateUserStatus]: 'bg-pink-100 text-pink-800',
  [LogAction.DeleteUser]: 'bg-red-100 text-red-800',
  [LogAction.SystemConfig]: 'bg-teal-100 text-teal-800',
};

export const ActivityLogs: React.FC = () => {
  const { activityLogs } = useSuperAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<LogAction | 'all'>('all');
  const [filterUserType, setFilterUserType] = useState<'all' | 'owner' | 'tenant' | 'superadmin'>(
    'all'
  );

  // Filter logs
  const filteredLogs = useMemo(() => {
    return activityLogs.filter((log) => {
      const matchesSearch =
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.descripcion.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesAction = filterAction === 'all' || log.accion === filterAction;

      const matchesUserType = filterUserType === 'all' || log.userType === filterUserType;

      return matchesSearch && matchesAction && matchesUserType;
    });
  }, [activityLogs, searchTerm, filterAction, filterUserType]);

  // Export logs as CSV
  const handleExport = () => {
    const headers = ['ID', 'Fecha', 'Usuario', 'Tipo Usuario', 'Acción', 'Descripción'];
    const rows = filteredLogs.map((log) => [
      log.id,
      new Date(log.fecha).toLocaleString('es-ES'),
      log.userName,
      log.userType,
      actionLabels[log.accion as LogAction] || log.accion,
      log.descripcion,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Get unique actions from logs
  const uniqueActions = useMemo(() => {
    const actions = new Set(activityLogs.map((log) => log.accion));
    return Array.from(actions) as LogAction[];
  }, [activityLogs]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ClockIcon className="w-8 h-8 text-primary" />
              Registro de Actividad
            </h1>
            <p className="text-gray-600 mt-1">
              Monitorea todas las acciones en la plataforma
            </p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Exportar CSV
          </button>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por usuario o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-gray-500" />
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value as LogAction | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">Todas las acciones</option>
                {uniqueActions.map((action) => (
                  <option key={action} value={action}>
                    {actionLabels[action] || action}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={filterUserType}
              onChange={(e) =>
                setFilterUserType(e.target.value as 'all' | 'owner' | 'tenant' | 'superadmin')
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">Todos los usuarios</option>
              <option value="owner">Propietarios</option>
              <option value="tenant">Inquilinos</option>
              <option value="superadmin">SuperAdmin</option>
            </select>

            <div className="ml-auto text-sm text-gray-600 flex items-center">
              Mostrando <span className="font-bold mx-1">{filteredLogs.length}</span> de{' '}
              <span className="font-bold ml-1">{activityLogs.length}</span> registros
            </div>
          </div>
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha/Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(log.fecha).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(log.fecha).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{log.userName}</div>
                      <div className="text-xs text-gray-500 capitalize">{log.userType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          actionColors[log.accion as LogAction] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {actionLabels[log.accion as LogAction] || log.accion}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{log.descripcion}</p>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <ClockIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No se encontraron registros</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Logs</p>
          <p className="text-2xl font-bold text-gray-900">{activityLogs.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Últimas 24h</p>
          <p className="text-2xl font-bold text-blue-600">
            {
              activityLogs.filter(
                (log) =>
                  new Date(log.fecha).getTime() > Date.now() - 24 * 60 * 60 * 1000
              ).length
            }
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Tipos de Acción</p>
          <p className="text-2xl font-bold text-green-600">{uniqueActions.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Filtrados</p>
          <p className="text-2xl font-bold text-purple-600">{filteredLogs.length}</p>
        </div>
      </div>
    </div>
  );
};
