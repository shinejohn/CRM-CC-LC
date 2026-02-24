// ============================================
// CAMPAIGN WIZARD - Command Center
// CC-FT-05: Campaigns Module
// ============================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, MessageSquare, Phone, Radio, Users,
  Calendar, ChevronRight, ChevronLeft, Check, Sparkles,
  Building2, Filter, Loader2
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
import { useCampaigns } from './useCampaigns';
import { useAI } from '../../hooks/useAI';
import { useBusinessIntelligenceContext } from '../../hooks/useBusinessIntelligenceContext';
import { communityService, type Community, type CommunityBusiness } from '@/services/communityService';
import type { CampaignChannel, CampaignTemplateCategory } from './campaign.types';

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

const channels: Array<{
  id: CampaignChannel;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}> = [
    { id: 'email', label: 'Email', icon: Mail, description: 'Send email campaigns' },
    { id: 'sms', label: 'SMS', icon: MessageSquare, description: 'Send text messages' },
    { id: 'phone', label: 'Phone', icon: Phone, description: 'Automated phone calls' },
    { id: 'rvm', label: 'Ringless VM', icon: Radio, description: 'Direct to voicemail' },
  ];

export function CampaignWizard({ open, onClose, onCreated }: CampaignWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    channel: '' as CampaignChannel | '',
    templateId: '',
    audience: [] as string[],
    audienceType: 'all' as 'all' | 'leads' | 'recent' | 'custom' | 'community',
    communityId: '',
    communityBusinessIds: [] as string[],
    subject: '',
    content: '',
    scheduledAt: '',
  });

  // Community targeting state
  const [communities, setCommunities] = useState<Community[]>([]);
  const [communityBusinesses, setCommunityBusinesses] = useState<CommunityBusiness[]>([]);
  const [isLoadingCommunities, setIsLoadingCommunities] = useState(false);
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(false);
  const [communityFilter, setCommunityFilter] = useState({ category: '', stage: '', search: '' });

  const { createCampaign, templates, isLoading } = useCampaigns({});
  const { generate, isLoading: isAIGenerating } = useAI();
  const { enrichedContext } = useBusinessIntelligenceContext();

  // Load communities when audience type changes to 'community'
  useEffect(() => {
    if (formData.audienceType === 'community' && communities.length === 0) {
      setIsLoadingCommunities(true);
      communityService.list({ status: 'active' })
        .then((res) => setCommunities(res.data ?? []))
        .catch((err) => console.error('Failed to load communities:', err))
        .finally(() => setIsLoadingCommunities(false));
    }
  }, [formData.audienceType]);

  // Load businesses when a community is selected
  useEffect(() => {
    if (formData.communityId) {
      setIsLoadingBusinesses(true);
      communityService.getBusinesses(formData.communityId, {
        category: communityFilter.category || undefined,
        stage: communityFilter.stage || undefined,
        search: communityFilter.search || undefined,
        per_page: 100,
      })
        .then((res) => setCommunityBusinesses(res.data ?? []))
        .catch((err) => console.error('Failed to load businesses:', err))
        .finally(() => setIsLoadingBusinesses(false));
    }
  }, [formData.communityId, communityFilter]);

  const filteredTemplates = templates.filter(t =>
    !formData.channel || t.channel === formData.channel
  );

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

  const handleAIGenerate = async () => {
    if (!formData.channel || !formData.templateId) return;

    try {
      const generated = await generate({
        type: formData.channel === 'email' ? 'email' : formData.channel === 'sms' ? 'sms' : 'social',
        prompt: `Generate ${formData.channel} campaign content for template ${formData.templateId}`,
      });

      if (formData.channel === 'email') {
        setFormData({ ...formData, subject: generated.split('\n')[0] || '', content: generated });
      } else {
        setFormData({ ...formData, content: generated });
      }
    } catch (error) {
      console.error('Failed to generate content:', error);
    }
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.channel || !formData.content) {
      return;
    }

    try {
      await createCampaign({
        name: formData.name,
        channel: formData.channel,
        templateId: formData.templateId || undefined,
        audience: formData.audience.length > 0 ? formData.audience : ['all'], // Default to all
        subject: formData.subject,
        content: formData.content,
        scheduledAt: formData.scheduledAt || undefined,
      });
      onCreated();
      // Reset form
      setFormData({
        name: '',
        channel: '' as CampaignChannel | '',
        templateId: '',
        audience: [],
        audienceType: 'all',
        communityId: '',
        communityBusinessIds: [],
        subject: '',
        content: '',
        scheduledAt: '',
      });
      setCurrentStep(0);
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
                      : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                    }
                  `}
                >
                  <Icon className={`w-8 h-8 mb-2 ${isSelected ? 'text-purple-500' : 'text-gray-400'}`} />
                  <h3 className="font-semibold text-gray-900 dark:text-white">{channel.label}</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{channel.description}</p>
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
                  variant="outline"
                  className="cursor-pointer"
                >
                  {cat}
                </Badge>
              ))}
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredTemplates.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-8">
                  No templates available for {formData.channel || 'selected channel'}
                </p>
              ) : (
                filteredTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setFormData({ ...formData, templateId: template.id })}
                    className={`
                      w-full p-3 rounded-lg border text-left transition-all
                      ${formData.templateId === template.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{template.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-slate-400">{template.description}</p>
                      </div>
                      <Badge variant="outline">{template.category}</Badge>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        );

      case 'audience':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <h4 className="font-medium mb-3 text-gray-900 dark:text-white">Audience Options</h4>
              <div className="space-y-2">
                {[
                  { value: 'all', label: 'All Customers' },
                  { value: 'leads', label: 'Active Leads' },
                  { value: 'recent', label: 'Recent Interactions' },
                  { value: 'community', label: 'Community Businesses' },
                  { value: 'custom', label: 'Custom Segment' },
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="audience"
                      value={option.value}
                      className="text-purple-500"
                      checked={formData.audienceType === option.value}
                      onChange={() => {
                        setFormData({ ...formData, audienceType: option.value as typeof formData.audienceType, audience: [option.label] });
                      }}
                    />
                    <span className="text-gray-900 dark:text-white">{option.label}</span>
                    {option.value === 'community' && (
                      <Badge variant="outline" className="text-[10px] ml-1">Intelligence Hub</Badge>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Community Targeting Panel */}
            {formData.audienceType === 'community' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 border-2 border-purple-200 dark:border-purple-800 rounded-lg bg-purple-50/50 dark:bg-purple-900/10"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-4 h-4 text-purple-500" />
                  <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-300">Select Community</h4>
                </div>

                {isLoadingCommunities ? (
                  <div className="flex items-center gap-2 py-4 justify-center text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Loading communities...</span>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {communities.map((community) => (
                      <button
                        key={community.id}
                        onClick={() => setFormData({ ...formData, communityId: community.id, communityBusinessIds: [] })}
                        className={`w-full p-2 rounded-lg text-left text-sm transition-all ${formData.communityId === community.id
                          ? 'bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-700'
                          : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-purple-300'
                          }`}
                      >
                        <span className="font-medium text-gray-900 dark:text-white">{community.name}</span>
                        {community.slug && (
                          <span className="text-xs text-gray-500 dark:text-slate-400 ml-2">({community.slug})</span>
                        )}
                      </button>
                    ))}
                    {communities.length === 0 && (
                      <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-2">No communities found</p>
                    )}
                  </div>
                )}

                {/* Community Businesses Filter + List */}
                {formData.communityId && (
                  <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Filter className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs font-medium text-gray-600 dark:text-slate-400">Filter businesses</span>
                    </div>
                    <div className="flex gap-2 mb-3">
                      <Input
                        placeholder="Search..."
                        value={communityFilter.search}
                        onChange={(e) => setCommunityFilter({ ...communityFilter, search: e.target.value })}
                        className="text-xs h-8"
                      />
                      <select
                        value={communityFilter.stage}
                        onChange={(e) => setCommunityFilter({ ...communityFilter, stage: e.target.value })}
                        className="text-xs h-8 px-2 rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                      >
                        <option value="">All stages</option>
                        <option value="prospect">Prospect</option>
                        <option value="onboarding">Onboarding</option>
                        <option value="active">Active</option>
                      </select>
                    </div>

                    {isLoadingBusinesses ? (
                      <div className="flex items-center gap-2 py-4 justify-center text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Loading businesses...</span>
                      </div>
                    ) : (
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        <label className="flex items-center gap-2 p-2 rounded bg-gray-100 dark:bg-slate-700/50 cursor-pointer">
                          <input
                            type="checkbox"
                            className="text-purple-500"
                            checked={formData.communityBusinessIds.length === communityBusinesses.length && communityBusinesses.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ ...formData, communityBusinessIds: communityBusinesses.map(b => b.id) });
                              } else {
                                setFormData({ ...formData, communityBusinessIds: [] });
                              }
                            }}
                          />
                          <span className="text-xs font-medium text-gray-700 dark:text-slate-300">
                            Select all ({communityBusinesses.length})
                          </span>
                        </label>
                        {communityBusinesses.map((biz) => (
                          <label key={biz.id} className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-slate-700/30 cursor-pointer">
                            <input
                              type="checkbox"
                              className="text-purple-500"
                              checked={formData.communityBusinessIds.includes(biz.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({ ...formData, communityBusinessIds: [...formData.communityBusinessIds, biz.id] });
                                } else {
                                  setFormData({ ...formData, communityBusinessIds: formData.communityBusinessIds.filter(id => id !== biz.id) });
                                }
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-sm text-gray-900 dark:text-white">{biz.business_name}</span>
                              <div className="flex items-center gap-2 mt-0.5">
                                {biz.category && <Badge variant="outline" className="text-[9px] px-1 py-0">{biz.category}</Badge>}
                                {biz.stage && <span className="text-[10px] text-gray-400">{biz.stage}</span>}
                                {biz.profile_completeness !== undefined && (
                                  <span className="text-[10px] text-gray-400">{biz.profile_completeness}% complete</span>
                                )}
                              </div>
                            </div>
                          </label>
                        ))}
                        {communityBusinesses.length === 0 && (
                          <p className="text-xs text-gray-500 dark:text-slate-400 text-center py-3">No businesses found</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            <div className="text-center p-4 border-2 border-dashed rounded-lg border-gray-300 dark:border-slate-600">
              <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Estimated reach: <strong className="text-gray-900 dark:text-white">
                  {formData.audienceType === 'community'
                    ? formData.communityBusinessIds.length || communityBusinesses.length
                    : '1,234'
                  }
                </strong> {formData.audienceType === 'community' ? 'businesses' : 'contacts'}
              </p>
            </div>
          </div>
        );

      case 'content':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">Campaign Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter campaign name"
                className="mt-1"
              />
            </div>
            {formData.channel === 'email' && (
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white">Subject Line</label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Enter email subject"
                  className="mt-1"
                />
              </div>
            )}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-900 dark:text-white">Message Content</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAIGenerate}
                  disabled={isAIGenerating || !formData.channel || !formData.templateId}
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  {isAIGenerating ? 'Generating...' : 'AI Assist'}
                </Button>
              </div>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your message..."
                rows={6}
                className="mt-1"
              />
            </div>
          </div>
        );

      case 'schedule':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setFormData({ ...formData, scheduledAt: '' })}
                className={`p-4 border-2 rounded-lg text-left transition-all ${!formData.scheduledAt
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                  }`}
              >
                <h4 className="font-medium text-gray-900 dark:text-white">Send Now</h4>
                <p className="text-sm text-gray-500 dark:text-slate-400">Start immediately</p>
              </button>
              <button
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  setFormData({ ...formData, scheduledAt: tomorrow.toISOString().slice(0, 16) });
                }}
                className={`p-4 border-2 rounded-lg text-left transition-all ${formData.scheduledAt
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                  }`}
              >
                <h4 className="font-medium text-gray-900 dark:text-white">Schedule</h4>
                <p className="text-sm text-gray-500 dark:text-slate-400">Pick a date & time</p>
              </button>
            </div>
            {formData.scheduledAt && (
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white">Schedule Date & Time</label>
                <Input
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                  className="mt-1"
                />
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
                        : 'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-400'
                    }
                  `}
                >
                  {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                <span className="text-xs mt-1 text-gray-500 dark:text-slate-400">{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${index < currentStep ? 'bg-green-500' : 'bg-gray-200 dark:bg-slate-700'}`} />
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
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-slate-700">
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
            <Button onClick={handleCreate} disabled={isLoading || !formData.name || !formData.content}>
              {isLoading ? 'Creating...' : 'Create Campaign'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

