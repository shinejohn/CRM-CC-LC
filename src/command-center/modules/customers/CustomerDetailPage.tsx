import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft, Phone, Mail, Building, Clock, Edit,
  Handshake, FileText, Receipt,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DataTable, StatusBadge } from '@/components/shared';
import type { ColumnDef } from '@/components/shared';
import { EngagementScoreCard } from './EngagementScoreCard';
import { EditCustomerModal } from './EditCustomerModal';
import { useCustomer, useUpdateCustomer } from '@/hooks/useCustomers';
import { useCustomerDeals, useCustomerQuotes, useCustomerInvoices } from '@/hooks/useCustomerDetail';
import { mapApiCustomerToUi, type ApiCustomer } from './customerMap';
import type { Deal } from '@/services/crm/deals-api';
import type { Quote } from '@/services/crm/quotes-api';
import type { Invoice } from '@/services/crm/invoices-api';

type BadgeStatus = Parameters<typeof StatusBadge>[0]['status'];

const formatCurrency = (value: string | number | undefined): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    Number(value ?? 0) || 0,
  );

const formatDate = (value?: string): string =>
  value
    ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    : '—';

const DEAL_BADGE: Record<string, BadgeStatus> = {
  hook: 'draft',
  engagement: 'pending',
  sales: 'active',
  retention: 'active',
  won: 'completed',
  lost: 'cancelled',
};

const DOC_BADGE: Record<string, BadgeStatus> = {
  draft: 'draft',
  sent: 'pending',
  accepted: 'active',
  declined: 'cancelled',
  expired: 'overdue',
  paid: 'completed',
  partial: 'pending',
  overdue: 'overdue',
  void: 'cancelled',
  cancelled: 'cancelled',
};

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const customerId = id ?? '';
  const { data: apiCustomer, isLoading, error, refetch } = useCustomer(customerId);
  const updateCustomerMutation = useUpdateCustomer();

  const dealsQuery = useCustomerDeals(customerId);
  const quotesQuery = useCustomerQuotes(customerId);
  const invoicesQuery = useCustomerInvoices(customerId);

  const customer = apiCustomer ? mapApiCustomerToUi(apiCustomer as unknown as ApiCustomer) : null;

  const deals = dealsQuery.data?.data ?? [];
  const quotes = quotesQuery.data?.data ?? [];
  const invoices = invoicesQuery.data?.data ?? [];

  if (isLoading) {
    return <CustomerDetailSkeleton />;
  }

  if (error || !customer) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-red-500">
          {error instanceof Error ? error.message : String(error || 'Customer not found')}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button type="button" variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/command-center/sell/customers')}
          >
            Back to Customers
          </Button>
        </div>
      </div>
    );
  }

  const dealColumns: ColumnDef<Deal>[] = [
    {
      header: 'Name',
      cell: (row) => (
        <span className="font-medium text-[var(--nexus-text-primary)]">{row.name}</span>
      ),
    },
    { header: 'Value', cell: (row) => formatCurrency(row.value) },
    { header: 'Probability', cell: (row) => `${row.probability ?? 0}%` },
    { header: 'Expected Close', cell: (row) => formatDate(row.expected_close_at) },
    { header: 'Stage', cell: (row) => <StatusBadge status={DEAL_BADGE[row.stage] ?? 'draft'} /> },
  ];

  const quoteColumns: ColumnDef<Quote>[] = [
    {
      header: 'Quote #',
      cell: (row) => (
        <span className="font-medium text-[var(--nexus-text-primary)]">{row.quote_number}</span>
      ),
    },
    { header: 'Total', cell: (row) => formatCurrency(row.total) },
    { header: 'Valid Until', cell: (row) => formatDate(row.valid_until) },
    { header: 'Status', cell: (row) => <StatusBadge status={DOC_BADGE[row.status] ?? 'draft'} /> },
  ];

  const invoiceColumns: ColumnDef<Invoice>[] = [
    {
      header: 'Invoice #',
      cell: (row) => (
        <span className="font-medium text-[var(--nexus-text-primary)]">{row.invoice_number}</span>
      ),
    },
    { header: 'Total', cell: (row) => formatCurrency(row.total) },
    { header: 'Balance Due', cell: (row) => formatCurrency(row.balance_due) },
    { header: 'Due Date', cell: (row) => formatDate(row.due_date) },
    { header: 'Status', cell: (row) => <StatusBadge status={DOC_BADGE[row.status] ?? 'draft'} /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Back to customers"
            onClick={() => navigate('/command-center/sell/customers')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-2xl">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {customer.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge>{customer.stage}</Badge>
                {customer.tags.map((tag) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" onClick={() => setShowEditModal(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Info */}
        <div className="col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="deals">Deals ({deals.length})</TabsTrigger>
              <TabsTrigger value="quotes">Quotes ({quotes.length})</TabsTrigger>
              <TabsTrigger value="invoices">Invoices ({invoices.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              {/* Contact Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InfoRow icon={Mail} label="Email" value={customer.email || '—'} />
                  {customer.phone && (
                    <InfoRow icon={Phone} label="Phone" value={customer.phone} />
                  )}
                  {customer.company && (
                    <InfoRow icon={Building} label="Company" value={customer.company} />
                  )}
                  {customer.lastInteraction && (
                    <InfoRow
                      icon={Clock}
                      label="Last Interaction"
                      value={new Date(customer.lastInteraction).toLocaleDateString()}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="deals" className="mt-6">
              {dealsQuery.isError ? (
                <TabError label="deals" onRetry={() => dealsQuery.refetch()} />
              ) : (
                <DataTable<Deal>
                  columns={dealColumns}
                  data={deals}
                  isLoading={dealsQuery.isLoading}
                  emptyMessage="No deals for this customer yet"
                />
              )}
            </TabsContent>

            <TabsContent value="quotes" className="mt-6">
              {quotesQuery.isError ? (
                <TabError label="quotes" onRetry={() => quotesQuery.refetch()} />
              ) : (
                <DataTable<Quote>
                  columns={quoteColumns}
                  data={quotes}
                  isLoading={quotesQuery.isLoading}
                  emptyMessage="No quotes for this customer yet"
                />
              )}
            </TabsContent>

            <TabsContent value="invoices" className="mt-6">
              {invoicesQuery.isError ? (
                <TabError label="invoices" onRetry={() => invoicesQuery.refetch()} />
              ) : (
                <DataTable<Invoice>
                  columns={invoiceColumns}
                  data={invoices}
                  isLoading={invoicesQuery.isLoading}
                  emptyMessage="No invoices for this customer yet"
                />
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Scores & Summary */}
        <div className="space-y-6">
          <EngagementScoreCard
            score={customer.engagementScore}
            predictiveScore={customer.predictiveScore}
          />

          {/* Activity Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <SummaryRow icon={Handshake} label="Open deals" value={deals.length} />
              <SummaryRow icon={FileText} label="Quotes" value={quotes.length} />
              <SummaryRow icon={Receipt} label="Invoices" value={invoices.length} />
            </CardContent>
          </Card>
        </div>
      </div>

      {showEditModal && (
        <EditCustomerModal
          customer={customer}
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSaved={() => {
            setShowEditModal(false);
            refetch();
          }}
          updateCustomer={async (cId, data) => {
            const result = await updateCustomerMutation.mutateAsync({
              id: cId,
              data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                business_context: data.company ? { company: data.company } : undefined,
              },
            });
            return mapApiCustomerToUi(result as unknown as ApiCustomer);
          }}
        />
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-4 h-4 text-gray-400" />
      <div>
        <p className="text-xs text-gray-500 dark:text-slate-400">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

function SummaryRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
        <Icon className="w-4 h-4 text-gray-400" />
        {label}
      </div>
      <span className="text-sm font-semibold text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}

function TabError({ label, onRetry }: { label: string; onRetry: () => void }) {
  return (
    <Card>
      <CardContent className="p-8 text-center space-y-4">
        <p className="text-sm text-red-500">Couldn’t load {label}. Please try again.</p>
        <Button type="button" variant="outline" onClick={onRetry}>
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}

function CustomerDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gray-200 dark:bg-slate-700 rounded-full" />
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-48" />
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-32" />
        </div>
      </div>
    </div>
  );
}
