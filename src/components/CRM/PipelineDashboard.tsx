import { PageHeader, DataCard, MetricCard } from "@/components/shared";
import { useDeals } from "@/hooks/useCrmData";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, Target, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PipelineDashboard() {
    const { deals, isLoading } = useDeals();
    const navigate = useNavigate();

    const totalValue = deals.reduce((acc, d) => acc + d.value, 0);
    const wonValue = deals.filter(d => d.stage === "won").reduce((acc, d) => acc + d.value, 0);
    const winRate = deals.length > 0 ? (deals.filter(d => d.stage === "won").length / deals.length) * 100 : 0;

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Sales Pipeline"
                subtitle="Track and manage active deals across stages."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                    label="Total Pipeline Value"
                    value={formatCurrency(totalValue)}
                    icon={DollarSign}
                    color="blue"
                    isLoading={isLoading}
                />
                <MetricCard
                    label="Closed Won (YTD)"
                    value={formatCurrency(wonValue)}
                    icon={Target}
                    color="emerald"
                    isLoading={isLoading}
                />
                <MetricCard
                    label="Win Rate"
                    value={`${winRate.toFixed(1)}%`}
                    icon={TrendingUp}
                    color="purple"
                    isLoading={isLoading}
                />
            </div>

            <DataCard title="Active Deals by Stage" isLoading={isLoading} className="bg-transparent border-0 shadow-none">
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                    {["discovery", "proposal", "negotiation", "won"].map(stage => {
                        const stageDeals = deals.filter(d => d.stage === stage);
                        return (
                            <div key={stage} className="flex-1 min-w-[280px] bg-[var(--nexus-bg-secondary)] rounded-xl p-4 flex flex-col gap-3">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-bold text-sm text-[var(--nexus-text-primary)] uppercase tracking-wider">{stage}</h4>
                                    <span className="text-xs font-semibold text-[var(--nexus-text-tertiary)] bg-[var(--nexus-card-bg)] px-2 py-1 rounded-full shadow-sm">{stageDeals.length}</span>
                                </div>
                                {stageDeals.map(deal => (
                                    <div
                                        key={deal.id}
                                        onClick={() => navigate(`/crm/deals/${deal.id}`)}
                                        className="bg-[var(--nexus-card-bg)] p-4 rounded-lg shadow-sm border border-[var(--nexus-card-border)] hover:border-[var(--nexus-accent-primary)] transition-colors cursor-pointer group"
                                    >
                                        <p className="font-medium text-[var(--nexus-text-primary)] text-sm mb-2 group-hover:text-[var(--nexus-accent-primary)] transition-colors">{deal.title}</p>
                                        <div className="flex justify-between items-end">
                                            <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(deal.value)}</span>
                                            <span className="text-xs text-[var(--nexus-text-tertiary)] font-medium">Prob: {deal.probability}%</span>
                                        </div>
                                    </div>
                                ))}
                                {stageDeals.length === 0 && (
                                    <div className="text-center text-xs text-[var(--nexus-text-tertiary)] py-6">No deals in this stage</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </DataCard>
        </div>
    );
}
