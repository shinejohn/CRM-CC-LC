// ============================================
// CAMPAIGNS PAGE - Command Center
// CC-FT-05: Campaigns Module
// ============================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Plus, Mail, MessageSquare, Phone, 
  Radio, Calendar, TrendingUp, Users, BarChart2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CampaignCard } from './CampaignCard';
import { CampaignWizard } from './CampaignWizard';
import { useCampaigns } from './useCampaigns';
import type { CampaignStatus, CampaignChannel } from './campaign.types';

export function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all');
  const [showWizard, setShowWizard] = useState(false);
  const [channelFilter, setChannelFilter] = useState<CampaignChannel | null>(null);

  const { campaigns, isLoading, error, stats, pauseCampaign, resumeCampaign, refreshCampaigns } = useCampaigns({
    status: statusFilter === 'all' ? null : statusFilter,
    channel: channelFilter || undefined,
    search: searchQuery || undefined,
  });

  const filteredCampaigns = campaigns.filter(c => {
    if (!searchQuery) return true;
    return c.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Campaigns</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Create and manage your marketing campaigns
          </p>
        </div>
        <Button onClick={() => setShowWizard(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard label="Active" value={stats.active} icon={TrendingUp} color="green" />
        <StatsCard label="Scheduled" value={stats.scheduled} icon={Calendar} color="blue" />
        <StatsCard label="Total Reach" value={stats.totalReach.toLocaleString()} icon={Users} color="purple" />
        <StatsCard label="Avg. Open Rate" value={`${stats.avgOpenRate}%`} icon={BarChart2} color="orange" />
      </div>

      {/* Channel Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-500 dark:text-slate-400">Channel:</span>
        {[
          { id: null, label: 'All', icon: null },
          { id: 'email' as CampaignChannel, label: 'Email', icon: Mail },
          { id: 'sms' as CampaignChannel, label: 'SMS', icon: MessageSquare },
          { id: 'phone' as CampaignChannel, label: 'Phone', icon: Phone },
          { id: 'rvm' as CampaignChannel, label: 'RVM', icon: Radio },
        ].map((channel) => (
          <Button
            key={channel.id || 'all'}
            variant={channelFilter === channel.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChannelFilter(channel.id)}
          >
            {channel.icon && <channel.icon className="w-4 h-4 mr-1" />}
            {channel.label}
          </Button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search campaigns..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Status Tabs */}
      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as CampaignStatus | 'all')}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-6">
          {isLoading ? (
            <CampaignGridSkeleton />
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <Button onClick={() => refreshCampaigns()} className="mt-4">
                Retry
              </Button>
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <EmptyState onCreateNew={() => setShowWizard(true)} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCampaigns.map((campaign, index) => (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <CampaignCard
                    campaign={campaign}
                    onPause={pauseCampaign}
                    onResume={resumeCampaign}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Campaign Wizard */}
      <CampaignWizard
        open={showWizard}
        onClose={() => setShowWizard(false)}
        onCreated={() => {
          setShowWizard(false);
          refreshCampaigns();
        }}
      />
    </div>
  );
}

function StatsCard({ label, value, icon: Icon, color }: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  const colorClasses: Record<string, { bg: string; text: string }> = {
    green: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' },
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' },
    orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' },
  };

  const colors = colorClasses[color] || colorClasses.green;

  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`p-3 rounded-lg ${colors.bg}`}>
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-slate-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function CampaignGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-48 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState({ onCreateNew }: { onCreateNew: () => void }) {
  return (
    <div className="text-center py-12">
      <Mail className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No campaigns yet</h3>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">Create your first campaign</p>
      <Button onClick={onCreateNew}>
        <Plus className="w-4 h-4 mr-2" />
        New Campaign
      </Button>
    </div>
  );
}

