import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { Dashboard } from '../components/views/Dashboard';
import { Properties } from '../components/views/Properties';
import { Tenants } from '../components/views/Tenants';
import { Contracts } from '../components/views/Contracts';
import { Payments } from '../components/views/Payments';
import { Income } from '../components/views/Income';
import { Tickets } from '../components/views/Tickets';
import { Profile } from '../components/views/Profile';
import { PropertyDetail } from '../components/views/PropertyDetail';
import { ContractDetail } from '../components/views/ContractDetail';
import { Owner, Property, Tenant, Contract, Payment, Ticket, Contractor, OccupancyStatus } from '../types';

export type View = 'dashboard' | 'properties' | 'tenants' | 'contracts' | 'payments' | 'tickets' | 'income' | 'profile';

interface LandlordPortalProps {
    owner: Owner;
    properties: Property[];
    tenants: Tenant[];
    contracts: Contract[];
    payments: Payment[];
    tickets: Ticket[];
    contractors: Contractor[];
    onLogout: () => void;
    handlers: any;
}

export const LandlordPortal: React.FC<LandlordPortalProps> = ({
    owner, properties, tenants, contracts, payments, tickets, contractors, onLogout, handlers
}) => {
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

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  
  const handleAddProperty = (property: Omit<Property, 'id'>) => {
    handlers.addProperty(property);
    setView('properties');
  };

  const handleAddTenant = (tenant: Omit<Tenant, 'id'>) => {
    handlers.addTenant(tenant);
    setView('tenants');
  };

  const handleAddContract = (contract: Omit<Contract, 'id'>) => {
    handlers.addContract(contract);
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
    const property = properties.find(p => p.id === selectedPropertyId);
    if (!property) return null;
    const contract = contracts.find(c => c.propertyId === property.id && c.estado_contrato === 'activo');
    const tenant = contract ? tenants.find(t => t.id === contract.tenantId) : null;
    return { property, contract, tenant };
  }, [selectedPropertyId, properties, contracts, tenants]);

  const selectedContractData = useMemo(() => {
    if (!selectedContractId) return null;
    const contract = contracts.find(c => c.id === selectedContractId);
    if (!contract) return null;
    const property = properties.find(p => p.id === contract.propertyId);
    const tenant = tenants.find(t => t.id === contract.tenantId);
    return { contract, property, tenant };
  }, [selectedContractId, properties, contracts, tenants]);

  const content = useMemo(() => {
    if (selectedPropertyId && selectedPropertyData) {
        return <PropertyDetail 
                    {...selectedPropertyData} 
                    onBack={handleDeselectProperty} 
                    tenants={tenants}
                    addContract={handleAddContract}
                    terminateContract={handlers.terminateContract}
                    updatePropertyStatus={handlers.updatePropertyStatus}
                    onSelectContract={handleSelectContract}
                    updateProperty={handlers.updateProperty}
                    deleteProperty={handlers.deleteProperty}
                />;
    }
    
    if (selectedContractId && selectedContractData) {
        return <ContractDetail
                    {...selectedContractData}
                    onBack={handleDeselectContract}
                    addDocument={handlers.addDocumentToContract}
                />
    }

    switch (view) {
      case 'dashboard':
        return <Dashboard properties={properties} contracts={contracts} payments={payments} setView={setView} />;
      case 'properties':
        return <Properties properties={properties} addProperty={handleAddProperty} onSelectProperty={handleSelectProperty} />;
      case 'tenants':
        return <Tenants tenants={tenants} addTenant={handleAddTenant} updateTenant={handlers.updateTenant} />;
      case 'contracts':
        return <Contracts contracts={contracts} properties={properties} tenants={tenants} addContract={handleAddContract} onSelectContract={handleSelectContract} />;
      case 'payments':
        return <Payments payments={payments} contracts={contracts} tenants={tenants} properties={properties} addPayment={handlers.addPayment} updatePayment={handlers.updatePayment} />;
      case 'tickets':
        return <Tickets tickets={tickets} properties={properties} tenants={tenants} contractors={contractors} updateTicket={handlers.updateTicket} />;
      case 'income':
        return <Income contracts={contracts} properties={properties} tenants={tenants} payments={payments} setView={setView} />;
      case 'profile':
        return <Profile owner={owner} onUpdate={handlers.updateOwner} />;
      default:
        return <Dashboard properties={properties} contracts={contracts} payments={payments} setView={setView} />;
    }
  }, [view, properties, tenants, contracts, payments, tickets, contractors, owner, selectedPropertyId, selectedPropertyData, selectedContractId, selectedContractData]);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentView={view} setView={setView} isOpen={isSidebarOpen} toggle={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} user={owner} onLogout={onLogout} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
          {content}
        </main>
      </div>
    </div>
  );
};