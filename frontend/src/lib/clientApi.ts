import api from './api';

export interface Client {
  id: number;
  userId: number;
  clientName: string;
  clientEmail?: string | null;
  clientAddress?: string | null;
  clientPhone?: string | null;
  taxId?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    invoices: number;
  };
}

export interface ClientInput {
  clientName: string;
  clientEmail?: string;
  clientAddress?: string;
  clientPhone?: string;
  taxId?: string;
}

export interface ClientsResponse {
  clients: Client[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const clientApi = {
  getClients: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ClientsResponse> => {
    const response = await api.get('/clients', { params });
    return response.data;
  },

  getClient: async (id: number): Promise<Client> => {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  createClient: async (data: ClientInput): Promise<Client> => {
    const response = await api.post('/clients', data);
    return response.data;
  },

  updateClient: async (id: number, data: ClientInput): Promise<Client> => {
    const response = await api.put(`/clients/${id}`, data);
    return response.data;
  },

  deleteClient: async (id: number): Promise<void> => {
    await api.delete(`/clients/${id}`);
  },
};
