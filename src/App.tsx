import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AppProvider } from '@/contexts/AppContext';
import { SuperAdminProvider } from '@/contexts/SuperAdminContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { useToast } from '@/contexts/ToastContext';
import { LoginPage } from '@/pages/LoginPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
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
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            currentUser ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <ErrorBoundary>
                <LoginPage />
              </ErrorBoundary>
            )
          }
        />
        <Route
          path="/forgot-password"
          element={
            currentUser ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <ErrorBoundary>
                <ForgotPasswordPage />
              </ErrorBoundary>
            )
          }
        />
        <Route
          path="/reset-password"
          element={
            currentUser ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <ErrorBoundary>
                <ResetPasswordPage />
              </ErrorBoundary>
            )
          }
        />

        {/* Protected routes */}
        <Route
          path="/dashboard/*"
          element={
            !currentUser ? (
              <Navigate to="/login" replace />
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
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Default route */}
        <Route
          path="/"
          element={<Navigate to={currentUser ? '/dashboard' : '/login'} replace />}
        />

        {/* Catch all - redirect to login or dashboard */}
        <Route
          path="*"
          element={<Navigate to={currentUser ? '/dashboard' : '/login'} replace />}
        />
      </Routes>
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
