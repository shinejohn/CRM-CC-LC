// ============================================
// MARKETING DIAGNOSTIC WIZARD
// CC Intelligence Hub - Spec Item #8
// Pulls from full profile instead of asking
// questions the system already knows
// ============================================

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, Sparkles,
    AlertTriangle, TrendingUp, Target, BarChart3,
    Lightbulb, ArrowRight, Loader2, CheckCircle2,
    XCircle
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBusinessIntelligenceContext } from '../../hooks/useBusinessIntelligenceContext';
import { useAI } from '../../hooks/useAI';
import type { SMBFullProfile } from '@/types/smb';

interface MarketingDiagnosticWizardProps {
    open: boolean;
    onClose: () => void;
    smbId?: string;
}

// ── Diagnostic Categories ─────────────────────────

interface DiagnosticCategory {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
}

const diagnosticCategories: DiagnosticCategory[] = [
    { id: 'online_presence', label: 'Online Presence', icon: Target, description: 'Website, social media, and Google footprint' },
    { id: 'campaign_effectiveness', label: 'Campaign Effectiveness', icon: BarChart3, description: 'Email opens, clicks, and conversions' },
    { id: 'customer_sentiment', label: 'Customer Sentiment', icon: TrendingUp, description: 'NPS, reviews, and feedback themes' },
    { id: 'competitive_position', label: 'Competitive Position', icon: AlertTriangle, description: 'Market positioning and differentiation' },
    { id: 'content_readiness', label: 'Content Readiness', icon: Lightbulb, description: 'AI context, brand voice, and story angles' },
];

// ── Assessment Functions ──────────────────────────

interface Finding {
    label: string;
    status: 'good' | 'warning' | 'critical' | 'missing';
    detail: string;
}

function assessOnlinePresence(profile: SMBFullProfile): Finding[] {
    const findings: Finding[] = [];

    // Google Data
    if (profile.google_data?.place_id) {
        findings.push({
            label: 'Google Business Profile',
            status: profile.google_data.rating && profile.google_data.rating >= 4.0 ? 'good' : 'warning',
            detail: profile.google_data.rating
                ? `${profile.google_data.rating}★ (${profile.google_data.review_count ?? 0} reviews)`
                : 'Listed but rating unknown',
        });
    } else {
        findings.push({ label: 'Google Business Profile', status: 'critical', detail: 'Not found — critical for local visibility' });
    }

    // Website
    if (profile.google_data?.website || profile.enriched_data?.website_description) {
        findings.push({ label: 'Website', status: 'good', detail: profile.google_data?.website || 'Found via enrichment' });
    } else {
        findings.push({ label: 'Website', status: 'critical', detail: 'No website detected' });
    }

    // Social Media
    const hasFacebook = !!profile.enriched_data?.facebook_url;
    const hasInstagram = !!profile.enriched_data?.instagram_url;
    if (hasFacebook && hasInstagram) {
        findings.push({ label: 'Social Media', status: 'good', detail: 'Facebook + Instagram found' });
    } else if (hasFacebook || hasInstagram) {
        findings.push({ label: 'Social Media', status: 'warning', detail: `Only ${hasFacebook ? 'Facebook' : 'Instagram'} found` });
    } else {
        findings.push({ label: 'Social Media', status: 'missing', detail: 'No social media profiles detected' });
    }

    // Photos
    if (profile.google_data?.photos && profile.google_data.photos.length >= 5) {
        findings.push({ label: 'Photo Library', status: 'good', detail: `${profile.google_data.photos.length} photos available` });
    } else {
        findings.push({ label: 'Photo Library', status: 'warning', detail: `Only ${profile.google_data?.photos?.length ?? 0} photos — recommend 10+` });
    }

    return findings;
}

function assessCampaignEffectiveness(profile: SMBFullProfile): Finding[] {
    const findings: Finding[] = [];
    const ch = profile.campaign_history;

    if (!ch || !ch.total_campaigns) {
        return [{ label: 'Campaign History', status: 'missing', detail: 'No campaigns have been run yet' }];
    }

    findings.push({
        label: 'Campaign Volume',
        status: ch.total_campaigns >= 10 ? 'good' : ch.total_campaigns >= 3 ? 'warning' : 'critical',
        detail: `${ch.total_campaigns} campaigns total, ${ch.active_campaigns ?? 0} active`,
    });

    if (ch.avg_open_rate !== undefined) {
        findings.push({
            label: 'Open Rate',
            status: ch.avg_open_rate >= 25 ? 'good' : ch.avg_open_rate >= 15 ? 'warning' : 'critical',
            detail: `${ch.avg_open_rate.toFixed(1)}% average (industry avg: ~21%)`,
        });
    }

    if (ch.avg_click_rate !== undefined) {
        findings.push({
            label: 'Click Rate',
            status: ch.avg_click_rate >= 5 ? 'good' : ch.avg_click_rate >= 2 ? 'warning' : 'critical',
            detail: `${ch.avg_click_rate.toFixed(1)}% average (industry avg: ~2.6%)`,
        });
    }

    return findings;
}

function assessCustomerSentiment(profile: SMBFullProfile): Finding[] {
    const findings: Finding[] = [];
    const ci = profile.customer_intelligence;

    if (!ci) {
        return [{ label: 'Customer Intelligence', status: 'missing', detail: 'No customer intelligence data collected' }];
    }

    if (ci.net_promoter_score !== undefined && ci.net_promoter_score !== null) {
        findings.push({
            label: 'Net Promoter Score',
            status: ci.net_promoter_score >= 50 ? 'good' : ci.net_promoter_score >= 0 ? 'warning' : 'critical',
            detail: `NPS: ${ci.net_promoter_score} (${ci.net_promoter_score >= 50 ? 'Excellent' : ci.net_promoter_score >= 0 ? 'Needs improvement' : 'Detractor territory'})`,
        });
    }

    if (ci.top_praised_features && ci.top_praised_features.length > 0) {
        findings.push({ label: 'Strengths Identified', status: 'good', detail: ci.top_praised_features.slice(0, 3).join(', ') });
    }

    if (ci.common_complaints && ci.common_complaints.length > 0) {
        findings.push({ label: 'Complaints Found', status: 'warning', detail: ci.common_complaints.slice(0, 2).join(', ') });
    }

    if (ci.perception_gaps && Object.keys(ci.perception_gaps).length > 0) {
        findings.push({ label: 'Perception Gaps', status: 'warning', detail: `${Object.keys(ci.perception_gaps).length} gap(s) between owner and customer perception` });
    }

    return findings;
}

function assessCompetitivePosition(profile: SMBFullProfile): Finding[] {
    const findings: Finding[] = [];
    const ca = profile.competitor_analysis;

    if (!ca) {
        return [{ label: 'Competitive Data', status: 'missing', detail: 'No competitive analysis performed' }];
    }

    if (ca.market_position) {
        findings.push({ label: 'Market Position', status: 'good', detail: ca.market_position });
    }

    if (ca.direct_competitors && ca.direct_competitors.length > 0) {
        findings.push({
            label: 'Competitive Landscape',
            status: 'warning',
            detail: `${ca.direct_competitors.length} direct competitor${ca.direct_competitors.length > 1 ? 's' : ''} identified`,
        });
    }

    if (ca.differentiation_opportunities && ca.differentiation_opportunities.length > 0) {
        findings.push({
            label: 'Differentiation Opportunities',
            status: 'good',
            detail: ca.differentiation_opportunities.slice(0, 3).join(', '),
        });
    }

    return findings;
}

function assessContentReadiness(profile: SMBFullProfile): Finding[] {
    const findings: Finding[] = [];
    const ai = profile.ai_context;

    if (!ai) {
        return [{ label: 'AI Context', status: 'critical', detail: 'No brand voice or AI context configured — AI outputs will be generic' }];
    }

    if (ai.tone_and_voice && ai.tone_and_voice.length > 0) {
        findings.push({ label: 'Brand Voice', status: 'good', detail: ai.tone_and_voice.join(', ') });
    } else {
        findings.push({ label: 'Brand Voice', status: 'critical', detail: 'No tone/voice defined — content will sound generic' });
    }

    if (ai.story_angles && ai.story_angles.length >= 3) {
        findings.push({ label: 'Story Angles', status: 'good', detail: `${ai.story_angles.length} angles defined` });
    } else {
        findings.push({ label: 'Story Angles', status: 'warning', detail: `Only ${ai.story_angles?.length ?? 0} angles — recommend 3+` });
    }

    if (ai.approved_quotes && ai.approved_quotes.length > 0) {
        findings.push({ label: 'Approved Quotes', status: 'good', detail: `${ai.approved_quotes.length} quote(s) ready for use` });
    } else {
        findings.push({ label: 'Approved Quotes', status: 'missing', detail: 'No approved quotes — AI cannot attribute statements' });
    }

    return findings;
}

const assessors: Record<string, (p: SMBFullProfile) => Finding[]> = {
    online_presence: assessOnlinePresence,
    campaign_effectiveness: assessCampaignEffectiveness,
    customer_sentiment: assessCustomerSentiment,
    competitive_position: assessCompetitivePosition,
    content_readiness: assessContentReadiness,
};

// ── Score Utilities ───────────────────────────────

function scoreFindings(findings: Finding[]): number {
    if (findings.length === 0) return 0;
    const statusScores: Record<Finding['status'], number> = { good: 100, warning: 60, critical: 20, missing: 0 };
    const total = findings.reduce((sum, f) => sum + statusScores[f.status], 0);
    return Math.round(total / findings.length);
}

function statusIcon(status: Finding['status']) {
    switch (status) {
        case 'good': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
        case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
        case 'critical': return <XCircle className="w-4 h-4 text-red-500" />;
        case 'missing': return <XCircle className="w-4 h-4 text-gray-400" />;
    }
}

function scoreColor(score: number): string {
    if (score >= 70) return 'text-green-600 dark:text-green-400';
    if (score >= 40) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
}

// ── Main Component ────────────────────────────────

export function MarketingDiagnosticWizard({ open, onClose, smbId }: MarketingDiagnosticWizardProps) {
    const [step, setStep] = useState<'loading' | 'results' | 'recommendations'>('loading');
    const [aiRecommendations, setAiRecommendations] = useState<string | null>(null);
    const [isGeneratingRecs, setIsGeneratingRecs] = useState(false);

    const { profile, isLoading, enrichedContext } = useBusinessIntelligenceContext({ smbId });
    const { generate } = useAI({ context: enrichedContext });

    // Run assessments when profile is loaded
    const assessmentResults = useMemo(() => {
        if (!profile) return null;
        const results: Record<string, { findings: Finding[]; score: number }> = {};
        for (const cat of diagnosticCategories) {
            const findings = assessors[cat.id](profile);
            results[cat.id] = { findings, score: scoreFindings(findings) };
        }
        return results;
    }, [profile]);

    const overallScore = useMemo(() => {
        if (!assessmentResults) return 0;
        const scores = Object.values(assessmentResults).map(r => r.score);
        return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    }, [assessmentResults]);

    // Transition to results once profile loads
    React.useEffect(() => {
        if (profile && step === 'loading') {
            setStep('results');
        }
    }, [profile, step]);

    const handleGenerateRecommendations = async () => {
        if (!assessmentResults) return;
        setIsGeneratingRecs(true);
        try {
            const prompt = `Based on the following marketing diagnostic assessment for "${profile?.name || 'this business'}":

${Object.entries(assessmentResults).map(([catId, { findings, score }]) => {
                const cat = diagnosticCategories.find(c => c.id === catId);
                return `## ${cat?.label} (Score: ${score}/100)\n${findings.map(f => `- [${f.status.toUpperCase()}] ${f.label}: ${f.detail}`).join('\n')}`;
            }).join('\n\n')}

Overall Score: ${overallScore}/100

Please provide:
1. Top 3 immediate actions (this week)
2. Top 3 medium-term priorities (this month)
3. One strategic recommendation (this quarter)

Be specific and actionable. Reference the actual data points above.`;

            const content = await generate({ type: 'article', prompt });
            setAiRecommendations(content);
            setStep('recommendations');
        } catch (err) {
            console.error('Failed to generate recommendations:', err);
        } finally {
            setIsGeneratingRecs(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
                            <BarChart3 className="w-5 h-5 text-white" />
                        </div>
                        Marketing Diagnostic
                        {profile && (
                            <Badge variant="outline" className="ml-2 font-normal">{profile.name}</Badge>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <AnimatePresence mode="wait">
                    {/* Loading State */}
                    {(step === 'loading' || isLoading) && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-16"
                        >
                            <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
                            <p className="text-gray-600 dark:text-slate-400">Analyzing business profile...</p>
                            <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">Pulling data from Intelligence Hub</p>
                        </motion.div>
                    )}

                    {/* Results */}
                    {step === 'results' && assessmentResults && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="space-y-6"
                        >
                            {/* Overall Score */}
                            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900">
                                <div className={`text-5xl font-bold ${scoreColor(overallScore)}`}>
                                    {overallScore}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Overall Marketing Health Score</p>
                                <div className="flex justify-center gap-2 mt-3">
                                    {profile?.data_sources?.map((src) => (
                                        <Badge key={src} variant="outline" className="text-[10px]">{src.replace('_', ' ')}</Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Category Results */}
                            <div className="space-y-4">
                                {diagnosticCategories.map((cat, index) => {
                                    const result = assessmentResults[cat.id];
                                    const Icon = cat.icon;
                                    return (
                                        <motion.div
                                            key={cat.id}
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden"
                                        >
                                            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-slate-800">
                                                <div className="flex items-center gap-2">
                                                    <Icon className="w-4 h-4 text-gray-500" />
                                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{cat.label}</span>
                                                </div>
                                                <span className={`text-sm font-bold ${scoreColor(result.score)}`}>
                                                    {result.score}/100
                                                </span>
                                            </div>
                                            <div className="px-4 py-2 space-y-1.5">
                                                {result.findings.map((finding, i) => (
                                                    <div key={i} className="flex items-start gap-2 py-1">
                                                        {statusIcon(finding.status)}
                                                        <div className="min-w-0">
                                                            <span className="text-sm font-medium text-gray-800 dark:text-slate-200">{finding.label}</span>
                                                            <p className="text-xs text-gray-500 dark:text-slate-400">{finding.detail}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Generate Recommendations CTA */}
                            <div className="text-center pt-2">
                                <Button
                                    onClick={handleGenerateRecommendations}
                                    disabled={isGeneratingRecs}
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                                >
                                    {isGeneratingRecs ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Generating AI Recommendations...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            Get AI Recommendations
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* AI Recommendations */}
                    {step === 'recommendations' && aiRecommendations && (
                        <motion.div
                            key="recommendations"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setStep('results')}
                                >
                                    <ChevronLeft className="w-4 h-4 mr-1" />
                                    Back to Results
                                </Button>
                            </div>

                            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles className="w-5 h-5 text-purple-500" />
                                    <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-300">
                                        AI-Powered Recommendations
                                    </h3>
                                </div>
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <div className="whitespace-pre-wrap text-sm text-gray-700 dark:text-slate-300">
                                        {aiRecommendations}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="outline" onClick={onClose}>
                                    Close
                                </Button>
                                <Button
                                    onClick={() => {
                                        // TODO: Navigate to campaign creation with recommendations pre-filled
                                        onClose();
                                    }}
                                >
                                    Create Campaign from Recommendations
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
