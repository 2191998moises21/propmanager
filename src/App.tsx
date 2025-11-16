import React from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AppProvider } from '@/contexts/AppContext';
import { SuperAdminProvider } from '@/contexts/SuperAdminContext';
import { LoginPage } from '@/pages/LoginPage';
import { LandlordPortal } from '@/portals/LandlordPortal';
import { TenantPortal } from '@/portals/TenantPortal';
import { SuperAdminPortal } from '@/portals/SuperAdminPortal';

const AppContent: React.FC = () => {
  const { currentUser, isOwner, isTenant, isSuperAdmin } = useAuth();

  if (!currentUser) {
    return (
      <ErrorBoundary>
        <LoginPage />
      </ErrorBoundary>
    );
  }

  if (isSuperAdmin && currentUser.type === 'superadmin') {
    return (
      <ErrorBoundary>
        <SuperAdminPortal superAdmin={currentUser.data} />
      </ErrorBoundary>
    );
  }

  if (isOwner && currentUser.type === 'owner') {
    return (
      <ErrorBoundary>
        <LandlordPortal owner={currentUser.data} />
      </ErrorBoundary>
    );
  }

  if (isTenant && currentUser.type === 'tenant') {
    return (
      <ErrorBoundary>
        <TenantPortal tenant={currentUser.data} />
      </ErrorBoundary>
    );
  }

  return null;
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SuperAdminProvider>
          <AppProvider>
            <AppContent />
          </AppProvider>
        </SuperAdminProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
