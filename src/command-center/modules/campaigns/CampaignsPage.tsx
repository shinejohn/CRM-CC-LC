// ============================================
// CAMPAIGNS PAGE - Command Center
// CC-FT-05: Campaigns Module
// ============================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Plus, Mail, MessageSquare, Phone,
  Radio, Calendar, TrendingUp, Users, BarChart2,
  Play, Pause, Clock
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CampaignCard } from './CampaignCard';
import { CampaignWizard } from './CampaignWizard';
import { useCampaigns } from './useCampaigns';
import type { CampaignStatus, CampaignChannel, TimelineProgress } from './campaign.types';

export function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all');
  const [showWizard, setShowWizard] = useState(false);
  const [channelFilter, setChannelFilter] = useState<CampaignChannel | null>(null);

  const {
    campaigns, isLoading, error, stats, pauseCampaign, resumeCampaign, refreshCampaigns,
    timelineProgress, availableTimelines, timelineLoading,
    pauseTimeline, resumeTimeline,
  } = useCampaigns({
    status: statusFilter === 'all' ? null : statusFilter,
    channel: channelFilter || undefined,
    search: searchQuery || undefined,
  });
  const [activeTab, setActiveTab] = useState<'campaigns' | 'timeline'>('campaigns');

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
        <StatsCard label="Timeline Enrollments" value={timelineProgress.filter(p => p.status === 'active').length} icon={Clock} color="orange" />
      </div>

      {/* View Toggle: Campaigns vs Timeline */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setActiveTab('campaigns')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'campaigns'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400'
          }`}
        >
          Campaigns
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'timeline'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400'
          }`}
        >
          Timeline Progress
          {timelineProgress.length > 0 && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
              {timelineProgress.filter(p => p.status === 'active').length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'campaigns' ? (
        <>
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
        </>
      ) : (
        <TimelineProgressPanel
          progress={timelineProgress}
          timelines={availableTimelines}
          loading={timelineLoading}
          onPause={pauseTimeline}
          onResume={resumeTimeline}
        />
      )}

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

function TimelineProgressPanel({
  progress,
  timelines,
  loading,
  onPause,
  onResume,
}: {
  progress: TimelineProgress[];
  timelines: Array<{ id: string; name: string; pipeline_stage: string; duration_days: number; active_enrollments: number }>;
  loading: boolean;
  onPause: (customerId: string) => Promise<void>;
  onResume: (customerId: string) => Promise<void>;
}) {
  if (loading) {
    return <CampaignGridSkeleton />;
  }

  const stageColors: Record<string, string> = {
    hook: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    engagement: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    sales: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    retention: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  };

  return (
    <div className="space-y-6">
      {/* Available Timelines */}
      {timelines.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-3">Available Timelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {timelines.map((t) => (
              <Card key={t.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900 dark:text-white text-sm">{t.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${stageColors[t.pipeline_stage] ?? 'bg-gray-100 text-gray-700'}`}>
                      {t.pipeline_stage}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {t.duration_days} days &middot; {t.active_enrollments} active
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Active Progress */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-3">
          Customer Progress ({progress.length})
        </h3>

        {progress.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-slate-400">
              No customers enrolled in timelines yet.
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
              Use <code className="bg-gray-100 dark:bg-slate-700 px-1 rounded">php artisan campaign:enroll</code> to start.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {progress.map((p) => {
              const pct = Math.round((p.current_day / p.timeline.duration_days) * 100);
              return (
                <Card key={p.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                          {p.customer.business_name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">
                          {p.customer.email} &middot; {p.timeline.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          p.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' :
                          p.status === 'paused' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' :
                          'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                          {p.status}
                        </span>
                        {p.status === 'active' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onPause(p.customer.id)}
                            aria-label={`Pause timeline for ${p.customer.business_name}`}
                          >
                            <Pause className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {p.status === 'paused' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onResume(p.customer.id)}
                            aria-label={`Resume timeline for ${p.customer.business_name}`}
                          >
                            <Play className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all"
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-slate-400 tabular-nums shrink-0">
                        Day {p.current_day}/{p.timeline.duration_days}
                      </span>
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-gray-400 dark:text-slate-500">
                      <span>{p.completed_actions_count} completed</span>
                      <span>{p.skipped_actions_count} skipped</span>
                      {p.last_action_at && (
                        <span>Last action: {new Date(p.last_action_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

