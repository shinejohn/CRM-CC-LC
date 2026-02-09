import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Plus, Filter, Download, Upload, 
  Users, TrendingUp, AlertCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CustomerCard } from './CustomerCard';
import { CustomerFilters } from './CustomerFilters';
import { CreateCustomerModal } from './CreateCustomerModal';
import { useCustomers } from '../../hooks/useCustomers';
import { Customer, CustomerStage } from '@/types/command-center';

export function CustomersListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    stage: null as CustomerStage | null,
    tags: [] as string[],
    engagementMin: 0,
    engagementMax: 100,
  });

  const {
    customers,
    isLoading,
    error,
    totalCount,
    page,
    setPage,
    refreshCustomers,
    createCustomer,
  } = useCustomers(filters);

  // Filter by search
  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return customers;
    const query = searchQuery.toLowerCase();
    return customers.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.company?.toLowerCase().includes(query)
    );
  }, [customers, searchQuery]);

  // Summary stats
  const stats = useMemo(() => ({
    total: totalCount,
    leads: customers.filter(c => c.stage === 'lead').length,
    customers: customers.filter(c => c.stage === 'customer').length,
    atRisk: customers.filter(c => c.engagementScore < 30).length,
  }), [customers, totalCount]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Customers
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Manage your customer relationships
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatsCard
          label="Total Customers"
          value={stats.total}
          icon={Users}
          color="blue"
        />
        <StatsCard
          label="New Leads"
          value={stats.leads}
          icon={TrendingUp}
          color="green"
        />
        <StatsCard
          label="Active Customers"
          value={stats.customers}
          icon={Users}
          color="purple"
        />
        <StatsCard
          label="At Risk"
          value={stats.atRisk}
          icon={AlertCircle}
          color="red"
        />
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name, email, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <CustomerFilters filters={filters} onChange={setFilters} />
      </div>

      {/* Customer Grid */}
      {isLoading ? (
        <CustomerGridSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={refreshCustomers} />
      ) : filteredCustomers.length === 0 ? (
        <EmptyState onCreateNew={() => setShowCreateModal(true)} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map((customer, index) => (
              <motion.div
                key={customer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <CustomerCard
                  customer={customer}
                  isSelected={selectedCustomers.includes(customer.id)}
                  onSelect={(selected) => {
                    setSelectedCustomers(prev =>
                      selected
                        ? [...prev, customer.id]
                        : prev.filter(id => id !== customer.id)
                    );
                  }}
                />
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            page={page}
            totalPages={Math.ceil(totalCount / 20)}
            onPageChange={setPage}
          />
        </>
      )}

      {/* Create Modal */}
      <CreateCustomerModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => {
          setShowCreateModal(false);
          refreshCustomers();
        }}
        createCustomer={createCustomer}
      />
    </div>
  );
}

// Sub-components
function StatsCard({ label, value, icon: Icon, color }: any) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-slate-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function CustomerGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 dark:bg-slate-700 rounded-full" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-32" />
                <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyState({ onCreateNew }: { onCreateNew: () => void }) {
  return (
    <div className="text-center py-12">
      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        No customers yet
      </h3>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
        Add your first customer to get started
      </p>
      <Button onClick={onCreateNew}>
        <Plus className="w-4 h-4 mr-2" />
        Add Customer
      </Button>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="text-center py-12">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <p className="text-sm text-red-600 mb-4">{message}</p>
      <Button variant="outline" onClick={onRetry}>Try Again</Button>
    </div>
  );
}

function Pagination({ page, totalPages, onPageChange }: any) {
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <Button
        variant="outline"
        size="sm"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </Button>
      <span className="text-sm text-gray-500">
        Page {page} of {totalPages || 1}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </div>
  );
}

