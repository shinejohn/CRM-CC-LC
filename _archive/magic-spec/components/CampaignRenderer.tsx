import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface CampaignSlideData {
    id: number;
    component: string;
    content: Record<string, any>;
    audioUrl?: string;
    requiresPersonalization?: boolean;
    narration?: string;
}

export interface CampaignRendererProps {
    slide: CampaignSlideData;
}

export function CampaignRenderer({ slide }: CampaignRendererProps) {
    const { component, content } = slide;

    const renderComponent = () => {
        switch (component) {
            case 'HeroSlide':
                return (
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold text-white mb-6">
                            {content.headline}
                        </h1>
                        <p className="text-xl text-blue-200">{content.subheadline}</p>
                    </div>
                );

            case 'ProblemSlide':
                return (
                    <div className="text-left w-full max-w-2xl mx-auto">
                        <h2 className="text-3xl font-bold text-red-400 mb-4">{content.title}</h2>
                        <p className="text-xl text-white mb-6">{content.problem}</p>
                        {content.painPoints && (
                            <ul className="space-y-3">
                                {content.painPoints.map((point: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-3 text-slate-300 text-lg">
                                        <span className="text-red-400 font-bold mt-1">✕</span>
                                        {point}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                );

            case 'SolutionSlide':
                return (
                    <div className="text-left w-full max-w-2xl mx-auto">
                        <h2 className="text-3xl font-bold text-emerald-400 mb-4">{content.title}</h2>
                        <p className="text-xl text-white mb-6">{content.solution}</p>
                        {content.benefits && (
                            <ul className="space-y-3">
                                {content.benefits.map((point: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-3 text-slate-300 text-lg">
                                        <span className="text-emerald-400 font-bold mt-1">✓</span>
                                        {point}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                );

            case 'StatsSlide':
                return (
                    <div className="text-center w-full max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold text-white mb-10">{content.headline}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {content.stats?.map((stat: any, idx: number) => (
                                <div key={idx} className="bg-white/10 p-6 rounded-xl backdrop-blur-sm border border-white/20">
                                    <div className="text-5xl font-black text-blue-400 mb-2">{stat.value}</div>
                                    <div className="text-xl font-semibold text-white">{stat.label}</div>
                                    {stat.sublabel && <div className="text-sm text-slate-300 mt-2">{stat.sublabel}</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'ComparisonSlide':
                return (
                    <div className="w-full max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold text-white text-center mb-10">{content.headline}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {content.before && (
                                <div className="bg-red-500/10 p-8 rounded-xl border border-red-500/30">
                                    <h3 className="text-2xl font-bold text-red-400 mb-6">{content.before.title}</h3>
                                    <ul className="space-y-4">
                                        {content.before.items?.map((item: string, idx: number) => (
                                            <li key={idx} className="flex items-start gap-3 text-slate-200">
                                                <span className="text-red-400">✕</span> {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {content.after && (
                                <div className="bg-emerald-500/10 p-8 rounded-xl border border-emerald-500/30">
                                    <h3 className="text-2xl font-bold text-emerald-400 mb-6">{content.after.title}</h3>
                                    <ul className="space-y-4">
                                        {content.after.items?.map((item: string, idx: number) => (
                                            <li key={idx} className="flex items-start gap-3 text-slate-200">
                                                <span className="text-emerald-400">✓</span> {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'ProcessSlide':
                return (
                    <div className="w-full max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold text-white text-center mb-2">{content.headline}</h2>
                        <p className="text-lg text-blue-200 text-center mb-10">{content.subheadline}</p>
                        <div className="space-y-6">
                            {content.steps?.map((step: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-6 bg-white/5 p-4 rounded-xl border border-white/10">
                                    <div className="w-12 h-12 rounded-full bg-blue-600 flex flex-shrink-0 items-center justify-center text-xl font-bold text-white">
                                        {step.number}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{step.title}</h3>
                                        <p className="text-slate-300">{step.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'CTASlide':
                return (
                    <div className="text-center px-4 w-full">
                        <h2 className="text-4xl font-bold text-white mb-4">{content.headline}</h2>
                        <p className="text-xl text-blue-200 mb-10">{content.subheadline}</p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            {content.primaryCTA && (
                                <button className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105">
                                    {content.primaryCTA.text}
                                </button>
                            )}
                            {content.secondaryCTA && (
                                <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/30 transition-all transform hover:scale-105">
                                    {content.secondaryCTA.text}
                                </button>
                            )}
                        </div>
                    </div>
                );

            default:
                // Generic fallback
                return (
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-white mb-4">{content.title || 'Slide'}</h2>
                        <p className="text-lg text-slate-300">{content.description || content.solution || content.problem || JSON.stringify(content)}</p>
                    </div>
                );
        }
    };

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="w-full flex justify-center h-full items-center py-10"
            >
                {renderComponent()}
            </motion.div>
        </AnimatePresence>
    );
}
