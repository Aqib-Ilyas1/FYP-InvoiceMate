import api from './api';

export interface LineItem {
  id?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount?: number;
  lineTotal?: number;
  sortOrder?: number;
}

export interface Invoice {
  id: number;
  userId: number;
  clientId?: number | null;
  client?: {
    id: number;
    clientName: string;
    clientEmail?: string | null;
    clientAddress?: string | null;
    clientPhone?: string | null;
  } | null;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string | null;
  currency: string;
  subtotal: number;
  totalTax: number;
  total: number;
  paymentTerms?: string | null;
  notes?: string | null;
  status: string;
  source: string;
  confidenceScore?: number | null;
  createdAt: string;
  updatedAt: string;
  lineItems?: LineItem[];
  payments?: any[];
  _count?: {
    lineItems: number;
    payments: number;
  };
}

export interface InvoiceInput {
  clientId?: number | null;
  invoiceDate: string;
  dueDate?: string | null;
  currency?: string;
  paymentTerms?: string;
  notes?: string;
  status?: string;
  lineItems: LineItem[];
}

export interface InvoicesResponse {
  invoices: Invoice[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const invoiceApi = {
  getInvoices: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    clientId?: number;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<InvoicesResponse> => {
    const response = await api.get('/invoices', { params });
    return response.data;
  },

  getInvoice: async (id: number): Promise<Invoice> => {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },

  createInvoice: async (data: InvoiceInput): Promise<Invoice> => {
    const response = await api.post('/invoices', data);
    return response.data;
  },

  updateInvoice: async (id: number, data: InvoiceInput): Promise<Invoice> => {
    const response = await api.put(`/invoices/${id}`, data);
    return response.data;
  },

  deleteInvoice: async (id: number): Promise<void> => {
    await api.delete(`/invoices/${id}`);
  },

  updateStatus: async (id: number, status: string): Promise<Invoice> => {
    const response = await api.patch(`/invoices/${id}/status`, { status });
    return response.data;
  },
  getInvoiceStats: async (): Promise<any> => {
    const response = await api.get('/invoices/stats');
    return response.data;
  },
};
