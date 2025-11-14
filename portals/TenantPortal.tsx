import React, { useState, useMemo, useEffect } from 'react';
import { TenantSidebar } from '../components/layout/TenantSidebar';
import { Header } from '../components/layout/Header';
import { TenantDashboard } from '../components/views/tenant/TenantDashboard';
import { MyPropertyView } from '../components/views/tenant/MyPropertyView';
import { MyContractView } from '../components/views/tenant/MyContractView';
import { TenantTicketsView } from '../components/views/tenant/TenantTicketsView';
import { TenantPaymentsView } from '../components/views/tenant/TenantPaymentsView';
import { TenantProfileView } from '../components/views/tenant/TenantProfileView';
import { Tenant, Property, Contract, Payment, Ticket, Contractor, ContractStatus } from '../types';

export type TenantView = 'dashboard' | 'property' | 'contract' | 'payments' | 'tickets' | 'profile';

interface TenantPortalProps {
    tenant: Tenant;
    allData: {
        properties: Property[];
        tenants: Tenant[];
        contracts: Contract[];
        payments: Payment[];
        tickets: Ticket[];
        contractors: Contractor[];
    };
    onLogout: () => void;
    handlers: {
        addTicket: (ticket: Omit<Ticket, 'id' | 'costo_estimado' | 'moneda' | 'urgencia' | 'estado' | 'fecha_creacion'>) => void;
        uploadPaymentProof: (paymentId: string, proofUrl: string) => void;
    };
}

export const TenantPortal: React.FC<TenantPortalProps> = ({ tenant, allData, onLogout, handlers }) => {
  const [view, setView] = useState<TenantView>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);

  const tenantData = useMemo(() => {
    const contract = allData.contracts.find(c => c.tenantId === tenant.id && c.estado_contrato === ContractStatus.Activo);
    const property = contract ? allData.properties.find(p => p.id === contract.propertyId) : undefined;
    const payments = contract ? allData.payments.filter(p => p.contractId === contract.id) : [];
    const tickets = contract ? allData.tickets.filter(t => t.tenantId === tenant.id && t.propertyId === property?.id) : [];
    return { contract, property, payments, tickets };
  }, [tenant, allData]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  
  const content = useMemo(() => {
    if (!tenantData.contract || !tenantData.property) {
        return (
            <div className="text-center p-10">
                <h2 className="text-2xl font-semibold">Bienvenido, {tenant.nombre_completo}</h2>
                <p className="text-gray-600 mt-2">Parece que no tiene un contrato activo asignado. Por favor, contacte a su propietario.</p>
            </div>
        );
    }
    
    switch (view) {
        case 'dashboard':
            return <TenantDashboard tenant={tenant} tickets={tenantData.tickets} payments={tenantData.payments} setView={setView} />;
        case 'property':
            return <MyPropertyView property={tenantData.property} />;
        case 'contract':
            return <MyContractView contract={tenantData.contract} property={tenantData.property} />;
        case 'tickets':
            return <TenantTicketsView tickets={tenantData.tickets} property={tenantData.property} tenant={tenant} addTicket={handlers.addTicket} />;
        case 'payments':
            return <TenantPaymentsView payments={tenantData.payments} contract={tenantData.contract} uploadPaymentProof={handlers.uploadPaymentProof} />;
        case 'profile':
            return <TenantProfileView tenant={tenant} />;
        default:
            return <TenantDashboard tenant={tenant} tickets={tenantData.tickets} payments={tenantData.payments} setView={setView} />;
    }
  }, [view, tenant, tenantData, handlers]);

  return (
    <div className="flex h-screen bg-background">
      <TenantSidebar currentView={view} setView={setView} isOpen={isSidebarOpen} toggle={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} user={tenant} onLogout={onLogout} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
          {content}
        </main>
      </div>
    </div>
  );
};