import React, { useState, useMemo } from 'react';
import {
  DocumentChartBarIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  HomeIcon,
  UsersIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { useApp } from '@/contexts/AppContext';
import { useSuperAdmin } from '@/contexts/SuperAdminContext';
import { formatCurrency } from '@/utils/formatters';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/ui/Toast';

export const Reports: React.FC = () => {
  const { properties, contracts, payments, tickets, owners, tenants } = useApp();
  const { activityLogs } = useSuperAdmin();
  const { toasts, removeToast, success } = useToast();
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year' | 'all'>('month');

  // Calculate financial stats
  const financialStats = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (dateRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(0);
    }

    const filteredPayments = payments.filter((p) => {
      const paymentDate = new Date(p.mes_correspondiente);
      return paymentDate >= startDate;
    });

    const totalIncome = filteredPayments
      .filter((p) => p.estado_pago === 'pagado')
      .reduce((sum, p) => sum + p.monto, 0);

    const pendingIncome = filteredPayments
      .filter((p) => p.estado_pago === 'pendiente')
      .reduce((sum, p) => sum + p.monto, 0);

    const overdueIncome = filteredPayments
      .filter((p) => p.estado_pago === 'atrasado')
      .reduce((sum, p) => sum + p.monto, 0);

    return {
      total: totalIncome,
      pending: pendingIncome,
      overdue: overdueIncome,
      paymentsCount: filteredPayments.length,
    };
  }, [payments, dateRange]);

  // Property statistics
  const propertyStats = useMemo(() => {
    const occupied = properties.filter((p) => p.estado_ocupacion === 'ocupada').length;
    const available = properties.filter((p) => p.estado_ocupacion === 'disponible').length;
    const maintenance = properties.filter((p) => p.estado_ocupacion === 'mantenimiento').length;
    const occupancyRate = properties.length > 0 ? (occupied / properties.length) * 100 : 0;

    return { occupied, available, maintenance, occupancyRate };
  }, [properties]);

  // Export reports
  const exportFinancialReport = () => {
    const headers = ['Mes', 'Propiedad', 'Inquilino', 'Monto', 'Estado', 'Método Pago'];
    const rows = payments.map((p) => {
      const property = properties.find((prop) => prop.id === p.propertyId);
      const tenant = tenants.find((t) => t.id === p.tenantId);
      return [
        p.mes_correspondiente,
        property?.direccion || 'N/A',
        tenant?.nombre_completo || 'N/A',
        p.monto.toString(),
        p.estado_pago,
        p.metodo_pago,
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reporte-financiero-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    success('Reporte financiero exportado exitosamente');
  };

  const exportPropertiesReport = () => {
    const headers = [
      'Dirección',
      'Tipo',
      'Estado',
      'Renta Mensual',
      'Propietario',
      'Inquilino Actual',
    ];
    const rows = properties.map((p) => {
      const owner = owners.find((o) => o.id === p.ownerId);
      const activeContract = contracts.find(
        (c) => c.propertyId === p.id && c.estado_contrato === 'activo'
      );
      const tenant = activeContract
        ? tenants.find((t) => t.id === activeContract.tenantId)
        : null;

      return [
        p.direccion,
        p.tipo,
        p.estado_ocupacion,
        p.renta_mensual.toString(),
        owner?.nombre_completo || 'N/A',
        tenant?.nombre_completo || 'Ninguno',
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reporte-propiedades-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    success('Reporte de propiedades exportado exitosamente');
  };

  const exportUsersReport = () => {
    const headers = ['Nombre', 'Email', 'Teléfono', 'Tipo', 'Fecha Registro'];
    const ownerRows = owners.map((o) => [
      o.nombre_completo,
      o.email,
      o.telefono,
      'Propietario',
      'N/A',
    ]);
    const tenantRows = tenants.map((t) => [
      t.nombre_completo,
      t.email,
      t.telefono,
      'Inquilino',
      'N/A',
    ]);

    const csvContent = [
      headers.join(','),
      ...ownerRows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ...tenantRows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reporte-usuarios-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    success('Reporte de usuarios exportado exitosamente');
  };

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <DocumentChartBarIcon className="w-8 h-8" />
          Reportes y Analíticas
        </h1>
        <p className="text-yellow-100">Estadísticas detalladas y exportación de datos</p>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-primary" />
            Período de Análisis
          </h2>
          <div className="flex gap-2">
            {(['week', 'month', 'year', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  dateRange === range
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range === 'week'
                  ? 'Semana'
                  : range === 'month'
                  ? 'Mes'
                  : range === 'year'
                  ? 'Año'
                  : 'Todo'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
            Resumen Financiero
          </h2>
          <button
            onClick={exportFinancialReport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Exportar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
            <p className="text-green-100 mb-1">Ingresos Totales</p>
            <p className="text-3xl font-bold">{formatCurrency(financialStats.total, 'USD')}</p>
            <p className="text-sm text-green-100 mt-2">{financialStats.paymentsCount} pagos</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
            <p className="text-yellow-100 mb-1">Pendientes</p>
            <p className="text-3xl font-bold">{formatCurrency(financialStats.pending, 'USD')}</p>
            <p className="text-sm text-yellow-100 mt-2">Por cobrar</p>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-6 text-white">
            <p className="text-red-100 mb-1">Atrasados</p>
            <p className="text-3xl font-bold">{formatCurrency(financialStats.overdue, 'USD')}</p>
            <p className="text-sm text-red-100 mt-2">Requieren atención</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <p className="text-blue-100 mb-1">Total Pagos</p>
            <p className="text-3xl font-bold">{payments.length}</p>
            <p className="text-sm text-blue-100 mt-2">Todos los períodos</p>
          </div>
        </div>
      </div>

      {/* Property Statistics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <HomeIcon className="w-6 h-6 text-blue-600" />
            Estadísticas de Propiedades
          </h2>
          <button
            onClick={exportPropertiesReport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Exportar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <p className="text-purple-100 mb-1">Total Propiedades</p>
            <p className="text-3xl font-bold">{properties.length}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
            <p className="text-green-100 mb-1">Ocupadas</p>
            <p className="text-3xl font-bold">{propertyStats.occupied}</p>
            <p className="text-sm text-green-100 mt-2">
              {propertyStats.occupancyRate.toFixed(1)}% ocupación
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <p className="text-blue-100 mb-1">Disponibles</p>
            <p className="text-3xl font-bold">{propertyStats.available}</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
            <p className="text-yellow-100 mb-1">En Mantenimiento</p>
            <p className="text-3xl font-bold">{propertyStats.maintenance}</p>
          </div>
        </div>
      </div>

      {/* User Statistics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <UsersIcon className="w-6 h-6 text-purple-600" />
            Estadísticas de Usuarios
          </h2>
          <button
            onClick={exportUsersReport}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Exportar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-6 text-white">
            <p className="text-indigo-100 mb-1">Total Usuarios</p>
            <p className="text-3xl font-bold">{owners.length + tenants.length}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <p className="text-blue-100 mb-1">Propietarios</p>
            <p className="text-3xl font-bold">{owners.length}</p>
            <p className="text-sm text-blue-100 mt-2">{properties.length} propiedades</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
            <p className="text-green-100 mb-1">Inquilinos</p>
            <p className="text-3xl font-bold">{tenants.length}</p>
            <p className="text-sm text-green-100 mt-2">
              {contracts.filter((c) => c.estado_contrato === 'activo').length} contratos activos
            </p>
          </div>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <ChartBarIcon className="w-6 h-6 text-orange-600" />
          Resumen de Actividad
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border-2 border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Contratos Totales</p>
            <p className="text-2xl font-bold text-gray-900">{contracts.length}</p>
            <p className="text-xs text-gray-500 mt-1">
              {contracts.filter((c) => c.estado_contrato === 'activo').length} activos
            </p>
          </div>

          <div className="p-4 border-2 border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Tickets Totales</p>
            <p className="text-2xl font-bold text-gray-900">{tickets.length}</p>
            <p className="text-xs text-gray-500 mt-1">
              {tickets.filter((t) => t.estado === 'abierto').length} abiertos
            </p>
          </div>

          <div className="p-4 border-2 border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Logs de Actividad</p>
            <p className="text-2xl font-bold text-gray-900">{activityLogs.length}</p>
            <p className="text-xs text-gray-500 mt-1">Todas las acciones</p>
          </div>
        </div>
      </div>
    </div>
  );
};
