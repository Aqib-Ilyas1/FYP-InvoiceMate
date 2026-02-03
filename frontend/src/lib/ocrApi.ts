import api from './api';
import { InvoiceInput } from './invoiceApi';

export interface OcrResponse {
  extractedData: InvoiceInput & {
    invoice_number?: string;
    vendor_name?: string;
    clientName?: string;
    clientEmail?: string;
    clientAddress?: string;
    clientPhone?: string;
    confidenceScore?: number;
    source?: string;
    amount?: string;
    accountNumber?: string;
    sender?: string;
  };
}

export const ocrApi = {
  processInvoiceImage: async (file: File): Promise<OcrResponse> => {
    const formData = new FormData();
    formData.append('invoice', file);

    const response = await api.post('/ocr/process', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
