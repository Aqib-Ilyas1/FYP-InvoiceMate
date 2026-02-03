import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { invoiceApi } from '@/lib/invoiceApi';
import {
  DollarSign,
  FileText,
  Clock,
  CheckCircle,
  Users,
  Plus,
  ArrowUpRight,
  Loader2
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['invoiceStats'],
    queryFn: invoiceApi.getInvoiceStats,
  });

  const { data: recentInvoicesData, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ['recentInvoices'],
    queryFn: () => invoiceApi.getInvoices({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
  });

  const recentInvoices = recentInvoicesData?.invoices || [];

  if (isLoadingStats || isLoadingInvoices) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      </Layout>
    );
  }

  const metrics = [
    {
      title: 'Total Revenue',
      value: `$${(parseFloat(stats?.totalRevenue) || 0).toFixed(2)}`,
      description: 'All time earnings',
      icon: DollarSign,
      trend: '',
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Pending Invoices',
      value: stats?.dueInvoicesCount || 0,
      description: 'Awaiting payment',
      icon: Clock,
      trend: '0 invoices',
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Paid Invoices',
      value: stats?.paidInvoicesCount || 0,
      description: 'All time',
      icon: CheckCircle,
      trend: `${stats?.paidInvoicesCount || 0} paid`,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Clients',
      value: stats?.clientCount || 0,
      description: 'Active clients',
      icon: Users,
      trend: '',
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back! Here's an overview of your invoices
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2" onClick={() => navigate('/clients')}>
              <Plus className="h-4 w-4" />
              Add Client
            </Button>
            <Button className="gap-2" onClick={() => navigate('/invoices/new')}>
              <Plus className="h-4 w-4" />
              Create Invoice
            </Button>
          </div>
        </div>

        {/* Metrics cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <Card key={metric.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {metric.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <metric.icon className={`h-5 w-5 ${metric.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {metric.description}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-xs text-gray-500">{metric.trend}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent invoices */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Invoices</CardTitle>
                <CardDescription>Your latest invoice activity</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate('/invoices')}>
                View All
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentInvoices.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No invoices yet</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Get started by creating your first invoice
                </p>
                <Button className="mt-6 gap-2" onClick={() => navigate('/invoices/new')}>
                  <Plus className="h-4 w-4" />
                  Create Your First Invoice
                </Button>
              </div>
            ) : (
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
                    {recentInvoices.map((invoice: any) => (
                      <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium">{invoice.invoiceNumber}</td>
                        <td className="py-3 px-4 text-sm">{invoice.client?.clientName || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{new Date(invoice.invoiceDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-sm font-medium">${parseFloat(invoice.total).toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              invoice.status === 'paid'
                                ? 'success'
                                : invoice.status === 'pending' || invoice.status === 'sent'
                                ? 'warning'
                                : 'default'
                            }
                          >
                            {invoice.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/invoices/${invoice.id}`)}>
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Draft Invoices</span>
                <span className="font-semibold">{stats?.draftInvoicesCount || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Overdue Invoices</span>
                <span className="font-semibold text-red-600">{stats?.dueInvoicesCount || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Invoice Value</span>
                <span className="font-semibold">${(parseFloat(stats?.avgInvoiceValue) || 0).toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No recent activity</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
