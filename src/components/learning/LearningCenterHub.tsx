import { PageHeader, DataCard } from "@/components/shared";
import { campaigns } from "@/data/campaigns";
import { useNavigate } from "react-router-dom";
import { PlayCircle, Clock, Target } from "lucide-react";

export default function LearningCenterHub() {
    const navigate = useNavigate();

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Learning Center"
                subtitle="Master the Fibonacco framework with interactive campaigns and modules."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((campaign) => (
                    <DataCard
                        key={campaign.id}
                        className="flex flex-col h-full hover:border-[var(--nexus-accent-primary)] transition-all cursor-pointer group shadow-sm hover:shadow-md"
                        onClick={() => navigate(`/learn/${campaign.slug}`)}
                    >
                        <div className="flex-1 space-y-4">
                            <div className="flex justify-between items-start">
                                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[var(--nexus-bg-secondary)] border border-[var(--nexus-divider)] text-[var(--nexus-text-primary)]">
                                    {campaign.id.split('-')[0] || "Campaign"}
                                </span>
                                {campaign.estimated_duration_weeks && (
                                    <span className="text-xs font-medium flex items-center gap-1 text-[var(--nexus-text-tertiary)] bg-[var(--nexus-card-bg)] px-2 py-1 rounded-full shadow-sm">
                                        <Clock className="w-3 h-3" /> {campaign.estimated_duration_weeks}w
                                    </span>
                                )}
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-[var(--nexus-text-primary)] group-hover:text-[var(--nexus-brand-primary)] transition-colors line-clamp-2">
                                    {campaign.title}
                                </h3>
                                <p className="text-[var(--nexus-text-secondary)] mt-2 text-sm line-clamp-3 leading-relaxed">
                                    {campaign.description}
                                </p>
                            </div>

                            {campaign.primary_objective && (
                                <div className="flex items-start gap-2 text-sm text-[var(--nexus-text-secondary)] bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                                    <Target className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-500" />
                                    <span className="line-clamp-2 font-medium">{campaign.primary_objective}</span>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 mt-6 border-t border-[var(--nexus-divider)] flex items-center text-[var(--nexus-brand-primary)] font-bold text-sm group-hover:translate-x-1 transition-transform">
                            <PlayCircle className="w-5 h-5 mr-2" /> Start Campaign
                        </div>
                    </DataCard>
                ))}
            </div>

            {campaigns.length === 0 && (
                <div className="text-center py-20 bg-[var(--nexus-card-bg)] rounded-xl border border-[var(--nexus-card-border)] shadow-sm">
                    <h3 className="text-xl font-bold text-[var(--nexus-text-primary)] mb-2">No Campaigns Found</h3>
                    <p className="text-[var(--nexus-text-secondary)]">Check the content directory for JSON files.</p>
                </div>
            )}
        </div>
    );
}
