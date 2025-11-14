import React from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AppProvider } from '@/contexts/AppContext';
import { LoginPage } from '@/pages/LoginPage';
import { LandlordPortal } from '@/portals/LandlordPortal';
import { TenantPortal } from '@/portals/TenantPortal';

const AppContent: React.FC = () => {
  const { currentUser, isOwner, isTenant } = useAuth();

  if (!currentUser) {
    return <LoginPage />;
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
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
};

export default App;
