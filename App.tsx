
import React, { useState } from 'react';
import { LoginPage } from './pages/LoginPage';
import { LandlordPortal } from './portals/LandlordPortal';
import { TenantPortal } from './portals/TenantPortal';

import { mockProperties, mockTenants, mockContracts, mockPayments, mockTickets, mockContractors, mockOwner } from './data/mockData';
// FIX: Import TicketStatus and PaymentStatus to resolve compilation errors.
import { Owner, Property, Tenant, Contract, Payment, OccupancyStatus, Ticket, Contractor, ContractStatus, ContractDocument, Currency, TicketUrgency, TicketStatus, PaymentStatus } from './types';

export type User = { type: 'owner', data: Owner } | { type: 'tenant', data: Tenant };

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Global state management
  const [properties, setProperties] = useState<Property[]>(mockProperties);
  const [tenants, setTenants] = useState<Tenant[]>(mockTenants);
  const [contracts, setContracts] = useState<Contract[]>(mockContracts);
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [contractors, setContractors] = useState<Contractor[]>(mockContractors);
  const [owners, setOwners] = useState<Owner[]>([mockOwner]);

  // --- Handlers for state modification ---

  const handleLogin = (email: string, role: 'owner' | 'tenant') => {
    if (role === 'owner') {
      const owner = owners.find(o => o.email.toLowerCase() === email.toLowerCase());
      if (owner) {
        setCurrentUser({ type: 'owner', data: owner });
        return true;
      }
    } else {
      const tenant = mockTenants.find(t => t.email.toLowerCase() === email.toLowerCase());
      if (tenant) {
        setCurrentUser({ type: 'tenant', data: tenant });
        return true;
      }
    }
    return false;
  };

  const handleRegisterOwner = (ownerData: Omit<Owner, 'id' | 'fotoUrl'>): boolean => {
    if (owners.some(o => o.email.toLowerCase() === ownerData.email.toLowerCase())) {
        return false; // Email already exists
    }
    const newOwner: Owner = {
        ...ownerData,
        id: `owner${owners.length + 1}`,
        fotoUrl: `https://i.pravatar.cc/150?u=${ownerData.email}`
    };
    setOwners(prev => [...prev, newOwner]);
    setCurrentUser({ type: 'owner', data: newOwner });
    return true;
  }

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Landlord-specific handlers
  const addProperty = (property: Omit<Property, 'id'>) => {
    const newProperty: Property = {
      ...property,
      id: `prop${properties.length + 1}`,
    };
    setProperties(prev => [newProperty, ...prev]);
  };
  
  const updateProperty = (updatedProperty: Property) => {
    setProperties(prev => prev.map(p => p.id === updatedProperty.id ? updatedProperty : p));
  };

  const deleteProperty = (propertyId: string) => {
    setProperties(prev => prev.filter(p => p.id !== propertyId));
  };

  const addTenant = (tenant: Omit<Tenant, 'id'>) => {
    const newTenant: Tenant = {
      ...tenant,
      id: `ten${tenants.length + 1}`,
    };
    setTenants(prev => [newTenant, ...prev]);
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
    setProperties(prev => prev.map(p => 
      p.id === newContract.propertyId 
        ? { ...p, estado_ocupacion: OccupancyStatus.Ocupada, fecha_disponible: undefined } 
        : p
    ));
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

  const updateOwner = (updatedOwner: Owner) => {
    setOwners(prev => prev.map(o => (o.id === updatedOwner.id ? updatedOwner : o)));
    if (currentUser && currentUser.type === 'owner' && currentUser.data.id === updatedOwner.id) {
        setCurrentUser({ ...currentUser, data: updatedOwner });
    }
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
    if (newStatus === OccupancyStatus.Ocupada) return;
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

  // Handlers used by both portals
  const updateTicket = (updatedTicket: Ticket) => {
    setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
  };

  // Tenant-specific handlers
  const addTicket = (ticket: Omit<Ticket, 'id' | 'costo_estimado' | 'moneda' | 'urgencia' | 'estado' | 'fecha_creacion'>) => {
    const newTicket: Ticket = {
      ...ticket,
      id: `tic${tickets.length + 1}`,
      costo_estimado: 0,
      moneda: Currency.USD,
      urgencia: TicketUrgency.Media, // Default value
      estado: TicketStatus.Abierto,
      fecha_creacion: new Date().toISOString().split('T')[0]
    };
    setTickets(prev => [newTicket, ...prev]);
  };

  const uploadPaymentProof = (paymentId: string, proofUrl: string) => {
    setPayments(prev => prev.map(p => p.id === paymentId ? {
      ...p,
      comprobanteUrl: proofUrl,
      // FIX: Use PaymentStatus.EnRevision, as 'EnRevision' is not a member of OccupancyStatus.
      estado_pago: PaymentStatus.EnRevision,
      fecha_pago: new Date().toISOString().split('T')[0]
    } : p));
  };


  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} onRegister={handleRegisterOwner} />;
  }

  if (currentUser.type === 'owner') {
    return (
      <LandlordPortal
        owner={currentUser.data}
        properties={properties}
        tenants={tenants}
        contracts={contracts}
        payments={payments}
        tickets={tickets}
        contractors={contractors}
        onLogout={handleLogout}
        handlers={{
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
          addDocumentToContract
        }}
      />
    );
  }

  if (currentUser.type === 'tenant') {
    return (
        <TenantPortal
            tenant={currentUser.data}
            allData={{ properties, tenants, contracts, payments, tickets, contractors }}
            onLogout={handleLogout}
            handlers={{
                addTicket,
                uploadPaymentProof
            }}
        />
    );
  }
  
  return null; // Should not be reached
};

export default App;
