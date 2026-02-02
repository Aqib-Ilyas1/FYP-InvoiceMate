export interface User {
  id: number;
  email: string;
  fullName?: string | null;
  companyName?: string | null;
  createdAt: string;
  updatedAt?: string;
}

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
}

export interface LineItem {
  id?: number;
  invoiceId?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  lineTotal: number;
  sortOrder: number;
}

export interface Invoice {
  id: number;
  userId: number;
  clientId?: number | null;
  client?: Client | null;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string | null;
  currency: string;
  subtotal: number;
  totalTax: number;
  total: number;
  paymentTerms?: string | null;
  notes?: string | null;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  source: 'manual' | 'ocr' | 'nlp';
  confidenceScore?: number | null;
  createdAt: string;
  updatedAt: string;
  lineItems?: LineItem[];
  payments?: Payment[];
}

export interface Payment {
  id: number;
  invoiceId: number;
  amount: number;
  paymentDate: string;
  paymentMethod?: string | null;
  referenceNumber?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: any[];
}

export interface OCRResult {
  vendor_name?: string | null;
  vendor_address?: string | null;
  invoice_number?: string | null;
  invoice_date?: string | null;
  due_date?: string | null;
  currency?: string | null;
  line_items: Array<{
    description: string;
    quantity?: number | null;
    unit_price?: number | null;
    tax_rate?: number | null;
    total?: number | null;
  }>;
  subtotal?: number | null;
  taxes_breakdown?: Array<{
    tax_code: string;
    rate: number;
    amount: number;
  }>;
  total?: number | null;
  payment_terms?: string | null;
  confidence_scores?: {
    vendor_name?: number;
    invoice_number?: number;
    total?: number;
  };
}

export interface NLPResult {
  client_name: string;
  line_items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
  due_date?: string;
  currency: string;
  payment_terms?: string;
  confidence: number;
}
