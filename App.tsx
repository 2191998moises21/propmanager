import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/views/Dashboard';
import { Properties } from './components/views/Properties';
import { Tenants } from './components/views/Tenants';
import { Contracts } from './components/views/Contracts';
import { Payments } from './components/views/Payments';
import { Income } from './components/views/Income';
import { Tickets } from './components/views/Tickets';
import { Profile } from './components/views/Profile';
import { PropertyDetail } from './components/views/PropertyDetail';
import { ContractDetail } from './components/views/ContractDetail';
import { mockProperties, mockTenants, mockContracts, mockPayments, mockTickets, mockContractors, mockOwner } from './data/mockData';
import { Owner, Property, Tenant, Contract, Payment, OccupancyStatus, Ticket, Contractor, ContractStatus, ContractDocument } from './types';

export type View = 'dashboard' | 'properties' | 'tenants' | 'contracts' | 'payments' | 'tickets' | 'income' | 'profile';

const App: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  
  const [properties, setProperties] = useState<Property[]>(mockProperties);
  const [tenants, setTenants] = useState<Tenant[]>(mockTenants);
  const [contracts, setContracts] = useState<Contract[]>(mockContracts);
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [contractors, setContractors] = useState<Contractor[]>(mockContractors);
  const [owner, setOwner] = useState<Owner>(mockOwner);
  
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    // Clean up the event listener when the component unmounts
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  
  const addProperty = (property: Omit<Property, 'id'>) => {
    const newProperty: Property = {
      ...property,
      id: `prop${properties.length + 1}`,
    };
    setProperties(prev => [newProperty, ...prev]);
    setView('properties');
  };
  
  const updateProperty = (updatedProperty: Property) => {
    setProperties(prev => prev.map(p => p.id === updatedProperty.id ? updatedProperty : p));
  };

  const deleteProperty = (propertyId: string) => {
    setProperties(prev => prev.filter(p => p.id !== propertyId));
    setSelectedPropertyId(null);
  };

  const addTenant = (tenant: Omit<Tenant, 'id'>) => {
    const newTenant: Tenant = {
      ...tenant,
      id: `ten${tenants.length + 1}`,
    };
    setTenants(prev => [newTenant, ...prev]);
    setView('tenants');
  };
  
  const updateTenant = (updatedTenant: Tenant) => {
    setTenants(prev => prev.map(t => t.id === updatedTenant.id ? updatedTenant : t));
  };

  const addContract = (contract: Omit<Contract, 'id'>) => {
    const newContract: Contract = {
      ...contract,
      id: `con${contracts.length + 1}`
    };
    setContracts(prev => [newContract, ...prev]);
    // Also update the property status to occupied and remove availability date
    setProperties(prev => prev.map(p => 
      p.id === newContract.propertyId 
        ? { ...p, estado_ocupacion: OccupancyStatus.Ocupada, fecha_disponible: undefined } 
        : p
    ));
    setView('contracts');
    setSelectedPropertyId(null); // Return to properties list after assigning
    setView('properties');
  };

  const addPayment = (payment: Omit<Payment, 'id'>) => {
    const newPayment: Payment = {
      ...payment,
      id: `pay${payments.length + 1}`
    };
    setPayments(prev => [newPayment, ...prev.sort((a,b) => new Date(b.mes_correspondiente).getTime() - new Date(a.mes_correspondiente).getTime())]);
  };
  
  const updatePayment = (updatedPayment: Payment) => {
    setPayments(prev => prev.map(p => p.id === updatedPayment.id ? updatedPayment : p));
  };

  const updateTicket = (updatedTicket: Ticket) => {
    setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
  };
  
  const updateOwner = (updatedOwner: Owner) => {
    setOwner(updatedOwner);
  }

  const terminateContract = (contractId: string) => {
    let propertyToUpdateId: string | null = null;
    const updatedContracts = contracts.map(c => {
      if (c.id === contractId) {
        propertyToUpdateId = c.propertyId;
        return { ...c, estado_contrato: ContractStatus.Terminado };
      }
      return c;
    });

    if (propertyToUpdateId) {
      const updatedProperties = properties.map(p => 
        p.id === propertyToUpdateId 
          ? { ...p, estado_ocupacion: OccupancyStatus.Disponible, fecha_disponible: new Date().toISOString().split('T')[0] } 
          : p
      );
      setProperties(updatedProperties);
    }
    
    setContracts(updatedContracts);
  };

  const updatePropertyStatus = (propertyId: string, newStatus: OccupancyStatus) => {
    if (newStatus === OccupancyStatus.Ocupada) return; // Should be handled by contract creation
    setProperties(prev => prev.map(p => 
      p.id === propertyId ? { ...p, estado_ocupacion: newStatus } : p
    ));
  };
  
  const addDocumentToContract = (contractId: string, document: ContractDocument) => {
    setContracts(prev => prev.map(c => 
      c.id === contractId 
        ? { ...c, documentos: [...(c.documentos || []), document] }
        : c
    ));
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
                    addContract={addContract}
                    terminateContract={terminateContract}
                    updatePropertyStatus={updatePropertyStatus}
                    onSelectContract={handleSelectContract}
                    updateProperty={updateProperty}
                    deleteProperty={deleteProperty}
                />;
    }
    
    if (selectedContractId && selectedContractData) {
        return <ContractDetail
                    {...selectedContractData}
                    onBack={handleDeselectContract}
                    addDocument={addDocumentToContract}
                />
    }

    switch (view) {
      case 'dashboard':
        return <Dashboard properties={properties} contracts={contracts} payments={payments} setView={setView} />;
      case 'properties':
        return <Properties properties={properties} addProperty={addProperty} onSelectProperty={handleSelectProperty} />;
      case 'tenants':
        return <Tenants tenants={tenants} addTenant={addTenant} updateTenant={updateTenant} />;
      case 'contracts':
        return <Contracts contracts={contracts} properties={properties} tenants={tenants} addContract={addContract} onSelectContract={handleSelectContract} />;
      case 'payments':
        return <Payments payments={payments} contracts={contracts} tenants={tenants} properties={properties} addPayment={addPayment} updatePayment={updatePayment} />;
      case 'tickets':
        return <Tickets tickets={tickets} properties={properties} tenants={tenants} contractors={contractors} updateTicket={updateTicket} />;
      case 'income':
        return <Income contracts={contracts} properties={properties} tenants={tenants} payments={payments} setView={setView} />;
      case 'profile':
        return <Profile owner={owner} onUpdate={updateOwner} />;
      default:
        return <Dashboard properties={properties} contracts={contracts} payments={payments} setView={setView} />;
    }
  }, [view, properties, tenants, contracts, payments, tickets, contractors, owner, selectedPropertyId, selectedPropertyData, selectedContractId, selectedContractData]);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentView={view} setView={setView} isOpen={isSidebarOpen} toggle={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} setView={setView} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
          {content}
        </main>
      </div>
    </div>
  );
};

export default App;