import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  SuperAdmin,
  ActivityLog,
  SystemConfig,
  PlatformStats,
  Owner,
  Tenant,
  UserStatus,
  LogAction,
} from '@/types';
import { generateId } from '@/utils/id';
import {
  mockSuperAdmin,
  mockActivityLogs,
  mockSystemConfig,
} from '@/data/mockSuperAdminData';

interface SuperAdminContextType {
  // State
  superAdmin: SuperAdmin;
  activityLogs: ActivityLog[];
  systemConfig: SystemConfig[];
  platformStats: PlatformStats;

  // Log handlers
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'fecha'>) => void;
  getLogsByUser: (userId: string) => ActivityLog[];
  getLogsByAction: (action: LogAction) => ActivityLog[];

  // Config handlers
  updateSystemConfig: (configId: string, newValue: string | number | boolean) => void;
  getConfigByKey: (key: string) => SystemConfig | undefined;

  // User management
  updateUserStatus: (userId: string, userType: 'owner' | 'tenant', status: UserStatus) => void;
  deleteUser: (userId: string, userType: 'owner' | 'tenant') => void;

  // Platform stats
  refreshPlatformStats: (owners: Owner[], tenants: Tenant[]) => void;
}

const SuperAdminContext = createContext<SuperAdminContextType | undefined>(undefined);

interface SuperAdminProviderProps {
  children: ReactNode;
}

export const SuperAdminProvider: React.FC<SuperAdminProviderProps> = ({ children }) => {
  const [superAdmin] = useState<SuperAdmin>(mockSuperAdmin);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(mockActivityLogs);
  const [systemConfig, setSystemConfig] = useState<SystemConfig[]>(mockSystemConfig);
  const [platformStats, setPlatformStats] = useState<PlatformStats>({
    totalUsuarios: 0,
    totalPropietarios: 0,
    totalInquilinos: 0,
    totalPropiedades: 0,
    propiedadesOcupadas: 0,
    totalContratos: 0,
    ingresosEsteMes: 0,
    ticketsAbiertos: 0,
    moneda: 'USD',
  });

  // Log handlers
  const addActivityLog = useCallback(
    (log: Omit<ActivityLog, 'id' | 'fecha'>) => {
      const newLog: ActivityLog = {
        ...log,
        id: generateId('log'),
        fecha: new Date().toISOString(),
      };
      setActivityLogs((prev) => [newLog, ...prev]);
    },
    []
  );

  const getLogsByUser = useCallback(
    (userId: string): ActivityLog[] => {
      return activityLogs.filter((log) => log.userId === userId);
    },
    [activityLogs]
  );

  const getLogsByAction = useCallback(
    (action: LogAction): ActivityLog[] => {
      return activityLogs.filter((log) => log.accion === action);
    },
    [activityLogs]
  );

  // Config handlers
  const updateSystemConfig = useCallback(
    (configId: string, newValue: string | number | boolean) => {
      setSystemConfig((prev) =>
        prev.map((cfg) =>
          cfg.id === configId
            ? {
                ...cfg,
                valor: newValue,
                fecha_modificacion: new Date().toISOString().split('T')[0],
              }
            : cfg
        )
      );
    },
    []
  );

  const getConfigByKey = useCallback(
    (key: string): SystemConfig | undefined => {
      return systemConfig.find((cfg) => cfg.clave === key);
    },
    [systemConfig]
  );

  // User management
  const updateUserStatus = useCallback(
    (userId: string, userType: 'owner' | 'tenant', status: UserStatus) => {
      addActivityLog({
        userId: superAdmin.id,
        userType: 'superadmin',
        userName: superAdmin.nombre_completo,
        accion: LogAction.UpdateUserStatus,
        descripcion: `Cambió estado de usuario ${userId} a ${status}`,
        detalles: { userId, userType, newStatus: status },
      });
    },
    [superAdmin, addActivityLog]
  );

  const deleteUser = useCallback(
    (userId: string, userType: 'owner' | 'tenant') => {
      addActivityLog({
        userId: superAdmin.id,
        userType: 'superadmin',
        userName: superAdmin.nombre_completo,
        accion: LogAction.DeleteUser,
        descripcion: `Eliminó usuario ${userType}: ${userId}`,
        detalles: { userId, userType },
      });
    },
    [superAdmin, addActivityLog]
  );

  // Platform stats
  const refreshPlatformStats = useCallback((owners: Owner[], tenants: Tenant[]) => {
    setPlatformStats((prev) => ({
      ...prev,
      totalPropietarios: owners.length,
      totalInquilinos: tenants.length,
      totalUsuarios: owners.length + tenants.length,
    }));
  }, []);

  const value: SuperAdminContextType = {
    superAdmin,
    activityLogs,
    systemConfig,
    platformStats,
    addActivityLog,
    getLogsByUser,
    getLogsByAction,
    updateSystemConfig,
    getConfigByKey,
    updateUserStatus,
    deleteUser,
    refreshPlatformStats,
  };

  return <SuperAdminContext.Provider value={value}>{children}</SuperAdminContext.Provider>;
};

export const useSuperAdmin = (): SuperAdminContextType => {
  const context = useContext(SuperAdminContext);
  if (context === undefined) {
    throw new Error('useSuperAdmin must be used within a SuperAdminProvider');
  }
  return context;
};
