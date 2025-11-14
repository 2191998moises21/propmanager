import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  Owner,
  Property,
  Tenant,
  Contract,
  Payment,
  Ticket,
  Contractor,
  OccupancyStatus,
  ContractStatus,
  ContractDocument,
  PaymentStatus,
  TicketStatus,
  Currency,
  TicketUrgency,
} from '@/types';
import { generateId } from '@/utils/id';
import {
  mockProperties,
  mockTenants,
  mockContracts,
  mockPayments,
  mockTickets,
  mockContractors,
  mockOwner,
} from '@/data/mockData';

interface AppContextType {
  // State
  properties: Property[];
  tenants: Tenant[];
  contracts: Contract[];
  payments: Payment[];
  tickets: Ticket[];
  contractors: Contractor[];
  owners: Owner[];

  // Property handlers
  addProperty: (property: Omit<Property, 'id'>) => Property;
  updateProperty: (property: Property) => void;
  deleteProperty: (propertyId: string) => void;
  updatePropertyStatus: (propertyId: string, newStatus: OccupancyStatus) => void;

  // Tenant handlers
  addTenant: (tenant: Omit<Tenant, 'id'>) => Tenant;
  updateTenant: (tenant: Tenant) => void;

  // Contract handlers
  addContract: (contract: Omit<Contract, 'id'>) => Contract;
  terminateContract: (contractId: string) => void;
  addDocumentToContract: (contractId: string, document: ContractDocument) => void;

  // Payment handlers
  addPayment: (payment: Omit<Payment, 'id'>) => Payment;
  updatePayment: (payment: Payment) => void;
  uploadPaymentProof: (paymentId: string, proofUrl: string) => void;

  // Ticket handlers
  addTicket: (
    ticket: Omit<Ticket, 'id' | 'costo_estimado' | 'moneda' | 'urgencia' | 'estado' | 'fecha_creacion'>
  ) => Ticket;
  updateTicket: (ticket: Ticket) => void;

  // Owner handlers
  addOwner: (owner: Omit<Owner, 'id' | 'fotoUrl'>) => Owner;
  updateOwner: (owner: Owner) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>(mockProperties);
  const [tenants, setTenants] = useState<Tenant[]>(mockTenants);
  const [contracts, setContracts] = useState<Contract[]>(mockContracts);
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [contractors] = useState<Contractor[]>(mockContractors);
  const [owners, setOwners] = useState<Owner[]>([mockOwner]);

  // Property handlers
  const addProperty = useCallback((property: Omit<Property, 'id'>): Property => {
    const newProperty: Property = {
      ...property,
      id: generateId('prop'),
    };
    setProperties((prev) => [newProperty, ...prev]);
    return newProperty;
  }, []);

  const updateProperty = useCallback((updatedProperty: Property) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === updatedProperty.id ? updatedProperty : p))
    );
  }, []);

  const deleteProperty = useCallback((propertyId: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== propertyId));
  }, []);

  const updatePropertyStatus = useCallback(
    (propertyId: string, newStatus: OccupancyStatus) => {
      if (newStatus === OccupancyStatus.Ocupada) return;
      setProperties((prev) =>
        prev.map((p) => (p.id === propertyId ? { ...p, estado_ocupacion: newStatus } : p))
      );
    },
    []
  );

  // Tenant handlers
  const addTenant = useCallback((tenant: Omit<Tenant, 'id'>): Tenant => {
    const newTenant: Tenant = {
      ...tenant,
      id: generateId('ten'),
    };
    setTenants((prev) => [newTenant, ...prev]);
    return newTenant;
  }, []);

  const updateTenant = useCallback((updatedTenant: Tenant) => {
    setTenants((prev) => prev.map((t) => (t.id === updatedTenant.id ? updatedTenant : t)));
  }, []);

  // Contract handlers
  const addContract = useCallback((contract: Omit<Contract, 'id'>): Contract => {
    const newContract: Contract = {
      ...contract,
      id: generateId('con'),
    };
    setContracts((prev) => [newContract, ...prev]);
    setProperties((prev) =>
      prev.map((p) =>
        p.id === newContract.propertyId
          ? { ...p, estado_ocupacion: OccupancyStatus.Ocupada, fecha_disponible: undefined }
          : p
      )
    );
    return newContract;
  }, []);

  const terminateContract = useCallback((contractId: string) => {
    let propertyToUpdateId: string | null = null;
    const updatedContracts = contracts.map((c) => {
      if (c.id === contractId) {
        propertyToUpdateId = c.propertyId;
        return { ...c, estado_contrato: ContractStatus.Terminado };
      }
      return c;
    });

    if (propertyToUpdateId) {
      const updatedProperties = properties.map((p) =>
        p.id === propertyToUpdateId
          ? {
              ...p,
              estado_ocupacion: OccupancyStatus.Disponible,
              fecha_disponible: new Date().toISOString().split('T')[0],
            }
          : p
      );
      setProperties(updatedProperties);
    }

    setContracts(updatedContracts);
  }, [contracts, properties]);

  const addDocumentToContract = useCallback(
    (contractId: string, document: ContractDocument) => {
      setContracts((prev) =>
        prev.map((c) =>
          c.id === contractId ? { ...c, documentos: [...(c.documentos || []), document] } : c
        )
      );
    },
    []
  );

  // Payment handlers
  const addPayment = useCallback((payment: Omit<Payment, 'id'>): Payment => {
    const newPayment: Payment = {
      ...payment,
      id: generateId('pay'),
    };
    setPayments((prev) => {
      const updated = [newPayment, ...prev];
      return [...updated].sort(
        (a, b) =>
          new Date(b.mes_correspondiente).getTime() - new Date(a.mes_correspondiente).getTime()
      );
    });
    return newPayment;
  }, []);

  const updatePayment = useCallback((updatedPayment: Payment) => {
    setPayments((prev) => prev.map((p) => (p.id === updatedPayment.id ? updatedPayment : p)));
  }, []);

  const uploadPaymentProof = useCallback((paymentId: string, proofUrl: string) => {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === paymentId
          ? {
              ...p,
              comprobanteUrl: proofUrl,
              estado_pago: PaymentStatus.EnRevision,
              fecha_pago: new Date().toISOString().split('T')[0],
            }
          : p
      )
    );
  }, []);

  // Ticket handlers
  const addTicket = useCallback(
    (
      ticket: Omit<
        Ticket,
        'id' | 'costo_estimado' | 'moneda' | 'urgencia' | 'estado' | 'fecha_creacion'
      >
    ): Ticket => {
      const newTicket: Ticket = {
        ...ticket,
        id: generateId('tic'),
        costo_estimado: 0,
        moneda: Currency.USD,
        urgencia: TicketUrgency.Media,
        estado: TicketStatus.Abierto,
        fecha_creacion: new Date().toISOString().split('T')[0],
        fotos: ticket.fotos || [],
      };
      setTickets((prev) => [newTicket, ...prev]);
      return newTicket;
    },
    []
  );

  const updateTicket = useCallback((updatedTicket: Ticket) => {
    setTickets((prev) => prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t)));
  }, []);

  // Owner handlers
  const addOwner = useCallback((owner: Omit<Owner, 'id' | 'fotoUrl'>): Owner => {
    const newOwner: Owner = {
      ...owner,
      id: generateId('own'),
      fotoUrl: `https://i.pravatar.cc/150?u=${owner.email}`,
    };
    setOwners((prev) => [...prev, newOwner]);
    return newOwner;
  }, []);

  const updateOwner = useCallback((updatedOwner: Owner) => {
    setOwners((prev) => prev.map((o) => (o.id === updatedOwner.id ? updatedOwner : o)));
  }, []);

  const value: AppContextType = {
    properties,
    tenants,
    contracts,
    payments,
    tickets,
    contractors,
    owners,
    addProperty,
    updateProperty,
    deleteProperty,
    updatePropertyStatus,
    addTenant,
    updateTenant,
    addContract,
    terminateContract,
    addDocumentToContract,
    addPayment,
    updatePayment,
    uploadPaymentProof,
    addTicket,
    updateTicket,
    addOwner,
    updateOwner,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
