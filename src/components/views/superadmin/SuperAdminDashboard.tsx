import React, { useEffect } from 'react';
import {
  UsersIcon,
  HomeIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { useSuperAdmin } from '@/contexts/SuperAdminContext';
import { useApp } from '@/contexts/AppContext';
import { formatCurrency } from '@/utils/formatters';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, subtitle }) => (
  <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
    </div>
    <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
    {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
  </div>
);

interface RecentActivityProps {
  logs: Array<{
    id: string;
    userName: string;
    accion: string;
    descripcion: string;
    fecha: string;
  }>;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ logs }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
      <ChartBarIcon className="w-6 h-6 text-primary" />
      Actividad Reciente
    </h2>
    <div className="space-y-3">
      {logs.slice(0, 10).map((log) => (
        <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{log.userName}</p>
            <p className="text-sm text-gray-600">{log.descripcion}</p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(log.fecha).toLocaleString('es-ES', {
                dateStyle: 'short',
                timeStyle: 'short',
              })}
            </p>
          </div>
        </div>
      ))}
      {logs.length === 0 && (
        <p className="text-center text-gray-500 py-8">No hay actividad reciente</p>
      )}
    </div>
  </div>
);

interface SuperAdminDashboardProps {
  onNavigate: (view: string) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ onNavigate }) => {
  const { platformStats, activityLogs, refreshPlatformStats } = useSuperAdmin();
  const { properties, contracts, payments, tickets, owners, tenants } = useApp();

  // Refresh stats when data changes
  useEffect(() => {
    refreshPlatformStats(owners, tenants);
  }, [owners, tenants, refreshPlatformStats]);

  // Calculate additional stats
  const propiedadesOcupadas = properties.filter((p) => p.estado_ocupacion === 'ocupada').length;
  const contratosActivos = contracts.filter((c) => c.estado_contrato === 'activo').length;
  const ticketsAbiertos = tickets.filter((t) => t.estado === 'abierto').length;

  // Calculate this month's income
  const currentMonth = new Date().toISOString().slice(0, 7);
  const ingresosEsteMes = payments
    .filter(
      (p) =>
        p.estado_pago === 'pagado' && p.mes_correspondiente.startsWith(currentMonth)
    )
    .reduce((sum, p) => sum + p.monto, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Panel de SuperAdmin</h1>
        <p className="text-purple-100">
          Control y gestión completa de la plataforma PropManager
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Usuarios"
          value={platformStats.totalUsuarios}
          icon={<UsersIcon className="w-6 h-6 text-white" />}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          subtitle={`${platformStats.totalPropietarios} propietarios, ${platformStats.totalInquilinos} inquilinos`}
        />

        <StatCard
          title="Propiedades"
          value={properties.length}
          icon={<HomeIcon className="w-6 h-6 text-white" />}
          color="bg-gradient-to-br from-green-500 to-green-600"
          subtitle={`${propiedadesOcupadas} ocupadas`}
        />

        <StatCard
          title="Contratos Activos"
          value={contratosActivos}
          icon={<DocumentTextIcon className="w-6 h-6 text-white" />}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          subtitle={`de ${contracts.length} totales`}
        />

        <StatCard
          title="Ingresos del Mes"
          value={formatCurrency(ingresosEsteMes, platformStats.moneda)}
          icon={<CurrencyDollarIcon className="w-6 h-6 text-white" />}
          color="bg-gradient-to-br from-yellow-500 to-yellow-600"
          subtitle={`${payments.filter((p) => p.mes_correspondiente.startsWith(currentMonth)).length} pagos`}
        />

        <StatCard
          title="Tickets Abiertos"
          value={ticketsAbiertos}
          icon={<ExclamationTriangleIcon className="w-6 h-6 text-white" />}
          color="bg-gradient-to-br from-red-500 to-red-600"
          subtitle={`de ${tickets.length} totales`}
        />

        <StatCard
          title="Total Pagos"
          value={payments.length}
          icon={<CurrencyDollarIcon className="w-6 h-6 text-white" />}
          color="bg-gradient-to-br from-indigo-500 to-indigo-600"
          subtitle={`${payments.filter((p) => p.estado_pago === 'pagado').length} pagados`}
        />
      </div>

      {/* Recent Activity */}
      <RecentActivity logs={activityLogs} />

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate('users')}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-blue-50 transition-all hover:scale-105 text-center"
          >
            <UsersIcon className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="font-medium text-gray-700">Gestionar Usuarios</p>
            <p className="text-xs text-gray-500 mt-1">
              {owners.length + tenants.length} usuarios activos
            </p>
          </button>
          <button
            onClick={() => onNavigate('logs')}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all hover:scale-105 text-center"
          >
            <ChartBarIcon className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="font-medium text-gray-700">Ver Logs Detallados</p>
            <p className="text-xs text-gray-500 mt-1">{activityLogs.length} registros totales</p>
          </button>
          <button
            onClick={() => onNavigate('config')}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all hover:scale-105 text-center"
          >
            <DocumentTextIcon className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="font-medium text-gray-700">Configuración Sistema</p>
            <p className="text-xs text-gray-500 mt-1">Ajustes globales</p>
          </button>
          <button
            onClick={() => onNavigate('reports')}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-all hover:scale-105 text-center"
          >
            <DocumentTextIcon className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
            <p className="font-medium text-gray-700">Reportes Avanzados</p>
            <p className="text-xs text-gray-500 mt-1">Analíticas y exportar</p>
          </button>
          <button
            onClick={() => onNavigate('support')}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all hover:scale-105 text-center"
          >
            <ExclamationTriangleIcon className="w-8 h-8 mx-auto mb-2 text-red-600" />
            <p className="font-medium text-gray-700">Soporte Técnico</p>
            <p className="text-xs text-gray-500 mt-1">Herramientas de ayuda</p>
          </button>
          <button
            onClick={() => onNavigate('maintenance')}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all hover:scale-105 text-center"
          >
            <HomeIcon className="w-8 h-8 mx-auto mb-2 text-indigo-600" />
            <p className="font-medium text-gray-700">Mantenimiento</p>
            <p className="text-xs text-gray-500 mt-1">Respaldos y limpieza</p>
          </button>
        </div>
      </div>
    </div>
  );
};
