import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package, CreditCard, FileText, TrendingUp, Plus, Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ActiveServiceCard } from './ActiveServiceCard';
import { ServiceCatalog } from './ServiceCatalog';
import { InvoicesList } from './InvoicesList';
import { useServices } from '../../hooks/useServices';

export function ServicesDashboard() {
  const [activeTab, setActiveTab] = useState('active');
  
  const { 
    subscriptions, 
    services, 
    invoices, 
    billing,
    isLoading 
  } = useServices();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Services & Billing
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Manage your subscriptions and billing
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Billing Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">Active Services</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {isLoading ? '...' : subscriptions.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
              <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">Monthly Cost</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {isLoading ? '...' : `$${billing.monthlyCost.toFixed(2)}`}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">Current Usage</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {isLoading ? '...' : `${billing.usagePercent}%`}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">Outstanding</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {isLoading ? '...' : `$${billing.outstanding.toFixed(2)}`}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">
            Active Services
            <Badge variant="secondary" className="ml-2">{subscriptions.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="catalog">Service Catalog</TabsTrigger>
          <TabsTrigger value="invoices">
            Invoices
            {billing.outstanding > 0 && (
              <Badge variant="destructive" className="ml-2">!</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {subscriptions.length === 0 ? (
            <EmptyState
              title="No active services"
              description="Browse our catalog to add services"
              action={() => setActiveTab('catalog')}
              actionLabel="Browse Catalog"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subscriptions.map((sub, index) => (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ActiveServiceCard subscription={sub} />
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="catalog" className="mt-6">
          <ServiceCatalog services={services} />
        </TabsContent>

        <TabsContent value="invoices" className="mt-6">
          <InvoicesList invoices={invoices} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ title, description, action, actionLabel }: {
  title: string;
  description: string;
  action: () => void;
  actionLabel: string;
}) {
  return (
    <div className="text-center py-12">
      <Package className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{description}</p>
      <Button onClick={action}>{actionLabel}</Button>
    </div>
  );
}

