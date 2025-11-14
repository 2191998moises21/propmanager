import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Dashboard } from '@/components/views/Dashboard';
import { Properties } from '@/components/views/Properties';
import { Tenants } from '@/components/views/Tenants';
import { Contracts } from '@/components/views/Contracts';
import { Payments } from '@/components/views/Payments';
import { Income } from '@/components/views/Income';
import { Tickets } from '@/components/views/Tickets';
import { Profile } from '@/components/views/Profile';
import { PropertyDetail } from '@/components/views/PropertyDetail';
import { ContractDetail } from '@/components/views/ContractDetail';
import { Owner } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';

export type View =
  | 'dashboard'
  | 'properties'
  | 'tenants'
  | 'contracts'
  | 'payments'
  | 'tickets'
  | 'income'
  | 'profile';

interface LandlordPortalProps {
  owner: Owner;
}

export const LandlordPortal: React.FC<LandlordPortalProps> = ({ owner }) => {
  const { logout } = useAuth();
  const {
    properties,
    tenants,
    contracts,
    payments,
    tickets,
    contractors,
    addProperty,
    updateProperty,
    deleteProperty,
    addTenant,
    updateTenant,
    addContract,
    addPayment,
    updatePayment,
    updateTicket,
    updateOwner,
    terminateContract,
    updatePropertyStatus,
    addDocumentToContract,
  } = useApp();

  const [view, setView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);

  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);

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

  const handleAddProperty = (property: Parameters<typeof addProperty>[0]) => {
    addProperty(property);
    setView('properties');
  };

  const handleAddTenant = (tenant: Parameters<typeof addTenant>[0]) => {
    addTenant(tenant);
    setView('tenants');
  };

  const handleAddContract = (contract: Parameters<typeof addContract>[0]) => {
    addContract(contract);
    setSelectedPropertyId(null);
    setView('properties');
  };

  const handleSelectProperty = (id: string) => {
    setView('properties');
    setSelectedPropertyId(id);
    setSelectedContractId(null);
  };

  const handleDeselectProperty = () => {
    setSelectedPropertyId(null);
  };

  const handleSelectContract = (id: string) => {
    setView('contracts');
    setSelectedContractId(id);
    setSelectedPropertyId(null);
  };

  const handleDeselectContract = () => {
    setSelectedContractId(null);
  };

  const selectedPropertyData = useMemo(() => {
    if (!selectedPropertyId) return null;
    const property = properties.find((p) => p.id === selectedPropertyId);
    if (!property) return null;
    const contract = contracts.find(
      (c) => c.propertyId === property.id && c.estado_contrato === 'activo'
    );
    const tenant = contract ? tenants.find((t) => t.id === contract.tenantId) : null;
    return { property, contract, tenant };
  }, [selectedPropertyId, properties, contracts, tenants]);

  const selectedContractData = useMemo(() => {
    if (!selectedContractId) return null;
    const contract = contracts.find((c) => c.id === selectedContractId);
    if (!contract) return null;
    const property = properties.find((p) => p.id === contract.propertyId);
    const tenant = tenants.find((t) => t.id === contract.tenantId);
    return { contract, property, tenant };
  }, [selectedContractId, properties, contracts, tenants]);

  const content = useMemo(() => {
    if (selectedPropertyId && selectedPropertyData) {
      return (
        <PropertyDetail
          {...selectedPropertyData}
          onBack={handleDeselectProperty}
          tenants={tenants}
          addContract={handleAddContract}
          terminateContract={terminateContract}
          updatePropertyStatus={updatePropertyStatus}
          onSelectContract={handleSelectContract}
          updateProperty={updateProperty}
          deleteProperty={deleteProperty}
        />
      );
    }

    if (selectedContractId && selectedContractData) {
      return (
        <ContractDetail
          {...selectedContractData}
          onBack={handleDeselectContract}
          addDocument={addDocumentToContract}
          onSelectProperty={handleSelectProperty}
        />
      );
    }

    switch (view) {
      case 'dashboard':
        return (
          <Dashboard
            properties={properties}
            contracts={contracts}
            payments={payments}
            setView={setView}
            onSelectProperty={handleSelectProperty}
          />
        );
      case 'properties':
        return (
          <Properties
            properties={properties}
            addProperty={handleAddProperty}
            onSelectProperty={handleSelectProperty}
          />
        );
      case 'tenants':
        return (
          <Tenants tenants={tenants} addTenant={handleAddTenant} updateTenant={updateTenant} />
        );
      case 'contracts':
        return (
          <Contracts
            contracts={contracts}
            properties={properties}
            tenants={tenants}
            addContract={handleAddContract}
            onSelectContract={handleSelectContract}
          />
        );
      case 'payments':
        return (
          <Payments
            payments={payments}
            contracts={contracts}
            tenants={tenants}
            properties={properties}
            addPayment={addPayment}
            updatePayment={updatePayment}
            onSelectContract={handleSelectContract}
          />
        );
      case 'tickets':
        return (
          <Tickets
            tickets={tickets}
            properties={properties}
            tenants={tenants}
            contractors={contractors}
            updateTicket={updateTicket}
            onSelectProperty={handleSelectProperty}
          />
        );
      case 'income':
        return (
          <Income
            contracts={contracts}
            properties={properties}
            tenants={tenants}
            payments={payments}
            setView={setView}
            onSelectContract={handleSelectContract}
          />
        );
      case 'profile':
        return <Profile owner={owner} onUpdate={updateOwner} />;
      default:
        return (
          <Dashboard
            properties={properties}
            contracts={contracts}
            payments={payments}
            setView={setView}
            onSelectProperty={handleSelectProperty}
          />
        );
    }
  }, [
    view,
    properties,
    tenants,
    contracts,
    payments,
    tickets,
    contractors,
    owner,
    selectedPropertyId,
    selectedPropertyData,
    selectedContractId,
    selectedContractData,
  ]);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentView={view} setView={setView} isOpen={isSidebarOpen} toggle={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} user={owner} onLogout={logout} setView={setView} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
          {content}
        </main>
      </div>
    </div>
  );
};
