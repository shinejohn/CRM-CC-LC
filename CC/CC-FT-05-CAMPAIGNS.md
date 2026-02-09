# CC-FT-05: Campaigns Module

## Module Overview

| Property | Value |
|----------|-------|
| Module ID | CC-FT-05 |
| Name | Campaigns Module |
| Phase | 3 - Feature Modules |
| Dependencies | CC-SVC-02 (API Client), CC-SVC-06 (AI Service) |
| Estimated Time | 5 hours |
| Agent Assignment | Agent 15 |

---

## Purpose

Create the campaign management module for creating and managing multi-channel marketing campaigns (email, SMS, phone, RVM). Integrates with the 60 campaign templates (EDU, HOOK, HOWTO series).

---

## UI Pattern References

**Primary Reference:** `/magic/patterns/CampaignBuilderPage.tsx`
- Campaign creation wizard
- Multi-step flow
- Channel selection

**Secondary Reference:** `/magic/patterns/MarketingCampaignWizard.tsx`
- Template selection
- Audience targeting
- Schedule configuration

---

## API Endpoints Used

```
GET    /v1/campaigns                     # List campaigns
POST   /v1/campaigns                     # Create campaign
GET    /v1/campaigns/{id}                # Get campaign details
PUT    /v1/campaigns/{id}                # Update campaign
DELETE /v1/campaigns/{id}                # Delete campaign
POST   /v1/campaigns/{id}/send           # Send/schedule campaign
GET    /v1/campaigns/{id}/stats          # Campaign analytics
GET    /v1/campaign-templates            # List templates (60 available)
POST   /v1/campaigns/{id}/test           # Send test message
```

---

## Deliverables

### 1. Campaigns Page

```typescript
// src/command-center/modules/campaigns/CampaignsPage.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Plus, Filter, Mail, MessageSquare, Phone, 
  Radio, Calendar, TrendingUp, Users, BarChart2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CampaignCard } from './CampaignCard';
import { CampaignWizard } from './CampaignWizard';
import { useCampaigns } from '../../hooks/useCampaigns';

type CampaignStatus = 'all' | 'draft' | 'scheduled' | 'active' | 'completed';

export function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CampaignStatus>('all');
  const [showWizard, setShowWizard] = useState(false);
  const [channelFilter, setChannelFilter] = useState<string | null>(null);

  const { campaigns, isLoading, error, stats, refreshCampaigns } = useCampaigns({
    status: statusFilter === 'all' ? null : statusFilter,
    channel: channelFilter,
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
      <div className="grid grid-cols-4 gap-4">
        <StatsCard label="Active" value={stats.active} icon={TrendingUp} color="green" />
        <StatsCard label="Scheduled" value={stats.scheduled} icon={Calendar} color="blue" />
        <StatsCard label="Total Reach" value={stats.totalReach} icon={Users} color="purple" />
        <StatsCard label="Avg. Open Rate" value={`${stats.avgOpenRate}%`} icon={BarChart2} color="orange" />
      </div>

      {/* Channel Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Channel:</span>
        {[
          { id: null, label: 'All', icon: null },
          { id: 'email', label: 'Email', icon: Mail },
          { id: 'sms', label: 'SMS', icon: MessageSquare },
          { id: 'phone', label: 'Phone', icon: Phone },
          { id: 'rvm', label: 'RVM', icon: Radio },
        ].map((channel) => (
          <Button
            key={channel.id || 'all'}
            variant={channelFilter === channel.id ? 'secondary' : 'ghost'}
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
      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as CampaignStatus)}>
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
                  <CampaignCard campaign={campaign} />
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

function StatsCard({ label, value, icon: Icon, color }: any) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/30`}>
          <Icon className={`w-5 h-5 text-${color}-600`} />
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function CampaignGridSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-48 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState({ onCreateNew }: { onCreateNew: () => void }) {
  return (
    <div className="text-center py-12">
      <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-2">No campaigns yet</h3>
      <p className="text-sm text-gray-500 mb-4">Create your first campaign</p>
      <Button onClick={onCreateNew}>
        <Plus className="w-4 h-4 mr-2" />
        New Campaign
      </Button>
    </div>
  );
}
```

### 2. Campaign Card

```typescript
// src/command-center/modules/campaigns/CampaignCard.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mail, MessageSquare, Phone, Radio, Calendar,
  Users, BarChart2, MoreVertical, Play, Pause
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface Campaign {
  id: string;
  name: string;
  channel: 'email' | 'sms' | 'phone' | 'rvm';
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';
  audience: number;
  sent: number;
  opened: number;
  clicked: number;
  scheduledAt?: string;
  template?: string;
}

const channelIcons = {
  email: Mail,
  sms: MessageSquare,
  phone: Phone,
  rvm: Radio,
};

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  scheduled: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-purple-100 text-purple-700',
};

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const navigate = useNavigate();
  const ChannelIcon = channelIcons[campaign.channel];
  const openRate = campaign.sent > 0 ? Math.round((campaign.opened / campaign.sent) * 100) : 0;

  return (
    <motion.div whileHover={{ y: -4 }}>
      <Card
        className="cursor-pointer hover:shadow-lg transition-all"
        onClick={() => navigate(`/command-center/campaigns/${campaign.id}`)}
      >
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg">
                <ChannelIcon className="w-4 h-4 text-gray-600 dark:text-slate-300" />
              </div>
              <Badge className={statusColors[campaign.status]}>
                {campaign.status}
              </Badge>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            {campaign.name}
          </h3>
          {campaign.template && (
            <p className="text-xs text-gray-500 mb-3">Template: {campaign.template}</p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {campaign.audience.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Audience</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {campaign.sent.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Sent</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-green-600">
                {openRate}%
              </p>
              <p className="text-xs text-gray-500">Open Rate</p>
            </div>
          </div>

          {/* Progress */}
          {campaign.status === 'active' && (
            <div className="mb-3">
              <Progress value={(campaign.sent / campaign.audience) * 100} />
              <p className="text-xs text-gray-500 mt-1">
                {Math.round((campaign.sent / campaign.audience) * 100)}% complete
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t">
            {campaign.scheduledAt && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(campaign.scheduledAt).toLocaleDateString()}
              </span>
            )}
            {campaign.status === 'active' && (
              <Button variant="outline" size="sm">
                <Pause className="w-3 h-3 mr-1" />
                Pause
              </Button>
            )}
            {campaign.status === 'paused' && (
              <Button variant="outline" size="sm">
                <Play className="w-3 h-3 mr-1" />
                Resume
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
```

### 3. Campaign Wizard

```typescript
// src/command-center/modules/campaigns/CampaignWizard.tsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, MessageSquare, Phone, Radio, Users, 
  Calendar, ChevronRight, ChevronLeft, Check, Sparkles
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useCampaigns } from '../../hooks/useCampaigns';

interface CampaignWizardProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const steps = [
  { id: 'channel', title: 'Select Channel' },
  { id: 'template', title: 'Choose Template' },
  { id: 'audience', title: 'Select Audience' },
  { id: 'content', title: 'Customize Content' },
  { id: 'schedule', title: 'Schedule' },
];

const channels = [
  { id: 'email', label: 'Email', icon: Mail, description: 'Send email campaigns' },
  { id: 'sms', label: 'SMS', icon: MessageSquare, description: 'Send text messages' },
  { id: 'phone', label: 'Phone', icon: Phone, description: 'Automated phone calls' },
  { id: 'rvm', label: 'Ringless VM', icon: Radio, description: 'Direct to voicemail' },
];

// Sample templates from the 60 available
const templates = [
  { id: 'EDU-001', name: 'Educational Series #1', category: 'EDU', description: 'Introduction to services' },
  { id: 'HOOK-001', name: 'Hook Campaign #1', category: 'HOOK', description: 'Attention-grabbing opener' },
  { id: 'HOWTO-001', name: 'How-To Guide #1', category: 'HOWTO', description: 'Step-by-step tutorial' },
  // ... more templates
];

export function CampaignWizard({ open, onClose, onCreated }: CampaignWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    channel: '',
    templateId: '',
    audience: [] as string[],
    subject: '',
    content: '',
    scheduledAt: '',
  });

  const { createCampaign, isLoading } = useCampaigns({});

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreate = async () => {
    try {
      await createCampaign(formData);
      onCreated();
    } catch (error) {
      console.error('Failed to create campaign:', error);
    }
  };

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'channel':
        return (
          <div className="grid grid-cols-2 gap-4">
            {channels.map((channel) => {
              const Icon = channel.icon;
              const isSelected = formData.channel === channel.id;
              return (
                <button
                  key={channel.id}
                  onClick={() => setFormData({ ...formData, channel: channel.id })}
                  className={`
                    p-4 rounded-xl border-2 text-left transition-all
                    ${isSelected
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className={`w-8 h-8 mb-2 ${isSelected ? 'text-purple-500' : 'text-gray-400'}`} />
                  <h3 className="font-semibold">{channel.label}</h3>
                  <p className="text-sm text-gray-500">{channel.description}</p>
                </button>
              );
            })}
          </div>
        );

      case 'template':
        return (
          <div className="space-y-3">
            <div className="flex gap-2 mb-4">
              {['All', 'EDU', 'HOOK', 'HOWTO'].map((cat) => (
                <Badge
                  key={cat}
                  variant={cat === 'All' ? 'default' : 'outline'}
                  className="cursor-pointer"
                >
                  {cat}
                </Badge>
              ))}
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setFormData({ ...formData, templateId: template.id })}
                  className={`
                    w-full p-3 rounded-lg border text-left transition-all
                    ${formData.templateId === template.id
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-gray-500">{template.description}</p>
                    </div>
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'audience':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <h4 className="font-medium mb-2">Audience Options</h4>
              <div className="space-y-2">
                {['All Customers', 'Active Leads', 'Recent Interactions', 'Custom Segment'].map((option) => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="audience"
                      className="text-purple-500"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="text-center p-4 border-2 border-dashed rounded-lg">
              <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Estimated reach: <strong>1,234</strong> contacts</p>
            </div>
          </div>
        );

      case 'content':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Campaign Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter campaign name"
              />
            </div>
            {formData.channel === 'email' && (
              <div>
                <label className="text-sm font-medium">Subject Line</label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Enter email subject"
                />
              </div>
            )}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Message Content</label>
                <Button variant="ghost" size="sm">
                  <Sparkles className="w-4 h-4 mr-1" />
                  AI Assist
                </Button>
              </div>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your message..."
                rows={6}
              />
            </div>
          </div>
        );

      case 'schedule':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 border-2 rounded-lg text-left hover:border-purple-500">
                <h4 className="font-medium">Send Now</h4>
                <p className="text-sm text-gray-500">Start immediately</p>
              </button>
              <button className="p-4 border-2 rounded-lg text-left hover:border-purple-500">
                <h4 className="font-medium">Schedule</h4>
                <p className="text-sm text-gray-500">Pick a date & time</p>
              </button>
            </div>
            <div>
              <label className="text-sm font-medium">Schedule Date & Time</label>
              <Input
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Campaign</DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${index < currentStep
                      ? 'bg-green-500 text-white'
                      : index === currentStep
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                    }
                  `}
                >
                  {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                <span className="text-xs mt-1 text-gray-500">{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${index < currentStep ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-[300px]"
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleCreate} disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Campaign'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### 4. Module Index

```typescript
// src/command-center/modules/campaigns/index.ts

export { CampaignsPage } from './CampaignsPage';
export { CampaignCard } from './CampaignCard';
export { CampaignWizard } from './CampaignWizard';
export { CampaignDetailPage } from './CampaignDetailPage';
export { useCampaigns } from '../../hooks/useCampaigns';
```

---

## Acceptance Criteria

- [ ] Campaign list with status filtering
- [ ] Channel filter (Email, SMS, Phone, RVM)
- [ ] Campaign wizard with 5 steps
- [ ] Template selection from 60 templates
- [ ] Audience targeting
- [ ] AI-assisted content creation
- [ ] Scheduling functionality
- [ ] Campaign analytics display
- [ ] Pause/Resume active campaigns
- [ ] Mobile responsive

---

## Handoff

Other agents import:
```typescript
import { CampaignsPage, useCampaigns } from '@/command-center/modules/campaigns';
```
