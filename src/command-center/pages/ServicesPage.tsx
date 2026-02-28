import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Megaphone, Share2, Search, Mail, Plus,
  SlidersHorizontal, ExternalLink, Settings, MoreVertical,
  CheckCircle2, AlertTriangle, Clock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useServiceCatalog } from '@/hooks/useServices';

type ServiceStatus = 'active' | 'issue' | 'pending';

interface MockService {
  id: string;
  name: string;
  type: string;
  typeLabel: string;
  icon: React.ElementType;
  status: ServiceStatus;
  lastUpdated: string;
  description: string;
}

// Semantic category colors — intentional, these identify service types
const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  article: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
  ads: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' },
  social: { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-600 dark:text-pink-400' },
  seo: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' },
  email: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' },
};

// Semantic status colors — intentional, these indicate operational state
const statusConfig: Record<ServiceStatus, { label: string; color: string; icon: React.ElementType }> = {
  active: {
    label: 'Active',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    icon: CheckCircle2,
  },
  issue: {
    label: 'Issue',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon: AlertTriangle,
  },
  pending: {
    label: 'Pending',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    icon: Clock,
  },
};

const MOCK_SERVICES: MockService[] = [
  {
    id: '1', name: 'Thought Leadership Articles', type: 'article',
    typeLabel: 'Content Marketing', icon: FileText, status: 'active',
    lastUpdated: '2 hours ago',
    description: 'Monthly thought leadership articles written by industry experts to establish authority in your niche.',
  },
  {
    id: '2', name: 'Google Ads Campaign', type: 'ads',
    typeLabel: 'Paid Advertising', icon: Megaphone, status: 'active',
    lastUpdated: '1 day ago',
    description: 'Managed PPC campaigns optimized for high conversion rates and maximum ROI.',
  },
  {
    id: '3', name: 'Social Media Management', type: 'social',
    typeLabel: 'Social Media', icon: Share2, status: 'issue',
    lastUpdated: '3 hours ago',
    description: 'Daily engagement and content posting across LinkedIn, Twitter, and Instagram.',
  },
  {
    id: '4', name: 'SEO Optimization', type: 'seo',
    typeLabel: 'Search Engine', icon: Search, status: 'pending',
    lastUpdated: '5 days ago',
    description: 'On-page and technical SEO improvements to boost organic rankings.',
  },
  {
    id: '5', name: 'Email Newsletter', type: 'email',
    typeLabel: 'Email Marketing', icon: Mail, status: 'active',
    lastUpdated: '1 week ago',
    description: 'Weekly curated newsletter sent to your subscriber base.',
  },
];

const TYPE_FILTERS = ['All', 'Content', 'Ads', 'Social', 'SEO', 'Email'];

export default function ServicesPage() {
  const [selectedId, setSelectedId] = useState<string>(MOCK_SERVICES[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  // Try loading from API — falls back gracefully
  const { data: _apiServices } = useServiceCatalog();

  const selected = MOCK_SERVICES.find(s => s.id === selectedId) ?? MOCK_SERVICES[0];

  const filteredServices = MOCK_SERVICES.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.typeLabel.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      typeFilter === 'All' ||
      s.typeLabel.toLowerCase().includes(typeFilter.toLowerCase());
    return matchesSearch && matchesType;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[var(--nexus-text-primary)]">Service Management</h1>
          <p className="text-sm text-[var(--nexus-text-secondary)] mt-1">
            Manage your active subscriptions, content, and campaigns.
          </p>
        </div>
        <button className="px-4 py-2 bg-[var(--nexus-accent-primary)] text-white font-semibold rounded-lg hover:bg-[var(--nexus-button-hover)] transition-colors shadow-sm flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Service
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          {/* Left Panel: Service List */}
          <div className="lg:col-span-4 flex flex-col h-full overflow-hidden">
            {/* Search */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-2 px-3 py-2 bg-[var(--nexus-card-bg)] border border-[var(--nexus-card-border)] rounded-lg flex-1">
                <Search className="w-4 h-4 text-[var(--nexus-text-tertiary)]" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-transparent outline-none text-sm flex-1 text-[var(--nexus-text-primary)] placeholder:text-[var(--nexus-text-tertiary)]"
                />
              </div>
              <button className="p-2 text-[var(--nexus-text-secondary)] hover:bg-[var(--nexus-bg-secondary)] rounded-lg transition-colors">
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Type Tabs — semantic active-filter color kept intentionally */}
            <div className="flex gap-1 mb-4 overflow-x-auto shrink-0">
              {TYPE_FILTERS.map(filter => (
                <button
                  key={filter}
                  onClick={() => setTypeFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    typeFilter === filter
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-[var(--nexus-text-secondary)] hover:bg-[var(--nexus-bg-secondary)]'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Service Cards */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredServices.map(service => {
                const Icon = service.icon;
                const colors = TYPE_COLORS[service.type] || TYPE_COLORS.article;
                const isSelected = service.id === selectedId;
                const status = statusConfig[service.status];
                const StatusIcon = status.icon;

                return (
                  <Card
                    key={service.id}
                    className={`cursor-pointer transition-all ${
                      isSelected
                        ? 'ring-2 ring-[var(--nexus-accent-primary)] shadow-md'
                        : 'hover:shadow-sm border-[var(--nexus-card-border)]'
                    }`}
                    onClick={() => setSelectedId(service.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${colors.bg} shrink-0`}>
                          <Icon className={`w-5 h-5 ${colors.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-[var(--nexus-text-primary)] text-sm truncate">
                              {service.name}
                            </h3>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ml-2 ${status.color}`}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {status.label}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--nexus-text-secondary)] mt-0.5">
                            {service.typeLabel}
                          </p>
                          <p className="text-xs text-[var(--nexus-text-tertiary)] mt-1">
                            Updated {service.lastUpdated}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {filteredServices.length === 0 && (
                <div className="text-center py-12 text-[var(--nexus-text-tertiary)]">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No services match your filters</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Detail View */}
          <div className="lg:col-span-8 bg-[var(--nexus-card-bg)] rounded-2xl shadow-sm border border-[var(--nexus-card-border)] h-full overflow-hidden flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex-1 overflow-y-auto p-8"
              >
                <ServiceDetail service={selected} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ServiceDetail({ service }: { service: MockService }) {
  const Icon = service.icon;
  const colors = TYPE_COLORS[service.type] || TYPE_COLORS.article;
  const status = statusConfig[service.status];
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6">
      {/* Service Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${colors.bg}`}>
            <Icon className={`w-8 h-8 ${colors.text}`} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--nexus-text-primary)]">{service.name}</h2>
            <p className="text-sm text-[var(--nexus-text-secondary)] mt-1">{service.typeLabel}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                <StatusIcon className="w-3.5 h-3.5" />
                {status.label}
              </span>
              <span className="text-xs text-[var(--nexus-text-tertiary)]">
                Last updated {service.lastUpdated}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-[var(--nexus-text-tertiary)] hover:text-[var(--nexus-text-secondary)] hover:bg-[var(--nexus-bg-secondary)] rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <button className="p-2 text-[var(--nexus-text-tertiary)] hover:text-[var(--nexus-text-secondary)] hover:bg-[var(--nexus-bg-secondary)] rounded-lg transition-colors">
            <ExternalLink className="w-5 h-5" />
          </button>
          <button className="p-2 text-[var(--nexus-text-tertiary)] hover:text-[var(--nexus-text-secondary)] hover:bg-[var(--nexus-bg-secondary)] rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="bg-[var(--nexus-bg-secondary)] rounded-xl p-5 border border-[var(--nexus-card-border)]">
        <h3 className="text-sm font-semibold text-[var(--nexus-text-secondary)] mb-2">Description</h3>
        <p className="text-sm text-[var(--nexus-text-secondary)] leading-relaxed">{service.description}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[var(--nexus-bg-secondary)] rounded-xl p-4 border border-[var(--nexus-card-border)] text-center">
          <p className="text-2xl font-bold text-[var(--nexus-text-primary)]">12</p>
          <p className="text-xs text-[var(--nexus-text-secondary)] mt-1">Items Created</p>
        </div>
        <div className="bg-[var(--nexus-bg-secondary)] rounded-xl p-4 border border-[var(--nexus-card-border)] text-center">
          <p className="text-2xl font-bold text-[var(--nexus-text-primary)]">89%</p>
          <p className="text-xs text-[var(--nexus-text-secondary)] mt-1">Completion Rate</p>
        </div>
        <div className="bg-[var(--nexus-bg-secondary)] rounded-xl p-4 border border-[var(--nexus-card-border)] text-center">
          <p className="text-2xl font-bold text-[var(--nexus-text-primary)]">4.8</p>
          <p className="text-xs text-[var(--nexus-text-secondary)] mt-1">Avg Rating</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-[var(--nexus-card-border)]">
        <button className="px-4 py-2 bg-[var(--nexus-accent-primary)] text-white rounded-lg hover:bg-[var(--nexus-button-hover)] transition-colors text-sm font-medium">
          View Details
        </button>
        <button className="px-4 py-2 bg-[var(--nexus-bg-secondary)] text-[var(--nexus-text-secondary)] rounded-lg hover:bg-[var(--nexus-card-bg-hover)] transition-colors text-sm font-medium">
          Edit Settings
        </button>
        {service.status === 'issue' && (
          <button className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors text-sm font-medium">
            Resolve Issue
          </button>
        )}
      </div>
    </div>
  );
}
