import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader, DataCard, MetricCard, StatusBadge, LoadingState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/services/api";
import { Deal } from "@/services/types/crm.types";
import { formatCurrency, formatDate, formatPercent } from "@/lib/utils";
import { ArrowLeft, Target, TrendingUp, Calendar, AlertCircle } from "lucide-react";

export default function DealDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [deal, setDeal] = useState<Deal | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDeal = async () => {
            setIsLoading(true);
            try {
                const res = await apiClient.get(`/crm/deals/${id}`).catch(() => ({ data: { data: null } }));
                setDeal(res.data.data || {
                    id: id || "1",
                    title: "Enterprise Software License (Placeholder)",
                    value: 125000,
                    stage: "proposal",
                    probability: 60,
                    expected_close: new Date(Date.now() + 86400000 * 30).toISOString(),
                });
            } finally {
                setIsLoading(false);
            }
        };
        if (id) fetchDeal();
    }, [id]);

    if (isLoading) return <LoadingState variant="detail" />;
    if (!deal) return <div>Deal not found</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 text-[var(--nexus-text-secondary)] hover:bg-[var(--nexus-bg-secondary)] hover:text-[var(--nexus-text-primary)]">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>

            <PageHeader
                title={deal.title}
                breadcrumbs={[
                    { label: "CRM", href: "/crm/dashboard" },
                    { label: "Deals", href: "/crm/deals" },
                    { label: deal.title },
                ]}
                actions={
                    <StatusBadge status={deal.stage as any} size="md" />
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                    label="Deal Value"
                    value={formatCurrency(deal.value)}
                    icon={Target}
                    color="emerald"
                />
                <MetricCard
                    label="Probability"
                    value={formatPercent(deal.probability)}
                    icon={TrendingUp}
                    color="blue"
                />
                <MetricCard
                    label="Expected Close"
                    value={formatDate(deal.expected_close)}
                    icon={Calendar}
                    color="purple"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <DataCard title="Deal Details">
                        <div className="space-y-8">
                            <div>
                                <h4 className="text-sm font-medium text-[var(--nexus-text-secondary)] mb-4">Stage Progression</h4>
                                <div className="flex items-center w-full gap-2">
                                    {["discovery", "proposal", "negotiation", "won"].map((stage, idx) => {
                                        const stages = ["discovery", "proposal", "negotiation", "won"];
                                        const currentIdx = stages.indexOf(deal.stage) === -1 && deal.stage === "lost" ? -1 : stages.indexOf(deal.stage);
                                        const isActive = idx <= currentIdx;
                                        return (
                                            <div key={stage} className="flex-1 flex flex-col items-center gap-2">
                                                <div className={`w-full h-2 rounded-full transition-colors ${isActive ? 'bg-[var(--nexus-accent-primary)]' : 'bg-[var(--nexus-bg-secondary)]'}`} />
                                                <span className={`text-[10px] uppercase font-bold tracking-wider ${isActive ? 'text-[var(--nexus-text-primary)]' : 'text-[var(--nexus-text-tertiary)]'}`}>{stage}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 rounded-xl flex items-start gap-3 border border-amber-200 dark:border-amber-900/50">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-sm">Action Required</p>
                                    <p className="text-sm mt-1">Pending signed NDA from legal compliance team before moving to Negotiation stage.</p>
                                </div>
                            </div>
                        </div>
                    </DataCard>
                </div>

                <div>
                    <DataCard title="Key Associated Contacts">
                        <div className="text-sm text-[var(--nexus-text-secondary)] py-4 text-center">
                            Contacts linked to this deal will appear here.
                        </div>
                    </DataCard>
                </div>
            </div>
        </div>
    );
}
