import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Save } from 'lucide-react';
import { invoiceApi, LineItem, InvoiceInput } from '@/lib/invoiceApi';
import { clientApi } from '@/lib/clientApi';
import { toast } from 'sonner';

export default function InvoiceEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  const [formData, setFormData] = useState<InvoiceInput>({
    clientId: null,
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: null,
    currency: 'USD',
    paymentTerms: '',
    notes: '',
    status: 'draft',
    lineItems: [
      { description: '', quantity: 1, unitPrice: 0, taxRate: 0, sortOrder: 0 },
    ],
  });

  // Fetch clients for dropdown
  const { data: clientsData } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientApi.getClients({ limit: 100 }),
  });

  // Fetch invoice if editing
  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => invoiceApi.getInvoice(parseInt(id!)),
    enabled: isEditMode,
  });

  // Load invoice data when editing
  useEffect(() => {
    if (invoice && isEditMode) {
      setFormData({
        clientId: invoice.clientId,
        invoiceDate: invoice.invoiceDate.split('T')[0],
        dueDate: invoice.dueDate?.split('T')[0] || null,
        currency: invoice.currency,
        paymentTerms: invoice.paymentTerms || '',
        notes: invoice.notes || '',
        status: invoice.status,
        lineItems: invoice.lineItems || [
          { description: '', quantity: 1, unitPrice: 0, taxRate: 0, sortOrder: 0 },
        ],
      });
    }
  }, [invoice, isEditMode]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: invoiceApi.createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice created successfully');
      navigate('/invoices');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create invoice');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: InvoiceInput }) =>
      invoiceApi.updateInvoice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      toast.success('Invoice updated successfully');
      navigate('/invoices');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update invoice');
    },
  });

  const addLineItem = () => {
    setFormData({
      ...formData,
      lineItems: [
        ...formData.lineItems,
        {
          description: '',
          quantity: 1,
          unitPrice: 0,
          taxRate: 0,
          sortOrder: formData.lineItems.length,
        },
      ],
    });
  };

  const removeLineItem = (index: number) => {
    if (formData.lineItems.length > 1) {
      setFormData({
        ...formData,
        lineItems: formData.lineItems.filter((_, i) => i !== index),
      });
    }
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const updatedItems = [...formData.lineItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setFormData({ ...formData, lineItems: updatedItems });
  };

  // Calculate totals
  const calculateTotals = () => {
    let subtotal = 0;
    let totalTax = 0;

    formData.lineItems.forEach((item) => {
      const lineTotal = item.quantity * item.unitPrice;
      const taxAmount = (lineTotal * item.taxRate) / 100;
      subtotal += lineTotal;
      totalTax += taxAmount;
    });

    return {
      subtotal: subtotal.toFixed(2),
      totalTax: totalTax.toFixed(2),
      total: (subtotal + totalTax).toFixed(2),
    };
  };

  const totals = calculateTotals();

  const handleSubmit = (e: React.FormEvent, status: string) => {
    e.preventDefault();

    // Validate
    if (!formData.invoiceDate) {
      toast.error('Invoice date is required');
      return;
    }

    if (formData.lineItems.length === 0) {
      toast.error('At least one line item is required');
      return;
    }

    const hasInvalidLineItems = formData.lineItems.some(
      (item) => !item.description || item.unitPrice <= 0
    );

    if (hasInvalidLineItems) {
      toast.error('All line items must have a description and valid price');
      return;
    }

    const invoiceData = { ...formData, status };

    if (isEditMode) {
      updateMutation.mutate({ id: parseInt(id!), data: invoiceData });
    } else {
      createMutation.mutate(invoiceData);
    }
  };

  const clients = clientsData?.clients || [];

  if (isEditMode && isLoading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Loading invoice...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? 'Edit Invoice' : 'Create New Invoice'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditMode ? 'Update invoice details' : 'Fill in the invoice information'}
          </p>
        </div>

        <form onSubmit={(e) => handleSubmit(e, 'draft')}>
          {/* Invoice Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client">Client</Label>
                  <Select
                    value={formData.clientId?.toString() || ''}
                    onValueChange={(value) =>
                      setFormData({ ...formData, clientId: value ? parseInt(value) : null })
                    }
                  >
                    <SelectTrigger id="client">
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.clientName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoiceDate">Invoice Date *</Label>
                  <Input
                    id="invoiceDate"
                    type="date"
                    value={formData.invoiceDate}
                    onChange={(e) =>
                      setFormData({ ...formData, invoiceDate: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value || null })
                    }
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="paymentTerms">Payment Terms</Label>
                  <Input
                    id="paymentTerms"
                    placeholder="e.g., Net 30"
                    value={formData.paymentTerms}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentTerms: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Line Items</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.lineItems.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-2 items-end p-4 border rounded-lg"
                  >
                    <div className="col-span-12 md:col-span-5 space-y-2">
                      <Label htmlFor={`desc-${index}`}>Description *</Label>
                      <Input
                        id={`desc-${index}`}
                        placeholder="Item description"
                        value={item.description}
                        onChange={(e) =>
                          updateLineItem(index, 'description', e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="col-span-4 md:col-span-2 space-y-2">
                      <Label htmlFor={`qty-${index}`}>Qty</Label>
                      <Input
                        id={`qty-${index}`}
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) =>
                          updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)
                        }
                        required
                      />
                    </div>

                    <div className="col-span-4 md:col-span-2 space-y-2">
                      <Label htmlFor={`price-${index}`}>Price *</Label>
                      <Input
                        id={`price-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)
                        }
                        required
                      />
                    </div>

                    <div className="col-span-3 md:col-span-2 space-y-2">
                      <Label htmlFor={`tax-${index}`}>Tax %</Label>
                      <Input
                        id={`tax-${index}`}
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={item.taxRate}
                        onChange={(e) =>
                          updateLineItem(index, 'taxRate', parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>

                    <div className="col-span-1 flex items-end justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLineItem(index)}
                        disabled={formData.lineItems.length === 1}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-6 border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${totals.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium">${totals.totalTax}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>${totals.total}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  className="w-full min-h-[100px] px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-950"
                  placeholder="Additional notes or terms..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/invoices')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : isEditMode
                ? 'Update Invoice'
                : 'Save as Draft'}
            </Button>
            <Button
              type="button"
              onClick={(e) => handleSubmit(e, 'sent')}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {isEditMode ? 'Save & Mark as Sent' : 'Create & Send'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
