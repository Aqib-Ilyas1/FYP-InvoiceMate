import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';
import { invoiceApi, Invoice } from '@/lib/invoiceApi';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import React from 'react';

export default function Invoices() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Fetch invoices
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['invoices', searchQuery, statusFilter],
    queryFn: () =>
      invoiceApi.getInvoices({
        search: searchQuery,
        status: statusFilter === 'all' ? undefined : statusFilter,
        limit: 50,
      }),
  });

  React.useEffect(() => {
    if (isError) {
      console.error("Error fetching invoices:", error);
    }
  }, [isError, error]);

  const deleteMutation = useMutation({
    mutationFn: invoiceApi.deleteInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setIsDeleteDialogOpen(false);
      setSelectedInvoice(null);
      toast.success('Invoice deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete invoice');
    },
  });

  const handleDelete = () => {
    if (selectedInvoice) {
      deleteMutation.mutate(selectedInvoice.id);
    }
  };

  const openDeleteDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDeleteDialogOpen(true);
  };

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

  const invoices = data?.invoices || [];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
            <p className="text-gray-600 mt-1">
              Manage all your invoices
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              className="gap-2"
              onClick={() => navigate('/invoices/new')}
            >
              <Plus className="h-4 w-4" />
              Create Invoice
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                useAuthStore.getState().logout();
                navigate('/login');
              }}
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Invoice List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading invoices...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <p className="text-red-500">Error fetching invoices: {error.message}</p>
          </div>
        ) : invoices.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  {searchQuery || statusFilter ? 'No invoices found' : 'No invoices yet'}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {searchQuery || statusFilter
                    ? 'Try adjusting your filters'
                    : 'Get started by creating your first invoice'}
                </p>
                {!searchQuery && !statusFilter && (
                  <Button
                    className="mt-6 gap-2"
                    onClick={() => navigate('/invoices/new')}
                  >
                    <Plus className="h-4 w-4" />
                    Create Your First Invoice
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>All Invoices ({data?.pagination.total || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                        Invoice #
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                        Client
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                        Due Date
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                        Amount
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                        Status
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr
                        key={invoice.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 text-sm font-medium">
                          {invoice.invoiceNumber}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {invoice.client?.clientName || 'No client'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDate(invoice.invoiceDate)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {invoice.dueDate ? formatDate(invoice.dueDate) : '-'}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium">
                          {formatCurrency(Number(invoice.total), invoice.currency)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={getStatusVariant(invoice.status)}>
                            {invoice.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/invoices/${invoice.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog(invoice)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Invoice</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete invoice {selectedInvoice?.invoiceNumber}? This
                action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
