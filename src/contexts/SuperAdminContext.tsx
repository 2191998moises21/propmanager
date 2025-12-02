import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
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
import { activityLogsAPI } from '@/services/api';
import { useAuth } from './AuthContext';
import { mockSuperAdmin, mockSystemConfig } from '@/data/mockSuperAdminData';

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
  const { currentUser, isAuthenticated } = useAuth();
  const [superAdmin] = useState<SuperAdmin>(mockSuperAdmin);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
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

  // Fetch activity logs when SuperAdmin logs in
  useEffect(() => {
    const fetchActivityLogs = async () => {
      if (isAuthenticated && currentUser?.type === 'superadmin') {
        try {
          const result = await activityLogsAPI.getAll({ limit: 100 });
          if (result.success && result.data) {
            // Convert backend format (snake_case) to frontend format (camelCase)
            const logs = (result.data as any[]).map((backendLog: any) => ({
              id: backendLog.id,
              userId: backendLog.user_id,
              userType: backendLog.user_type,
              userName: backendLog.user_name,
              accion: backendLog.accion,
              descripcion: backendLog.descripcion,
              fecha: backendLog.fecha,
              detalles: backendLog.detalles,
            }));
            setActivityLogs(logs);
          }
        } catch (error) {
          console.error('Error fetching activity logs:', error);
        }
      } else {
        setActivityLogs([]);
      }
    };

    fetchActivityLogs();
  }, [isAuthenticated, currentUser]);

  // Log handlers
  const addActivityLog = useCallback(async (log: Omit<ActivityLog, 'id' | 'fecha'>) => {
    try {
      const result = await activityLogsAPI.create({
        user_id: log.userId,
        user_type: log.userType,
        user_name: log.userName,
        accion: log.accion as string,
        descripcion: log.descripcion,
        detalles: log.detalles,
      });

      if (result.success && result.data) {
        // Convert backend format (snake_case) to frontend format (camelCase)
        const backendLog: any = result.data;
        const frontendLog: ActivityLog = {
          id: backendLog.id,
          userId: backendLog.user_id,
          userType: backendLog.user_type,
          userName: backendLog.user_name,
          accion: backendLog.accion,
          descripcion: backendLog.descripcion,
          fecha: backendLog.fecha,
          detalles: backendLog.detalles,
        };
        setActivityLogs((prev) => [frontendLog, ...prev]);
      }
    } catch (error) {
      console.error('Error creating activity log:', error);
    }
  }, []);

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
