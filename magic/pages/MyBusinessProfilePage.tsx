import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, MapPin, FileText, HelpCircle, MessageSquare, ClipboardList, ChevronRight, CheckCircle, AlertCircle, Clock, Phone, Mail, Settings, Store, Zap, PlayCircle, GraduationCap, Globe, Code, Target, BarChart3, Quote, Users, TrendingUp } from 'lucide-react';
import { ProfileStrengthIndicator, type SourceCompleteness } from '../components/ProfileStrengthIndicator';
import { FAQEditModal } from '../components/FAQEditModal';
import { useSMBProfile } from '@/hooks/useSMBProfile';
import { useFullSMBProfile } from '@/hooks/useFullSMBProfile';
import type { SMBFullProfile } from '@/types/smb';

interface MyBusinessProfilePageProps {
  onNavigate?: (page: string) => void;
  /** When provided (e.g. Command Center customer view), load full profile from Intelligence Hub */
  smbId?: string | null;
}
interface AlphaSiteComponent {
  id: string;
  name: string;
  description: string;
  status: 'generating' | 'ready';
}
function computeProfileStrength(profile: { name?: string; industry?: string; settings?: Record<string, unknown> } | null): number {
  if (!profile) return 0;
  let score = 0;
  if (profile.name) score += 15;
  if (profile.industry) score += 10;
  const s = profile.settings ?? {};
  if (s.phone || (s as { phone?: string }).phone) score += 15;
  if (s.email || (s as { email?: string }).email) score += 15;
  if (s.address || (s as { address?: string }).address) score += 10;
  if (s.hours || (s as { hours?: string }).hours) score += 10;
  if (s.photos && Array.isArray((s as { photos?: unknown[] }).photos) && (s as { photos: unknown[] }).photos.length > 0) score += 10;
  if (s.social && typeof (s as { social?: unknown }).social === 'object') score += 10;
  if (s.menu_services || (s as { menu_services?: unknown }).menu_services) score += 5;
  return Math.min(100, score);
}

function computeSourceBreakdown(fullProfile: SMBFullProfile): SourceCompleteness[] {
  const sources: SourceCompleteness[] = [];
  const gd = fullProfile.google_data;
  if (gd && (gd.rating != null || gd.address || gd.phone)) {
    sources.push({ source: 'google_places', label: 'Google', completeness: gd.rating && gd.address ? 100 : 50 });
  }
  const ed = fullProfile.enriched_data;
  if (ed && (ed.website_description || (ed.website_services?.length ?? 0) > 0)) {
    sources.push({ source: 'website_scan', label: 'Website', completeness: ed.website_description ? 100 : 60 });
  }
  const sr = fullProfile.survey_responses;
  if (sr && Object.keys(sr).length > 0) {
    const pct = (sr as { completion_pct?: number }).completion_pct ?? 70;
    sources.push({ source: 'owner_survey', label: 'Owner Survey', completeness: pct });
  }
  const ci = fullProfile.customer_intelligence;
  if (ci && (ci.perception_gaps || (ci.common_complaints?.length ?? 0) > 0 || ci.net_promoter_score != null)) {
    sources.push({ source: 'customer_survey', label: 'Customer Intel', completeness: ci.net_promoter_score != null ? 100 : 60 });
  }
  const ac = fullProfile.ai_context;
  if (ac && ((ac.tone_and_voice?.length ?? 0) > 0 || (ac.approved_quotes?.length ?? 0) > 0)) {
    sources.push({ source: 'ai_context', label: 'AI Context', completeness: (ac.approved_quotes?.length ?? 0) > 0 ? 100 : 70 });
  }
  return sources;
}

export function MyBusinessProfilePage({
  onNavigate,
  smbId: smbIdProp,
}: MyBusinessProfilePageProps) {
  const [isFAQModalOpen, setIsFAQModalOpen] = useState(false);
  const [alphaSiteMessage, setAlphaSiteMessage] = useState('');
  const [alphaSiteComponents, setAlphaSiteComponents] = useState<AlphaSiteComponent[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { data: profile, isLoading } = useSMBProfile();
  const resolvedSmbId = smbIdProp ?? (profile as { id?: string } | undefined)?.id ?? null;
  const { data: fullProfile } = useFullSMBProfile(resolvedSmbId);

  const profileStrength = useMemo(() => {
    if (fullProfile?.profile_completeness != null) return fullProfile.profile_completeness;
    return computeProfileStrength(profile ?? null);
  }, [fullProfile?.profile_completeness, profile]);

  const sourceBreakdown = useMemo(() => (fullProfile ? computeSourceBreakdown(fullProfile) : []), [fullProfile]);

  const s = (profile?.settings ?? {}) as Record<string, unknown>;
  const displayProfile = fullProfile ?? profile;
  const profileData = {
    configuration: {
      businessTypes: (s.business_types as string[]) ?? ['Retail / Store', 'Home Services'],
      customerEngagement: (s.customer_engagement as string[]) ?? ['Walk-ins Welcome', 'By Appointment', 'Phone Orders'],
      operationsEnabled: (s.operations_enabled as number) ?? 0,
      completeness: profileStrength
    },
    businessInfo: {
      name: displayProfile?.name ?? (displayProfile as { business_name?: string })?.business_name ?? profile?.name ?? '—',
      category: (fullProfile as SMBFullProfile)?.category ?? (fullProfile as SMBFullProfile)?.mapped_category ?? profile?.industry ?? '—',
      phone: (fullProfile as SMBFullProfile)?.google_data?.phone ?? (s.phone as string) ?? (profile as { primary_phone?: string })?.primary_phone ?? '—',
      email: (fullProfile as SMBFullProfile)?.enriched_data?.owner_email ?? (s.email as string) ?? (profile as { primary_email?: string })?.primary_email ?? '—',
      address: (fullProfile as SMBFullProfile)?.google_data?.address ?? (s.address as string) ?? '—',
      hours: (s.hours as string) ?? (typeof (fullProfile as SMBFullProfile)?.google_data?.hours === 'object' ? 'See profile' : '') ?? '—',
      completeness: profileStrength
    },
    processes: {
      total: 2,
      list: ['New Customer Intake', 'Pricing & Estimates Policy'],
      completeness: 40
    },
    faqs: {
      total: 12,
      preview: ['What is your cancellation policy?', 'Do you offer emergency services?'],
      completeness: 60
    },
    communication: {
      channels: ['Email', 'SMS'],
      tone: 'Friendly',
      completeness: 70
    },
    surveys: {
      total: 13,
      completed: 7,
      inProgress: 3,
      completeness: 54
    },
    marketingDiagnostic: {
      completed: false,
      lastCompleted: null
    }
  };
  const overallCompleteness = profileStrength;
  const handleGenerateComponent = async () => {
    if (!alphaSiteMessage.trim() || alphaSiteComponents.length >= 3) return;
    setIsGenerating(true);
    const newComponent: AlphaSiteComponent = {
      id: Date.now().toString(),
      name: alphaSiteMessage.slice(0, 50),
      description: alphaSiteMessage,
      status: 'generating'
    };
    setAlphaSiteComponents([...alphaSiteComponents, newComponent]);
    setAlphaSiteMessage('');
    // Simulate AI generation
    setTimeout(() => {
      setAlphaSiteComponents(prev => prev.map(comp => comp.id === newComponent.id ? {
        ...comp,
        status: 'ready'
      } : comp));
      setIsGenerating(false);
    }, 2000);
  };
  const handleDeleteComponent = (id: string) => {
    setAlphaSiteComponents(prev => prev.filter(comp => comp.id !== id));
  };
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0
    }
  };
  return <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            My Business Profile
          </h1>
          <p className="text-slate-500">
            Complete your profile to help AI understand and serve your business
            better.
          </p>
        </div>
        <motion.button whileHover={{
        scale: 1.05
      }} whileTap={{
        scale: 0.95
      }} onClick={() => onNavigate?.('learning')} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all">
          <GraduationCap className="h-5 w-5" />
          See the Demo and Learn
          <PlayCircle className="h-4 w-4" />
        </motion.button>
      </div>

      {/* Profile Strength */}
      <motion.div variants={itemVariants}>
        <ProfileStrengthIndicator
          strength={isLoading ? undefined : overallCompleteness}
          sourceBreakdown={sourceBreakdown.length > 0 ? sourceBreakdown : undefined}
          onCompleteClick={() => onNavigate?.('business-configurator')}
        />
      </motion.div>

      {/* Business Information Card - MOVED TO TOP */}
      <motion.div variants={itemVariants} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  Business Information
                </h3>
                <p className="text-xs text-slate-500">
                  Contact details, hours, and service area
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{
                  width: `${profileData.businessInfo.completeness}%`
                }} />
                </div>
                <span className="text-xs font-bold text-slate-600">
                  {profileData.businessInfo.completeness}%
                </span>
              </div>
              <motion.button whileHover={{
              scale: 1.05
            }} whileTap={{
              scale: 0.95
            }} onClick={() => onNavigate?.('business-info-edit')} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                Edit
                <ChevronRight className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Business Name
                </p>
                <p className="text-slate-900 font-medium">
                  {profileData.businessInfo.name}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Category
                </p>
                <p className="text-slate-900">
                  {profileData.businessInfo.category}
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Phone
                  </p>
                  <p className="text-slate-900 flex items-center gap-2">
                    {profileData.businessInfo.phone}
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Verified
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Email
                  </p>
                  <p className="text-slate-900">
                    {profileData.businessInfo.email}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Address
                  </p>
                  <p className="text-slate-900">
                    {profileData.businessInfo.address}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Hours
                  </p>
                  <p className="text-slate-900">
                    {profileData.businessInfo.hours}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {profileData.businessInfo.completeness < 100 && <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-900">
                <strong>Missing:</strong> Service area map and website URL.
                Complete these to improve your profile.
              </p>
            </div>}
        </div>
      </motion.div>

      {/* Intelligence Hub sections - when full profile is available */}
      {fullProfile && (
        <>
          {/* AI Profile */}
          {(fullProfile.ai_context?.tone_and_voice?.length ?? 0) > 0 || (fullProfile.ai_context?.approved_quotes?.length ?? 0) > 0 ? (
            <motion.div variants={itemVariants} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-violet-50">
                    <Sparkles className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">AI Profile</h3>
                    <p className="text-xs text-slate-500">Tone, story angles, approved quotes</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {fullProfile.ai_context?.tone_and_voice?.length ? (
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Tone & Voice</p>
                    <div className="flex flex-wrap gap-2">
                      {fullProfile.ai_context.tone_and_voice.map((t, i) => (
                        <span key={i} className="px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-sm">{t}</span>
                      ))}
                    </div>
                  </div>
                ) : null}
                {fullProfile.ai_context?.story_angles?.length ? (
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Story Angles</p>
                    <div className="flex flex-wrap gap-2">
                      {fullProfile.ai_context.story_angles.map((s, i) => (
                        <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">{s}</span>
                      ))}
                    </div>
                  </div>
                ) : null}
                {(fullProfile.ai_context?.approved_quotes?.length ?? 0) > 0 ? (
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Approved Quotes</p>
                    <div className="space-y-2">
                      {fullProfile.ai_context!.approved_quotes!.map((q, i) => (
                        <div key={i} className="flex gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <Quote className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm text-slate-900 italic">&quot;{q.text}&quot;</p>
                            <p className="text-xs text-slate-500 mt-1">— {q.attribution}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.div>
          ) : null}

          {/* Customer Intelligence */}
          {fullProfile.customer_intelligence && (fullProfile.customer_intelligence.perception_gaps || fullProfile.customer_intelligence.net_promoter_score != null || (fullProfile.customer_intelligence.top_praised_features?.length ?? 0) > 0) ? (
            <motion.div variants={itemVariants} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50">
                    <Users className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Customer Intelligence</h3>
                    <p className="text-xs text-slate-500">Perception gaps, NPS, feedback themes</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {fullProfile.customer_intelligence.net_promoter_score != null && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Net Promoter Score</p>
                    <p className="text-2xl font-bold text-emerald-600">{fullProfile.customer_intelligence.net_promoter_score}</p>
                  </div>
                )}
                {fullProfile.customer_intelligence.perception_gaps && Object.keys(fullProfile.customer_intelligence.perception_gaps).length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Perception Gaps</p>
                    <div className="space-y-2">
                      {Object.entries(fullProfile.customer_intelligence.perception_gaps).map(([k, v]) => (
                        <div key={k} className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                          <p className="text-xs text-amber-800"><strong>{k}:</strong> {v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {(fullProfile.customer_intelligence.top_praised_features?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Top Praised</p>
                    <div className="flex flex-wrap gap-2">
                      {fullProfile.customer_intelligence.top_praised_features!.map((f, i) => (
                        <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm">{f}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : null}

          {/* Competitive Intel */}
          {fullProfile.competitor_analysis && ((fullProfile.competitor_analysis.direct_competitors?.length ?? 0) > 0 || fullProfile.competitor_analysis.market_position) ? (
            <motion.div variants={itemVariants} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-50">
                    <TrendingUp className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Competitive Intel</h3>
                    <p className="text-xs text-slate-500">Market position, differentiation</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {fullProfile.competitor_analysis.market_position && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Market Position</p>
                    <p className="text-sm text-slate-900">{fullProfile.competitor_analysis.market_position}</p>
                  </div>
                )}
                {(fullProfile.competitor_analysis.direct_competitors?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Direct Competitors</p>
                    <div className="space-y-2">
                      {fullProfile.competitor_analysis.direct_competitors!.map((c, i) => (
                        <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <p className="font-medium text-slate-900">{c.name}</p>
                          {c.strengths?.length ? <p className="text-xs text-slate-600 mt-1">Strengths: {c.strengths.join(', ')}</p> : null}
                          {c.weaknesses?.length ? <p className="text-xs text-slate-600">Weaknesses: {c.weaknesses.join(', ')}</p> : null}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : null}

          {/* Data source indicators */}
          {(fullProfile.data_sources?.length ?? 0) > 0 && (
            <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Data sources:</span>
              {fullProfile.data_sources!.map((src) => (
                <span key={src} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">{src.replace(/_/g, ' ')}</span>
              ))}
            </motion.div>
          )}
        </>
      )}

      {/* Business Configuration & Marketing Diagnostic - 2 Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Configuration Card */}
        <motion.div variants={itemVariants} className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl overflow-hidden shadow-lg cursor-pointer group" onClick={() => onNavigate?.('business-configurator')}>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">
                    Business Configuration
                  </h3>
                  <p className="text-sm text-blue-100">Powers AI features</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg">
                <div className="w-16 h-2 bg-white/30 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full" style={{
                  width: `${profileData.configuration.completeness}%`
                }} />
                </div>
                <span className="text-xs font-bold text-white">
                  {profileData.configuration.completeness}%
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              {/* Business Types */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <Store className="h-4 w-4 text-white" />
                  <p className="text-xs font-bold text-white uppercase tracking-wide">
                    Business Types
                  </p>
                </div>
                <div className="space-y-1">
                  {profileData.configuration.businessTypes.map((type, idx) => <div key={idx} className="flex items-center gap-2 text-sm text-white">
                      <CheckCircle className="h-3 w-3 flex-shrink-0" />
                      <span>{type}</span>
                    </div>)}
                </div>
              </div>

              {/* Operations Summary */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-white" />
                  <p className="text-xs font-bold text-white uppercase tracking-wide">
                    Operations Enabled
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-white">
                    {profileData.configuration.operationsEnabled}
                  </span>
                  <span className="text-xs text-blue-100">
                    Powering 12 AI features
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-white" />
                <p className="text-sm font-bold text-white">
                  Configure your business
                </p>
              </div>
              <motion.div whileHover={{
              scale: 1.05
            }} whileTap={{
              scale: 0.95
            }} className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg font-bold text-sm group-hover:bg-blue-50 transition-colors">
                Open
                <ChevronRight className="h-4 w-4" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Marketing Diagnostic Card */}
        <motion.div variants={itemVariants} className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl overflow-hidden shadow-lg cursor-pointer group" onClick={() => onNavigate?.('marketing-diagnostic')}>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">
                    Marketing Check-Up
                  </h3>
                  <p className="text-sm text-emerald-100">
                    Understand your marketing
                  </p>
                </div>
              </div>
              {!profileData.marketingDiagnostic.completed && <div className="px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-lg">
                  New
                </div>}
            </div>

            <div className="space-y-3 mb-4">
              {/* What You'll Get */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <p className="text-xs font-bold text-white uppercase tracking-wide mb-3">
                  What You'll Get
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm text-white">
                    <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>Clear picture of your marketing health</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-white">
                    <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>The ONE thing holding you back</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-white">
                    <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>Simple action plan to fix it</span>
                  </div>
                </div>
              </div>

              {/* Time & Questions */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-emerald-100 mb-1">Takes about</p>
                    <p className="text-2xl font-bold text-white">5 min</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-emerald-100 mb-1">Questions</p>
                    <p className="text-2xl font-bold text-white">7</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-white" />
                <p className="text-sm font-bold text-white">
                  {profileData.marketingDiagnostic.completed ? 'View Your Results' : 'Start Assessment'}
                </p>
              </div>
              <motion.div whileHover={{
              scale: 1.05
            }} whileTap={{
              scale: 0.95
            }} className="flex items-center gap-2 px-4 py-2 bg-white text-emerald-600 rounded-lg font-bold text-sm group-hover:bg-emerald-50 transition-colors">
                {profileData.marketingDiagnostic.completed ? 'View' : 'Start'}
                <ChevronRight className="h-4 w-4" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Processes & Policies Card */}
      <motion.div variants={itemVariants} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50">
                <FileText className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  Processes & Policies
                </h3>
                <p className="text-xs text-slate-500">
                  How your business operates
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{
                  width: `${profileData.processes.completeness}%`
                }} />
                </div>
                <span className="text-xs font-bold text-slate-600">
                  {profileData.processes.completeness}%
                </span>
              </div>
              <motion.button whileHover={{
              scale: 1.05
            }} whileTap={{
              scale: 0.95
            }} onClick={() => onNavigate?.('process-builder')} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                Add Process
                <ChevronRight className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <p className="text-sm text-slate-600 mb-4">
            Define how your business operates so AI employees can follow your
            rules.
          </p>

          <div className="space-y-2 mb-4">
            {profileData.processes.list.map((process, idx) => <div key={idx} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <span className="text-sm font-medium text-slate-900">
                  {process}
                </span>
              </div>)}
          </div>

          <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
            <p className="text-sm text-amber-900 mb-3">
              <strong>Recommended:</strong> Add these processes to improve AI
              performance
            </p>
            <ul className="space-y-1 text-xs text-amber-800">
              <li>• Payment collection process</li>
              <li>• Emergency service protocol</li>
              <li>• Quality assurance checklist</li>
            </ul>
            <button onClick={() => onNavigate?.('process-builder')} className="mt-3 text-xs font-medium text-amber-900 hover:text-amber-950 flex items-center gap-1">
              Add these processes
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FAQs Card */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-50">
                  <HelpCircle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">FAQs & Knowledge</h3>
                  <p className="text-xs text-slate-500">
                    {profileData.faqs.total} questions
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-600 rounded-full" style={{
                  width: `${profileData.faqs.completeness}%`
                }} />
                </div>
                <span className="text-xs font-bold text-slate-600">
                  {profileData.faqs.completeness}%
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
              These FAQs help AI answer customer questions accurately.
            </p>

            <div className="space-y-2 mb-4">
              {profileData.faqs.preview.map((faq, idx) => <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm font-medium text-slate-900">{faq}</p>
                </div>)}
            </div>

            <button onClick={() => onNavigate?.('faq-management')} className="w-full py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-1">
              View All {profileData.faqs.total} FAQs
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>

        {/* Communication Preferences Card */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-50">
                  <MessageSquare className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Communication</h3>
                  <p className="text-xs text-slate-500">Preferences & tone</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{
                  width: `${profileData.communication.completeness}%`
                }} />
                </div>
                <span className="text-xs font-bold text-slate-600">
                  {profileData.communication.completeness}%
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4 mb-4">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                  Active Channels
                </p>
                <div className="flex gap-2">
                  {profileData.communication.channels.map(channel => <span key={channel} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium border border-indigo-200">
                      {channel}
                    </span>)}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                  Tone
                </p>
                <p className="text-sm text-slate-900">
                  {profileData.communication.tone}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                  Business Signature
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 font-mono">
                  <p>Thanks for choosing ABC Home Services!</p>
                  <p>- The ABC Team</p>
                </div>
              </div>
            </div>

            <button onClick={() => onNavigate?.('business-info-edit')} className="w-full py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-1">
              Edit Preferences
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Business Surveys Card */}
      <motion.div variants={itemVariants} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-50">
                <ClipboardList className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Business Surveys</h3>
                <p className="text-xs text-slate-500">
                  {profileData.surveys.completed} of {profileData.surveys.total}{' '}
                  completed
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full" style={{
                  width: `${profileData.surveys.completeness}%`
                }} />
                </div>
                <span className="text-xs font-bold text-slate-600">
                  {profileData.surveys.completeness}%
                </span>
              </div>
              <motion.button whileHover={{
              scale: 1.05
            }} whileTap={{
              scale: 0.95
            }} onClick={() => onNavigate?.('survey-management')} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                View All
                <ChevronRight className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <p className="text-sm text-slate-600 mb-4 bg-purple-50 p-3 rounded-lg border border-purple-100">
            Complete surveys to help AI employees understand your business,
            services, and communication preferences.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <p className="text-2xl font-bold text-emerald-900">
                {profileData.surveys.completed}
              </p>
              <p className="text-xs text-emerald-700">Completed</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-2xl font-bold text-blue-900">
                {profileData.surveys.inProgress}
              </p>
              <p className="text-xs text-blue-700">In Progress</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-2xl font-bold text-slate-900">
                {profileData.surveys.total - profileData.surveys.completed - profileData.surveys.inProgress}
              </p>
              <p className="text-xs text-slate-700">Not Started</p>
            </div>
          </div>

          <button onClick={() => onNavigate?.('survey-management')} className="w-full mt-4 py-2.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center justify-center gap-2">
            Continue Surveys
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </motion.div>

      {/* AlphaSite Component Builder Card */}
      <motion.div variants={itemVariants} className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl overflow-hidden shadow-xl border border-slate-700 cursor-pointer hover:shadow-2xl transition-shadow" onClick={() => onNavigate?.('alphasite-components')}>
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">
                  Add Components to Your AlphaSite
                </h3>
                <p className="text-sm text-slate-400">
                  Use AI to create custom components for your business website
                </p>
              </div>
            </div>
            <ChevronRight className="h-6 w-6 text-white" />
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between p-6 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-emerald-500/20">
                <Code className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">
                  {alphaSiteComponents.length} Component
                  {alphaSiteComponents.length !== 1 ? 's' : ''} Created
                </p>
                <p className="text-sm text-slate-400">
                  Click to manage and create more
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg border border-slate-700">
              <span className="text-xs font-bold text-slate-300">
                {alphaSiteComponents.length}/3 Used
              </span>
            </div>
          </div>

          <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-white mb-1">
                  Build Your AlphaSite
                </p>
                <p className="text-xs text-slate-400">
                  Create custom components with AI, preview them, and deploy to
                  your public website. Choose from templates or describe exactly
                  what you need.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <FAQEditModal isOpen={isFAQModalOpen} onClose={() => setIsFAQModalOpen(false)} onSave={() => setIsFAQModalOpen(false)} />
    </motion.div>;
}