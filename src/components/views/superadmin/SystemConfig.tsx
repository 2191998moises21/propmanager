import React, { useState } from 'react';
import {
  Cog6ToothIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useSuperAdmin } from '@/contexts/SuperAdminContext';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/ui/Toast';
import { SystemConfig as SystemConfigType } from '@/types';

interface ConfigItemProps {
  config: SystemConfigType;
  onUpdate: (configId: string, newValue: string | number | boolean) => void;
}

const ConfigItem: React.FC<ConfigItemProps> = ({ config, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(config.valor);

  const handleSave = () => {
    onUpdate(config.id, value);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setValue(config.valor);
    setIsEditing(false);
  };

  const renderInput = () => {
    if (typeof config.valor === 'boolean') {
      return (
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={value as boolean}
              onChange={(e) => setValue(e.target.checked)}
              disabled={!isEditing}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
          <span className="text-sm font-medium text-gray-700">
            {value ? 'Activado' : 'Desactivado'}
          </span>
        </div>
      );
    }

    if (typeof config.valor === 'number') {
      return (
        <input
          type="number"
          value={value as number}
          onChange={(e) => setValue(Number(e.target.value))}
          disabled={!isEditing}
          className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
        />
      );
    }

    return (
      <input
        type="text"
        value={value as string}
        onChange={(e) => setValue(e.target.value)}
        disabled={!isEditing}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
      />
    );
  };

  const categoryColors: Record<string, string> = {
    pagos: 'bg-green-100 text-green-800',
    notificaciones: 'bg-blue-100 text-blue-800',
    general: 'bg-purple-100 text-purple-800',
    seguridad: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{config.clave}</h3>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                categoryColors[config.categoria] || 'bg-gray-100 text-gray-800'
              }`}
            >
              {config.categoria}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3">{config.descripcion}</p>
          <p className="text-xs text-gray-400">
            Última modificación: {config.fecha_modificacion}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {renderInput()}
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Editar
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Guardar
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const SystemConfig: React.FC = () => {
  const { systemConfig, updateSystemConfig } = useSuperAdmin();
  const { toasts, removeToast, success } = useToast();

  const handleUpdate = (configId: string, newValue: string | number | boolean) => {
    updateSystemConfig(configId, newValue);
    success('Configuración actualizada exitosamente');
  };

  // Group configs by category
  const configsByCategory = systemConfig.reduce((acc, config) => {
    if (!acc[config.categoria]) {
      acc[config.categoria] = [];
    }
    acc[config.categoria].push(config);
    return acc;
  }, {} as Record<string, SystemConfigType[]>);

  const categoryTitles: Record<string, string> = {
    pagos: 'Configuración de Pagos',
    notificaciones: 'Configuración de Notificaciones',
    general: 'Configuración General',
    seguridad: 'Configuración de Seguridad',
  };

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Cog6ToothIcon className="w-8 h-8" />
          Configuración del Sistema
        </h1>
        <p className="text-indigo-100">
          Gestiona la configuración global de la plataforma
        </p>
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
        <div className="flex items-start gap-3">
          <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              Precaución al modificar configuraciones
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Los cambios en la configuración del sistema afectan a toda la plataforma. Asegúrate
              de entender el impacto antes de realizar modificaciones.
            </p>
          </div>
        </div>
      </div>

      {/* Config Sections by Category */}
      {Object.entries(configsByCategory).map(([category, configs]) => (
        <div key={category} className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CheckCircleIcon className="w-6 h-6 text-primary" />
            {categoryTitles[category] || category}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {configs.map((config) => (
              <ConfigItem key={config.id} config={config} onUpdate={handleUpdate} />
            ))}
          </div>
        </div>
      ))}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <p className="text-blue-100 mb-1">Total Configuraciones</p>
          <p className="text-3xl font-bold">{systemConfig.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <p className="text-green-100 mb-1">Pagos</p>
          <p className="text-3xl font-bold">{configsByCategory.pagos?.length || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <p className="text-purple-100 mb-1">Notificaciones</p>
          <p className="text-3xl font-bold">{configsByCategory.notificaciones?.length || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-6 text-white">
          <p className="text-indigo-100 mb-1">General</p>
          <p className="text-3xl font-bold">{configsByCategory.general?.length || 0}</p>
        </div>
      </div>
    </div>
  );
};
