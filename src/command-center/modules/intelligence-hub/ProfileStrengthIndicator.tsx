// ============================================
// PROFILE STRENGTH INDICATOR
// CC Intelligence Hub - Per-source completeness
// ============================================

import React from 'react';
import { motion } from 'framer-motion';
import {
    MapPin, Globe, ClipboardList, Users, Brain,
    CheckCircle2, AlertCircle
} from 'lucide-react';
import type { SMBFullProfile } from '@/types/smb';

interface ProfileStrengthIndicatorProps {
    profile: SMBFullProfile;
    compact?: boolean;
}

interface SourceScore {
    key: string;
    label: string;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    score: number;
    maxScore: number;
    color: string;
    details: string[];
}

function computeSourceScores(profile: SMBFullProfile): SourceScore[] {
    const googleDetails: string[] = [];
    let googleScore = 0;
    const g = profile.google_data;
    if (g?.place_id) { googleScore += 15; googleDetails.push('Place ID'); }
    if (g?.rating) { googleScore += 15; googleDetails.push('Rating'); }
    if (g?.address) { googleScore += 15; googleDetails.push('Address'); }
    if (g?.phone) { googleScore += 15; googleDetails.push('Phone'); }
    if (g?.website) { googleScore += 15; googleDetails.push('Website'); }
    if (g?.hours && Object.keys(g.hours).length > 0) { googleScore += 15; googleDetails.push('Hours'); }
    if (g?.photos && g.photos.length > 0) { googleScore += 10; googleDetails.push('Photos'); }

    const enrichDetails: string[] = [];
    let enrichScore = 0;
    const e = profile.enriched_data;
    if (e?.website_description) { enrichScore += 25; enrichDetails.push('Description'); }
    if (e?.website_services && e.website_services.length > 0) { enrichScore += 25; enrichDetails.push('Services'); }
    if (e?.facebook_url || e?.instagram_url) { enrichScore += 20; enrichDetails.push('Social links'); }
    if (e?.owner_name) { enrichScore += 15; enrichDetails.push('Owner name'); }
    if (e?.owner_email) { enrichScore += 15; enrichDetails.push('Owner email'); }

    const surveyDetails: string[] = [];
    let surveyScore = 0;
    const s = profile.survey_responses;
    if (s && typeof s === 'object') {
        const keys = Object.keys(s);
        if (keys.length > 0) {
            surveyScore = Math.min(100, keys.length * 20);
            surveyDetails.push(`${keys.length} response${keys.length !== 1 ? 's' : ''}`);
        }
    }

    const ciDetails: string[] = [];
    let ciScore = 0;
    const ci = profile.customer_intelligence;
    if (ci?.net_promoter_score !== undefined && ci.net_promoter_score !== null) { ciScore += 25; ciDetails.push('NPS'); }
    if (ci?.top_praised_features && ci.top_praised_features.length > 0) { ciScore += 25; ciDetails.push('Top praised'); }
    if (ci?.common_complaints && ci.common_complaints.length > 0) { ciScore += 25; ciDetails.push('Complaints'); }
    if (ci?.perception_gaps && Object.keys(ci.perception_gaps).length > 0) { ciScore += 25; ciDetails.push('Perception gaps'); }

    const aiDetails: string[] = [];
    let aiScore = 0;
    const ai = profile.ai_context;
    if (ai?.tone_and_voice && ai.tone_and_voice.length > 0) { aiScore += 20; aiDetails.push('Tone & voice'); }
    if (ai?.story_angles && ai.story_angles.length > 0) { aiScore += 20; aiDetails.push('Story angles'); }
    if (ai?.approved_quotes && ai.approved_quotes.length > 0) { aiScore += 20; aiDetails.push('Approved quotes'); }
    if (ai?.always_include && ai.always_include.length > 0) { aiScore += 20; aiDetails.push('Must-include'); }
    if (ai?.never_fabricate && ai.never_fabricate.length > 0) { aiScore += 20; aiDetails.push('Never fabricate'); }

    return [
        { key: 'google', label: 'Google', icon: MapPin, score: googleScore, maxScore: 100, color: '#4285F4', details: googleDetails },
        { key: 'website', label: 'Website & Social', icon: Globe, score: enrichScore, maxScore: 100, color: '#34A853', details: enrichDetails },
        { key: 'survey', label: 'Business Survey', icon: ClipboardList, score: surveyScore, maxScore: 100, color: '#FBBC05', details: surveyDetails },
        { key: 'customer', label: 'Customer Intel', icon: Users, score: ciScore, maxScore: 100, color: '#EA4335', details: ciDetails },
        { key: 'ai', label: 'AI Context', icon: Brain, score: aiScore, maxScore: 100, color: '#A855F7', details: aiDetails },
    ];
}

export function ProfileStrengthIndicator({ profile, compact = false }: ProfileStrengthIndicatorProps) {
    const sources = computeSourceScores(profile);
    const overallScore = profile.profile_completeness ??
        Math.round(sources.reduce((sum, s) => sum + s.score, 0) / sources.length);

    return (
        <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Profile Strength
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                        Data completeness by source
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {overallScore >= 70 ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                    )}
                    <span className={`text-2xl font-bold ${overallScore >= 70 ? 'text-green-600 dark:text-green-400' :
                            overallScore >= 40 ? 'text-amber-600 dark:text-amber-400' :
                                'text-red-600 dark:text-red-400'
                        }`}>
                        {overallScore}%
                    </span>
                </div>
            </div>

            <div className="space-y-3">
                {sources.map((source, index) => {
                    const Icon = source.icon;
                    const pct = Math.round((source.score / source.maxScore) * 100);

                    return (
                        <motion.div
                            key={source.key}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.08 }}
                        >
                            <div className="flex items-center gap-3">
                                <Icon className="w-4 h-4 flex-shrink-0" style={{ color: source.color }} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-medium text-gray-700 dark:text-slate-300">
                                            {source.label}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-slate-400">
                                            {pct}%
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: source.color }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ duration: 0.6, delay: index * 0.08, ease: 'easeOut' }}
                                        />
                                    </div>
                                    {!compact && source.details.length > 0 && (
                                        <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5 truncate">
                                            {source.details.join(' · ')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
