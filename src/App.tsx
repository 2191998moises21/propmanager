import React from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AppProvider } from '@/contexts/AppContext';
import { SuperAdminProvider } from '@/contexts/SuperAdminContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { useToast } from '@/contexts/ToastContext';
import { LoginPage } from '@/pages/LoginPage';
import { LandlordPortal } from '@/portals/LandlordPortal';
import { TenantPortal } from '@/portals/TenantPortal';
import { SuperAdminPortal } from '@/portals/SuperAdminPortal';

const ToastManager: React.FC = () => {
  const { toasts, removeToast } = useToast();
  return <ToastContainer toasts={toasts} onRemove={removeToast} />;
};

const AppContent: React.FC = () => {
  const { currentUser, isOwner, isTenant, isSuperAdmin } = useAuth();

  return (
    <>
      <ToastManager />
      {!currentUser ? (
        <ErrorBoundary>
          <LoginPage />
        </ErrorBoundary>
      ) : isSuperAdmin && currentUser.type === 'superadmin' ? (
        <ErrorBoundary>
          <SuperAdminPortal superAdmin={currentUser.data} />
        </ErrorBoundary>
      ) : isOwner && currentUser.type === 'owner' ? (
        <ErrorBoundary>
          <LandlordPortal owner={currentUser.data} />
        </ErrorBoundary>
      ) : isTenant && currentUser.type === 'tenant' ? (
        <ErrorBoundary>
          <TenantPortal tenant={currentUser.data} />
        </ErrorBoundary>
      ) : null}
    </>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <SuperAdminProvider>
            <AppProvider>
              <AppContent />
            </AppProvider>
          </SuperAdminProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;
