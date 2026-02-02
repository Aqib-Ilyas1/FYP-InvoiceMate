import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, FileText } from 'lucide-react';
import { invoiceApi } from '@/lib/invoiceApi';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => invoiceApi.getInvoice(parseInt(id!)),
    enabled: !!id,
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'sent':
        return 'info';
      case 'overdue':
        return 'destructive';
      case 'cancelled':
        return 'secondary';
      default:
        return 'warning';
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Loading invoice...</p>
        </div>
      </Layout>
    );
  }

  if (!invoice) {
    return (
      <Layout>
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Invoice not found</h3>
          <Button className="mt-6" onClick={() => navigate('/invoices')}>
            Back to Invoices
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/invoices')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Invoices
          </Button>
          <Button onClick={() => navigate(`/invoices/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Invoice
          </Button>
        </div>

        {/* Invoice Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{invoice.invoiceNumber}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Created {formatDate(invoice.createdAt)}
                </p>
              </div>
              <Badge variant={getStatusVariant(invoice.status)} className="text-sm">
                {invoice.status.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Client Info */}
            {invoice.client && (
              <div>
                <h3 className="font-semibold text-sm text-gray-600 mb-2">Bill To:</h3>
                <div className="text-sm">
                  <p className="font-medium">{invoice.client.clientName}</p>
                  {invoice.client.clientEmail && <p>{invoice.client.clientEmail}</p>}
                  {invoice.client.clientAddress && <p>{invoice.client.clientAddress}</p>}
                  {invoice.client.clientPhone && <p>{invoice.client.clientPhone}</p>}
                </div>
              </div>
            )}

            {/* Invoice Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Invoice Date</p>
                <p className="font-medium">{formatDate(invoice.invoiceDate)}</p>
              </div>
              {invoice.dueDate && (
                <div>
                  <p className="text-sm text-gray-600">Due Date</p>
                  <p className="font-medium">{formatDate(invoice.dueDate)}</p>
                </div>
              )}
              {invoice.paymentTerms && (
                <div>
                  <p className="text-sm text-gray-600">Payment Terms</p>
                  <p className="font-medium">{invoice.paymentTerms}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Currency</p>
                <p className="font-medium">{invoice.currency}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardHeader>
            <CardTitle>Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-sm font-medium text-gray-600">
                      Description
                    </th>
                    <th className="text-right py-2 text-sm font-medium text-gray-600">Qty</th>
                    <th className="text-right py-2 text-sm font-medium text-gray-600">Price</th>
                    <th className="text-right py-2 text-sm font-medium text-gray-600">Tax</th>
                    <th className="text-right py-2 text-sm font-medium text-gray-600">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems?.map((item, index) => (
                    <tr key={index} className="border-b last:border-0">
                      <td className="py-3 text-sm">{item.description}</td>
                      <td className="py-3 text-sm text-right">{item.quantity}</td>
                      <td className="py-3 text-sm text-right">
                        {formatCurrency(Number(item.unitPrice), invoice.currency)}
                      </td>
                      <td className="py-3 text-sm text-right">{item.taxRate}%</td>
                      <td className="py-3 text-sm text-right font-medium">
                        {formatCurrency(Number(item.lineTotal), invoice.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-6 space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">
                  {formatCurrency(Number(invoice.subtotal), invoice.currency)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax:</span>
                <span className="font-medium">
                  {formatCurrency(Number(invoice.totalTax), invoice.currency)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>{formatCurrency(Number(invoice.total), invoice.currency)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {invoice.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
