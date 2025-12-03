/**
 * API Service
 * Handles all HTTP requests to the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

// Get token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Set token in localStorage
export const setAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

// Remove token from localStorage
export const removeAuthToken = (): void => {
  localStorage.removeItem('authToken');
};

// Generic fetch wrapper with auth
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP error! status: ${response.status}`,
      };
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// Auth API
export const authAPI = {
  login: async (email: string, password: string, role: string) => {
    return fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });
  },

  registerOwner: async (data: {
    nombre_completo: string;
    email: string;
    password: string;
    telefono: string;
    direccion: string;
  }) => {
    return fetchAPI('/auth/register/owner', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  registerTenant: async (data: {
    nombre_completo: string;
    documento_id: string;
    email: string;
    password: string;
    telefono: string;
  }) => {
    return fetchAPI('/auth/register/tenant', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getProfile: async () => {
    return fetchAPI('/auth/profile');
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    return fetchAPI('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

// Properties API
export const propertiesAPI = {
  getMyProperties: async () => {
    return fetchAPI('/properties/my');
  },

  getPropertyById: async (id: string) => {
    return fetchAPI(`/properties/${id}`);
  },

  createProperty: async (data: any) => {
    return fetchAPI('/properties', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateProperty: async (id: string, data: any) => {
    return fetchAPI(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteProperty: async (id: string) => {
    return fetchAPI(`/properties/${id}`, {
      method: 'DELETE',
    });
  },
};

// Contracts API
export const contractsAPI = {
  getMyContracts: async () => {
    return fetchAPI('/contracts/my');
  },

  getContractById: async (id: string) => {
    return fetchAPI(`/contracts/${id}`);
  },

  createContract: async (data: any) => {
    return fetchAPI('/contracts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateContract: async (id: string, data: any) => {
    return fetchAPI(`/contracts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  terminateContract: async (id: string) => {
    return fetchAPI(`/contracts/${id}/terminate`, {
      method: 'POST',
    });
  },

  getContractDocuments: async (id: string) => {
    return fetchAPI(`/contracts/${id}/documents`);
  },

  addContractDocument: async (id: string, nombre: string, url: string) => {
    return fetchAPI(`/contracts/${id}/documents`, {
      method: 'POST',
      body: JSON.stringify({ nombre, url }),
    });
  },
};

// Payments API
export const paymentsAPI = {
  getMyPayments: async () => {
    return fetchAPI('/payments/my');
  },

  getPaymentsByContract: async (contractId: string) => {
    return fetchAPI(`/payments/contract/${contractId}`);
  },

  getPaymentById: async (id: string) => {
    return fetchAPI(`/payments/${id}`);
  },

  createPayment: async (data: any) => {
    return fetchAPI('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updatePayment: async (id: string, data: any) => {
    return fetchAPI(`/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  uploadPaymentProof: async (id: string, proofUrl: string) => {
    return fetchAPI(`/payments/${id}/proof`, {
      method: 'POST',
      body: JSON.stringify({ proofUrl }),
    });
  },

  getPendingPayments: async () => {
    return fetchAPI('/payments/pending');
  },
};

// Tickets API
export const ticketsAPI = {
  getMyTickets: async () => {
    return fetchAPI('/tickets/my');
  },

  getTicketsByProperty: async (propertyId: string) => {
    return fetchAPI(`/tickets/property/${propertyId}`);
  },

  getTicketById: async (id: string) => {
    return fetchAPI(`/tickets/${id}`);
  },

  createTicket: async (data: any) => {
    return fetchAPI('/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateTicket: async (id: string, data: any) => {
    return fetchAPI(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteTicket: async (id: string) => {
    return fetchAPI(`/tickets/${id}`, {
      method: 'DELETE',
    });
  },
};

// Tenants API
export const tenantsAPI = {
  getTenants: async () => {
    return fetchAPI('/tenants');
  },

  getTenantById: async (id: string) => {
    return fetchAPI(`/tenants/${id}`);
  },

  createTenant: async (data: any) => {
    return fetchAPI('/tenants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateTenant: async (id: string, data: any) => {
    return fetchAPI(`/tenants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteTenant: async (id: string) => {
    return fetchAPI(`/tenants/${id}`, {
      method: 'DELETE',
    });
  },
};

// Contractors API
export const contractorsAPI = {
  getAll: async () => {
    return fetchAPI('/contractors');
  },

  getById: async (id: string) => {
    return fetchAPI(`/contractors/${id}`);
  },

  search: async (searchTerm: string) => {
    return fetchAPI(`/contractors/search?q=${encodeURIComponent(searchTerm)}`);
  },

  create: async (data: { nombre: string; especialidad: string; telefono: string }) => {
    return fetchAPI('/contractors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: { nombre?: string; especialidad?: string; telefono?: string }) => {
    return fetchAPI(`/contractors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return fetchAPI(`/contractors/${id}`, {
      method: 'DELETE',
    });
  },
};

// Activity Logs API
export const activityLogsAPI = {
  getAll: async (params?: {
    limit?: number;
    offset?: number;
    user_id?: string;
    user_type?: string;
    accion?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    const queryString = queryParams.toString();
    return fetchAPI(`/activity-logs${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id: string) => {
    return fetchAPI(`/activity-logs/${id}`);
  },

  getByUser: async (userId: string, limit?: number, offset?: number) => {
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', limit.toString());
    if (offset) queryParams.append('offset', offset.toString());
    const queryString = queryParams.toString();
    return fetchAPI(`/activity-logs/user/${userId}${queryString ? `?${queryString}` : ''}`);
  },

  getByAction: async (accion: string, limit?: number, offset?: number) => {
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', limit.toString());
    if (offset) queryParams.append('offset', offset.toString());
    const queryString = queryParams.toString();
    return fetchAPI(`/activity-logs/action/${accion}${queryString ? `?${queryString}` : ''}`);
  },

  getRecent: async (limit?: number) => {
    const queryString = limit ? `?limit=${limit}` : '';
    return fetchAPI(`/activity-logs/recent${queryString}`);
  },

  getStats: async (fecha_desde?: string, fecha_hasta?: string) => {
    const queryParams = new URLSearchParams();
    if (fecha_desde) queryParams.append('fecha_desde', fecha_desde);
    if (fecha_hasta) queryParams.append('fecha_hasta', fecha_hasta);
    const queryString = queryParams.toString();
    return fetchAPI(`/activity-logs/stats${queryString ? `?${queryString}` : ''}`);
  },

  create: async (data: {
    user_id: string;
    user_type: string;
    user_name: string;
    accion: string;
    descripcion: string;
    detalles?: Record<string, unknown>;
  }) => {
    return fetchAPI('/activity-logs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  cleanup: async (daysToKeep?: number) => {
    const queryString = daysToKeep ? `?daysToKeep=${daysToKeep}` : '';
    return fetchAPI(`/activity-logs/cleanup${queryString}`, {
      method: 'DELETE',
    });
  },
};
