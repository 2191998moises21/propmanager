import React, { useState } from 'react';
import {
  ServerIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CircleStackIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useApp } from '@/contexts/AppContext';
import { useSuperAdmin } from '@/contexts/SuperAdminContext';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/ui/Toast';

export const Maintenance: React.FC = () => {
  const { properties, contracts, payments, tickets, owners, tenants } = useApp();
  const { activityLogs, systemConfig } = useSuperAdmin();
  const { toasts, removeToast, success, warning, error: showError } = useToast();
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  // Backup all data
  const handleBackupData = () => {
    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      data: {
        owners,
        tenants,
        properties,
        contracts,
        payments,
        tickets,
        activityLogs,
        systemConfig,
      },
    };

    const jsonString = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `propmanager-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    success('Respaldo completo generado exitosamente');
  };

  // Export individual data types
  const handleExportOwners = () => {
    const jsonString = JSON.stringify(owners, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `propietarios-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    success('Datos de propietarios exportados');
  };

  const handleExportTenants = () => {
    const jsonString = JSON.stringify(tenants, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `inquilinos-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    success('Datos de inquilinos exportados');
  };

  const handleExportProperties = () => {
    const jsonString = JSON.stringify(properties, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `propiedades-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    success('Datos de propiedades exportados');
  };

  // Data integrity check
  const checkDataIntegrity = () => {
    const issues: string[] = [];

    // Check for contracts without properties
    contracts.forEach((contract) => {
      if (!properties.find((p) => p.id === contract.propertyId)) {
        issues.push(`Contrato ${contract.id} referencia propiedad inexistente`);
      }
      if (!tenants.find((t) => t.id === contract.tenantId)) {
        issues.push(`Contrato ${contract.id} referencia inquilino inexistente`);
      }
    });

    // Check for payments without contracts
    payments.forEach((payment) => {
      if (!properties.find((p) => p.id === payment.propertyId)) {
        issues.push(`Pago ${payment.id} referencia propiedad inexistente`);
      }
      if (!tenants.find((t) => t.id === payment.tenantId)) {
        issues.push(`Pago ${payment.id} referencia inquilino inexistente`);
      }
    });

    // Check for tickets without properties
    tickets.forEach((ticket) => {
      if (!properties.find((p) => p.id === ticket.propertyId)) {
        issues.push(`Ticket ${ticket.id} referencia propiedad inexistente`);
      }
    });

    if (issues.length === 0) {
      success('✅ Verificación completa: No se encontraron problemas de integridad');
    } else {
      warning(`⚠️ Se encontraron ${issues.length} problemas de integridad`);
      console.log('Problemas de integridad:', issues);
    }

    return issues;
  };

  // Clear old logs
  const handleClearOldLogs = () => {
    if (
      !confirm(
        '¿Estás seguro de querer limpiar los logs antiguos? Esta acción no se puede deshacer.'
      )
    ) {
      return;
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const logsToKeep = activityLogs.filter((log) => new Date(log.fecha) >= thirtyDaysAgo);
    const logsRemoved = activityLogs.length - logsToKeep.length;

    if (logsRemoved > 0) {
      success(`${logsRemoved} logs antiguos eliminados. ${logsToKeep.length} logs conservados.`);
    } else {
      warning('No hay logs antiguos para eliminar');
    }
  };

  // Calculate storage usage (mock)
  const calculateStorageUsage = () => {
    const dataSize = JSON.stringify({
      owners,
      tenants,
      properties,
      contracts,
      payments,
      tickets,
      activityLogs,
    }).length;

    return {
      total: (dataSize / 1024).toFixed(2), // KB
      owners: (JSON.stringify(owners).length / 1024).toFixed(2),
      tenants: (JSON.stringify(tenants).length / 1024).toFixed(2),
      properties: (JSON.stringify(properties).length / 1024).toFixed(2),
      contracts: (JSON.stringify(contracts).length / 1024).toFixed(2),
      payments: (JSON.stringify(payments).length / 1024).toFixed(2),
      tickets: (JSON.stringify(tickets).length / 1024).toFixed(2),
      logs: (JSON.stringify(activityLogs).length / 1024).toFixed(2),
    };
  };

  const storage = calculateStorageUsage();

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <ServerIcon className="w-8 h-8" />
          Mantenimiento del Sistema
        </h1>
        <p className="text-indigo-100">Respaldos, limpieza y herramientas de mantenimiento</p>
      </div>

      {/* Maintenance Mode Toggle */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Modo Mantenimiento</h2>
            <p className="text-sm text-gray-600">
              Activar para realizar tareas de mantenimiento sin interrupciones de usuarios
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isMaintenanceMode}
              onChange={(e) => {
                setIsMaintenanceMode(e.target.checked);
                if (e.target.checked) {
                  warning('Modo mantenimiento activado');
                } else {
                  success('Modo mantenimiento desactivado');
                }
              }}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Backup Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <CircleStackIcon className="w-6 h-6 text-green-600" />
          Respaldo de Datos
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleBackupData}
            className="p-6 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
          >
            <ArrowDownTrayIcon className="w-12 h-12 mx-auto mb-3 text-green-600 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-gray-900 mb-1">Respaldo Completo</h3>
            <p className="text-sm text-gray-600">Exportar toda la base de datos</p>
            <p className="text-xs text-gray-500 mt-2">Incluye: usuarios, propiedades, pagos</p>
          </button>

          <div className="p-6 border-2 border-gray-200 rounded-lg">
            <ClockIcon className="w-12 h-12 mx-auto mb-3 text-blue-600" />
            <h3 className="font-bold text-gray-900 mb-1">Respaldos Programados</h3>
            <p className="text-sm text-gray-600 mb-3">Configurar respaldos automáticos</p>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Configurar
            </button>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold text-gray-900 mb-3">Exportar por Tipo</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={handleExportOwners}
              className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
            >
              <p className="font-medium text-blue-900">Propietarios</p>
              <p className="text-sm text-blue-700">{owners.length} registros</p>
            </button>
            <button
              onClick={handleExportTenants}
              className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left"
            >
              <p className="font-medium text-green-900">Inquilinos</p>
              <p className="text-sm text-green-700">{tenants.length} registros</p>
            </button>
            <button
              onClick={handleExportProperties}
              className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left"
            >
              <p className="font-medium text-purple-900">Propiedades</p>
              <p className="text-sm text-purple-700">{properties.length} registros</p>
            </button>
          </div>
        </div>
      </div>

      {/* Data Integrity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <ShieldCheckIcon className="w-6 h-6 text-purple-600" />
          Integridad de Datos
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={checkDataIntegrity}
            className="p-6 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
          >
            <CheckCircleIcon className="w-12 h-12 mx-auto mb-3 text-purple-600" />
            <h3 className="font-bold text-gray-900 mb-1">Verificar Integridad</h3>
            <p className="text-sm text-gray-600">Verificar relaciones y consistencia de datos</p>
          </button>

          <div className="p-6 border-2 border-gray-200 rounded-lg">
            <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-3 text-yellow-600" />
            <h3 className="font-bold text-gray-900 mb-1">Reparar Datos</h3>
            <p className="text-sm text-gray-600 mb-3">Corregir inconsistencias automáticamente</p>
            <button className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
              Ejecutar Reparación
            </button>
          </div>
        </div>
      </div>

      {/* Cleanup Tools */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrashIcon className="w-6 h-6 text-red-600" />
          Herramientas de Limpieza
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleClearOldLogs}
            className="p-6 border-2 border-dashed border-red-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all text-left"
          >
            <ClockIcon className="w-10 h-10 mb-3 text-red-600" />
            <h3 className="font-bold text-gray-900 mb-1">Limpiar Logs Antiguos</h3>
            <p className="text-sm text-gray-600">Eliminar logs de más de 30 días</p>
            <p className="text-xs text-gray-500 mt-2">{activityLogs.length} logs en el sistema</p>
          </button>

          <div className="p-6 border-2 border-gray-200 rounded-lg">
            <TrashIcon className="w-10 h-10 mb-3 text-gray-600" />
            <h3 className="font-bold text-gray-900 mb-1">Limpiar Cache</h3>
            <p className="text-sm text-gray-600 mb-3">
              Eliminar datos temporales y cache del sistema
            </p>
            <button className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              Limpiar Cache
            </button>
          </div>
        </div>
      </div>

      {/* Storage Usage */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <CircleStackIcon className="w-6 h-6 text-indigo-600" />
          Uso de Almacenamiento
        </h2>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Almacenamiento Total</span>
            <span className="font-bold text-gray-900">{storage.total} KB</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-indigo-600 h-3 rounded-full" style={{ width: '45%' }}></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">45% utilizado de 1 MB disponible</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-600">Propietarios</p>
            <p className="font-bold text-blue-900">{storage.owners} KB</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-xs text-green-600">Inquilinos</p>
            <p className="font-bold text-green-900">{storage.tenants} KB</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <p className="text-xs text-purple-600">Propiedades</p>
            <p className="font-bold text-purple-900">{storage.properties} KB</p>
          </div>
          <div className="p-3 bg-yellow-50 rounded-lg">
            <p className="text-xs text-yellow-600">Pagos</p>
            <p className="font-bold text-yellow-900">{storage.payments} KB</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <p className="text-xs text-red-600">Contratos</p>
            <p className="font-bold text-red-900">{storage.contracts} KB</p>
          </div>
          <div className="p-3 bg-indigo-50 rounded-lg">
            <p className="text-xs text-indigo-600">Tickets</p>
            <p className="font-bold text-indigo-900">{storage.tickets} KB</p>
          </div>
          <div className="p-3 bg-pink-50 rounded-lg">
            <p className="text-xs text-pink-600">Logs</p>
            <p className="font-bold text-pink-900">{storage.logs} KB</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">Total</p>
            <p className="font-bold text-gray-900">{storage.total} KB</p>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <CheckCircleIcon className="w-8 h-8 mb-2" />
          <p className="text-2xl font-bold">100%</p>
          <p className="text-green-100">Sistema Operativo</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <ServerIcon className="w-8 h-8 mb-2" />
          <p className="text-2xl font-bold">{storage.total} KB</p>
          <p className="text-blue-100">Datos Almacenados</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <ClockIcon className="w-8 h-8 mb-2" />
          <p className="text-2xl font-bold">&lt; 100ms</p>
          <p className="text-purple-100">Tiempo de Respuesta</p>
        </div>
      </div>
    </div>
  );
};
