import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { FilePlus, ScanLine, Bot } from 'lucide-react';

export default function NewInvoice() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Invoice</h1>
          <p className="text-gray-600 mt-1">
            Choose how you want to create your invoice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate('/invoices/new/manual')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FilePlus className="h-6 w-6 text-blue-600" />
                Manual Entry
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Create a new invoice from scratch by filling out the form.
              </p>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate('/invoices/scan')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <ScanLine className="h-6 w-6 text-purple-600" />
                AI Scanner (OCR)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Upload an image or PDF of an invoice and let AI extract the data.
              </p>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate('/invoices/quick-create')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Bot className="h-6 w-6 text-green-600" />
                Quick Create (NLP)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Create an invoice by typing a simple sentence.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
