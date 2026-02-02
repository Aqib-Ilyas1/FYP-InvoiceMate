import api from './api';
import { InvoiceInput } from './invoiceApi';

export interface OcrResponse {
  extractedData: InvoiceInput & {
    clientName?: string;
    clientEmail?: string;
    clientAddress?: string;
    clientPhone?: string;
    confidenceScore?: number;
    source?: string;
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
