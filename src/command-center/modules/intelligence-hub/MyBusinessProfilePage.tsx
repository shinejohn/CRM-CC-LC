// ============================================
// MY BUSINESS PROFILE PAGE
// CC Intelligence Hub - Aggregated evolving profile
// ============================================

import { motion } from 'framer-motion';
import {
    MapPin, Globe, ClipboardList, Users, Brain, Star,
    RefreshCw, Phone,
    Camera, Edit3, Sparkles, BarChart3,
    TrendingUp, Shield, Database, Award,
    Building2, Mail, Instagram, Facebook
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useIntelligenceHub, IntelligenceHubProvider } from './IntelligenceHubContext';
import { ProfileStrengthIndicator } from './ProfileStrengthIndicator';
import type { SMBFullProfile } from '@/types/smb';

// ── Section Card ──────────────────────────────────────────

interface SectionCardProps {
    title: string;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    iconColor: string;
    badge?: string;
    children: React.ReactNode;
    onEdit?: () => void;
    delay?: number;
}

function SectionCard({ title, icon: Icon, iconColor, badge, children, onEdit, delay = 0 }: SectionCardProps) {
    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay, duration: 0.3 }}
            className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden"
        >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${iconColor}15` }}>
                        <Icon className="w-4 h-4" style={{ color: iconColor }} />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
                    {badge && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {badge}
                        </Badge>
                    )}
                </div>
                {onEdit && (
                    <Button variant="ghost" size="sm" onClick={onEdit} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
                        <Edit3 className="w-3.5 h-3.5" />
                    </Button>
                )}
            </div>
            <div className="p-5">{children}</div>
        </motion.div>
    );
}

// ── Data Row ──────────────────────────────────────────────

function DataRow({ label, value, icon: Icon }: { label: string; value?: string | number | null; icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }> }) {
    if (!value && value !== 0) return null;
    return (
        <div className="flex items-start gap-3 py-1.5">
            {Icon && <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />}
            <div className="min-w-0">
                <dt className="text-[11px] text-gray-500 dark:text-slate-400 uppercase tracking-wider">{label}</dt>
                <dd className="text-sm text-gray-900 dark:text-white mt-0.5 break-words">{String(value)}</dd>
            </div>
        </div>
    );
}

// ── Tag List ──────────────────────────────────────────────

function TagList({ items, color = '#6366F1' }: { items: string[]; color?: string }) {
    if (!items || items.length === 0) return <EmptyState />;
    return (
        <div className="flex flex-wrap gap-1.5">
            {items.map((item, i) => (
                <span
                    key={i}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: `${color}15`, color }}
                >
                    {item}
                </span>
            ))}
        </div>
    );
}

// ── Empty State ───────────────────────────────────────────

function EmptyState({ message = 'No data yet' }: { message?: string }) {
    return (
        <p className="text-xs text-gray-400 dark:text-slate-500 italic">{message}</p>
    );
}

// ── Google Data Section ───────────────────────────────────

function GoogleDataSection({ data }: { data: SMBFullProfile['google_data'] }) {
    if (!data) return <EmptyState message="No Google data loaded" />;
    return (
        <div className="space-y-2">
            {data.rating && (
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                                key={i}
                                className={`w-4 h-4 ${i < Math.round(data.rating ?? 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-slate-600'}`}
                            />
                        ))}
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{data.rating}</span>
                    {data.review_count !== undefined && (
                        <span className="text-xs text-gray-500 dark:text-slate-400">({data.review_count} reviews)</span>
                    )}
                </div>
            )}
            <DataRow label="Address" value={data.address} icon={MapPin} />
            <DataRow label="Phone" value={data.phone} icon={Phone} />
            <DataRow label="Website" value={data.website} icon={Globe} />
            <DataRow label="Place ID" value={data.place_id} icon={Database} />
            {data.photos && data.photos.length > 0 && (
                <div className="mt-3">
                    <div className="flex items-center gap-1.5 mb-2">
                        <Camera className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-[11px] text-gray-500 dark:text-slate-400 uppercase tracking-wider">Photos</span>
                    </div>
                    <div className="flex gap-2 overflow-x-auto">
                        {(data.photos as string[]).slice(0, 5).map((url, i) => (
                            <div key={i} className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-slate-700 flex-shrink-0 overflow-hidden">
                                <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Enriched Data Section ─────────────────────────────────

function EnrichedDataSection({ data }: { data: SMBFullProfile['enriched_data'] }) {
    if (!data) return <EmptyState message="No enrichment data" />;
    return (
        <div className="space-y-2">
            <DataRow label="Owner" value={data.owner_name} icon={Users} />
            <DataRow label="Owner Email" value={data.owner_email} icon={Mail} />
            {data.website_description && (
                <div className="mt-2">
                    <dt className="text-[11px] text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Description</dt>
                    <dd className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">{data.website_description}</dd>
                </div>
            )}
            {data.website_services && data.website_services.length > 0 && (
                <div className="mt-3">
                    <dt className="text-[11px] text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Services</dt>
                    <TagList items={data.website_services} color="#34A853" />
                </div>
            )}
            <div className="flex gap-3 mt-3">
                {data.facebook_url && (
                    <a href={data.facebook_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                        <Facebook className="w-3.5 h-3.5" /> Facebook
                    </a>
                )}
                {data.instagram_url && (
                    <a href={data.instagram_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-pink-600 hover:underline">
                        <Instagram className="w-3.5 h-3.5" /> Instagram
                    </a>
                )}
            </div>
        </div>
    );
}

// ── AI Context Section ────────────────────────────────────

function AIContextSection({ data }: { data: SMBFullProfile['ai_context'] }) {
    if (!data) return <EmptyState message="No AI context configured" />;
    return (
        <div className="space-y-4">
            {data.tone_and_voice && data.tone_and_voice.length > 0 && (
                <div>
                    <dt className="text-[11px] text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Tone & Voice</dt>
                    <TagList items={data.tone_and_voice} color="#A855F7" />
                </div>
            )}
            {data.story_angles && data.story_angles.length > 0 && (
                <div>
                    <dt className="text-[11px] text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Story Angles</dt>
                    <TagList items={data.story_angles} color="#6366F1" />
                </div>
            )}
            {data.approved_quotes && data.approved_quotes.length > 0 && (
                <div>
                    <dt className="text-[11px] text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Approved Quotes</dt>
                    <div className="space-y-2">
                        {data.approved_quotes.map((q, i) => (
                            <blockquote key={i} className="border-l-2 border-purple-300 dark:border-purple-600 pl-3 py-1">
                                <p className="text-sm text-gray-700 dark:text-slate-300 italic">"{q.text}"</p>
                                {q.attribution && (
                                    <cite className="text-[11px] text-gray-500 dark:text-slate-400 not-italic">— {q.attribution}</cite>
                                )}
                            </blockquote>
                        ))}
                    </div>
                </div>
            )}
            {data.always_include && data.always_include.length > 0 && (
                <div>
                    <dt className="text-[11px] text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Always Include</dt>
                    <ul className="space-y-1">
                        {data.always_include.map((item, i) => (
                            <li key={i} className="text-sm text-gray-700 dark:text-slate-300 flex items-start gap-2">
                                <span className="text-green-500 mt-1">✓</span> {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {data.never_fabricate && data.never_fabricate.length > 0 && (
                <div>
                    <dt className="text-[11px] text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Never Fabricate</dt>
                    <ul className="space-y-1">
                        {data.never_fabricate.map((item, i) => (
                            <li key={i} className="text-sm text-gray-700 dark:text-slate-300 flex items-start gap-2">
                                <span className="text-red-500 mt-1">✗</span> {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

// ── Campaign History Section ──────────────────────────────

function CampaignHistorySection({ data }: { data: SMBFullProfile['campaign_history'] }) {
    if (!data) return <EmptyState message="No campaign history" />;
    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.total_campaigns ?? 0}</div>
                <div className="text-[11px] text-gray-500 dark:text-slate-400 uppercase">Total Campaigns</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.active_campaigns ?? 0}</div>
                <div className="text-[11px] text-gray-500 dark:text-slate-400 uppercase">Active</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{data.avg_open_rate ?? 0}%</div>
                <div className="text-[11px] text-gray-500 dark:text-slate-400 uppercase">Avg Open Rate</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{data.avg_click_rate ?? 0}%</div>
                <div className="text-[11px] text-gray-500 dark:text-slate-400 uppercase">Avg Click Rate</div>
            </div>
            {data.last_campaign_at && (
                <div className="col-span-2 text-xs text-gray-500 dark:text-slate-400 text-center">
                    Last campaign: {data.last_campaign_at}
                </div>
            )}
        </div>
    );
}

// ── Customer Intelligence Section ─────────────────────────

function CustomerIntelligenceSection({ data }: { data: SMBFullProfile['customer_intelligence'] }) {
    if (!data) return <EmptyState message="No customer intelligence data" />;
    return (
        <div className="space-y-4">
            {data.net_promoter_score !== undefined && data.net_promoter_score !== null && (
                <div className="flex items-center gap-3">
                    <div className={`text-3xl font-bold ${data.net_promoter_score >= 50 ? 'text-green-600' :
                        data.net_promoter_score >= 0 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                        {data.net_promoter_score}
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">NPS Score</div>
                        <div className="text-[11px] text-gray-500 dark:text-slate-400">
                            {data.net_promoter_score >= 50 ? 'Excellent' : data.net_promoter_score >= 0 ? 'Good' : 'Needs improvement'}
                        </div>
                    </div>
                </div>
            )}
            {data.top_praised_features && data.top_praised_features.length > 0 && (
                <div>
                    <dt className="text-[11px] text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Top Praised</dt>
                    <TagList items={data.top_praised_features} color="#22C55E" />
                </div>
            )}
            {data.common_complaints && data.common_complaints.length > 0 && (
                <div>
                    <dt className="text-[11px] text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Common Complaints</dt>
                    <TagList items={data.common_complaints} color="#EF4444" />
                </div>
            )}
            {data.perception_gaps && Object.keys(data.perception_gaps).length > 0 && (
                <div>
                    <dt className="text-[11px] text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Perception Gaps</dt>
                    <div className="space-y-1.5">
                        {Object.entries(data.perception_gaps).map(([key, val]) => (
                            <div key={key} className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-slate-400 capitalize">{key.replace(/_/g, ' ')}</span>
                                <span className="text-gray-900 dark:text-white font-medium">{val}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Competitor Analysis Section ───────────────────────────

function CompetitorAnalysisSection({ data }: { data: SMBFullProfile['competitor_analysis'] }) {
    if (!data) return <EmptyState message="No competitor data" />;
    return (
        <div className="space-y-4">
            {data.market_position && (
                <DataRow label="Market Position" value={data.market_position} icon={TrendingUp} />
            )}
            {data.differentiation_opportunities && data.differentiation_opportunities.length > 0 && (
                <div>
                    <dt className="text-[11px] text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Differentiation Opportunities</dt>
                    <TagList items={data.differentiation_opportunities} color="#F59E0B" />
                </div>
            )}
            {data.direct_competitors && data.direct_competitors.length > 0 && (
                <div>
                    <dt className="text-[11px] text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Direct Competitors</dt>
                    <div className="space-y-2">
                        {data.direct_competitors.map((comp, i) => (
                            <div key={i} className="p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50">
                                <div className="font-medium text-sm text-gray-900 dark:text-white">{comp.name}</div>
                                {comp.strengths && comp.strengths.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                        {comp.strengths.map((s, j) => (
                                            <span key={j} className="text-[10px] px-1.5 py-0.5 rounded bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">{s}</span>
                                        ))}
                                    </div>
                                )}
                                {comp.weaknesses && comp.weaknesses.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {comp.weaknesses.map((w, j) => (
                                            <span key={j} className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400">{w}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Subscription Section ──────────────────────────────────

function SubscriptionSection({ data }: { data: SMBFullProfile['subscription'] }) {
    if (!data) return <EmptyState message="No subscription info" />;

    const tierLabels: Record<string, string> = {
        community_influencer: 'Community Influencer',
        basic: 'Basic',
        professional: 'Professional',
        enterprise: 'Enterprise',
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {tierLabels[data.tier ?? ''] ?? data.tier ?? 'Unknown'}
                </span>
            </div>
            {data.monthly_value !== undefined && (
                <DataRow label="Monthly Value" value={`$${data.monthly_value}`} />
            )}
            {data.estimated_ad_value_delivered !== undefined && (
                <DataRow label="Est. Ad Value Delivered" value={`$${data.estimated_ad_value_delivered}`} />
            )}
            {data.trial_days_remaining !== undefined && data.trial_days_remaining !== null && (
                <div className="mt-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-medium">
                    {data.trial_days_remaining} trial days remaining
                </div>
            )}
        </div>
    );
}

// ── Main Page Content ─────────────────────────────────────

function ProfilePageContent() {
    const {
        profile,
        intelligenceSummary,
        isLoading,
        isError,
        error,
        refetch,
        requestEnrichment,
        isEnriching,
    } = useIntelligenceHub();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-500 dark:text-slate-400">Loading business intelligence…</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <Shield className="w-8 h-8 text-red-500 mx-auto mb-3" />
                    <p className="text-sm text-red-600 dark:text-red-400 mb-2">Failed to load profile</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">{error?.message}</p>
                    <Button variant="outline" size="sm" onClick={refetch}>Retry</Button>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-sm text-gray-500 dark:text-slate-400">No profile data available</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.name}</h1>
                    <div className="flex items-center gap-3 mt-1">
                        {profile.category && (
                            <Badge variant="outline" className="text-xs capitalize">{profile.category.replace(/_/g, ' ')}</Badge>
                        )}
                        {profile.data_sources && profile.data_sources.length > 0 && (
                            <div className="flex items-center gap-1">
                                <Database className="w-3 h-3 text-gray-400" />
                                <span className="text-[11px] text-gray-500 dark:text-slate-400">
                                    {profile.data_sources.length} source{profile.data_sources.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        )}
                        {profile.last_enriched_at && (
                            <span className="text-[11px] text-gray-400 dark:text-slate-500">
                                Last enriched: {new Date(profile.last_enriched_at).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => requestEnrichment()}
                    disabled={isEnriching}
                    className="gap-2"
                >
                    <RefreshCw className={`w-4 h-4 ${isEnriching ? 'animate-spin' : ''}`} />
                    {isEnriching ? 'Enriching…' : 'Re-Enrich'}
                </Button>
            </motion.div>

            {/* Profile Strength + Summary Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <ProfileStrengthIndicator profile={profile} />
                </div>
                <div className="lg:col-span-2">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200 dark:border-purple-800 p-5 h-full"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-purple-500" />
                            <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-300">Intelligence Summary</h3>
                        </div>
                        {intelligenceSummary ? (
                            <p className="text-sm text-purple-800 dark:text-purple-200 leading-relaxed whitespace-pre-line">
                                {intelligenceSummary}
                            </p>
                        ) : (
                            <p className="text-sm text-purple-400 dark:text-purple-500 italic">
                                Summary will be generated once enough profile data is available.
                            </p>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SectionCard title="Google Business" icon={MapPin} iconColor="#4285F4" badge="Source" delay={0.15}>
                    <GoogleDataSection data={profile.google_data} />
                </SectionCard>

                <SectionCard title="Website & Social" icon={Globe} iconColor="#34A853" badge="Enriched" delay={0.2}>
                    <EnrichedDataSection data={profile.enriched_data} />
                </SectionCard>

                <SectionCard title="AI Brand Context" icon={Brain} iconColor="#A855F7" badge="Editable" delay={0.25} onEdit={() => { /* TODO: open edit modal */ }}>
                    <AIContextSection data={profile.ai_context} />
                </SectionCard>

                <SectionCard title="Campaign History" icon={BarChart3} iconColor="#3B82F6" delay={0.3}>
                    <CampaignHistorySection data={profile.campaign_history} />
                </SectionCard>

                <SectionCard title="Customer Intelligence" icon={Users} iconColor="#EF4444" badge="Editable" delay={0.35} onEdit={() => { /* TODO: open edit modal */ }}>
                    <CustomerIntelligenceSection data={profile.customer_intelligence} />
                </SectionCard>

                <SectionCard title="Competitive Analysis" icon={TrendingUp} iconColor="#F59E0B" badge="Editable" delay={0.4} onEdit={() => { /* TODO: open edit modal */ }}>
                    <CompetitorAnalysisSection data={profile.competitor_analysis} />
                </SectionCard>

                <SectionCard title="Survey Responses" icon={ClipboardList} iconColor="#FBBC05" delay={0.45}>
                    {profile.survey_responses && Object.keys(profile.survey_responses).length > 0 ? (
                        <div className="space-y-2">
                            {Object.entries(profile.survey_responses).map(([key, val]) => (
                                <DataRow key={key} label={key.replace(/_/g, ' ')} value={typeof val === 'string' ? val : JSON.stringify(val)} />
                            ))}
                        </div>
                    ) : (
                        <EmptyState message="No survey responses" />
                    )}
                </SectionCard>

                <SectionCard title="Subscription" icon={Award} iconColor="#8B5CF6" delay={0.5}>
                    <SubscriptionSection data={profile.subscription} />
                </SectionCard>
            </div>
        </div>
    );
}

// ── Exported Page (with Provider) ─────────────────────────

export function MyBusinessProfilePage() {
    // In production, smbId comes from route params or auth context.
    // For now, read from URL search params or use the active business from CC store.
    const searchParams = new URLSearchParams(window.location.search);
    const smbId = searchParams.get('smbId') ?? searchParams.get('id') ?? '';

    if (!smbId) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <Building2 className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 dark:text-slate-400">Select a business to view its intelligence profile</p>
                </div>
            </div>
        );
    }

    return (
        <IntelligenceHubProvider smbId={smbId}>
            <ProfilePageContent />
        </IntelligenceHubProvider>
    );
}
