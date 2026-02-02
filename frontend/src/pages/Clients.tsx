import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  FileText,
  Edit,
  Trash2,
} from 'lucide-react';
import { clientApi, Client, ClientInput } from '@/lib/clientApi';
import { toast } from 'sonner';

export default function Clients() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<ClientInput>({
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    clientPhone: '',
    taxId: '',
  });

  // Fetch clients
  const { data, isLoading } = useQuery({
    queryKey: ['clients', searchQuery],
    queryFn: () => clientApi.getClients({ search: searchQuery, limit: 50 }),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: clientApi.createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success('Client created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create client');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ClientInput }) =>
      clientApi.updateClient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setIsEditDialogOpen(false);
      setSelectedClient(null);
      resetForm();
      toast.success('Client updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update client');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: clientApi.deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setIsDeleteDialogOpen(false);
      setSelectedClient(null);
      toast.success('Client deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete client');
    },
  });

  const resetForm = () => {
    setFormData({
      clientName: '',
      clientEmail: '',
      clientAddress: '',
      clientPhone: '',
      taxId: '',
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedClient) {
      updateMutation.mutate({ id: selectedClient.id, data: formData });
    }
  };

  const handleDelete = () => {
    if (selectedClient) {
      deleteMutation.mutate(selectedClient.id);
    }
  };

  const openEditDialog = (client: Client) => {
    setSelectedClient(client);
    setFormData({
      clientName: client.clientName,
      clientEmail: client.clientEmail || '',
      clientAddress: client.clientAddress || '',
      clientPhone: client.clientPhone || '',
      taxId: client.taxId || '',
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (client: Client) => {
    setSelectedClient(client);
    setIsDeleteDialogOpen(true);
  };

  const clients = data?.clients || [];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
            <p className="text-gray-600 mt-1">
              Manage your client database
            </p>
          </div>
          <Button
            className="gap-2"
            onClick={() => {
              resetForm();
              setIsCreateDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add Client
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Client List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading clients...</p>
          </div>
        ) : clients.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  {searchQuery ? 'No clients found' : 'No clients yet'}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {searchQuery
                    ? 'Try adjusting your search'
                    : 'Get started by adding your first client'}
                </p>
                {!searchQuery && (
                  <Button className="mt-6 gap-2" onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Add Your First Client
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client) => (
              <Card key={client.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{client.clientName}</CardTitle>
                      {client._count && (
                        <Badge variant="secondary" className="mt-2">
                          {client._count.invoices} {client._count.invoices === 1 ? 'invoice' : 'invoices'}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(client)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(client)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {client.clientEmail && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{client.clientEmail}</span>
                    </div>
                  )}
                  {client.clientPhone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{client.clientPhone}</span>
                    </div>
                  )}
                  {client.clientAddress && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{client.clientAddress}</span>
                    </div>
                  )}
                  {client.taxId && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="h-4 w-4" />
                      <span>Tax ID: {client.taxId}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
                <DialogDescription>
                  Create a new client record
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name *</Label>
                  <Input
                    id="clientName"
                    value={formData.clientName}
                    onChange={(e) =>
                      setFormData({ ...formData, clientName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">Email</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, clientEmail: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientPhone">Phone</Label>
                  <Input
                    id="clientPhone"
                    value={formData.clientPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, clientPhone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientAddress">Address</Label>
                  <Input
                    id="clientAddress"
                    value={formData.clientAddress}
                    onChange={(e) =>
                      setFormData({ ...formData, clientAddress: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID</Label>
                  <Input
                    id="taxId"
                    value={formData.taxId}
                    onChange={(e) =>
                      setFormData({ ...formData, taxId: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Client'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <form onSubmit={handleUpdate}>
              <DialogHeader>
                <DialogTitle>Edit Client</DialogTitle>
                <DialogDescription>
                  Update client information
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-clientName">Client Name *</Label>
                  <Input
                    id="edit-clientName"
                    value={formData.clientName}
                    onChange={(e) =>
                      setFormData({ ...formData, clientName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-clientEmail">Email</Label>
                  <Input
                    id="edit-clientEmail"
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, clientEmail: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-clientPhone">Phone</Label>
                  <Input
                    id="edit-clientPhone"
                    value={formData.clientPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, clientPhone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-clientAddress">Address</Label>
                  <Input
                    id="edit-clientAddress"
                    value={formData.clientAddress}
                    onChange={(e) =>
                      setFormData({ ...formData, clientAddress: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-taxId">Tax ID</Label>
                  <Input
                    id="edit-taxId"
                    value={formData.taxId}
                    onChange={(e) =>
                      setFormData({ ...formData, taxId: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Updating...' : 'Update Client'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Client</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedClient?.clientName}? This action cannot
                be undone.
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
