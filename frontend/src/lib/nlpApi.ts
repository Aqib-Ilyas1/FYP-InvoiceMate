import api from './api';
import { InvoiceInput } from './invoiceApi';

export interface NlpResponse {
  parsedData: InvoiceInput & {
    clientName?: string;
    source?: string;
  };
}

export const nlpApi = {
  parseNaturalLanguage: async (text: string): Promise<NlpResponse> => {
    const response = await api.post('/nlp/parse', { text });
    return response.data;
  },
};
