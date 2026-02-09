# CC-FT-03: Customers Module

## Module Overview

| Property | Value |
|----------|-------|
| Module ID | CC-FT-03 |
| Name | Customers Module |
| Phase | 3 - Feature Modules |
| Dependencies | CC-SVC-02 (API Client), CC-SVC-03 (State Management) |
| Estimated Time | 6 hours |
| Agent Assignment | Agent 13 |

---

## Purpose

Create the customer management module for viewing, creating, and managing customer relationships. This includes customer lists, detail views, engagement scoring, and timeline of interactions.

---

## UI Pattern References

**Primary Reference:** `/magic/patterns/CustomerDetailPage.tsx`
- Customer profile layout
- Engagement score display
- Timeline view
- Quick actions

**Secondary Reference:** `/magic/patterns/CustomersListPage.tsx`
- Customer list with filters
- Search functionality
- Bulk actions

**Tertiary Reference:** `/magic/patterns/ContactDetailPage.tsx`
- Contact information display
- Communication history

---

## API Endpoints Used

```
GET    /v1/customers                      # List customers (paginated)
POST   /v1/customers                      # Create customer
GET    /v1/customers/{id}                 # Get customer details
PUT    /v1/customers/{id}                 # Update customer
DELETE /v1/customers/{id}                 # Delete customer
GET    /v1/customers/{id}/engagement-score # Get engagement metrics
GET    /v1/customers/{id}/timeline        # Get interaction timeline
GET    /v1/customers/{id}/predictive      # Get predictive analytics
POST   /v1/customers/bulk-import          # Bulk import customers
GET    /v1/customers/stages               # Get customer stage definitions
```

---

## Deliverables

### 1. Customers List Page

```typescript
// src/command-center/modules/customers/CustomersListPage.tsx

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Plus, Filter, Download, Upload, 
  MoreHorizontal, Users, TrendingUp, AlertCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
        Page {page} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </div>
  );
}
```

### 2. Customer Card

```typescript
// src/command-center/modules/customers/CustomerCard.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Phone, Mail, Building, Star, TrendingUp, 
  TrendingDown, MoreVertical, ExternalLink
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Customer, CustomerStage } from '@/types/command-center';

interface CustomerCardProps {
  customer: Customer;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
}

const stageColors: Record<CustomerStage, string> = {
  lead: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  prospect: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  customer: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  advocate: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  churned: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

export function CustomerCard({ customer, isSelected, onSelect }: CustomerCardProps) {
  const navigate = useNavigate();

  const engagementColor = customer.engagementScore >= 70
    ? 'text-green-500'
    : customer.engagementScore >= 40
    ? 'text-yellow-500'
    : 'text-red-500';

  const TrendIcon = customer.engagementScore >= 50 ? TrendingUp : TrendingDown;

  return (
    <motion.div whileHover={{ y: -2 }}>
      <Card
        className={`
          cursor-pointer hover:shadow-lg transition-all
          ${isSelected ? 'ring-2 ring-purple-500' : ''}
        `}
        onClick={() => navigate(`/command-center/customers/${customer.id}`)}
      >
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={isSelected}
                onCheckedChange={onSelect}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg">
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {customer.name}
                </h3>
                {customer.company && (
                  <p className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-1">
                    <Building className="w-3 h-3" />
                    {customer.company}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>

          {/* Contact Info */}
          <div className="space-y-1 mb-3">
            <p className="text-sm text-gray-600 dark:text-slate-300 flex items-center gap-2">
              <Mail className="w-3 h-3 text-gray-400" />
              {customer.email}
            </p>
            {customer.phone && (
              <p className="text-sm text-gray-600 dark:text-slate-300 flex items-center gap-2">
                <Phone className="w-3 h-3 text-gray-400" />
                {customer.phone}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-700">
            <Badge className={stageColors[customer.stage]}>
              {customer.stage}
            </Badge>
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 ${engagementColor}`}>
                <TrendIcon className="w-4 h-4" />
                <span className="text-sm font-medium">{customer.engagementScore}</span>
              </div>
              {customer.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
```

### 3. Customer Detail Page

```typescript
// src/command-center/modules/customers/CustomerDetailPage.tsx

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Phone, Mail, Building, MapPin,
  Calendar, Clock, Edit, Trash2, MoreVertical,
  TrendingUp, Activity, FileText, Megaphone
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { EngagementScoreCard } from './EngagementScoreCard';
import { CustomerTimeline } from './CustomerTimeline';
import { EditCustomerModal } from './EditCustomerModal';
import { useCustomer } from '../../hooks/useCustomers';

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const { customer, timeline, isLoading, error, refreshCustomer } = useCustomer(id!);

  if (isLoading) {
    return <CustomerDetailSkeleton />;
  }

  if (error || !customer) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error || 'Customer not found'}</p>
        <Button variant="outline" onClick={() => navigate('/command-center/customers')}>
          Back to Customers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/command-center/customers')}
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
          <Button variant="outline" onClick={() => setShowEditModal(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button>
            <Phone className="w-4 h-4 mr-2" />
            Call
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
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              {/* Contact Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InfoRow icon={Mail} label="Email" value={customer.email} />
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

              {/* Notes Card */}
              <Card className="mt-6">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Notes</CardTitle>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4 mr-1" />
                    Add Note
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 dark:text-slate-400 italic">
                    No notes yet. Add your first note.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="mt-6">
              <CustomerTimeline timeline={timeline} />
            </TabsContent>

            <TabsContent value="content" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Content Sent</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">No content sent to this customer yet.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="campaigns" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign History</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">No campaigns for this customer yet.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Scores & Quick Actions */}
        <div className="space-y-6">
          <EngagementScoreCard
            score={customer.engagementScore}
            predictiveScore={customer.predictiveScore}
          />

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Create Content
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Megaphone className="w-4 h-4 mr-2" />
                Add to Campaign
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Activity className="w-4 h-4 mr-2" />
                Log Activity
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <EditCustomerModal
        customer={customer}
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSaved={() => {
          setShowEditModal(false);
          refreshCustomer();
        }}
      />
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
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
```

### 4. useCustomers Hook

```typescript
// src/command-center/hooks/useCustomers.ts

import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api.service';
import { Customer, CustomerStage } from '@/types/command-center';

interface CustomerFilters {
  stage: CustomerStage | null;
  tags: string[];
  engagementMin: number;
  engagementMax: number;
}

export function useCustomers(filters: CustomerFilters) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ page: String(page), per_page: '20' });
      if (filters.stage) params.append('stage', filters.stage);
      if (filters.tags.length) params.append('tags', filters.tags.join(','));
      if (filters.engagementMin > 0) params.append('engagement_min', String(filters.engagementMin));
      if (filters.engagementMax < 100) params.append('engagement_max', String(filters.engagementMax));

      const response = await apiService.get(`/v1/customers?${params}`);
      setCustomers(response.data || []);
      setTotalCount(response.meta?.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const createCustomer = useCallback(async (data: Partial<Customer>) => {
    const response = await apiService.post('/v1/customers', data);
    setCustomers(prev => [response.data, ...prev]);
    return response.data;
  }, []);

  const updateCustomer = useCallback(async (id: string, data: Partial<Customer>) => {
    const response = await apiService.put(`/v1/customers/${id}`, data);
    setCustomers(prev => prev.map(c => c.id === id ? response.data : c));
    return response.data;
  }, []);

  const deleteCustomer = useCallback(async (id: string) => {
    await apiService.delete(`/v1/customers/${id}`);
    setCustomers(prev => prev.filter(c => c.id !== id));
  }, []);

  return {
    customers,
    isLoading,
    error,
    totalCount,
    page,
    setPage,
    refreshCustomers: fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  };
}

export function useCustomer(id: string) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomer = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [customerRes, timelineRes] = await Promise.all([
        apiService.get(`/v1/customers/${id}`),
        apiService.get(`/v1/customers/${id}/timeline`),
      ]);
      setCustomer(customerRes.data);
      setTimeline(timelineRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customer');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  return {
    customer,
    timeline,
    isLoading,
    error,
    refreshCustomer: fetchCustomer,
  };
}
```

### 5. Module Index

```typescript
// src/command-center/modules/customers/index.ts

export { CustomersListPage } from './CustomersListPage';
export { CustomerDetailPage } from './CustomerDetailPage';
export { CustomerCard } from './CustomerCard';
export { CustomerFilters } from './CustomerFilters';
export { CreateCustomerModal } from './CreateCustomerModal';
export { EditCustomerModal } from './EditCustomerModal';
export { EngagementScoreCard } from './EngagementScoreCard';
export { CustomerTimeline } from './CustomerTimeline';
export { useCustomers, useCustomer } from '../../hooks/useCustomers';
```

---

## Acceptance Criteria

- [ ] Customer list displays with pagination
- [ ] Search filters by name, email, company
- [ ] Filter by stage, tags, engagement score
- [ ] Customer cards show key info and engagement score
- [ ] Detail page shows full customer profile
- [ ] Timeline displays interaction history
- [ ] Engagement score visualization
- [ ] Create/Edit customer modals work
- [ ] Bulk import/export functionality
- [ ] Real-time updates via WebSocket
- [ ] Mobile responsive

---

## Handoff

When complete, this module provides:

1. `CustomersListPage` - Customer list view
2. `CustomerDetailPage` - Customer profile
3. `CustomerCard` - Customer card component
4. `useCustomers` - Data management hook
5. `useCustomer` - Single customer hook

Other agents import:
```typescript
import { CustomersListPage, CustomerDetailPage, useCustomers } from '@/command-center/modules/customers';
```
