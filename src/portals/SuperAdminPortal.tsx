import React, { useState, useEffect } from 'react';
import { SuperAdmin } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { SuperAdminDashboard } from '@/components/views/superadmin/SuperAdminDashboard';
import { UsersManagement } from '@/components/views/superadmin/UsersManagement';
import { ActivityLogs } from '@/components/views/superadmin/ActivityLogs';
import { SystemConfig } from '@/components/views/superadmin/SystemConfig';
import { Reports } from '@/components/views/superadmin/Reports';
import { SupportTools } from '@/components/views/superadmin/SupportTools';
import { Maintenance } from '@/components/views/superadmin/Maintenance';
import {
  ChartBarIcon,
  UsersIcon,
  ClockIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ShieldCheckIcon,
  DocumentChartBarIcon,
  WrenchScrewdriverIcon,
  ServerIcon,
} from '@heroicons/react/24/outline';

export type SuperAdminView =
  | 'dashboard'
  | 'users'
  | 'logs'
  | 'config'
  | 'reports'
  | 'support'
  | 'maintenance';

interface SuperAdminPortalProps {
  superAdmin: SuperAdmin;
}

export const SuperAdminPortal: React.FC<SuperAdminPortalProps> = ({ superAdmin }) => {
  const { logout } = useAuth();
  const [view, setView] = useState<SuperAdminView>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const menuItems = [
    { id: 'dashboard' as SuperAdminView, label: 'Dashboard', icon: ChartBarIcon },
    { id: 'users' as SuperAdminView, label: 'Usuarios', icon: UsersIcon },
    { id: 'logs' as SuperAdminView, label: 'Actividad', icon: ClockIcon },
    { id: 'reports' as SuperAdminView, label: 'Reportes', icon: DocumentChartBarIcon },
    { id: 'config' as SuperAdminView, label: 'Configuración', icon: Cog6ToothIcon },
    { id: 'support' as SuperAdminView, label: 'Soporte', icon: WrenchScrewdriverIcon },
    { id: 'maintenance' as SuperAdminView, label: 'Mantenimiento', icon: ServerIcon },
  ];

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <SuperAdminDashboard onNavigate={(newView) => setView(newView as SuperAdminView)} />;
      case 'users':
        return <UsersManagement />;
      case 'logs':
        return <ActivityLogs />;
      case 'reports':
        return <Reports />;
      case 'config':
        return <SystemConfig />;
      case 'support':
        return <SupportTools />;
      case 'maintenance':
        return <Maintenance />;
      default:
        return <SuperAdminDashboard onNavigate={(newView) => setView(newView as SuperAdminView)} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed md:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-purple-800 to-indigo-900 text-white transition-transform duration-300 ease-in-out flex flex-col`}
      >
        {/* Header */}
        <div className="p-6 border-b border-purple-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="w-8 h-8 text-yellow-400" />
              <h1 className="text-xl font-bold">SuperAdmin</h1>
            </div>
            <button onClick={toggleSidebar} className="md:hidden text-white">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <img
              src={superAdmin.fotoUrl}
              alt={superAdmin.nombre_completo}
              className="w-12 h-12 rounded-full border-2 border-yellow-400"
            />
            <div>
              <p className="font-semibold text-sm">{superAdmin.nombre_completo}</p>
              <p className="text-xs text-purple-200">{superAdmin.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.id);
                  if (window.innerWidth < 768) setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-white text-purple-900 shadow-lg'
                    : 'text-purple-100 hover:bg-purple-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-purple-700">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-purple-100 hover:bg-purple-700 rounded-lg transition-colors"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <button onClick={toggleSidebar} className="md:hidden p-2 rounded-lg hover:bg-gray-100">
              <Bars3Icon className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">Panel de SuperAdmin</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
                <span className="text-sm font-medium">Modo Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">{renderView()}</main>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};
