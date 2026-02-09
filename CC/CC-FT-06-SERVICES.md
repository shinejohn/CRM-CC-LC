# CC-FT-06: Services Module

## Module Overview

| Property | Value |
|----------|-------|
| Module ID | CC-FT-06 |
| Name | Services Module |
| Phase | 3 - Feature Modules |
| Dependencies | CC-SVC-02 (API Client), CC-SVC-03 (State Management) |
| Estimated Time | 4 hours |
| Agent Assignment | Agent 16 |

---

## Purpose

Create the services module for managing subscribed Fibonacco services, viewing the service catalog, and handling billing/invoices.

---

## UI Pattern References

**Primary Reference:** `/magic/patterns/ServicesDashboard.tsx`
**Secondary Reference:** `/magic/patterns/ServiceCatalog.tsx`
**Tertiary Reference:** `/magic/patterns/InvoicesListPage.tsx`

---

## API Endpoints Used

```
GET    /v1/services                      # List available services
GET    /v1/services/{id}                 # Service details
GET    /v1/subscriptions                 # Active subscriptions
POST   /v1/subscriptions                 # Subscribe to service
DELETE /v1/subscriptions/{id}            # Cancel subscription
GET    /v1/invoices                      # List invoices
GET    /v1/invoices/{id}                 # Invoice details
POST   /v1/invoices/{id}/pay             # Pay invoice
GET    /v1/billing/summary               # Billing summary
```

---

## Deliverables

### 1. Services Dashboard

```typescript
// src/command-center/modules/services/ServicesDashboard.tsx

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
    <div className="space-y-6">
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
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Services</p>
              <p className="text-2xl font-bold">{subscriptions.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Monthly Cost</p>
              <p className="text-2xl font-bold">${billing.monthlyCost}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Current Usage</p>
              <p className="text-2xl font-bold">{billing.usagePercent}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <FileText className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Outstanding</p>
              <p className="text-2xl font-bold">${billing.outstanding}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
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

function EmptyState({ title, description, action, actionLabel }: any) {
  return (
    <div className="text-center py-12">
      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      <Button onClick={action}>{actionLabel}</Button>
    </div>
  );
}
```

### 2. Active Service Card

```typescript
// src/command-center/modules/services/ActiveServiceCard.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { Settings, ExternalLink, BarChart2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface Subscription {
  id: string;
  serviceName: string;
  serviceId: string;
  status: 'active' | 'pending' | 'cancelled' | 'past_due';
  tier: string;
  price: number;
  billingCycle: 'monthly' | 'annual';
  usage: {
    current: number;
    limit: number;
    unit: string;
  };
  nextBillingDate: string;
}

const statusColors = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-gray-100 text-gray-700',
  past_due: 'bg-red-100 text-red-700',
};

export function ActiveServiceCard({ subscription }: { subscription: Subscription }) {
  const usagePercent = (subscription.usage.current / subscription.usage.limit) * 100;
  const isHighUsage = usagePercent > 80;

  return (
    <motion.div whileHover={{ y: -4 }}>
      <Card className="hover:shadow-lg transition-all">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {subscription.serviceName}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={statusColors[subscription.status]}>
                  {subscription.status}
                </Badge>
                <Badge variant="outline">{subscription.tier}</Badge>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </div>

          {/* Pricing */}
          <div className="mb-4">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              ${subscription.price}
            </span>
            <span className="text-sm text-gray-500">
              /{subscription.billingCycle === 'monthly' ? 'mo' : 'yr'}
            </span>
          </div>

          {/* Usage */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-500">Usage</span>
              <span className={`text-sm font-medium ${isHighUsage ? 'text-orange-500' : 'text-gray-700'}`}>
                {subscription.usage.current.toLocaleString()} / {subscription.usage.limit.toLocaleString()} {subscription.usage.unit}
              </span>
            </div>
            <Progress
              value={usagePercent}
              className={isHighUsage ? '[&>div]:bg-orange-500' : ''}
            />
            {isHighUsage && (
              <p className="text-xs text-orange-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                High usage - consider upgrading
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t">
            <span className="text-xs text-gray-500">
              Next billing: {new Date(subscription.nextBillingDate).toLocaleDateString()}
            </span>
            <Button variant="link" size="sm" className="text-purple-600">
              <BarChart2 className="w-4 h-4 mr-1" />
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
```

### 3. Service Catalog

```typescript
// src/command-center/modules/services/ServiceCatalog.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  tiers: {
    id: string;
    name: string;
    price: number;
    billingCycle: 'monthly' | 'annual';
    features: string[];
    popular?: boolean;
  }[];
}

export function ServiceCatalog({ services }: { services: Service[] }) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', ...new Set(services.map(s => s.category))];
  const filteredServices = selectedCategory === 'all'
    ? services
    : services.filter(s => s.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex gap-2">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </Button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="space-y-8">
        {filteredServices.map((service) => (
          <div key={service.id}>
            <h3 className="text-lg font-semibold mb-2">{service.name}</h3>
            <p className="text-sm text-gray-500 mb-4">{service.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {service.tiers.map((tier, index) => (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`relative ${tier.popular ? 'border-purple-500 border-2' : ''}`}>
                    {tier.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-purple-500">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Popular
                        </Badge>
                      </div>
                    )}
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-lg mb-2">{tier.name}</h4>
                      <div className="mb-4">
                        <span className="text-3xl font-bold">${tier.price}</span>
                        <span className="text-gray-500">
                          /{tier.billingCycle === 'monthly' ? 'mo' : 'yr'}
                        </span>
                      </div>
                      <ul className="space-y-2 mb-6">
                        {tier.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button
                        className={`w-full ${tier.popular ? 'bg-purple-500 hover:bg-purple-600' : ''}`}
                        variant={tier.popular ? 'default' : 'outline'}
                      >
                        Subscribe
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 4. Module Index

```typescript
// src/command-center/modules/services/index.ts

export { ServicesDashboard } from './ServicesDashboard';
export { ActiveServiceCard } from './ActiveServiceCard';
export { ServiceCatalog } from './ServiceCatalog';
export { InvoicesList } from './InvoicesList';
export { useServices } from '../../hooks/useServices';
```

---

## Acceptance Criteria

- [ ] Services dashboard with billing summary
- [ ] Active subscriptions display
- [ ] Usage progress indicators
- [ ] Service catalog with tiers
- [ ] Invoice list with payment status
- [ ] Subscribe/cancel functionality
- [ ] Mobile responsive

---

## Handoff

Other agents import:
```typescript
import { ServicesDashboard, useServices } from '@/command-center/modules/services';
```
