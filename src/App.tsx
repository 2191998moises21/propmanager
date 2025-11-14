import React from 'react';
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
    return <LoginPage />;
  }

  if (isSuperAdmin && currentUser.type === 'superadmin') {
    return <SuperAdminPortal superAdmin={currentUser.data} />;
  }

  if (isOwner && currentUser.type === 'owner') {
    return <LandlordPortal owner={currentUser.data} />;
  }

  if (isTenant && currentUser.type === 'tenant') {
    return <TenantPortal tenant={currentUser.data} />;
  }

  return null;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <SuperAdminProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </SuperAdminProvider>
    </AuthProvider>
  );
};

export default App;
