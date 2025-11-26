import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
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
import {
  propertiesAPI,
  contractsAPI,
  paymentsAPI,
  ticketsAPI,
  tenantsAPI,
} from '@/services/api';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/useToast';
import { mockContractors } from '@/data/mockData';

interface AppContextType {
  // State
  properties: Property[];
  tenants: Tenant[];
  contracts: Contract[];
  payments: Payment[];
  tickets: Ticket[];
  contractors: Contractor[];
  owners: Owner[];

  // Loading and Error states
  isLoading: boolean;
  error: string | null;

  // Refresh data
  refreshData: () => Promise<void>;

  // Property handlers
  addProperty: (property: Omit<Property, 'id'>) => Promise<Property | null>;
  updateProperty: (property: Property) => Promise<void>;
  deleteProperty: (propertyId: string) => Promise<void>;
  updatePropertyStatus: (propertyId: string, newStatus: OccupancyStatus) => Promise<void>;

  // Tenant handlers
  addTenant: (tenant: Omit<Tenant, 'id'>) => Promise<Tenant | null>;
  updateTenant: (tenant: Tenant) => Promise<void>;

  // Contract handlers
  addContract: (contract: Omit<Contract, 'id'>) => Promise<Contract | null>;
  terminateContract: (contractId: string) => Promise<void>;
  addDocumentToContract: (contractId: string, document: ContractDocument) => Promise<void>;

  // Payment handlers
  addPayment: (payment: Omit<Payment, 'id'>) => Promise<Payment | null>;
  updatePayment: (payment: Payment) => Promise<void>;
  uploadPaymentProof: (paymentId: string, proofUrl: string) => Promise<void>;

  // Ticket handlers
  addTicket: (
    ticket: Omit<
      Ticket,
      'id' | 'costo_estimado' | 'moneda' | 'urgencia' | 'estado' | 'fecha_creacion'
    >
  ) => Promise<Ticket | null>;
  updateTicket: (ticket: Ticket) => Promise<void>;

  // Owner handlers
  addOwner: (owner: Omit<Owner, 'id' | 'fotoUrl'>) => Promise<Owner | null>;
  updateOwner: (owner: Owner) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const { success, error: showError } = useToast();

  // State
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [contractors] = useState<Contractor[]>(mockContractors); // Still using mock for contractors
  const [owners, setOwners] = useState<Owner[]>([]);

  // Loading and error states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data
  const fetchData = useCallback(async () => {
    if (!isAuthenticated || !currentUser) {
      // Clear data when not authenticated
      setProperties([]);
      setTenants([]);
      setContracts([]);
      setPayments([]);
      setTickets([]);
      setOwners([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userType = currentUser.type;

      // Fetch based on user role
      if (userType === 'owner') {
        // For owners: fetch properties, contracts, payments, tickets, tenants
        const [propsRes, contractsRes, paymentsRes, ticketsRes, tenantsRes] = await Promise.all([
          propertiesAPI.getMyProperties(),
          contractsAPI.getMyContracts(),
          paymentsAPI.getMyPayments(),
          ticketsAPI.getMyTickets(),
          tenantsAPI.getTenants(),
        ]);

        if (propsRes.success && propsRes.data) {
          setProperties(propsRes.data as Property[]);
        }
        if (contractsRes.success && contractsRes.data) {
          setContracts(contractsRes.data as Contract[]);
        }
        if (paymentsRes.success && paymentsRes.data) {
          setPayments(paymentsRes.data as Payment[]);
        }
        if (ticketsRes.success && ticketsRes.data) {
          setTickets(ticketsRes.data as Ticket[]);
        }
        if (tenantsRes.success && tenantsRes.data) {
          setTenants(tenantsRes.data as Tenant[]);
        }
      } else if (userType === 'tenant') {
        // For tenants: fetch their contract, payments, tickets
        const [contractsRes, paymentsRes, ticketsRes] = await Promise.all([
          contractsAPI.getMyContracts(),
          paymentsAPI.getMyPayments(),
          ticketsAPI.getMyTickets(),
        ]);

        if (contractsRes.success && contractsRes.data) {
          setContracts(contractsRes.data as Contract[]);
        }
        if (paymentsRes.success && paymentsRes.data) {
          setPayments(paymentsRes.data as Payment[]);
        }
        if (ticketsRes.success && ticketsRes.data) {
          setTickets(ticketsRes.data as Ticket[]);
        }
      }
      // SuperAdmin will use SuperAdminContext, so we don't fetch here
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading data';
      setError(errorMessage);
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, currentUser]);

  // Fetch data when user logs in or changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh data function
  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Property handlers
  const addProperty = useCallback(
    async (property: Omit<Property, 'id'>): Promise<Property | null> => {
      try {
        const result = await propertiesAPI.createProperty(property);

        if (result.success && result.data) {
          const newProperty = result.data as Property;
          setProperties((prev) => [newProperty, ...prev]);
          success('Propiedad agregada exitosamente');
          return newProperty;
        } else {
          showError(result.error || 'Error al agregar propiedad');
          return null;
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error al agregar propiedad';
        showError(errorMsg);
        return null;
      }
    },
    [success, showError]
  );

  const updateProperty = useCallback(
    async (updatedProperty: Property) => {
      try {
        const result = await propertiesAPI.updateProperty(updatedProperty.id, updatedProperty);

        if (result.success) {
          setProperties((prev) =>
            prev.map((p) => (p.id === updatedProperty.id ? updatedProperty : p))
          );
          success('Propiedad actualizada exitosamente');
        } else {
          showError(result.error || 'Error al actualizar propiedad');
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error al actualizar propiedad';
        showError(errorMsg);
      }
    },
    [success, showError]
  );

  const deleteProperty = useCallback(
    async (propertyId: string) => {
      try {
        const result = await propertiesAPI.deleteProperty(propertyId);

        if (result.success) {
          setProperties((prev) => prev.filter((p) => p.id !== propertyId));
          success('Propiedad eliminada exitosamente');
        } else {
          showError(result.error || 'Error al eliminar propiedad');
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error al eliminar propiedad';
        showError(errorMsg);
      }
    },
    [success, showError]
  );

  const updatePropertyStatus = useCallback(
    async (propertyId: string, newStatus: OccupancyStatus) => {
      if (newStatus === OccupancyStatus.Ocupada) return;

      try {
        const property = properties.find((p) => p.id === propertyId);
        if (!property) {
          showError('Propiedad no encontrada');
          return;
        }

        const updatedProperty = { ...property, estado_ocupacion: newStatus };
        const result = await propertiesAPI.updateProperty(propertyId, updatedProperty);

        if (result.success) {
          setProperties((prev) =>
            prev.map((p) => (p.id === propertyId ? { ...p, estado_ocupacion: newStatus } : p))
          );
          success('Estado actualizado exitosamente');
        } else {
          showError(result.error || 'Error al actualizar estado');
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error al actualizar estado';
        showError(errorMsg);
      }
    },
    [properties, success, showError]
  );

  // Tenant handlers
  const addTenant = useCallback(
    async (tenant: Omit<Tenant, 'id'>): Promise<Tenant | null> => {
      // Note: There's no create tenant endpoint in the API
      // Tenants are created via registration
      showError('Los inquilinos deben registrarse mediante el formulario de registro');
      return null;
    },
    [showError]
  );

  const updateTenant = useCallback(
    async (updatedTenant: Tenant) => {
      try {
        const result = await tenantsAPI.updateTenant(updatedTenant.id, updatedTenant);

        if (result.success) {
          setTenants((prev) => prev.map((t) => (t.id === updatedTenant.id ? updatedTenant : t)));
          success('Inquilino actualizado exitosamente');
        } else {
          showError(result.error || 'Error al actualizar inquilino');
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error al actualizar inquilino';
        showError(errorMsg);
      }
    },
    [success, showError]
  );

  // Contract handlers
  const addContract = useCallback(
    async (contract: Omit<Contract, 'id'>): Promise<Contract | null> => {
      try {
        const result = await contractsAPI.createContract(contract);

        if (result.success && result.data) {
          const newContract = result.data as Contract;
          setContracts((prev) => [newContract, ...prev]);

          // Update property status to occupied
          setProperties((prev) =>
            prev.map((p) =>
              p.id === newContract.propertyId
                ? { ...p, estado_ocupacion: OccupancyStatus.Ocupada, fecha_disponible: undefined }
                : p
            )
          );

          success('Contrato creado exitosamente');
          return newContract;
        } else {
          showError(result.error || 'Error al crear contrato');
          return null;
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error al crear contrato';
        showError(errorMsg);
        return null;
      }
    },
    [success, showError]
  );

  const terminateContract = useCallback(
    async (contractId: string) => {
      try {
        const result = await contractsAPI.terminateContract(contractId);

        if (result.success) {
          const contract = contracts.find((c) => c.id === contractId);

          setContracts((prev) =>
            prev.map((c) =>
              c.id === contractId ? { ...c, estado_contrato: ContractStatus.Terminado } : c
            )
          );

          // Update property status to available
          if (contract) {
            setProperties((prev) =>
              prev.map((p) =>
                p.id === contract.propertyId
                  ? {
                      ...p,
                      estado_ocupacion: OccupancyStatus.Disponible,
                      fecha_disponible: new Date().toISOString().split('T')[0],
                    }
                  : p
              )
            );
          }

          success('Contrato terminado exitosamente');
        } else {
          showError(result.error || 'Error al terminar contrato');
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error al terminar contrato';
        showError(errorMsg);
      }
    },
    [contracts, success, showError]
  );

  const addDocumentToContract = useCallback(
    async (contractId: string, document: ContractDocument) => {
      try {
        const result = await contractsAPI.addContractDocument(
          contractId,
          document.nombre,
          document.url
        );

        if (result.success) {
          setContracts((prev) =>
            prev.map((c) =>
              c.id === contractId ? { ...c, documentos: [...(c.documentos || []), document] } : c
            )
          );
          success('Documento agregado exitosamente');
        } else {
          showError(result.error || 'Error al agregar documento');
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error al agregar documento';
        showError(errorMsg);
      }
    },
    [success, showError]
  );

  // Payment handlers
  const addPayment = useCallback(
    async (payment: Omit<Payment, 'id'>): Promise<Payment | null> => {
      try {
        const result = await paymentsAPI.createPayment(payment);

        if (result.success && result.data) {
          const newPayment = result.data as Payment;
          setPayments((prev) => {
            const updated = [newPayment, ...prev];
            return [...updated].sort(
              (a, b) =>
                new Date(b.mes_correspondiente).getTime() -
                new Date(a.mes_correspondiente).getTime()
            );
          });
          success('Pago registrado exitosamente');
          return newPayment;
        } else {
          showError(result.error || 'Error al registrar pago');
          return null;
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error al registrar pago';
        showError(errorMsg);
        return null;
      }
    },
    [success, showError]
  );

  const updatePayment = useCallback(
    async (updatedPayment: Payment) => {
      try {
        const result = await paymentsAPI.updatePayment(updatedPayment.id, updatedPayment);

        if (result.success) {
          setPayments((prev) => prev.map((p) => (p.id === updatedPayment.id ? updatedPayment : p)));
          success('Pago actualizado exitosamente');
        } else {
          showError(result.error || 'Error al actualizar pago');
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error al actualizar pago';
        showError(errorMsg);
      }
    },
    [success, showError]
  );

  const uploadPaymentProof = useCallback(
    async (paymentId: string, proofUrl: string) => {
      try {
        const result = await paymentsAPI.uploadPaymentProof(paymentId, proofUrl);

        if (result.success) {
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
          success('Comprobante subido exitosamente');
        } else {
          showError(result.error || 'Error al subir comprobante');
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error al subir comprobante';
        showError(errorMsg);
      }
    },
    [success, showError]
  );

  // Ticket handlers
  const addTicket = useCallback(
    async (
      ticket: Omit<
        Ticket,
        'id' | 'costo_estimado' | 'moneda' | 'urgencia' | 'estado' | 'fecha_creacion'
      >
    ): Promise<Ticket | null> => {
      try {
        const ticketData = {
          ...ticket,
          costo_estimado: 0,
          moneda: Currency.USD,
          urgencia: TicketUrgency.Media,
          estado: TicketStatus.Abierto,
        };

        const result = await ticketsAPI.createTicket(ticketData);

        if (result.success && result.data) {
          const newTicket = result.data as Ticket;
          setTickets((prev) => [newTicket, ...prev]);
          success('Ticket creado exitosamente');
          return newTicket;
        } else {
          showError(result.error || 'Error al crear ticket');
          return null;
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error al crear ticket';
        showError(errorMsg);
        return null;
      }
    },
    [success, showError]
  );

  const updateTicket = useCallback(
    async (updatedTicket: Ticket) => {
      try {
        const result = await ticketsAPI.updateTicket(updatedTicket.id, updatedTicket);

        if (result.success) {
          setTickets((prev) => prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t)));
          success('Ticket actualizado exitosamente');
        } else {
          showError(result.error || 'Error al actualizar ticket');
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error al actualizar ticket';
        showError(errorMsg);
      }
    },
    [success, showError]
  );

  // Owner handlers
  const addOwner = useCallback(
    async (owner: Omit<Owner, 'id' | 'fotoUrl'>): Promise<Owner | null> => {
      // Note: There's no create owner endpoint in the API
      // Owners are created via registration
      showError('Los propietarios deben registrarse mediante el formulario de registro');
      return null;
    },
    [showError]
  );

  const updateOwner = useCallback(
    async (updatedOwner: Owner) => {
      // Note: There's no update owner endpoint in the API
      // This would typically be done via profile update
      setOwners((prev) => prev.map((o) => (o.id === updatedOwner.id ? updatedOwner : o)));
      success('Propietario actualizado exitosamente');
    },
    [success]
  );

  const value: AppContextType = {
    properties,
    tenants,
    contracts,
    payments,
    tickets,
    contractors,
    owners,
    isLoading,
    error,
    refreshData,
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
