import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader, DataCard, MetricCard, StatusBadge, LoadingState, ConfirmDialog } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useDeal, useTransitionDeal } from "@/hooks/useDeals";
import type { DealStage } from "@/services/crm/deals-api";
import { formatCurrency, formatDate, formatPercent } from "@/lib/utils";
import { ArrowLeft, Target, TrendingUp, Calendar, AlertCircle } from "lucide-react";

const STAGE_ORDER: DealStage[] = ["hook", "engagement", "sales", "retention", "won"];

const STAGE_BADGE: Record<DealStage, Parameters<typeof StatusBadge>[0]["status"]> = {
    hook: "draft",
    engagement: "pending",
    sales: "active",
    retention: "completed",
    won: "completed",
    lost: "cancelled",
};

export default function DealDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: deal, isLoading, isError } = useDeal(id ?? "");
    const transitionDeal = useTransitionDeal();
    const [pendingStage, setPendingStage] = useState<DealStage | null>(null);

    if (isLoading) return <LoadingState variant="detail" />;
    if (isError || !deal) {
        return (
            <div className="space-y-6">
                <Button type="button" variant="ghost" onClick={() => navigate(-1)} aria-label="Go back">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <DataCard>
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <AlertCircle className="w-8 h-8 text-[var(--nexus-accent-danger)] mb-3" />
                        <h3 className="text-lg font-semibold text-[var(--nexus-text-primary)]">Deal not found</h3>
                        <p className="text-sm text-[var(--nexus-text-secondary)] mt-1">
                            This deal could not be loaded. It may have been deleted.
                        </p>
                    </div>
                </DataCard>
            </div>
        );
    }

    const currentIdx = STAGE_ORDER.indexOf(deal.stage);
    const nextStage: DealStage | undefined = currentIdx >= 0 && currentIdx < STAGE_ORDER.length - 1
        ? STAGE_ORDER[currentIdx + 1]
        : undefined;
    const isClosed = deal.stage === "won" || deal.stage === "lost";

    const runTransition = async () => {
        if (!pendingStage) return;
        try {
            await transitionDeal.mutateAsync({ id: deal.id, stage: pendingStage });
            setPendingStage(null);
        } catch {
            // surfaced via global api-error event; keep dialog open
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <Button
                type="button"
                variant="ghost"
                onClick={() => navigate("/command-center/sell/pipeline")}
                aria-label="Back to pipeline"
                className="mb-2 text-[var(--nexus-text-secondary)] hover:bg-[var(--nexus-bg-secondary)] hover:text-[var(--nexus-text-primary)]"
            >
                <ArrowLeft className="w-4 h-4 mr-2" /> Pipeline
            </Button>

            <PageHeader
                title={deal.name}
                subtitle={deal.customer?.business_name}
                actions={
                    <div className="flex items-center gap-3">
                        <StatusBadge status={STAGE_BADGE[deal.stage]} size="md" />
                        {!isClosed && nextStage && (
                            <Button
                                type="button"
                                onClick={() => setPendingStage(nextStage)}
                                className="bg-[var(--nexus-button-bg)] text-white hover:bg-[var(--nexus-button-hover)] border-none"
                            >
                                Advance to {nextStage}
                            </Button>
                        )}
                        {!isClosed && (
                            <>
                                <Button type="button" variant="outline" onClick={() => setPendingStage("won")}>
                                    Mark Won
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setPendingStage("lost")}>
                                    Mark Lost
                                </Button>
                            </>
                        )}
                    </div>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard label="Deal Value" value={formatCurrency(Number(deal.value) || 0)} icon={Target} color="green" />
                <MetricCard label="Probability" value={formatPercent(deal.probability)} icon={TrendingUp} color="blue" />
                <MetricCard
                    label="Expected Close"
                    value={deal.expected_close_at ? formatDate(deal.expected_close_at) : "—"}
                    icon={Calendar}
                    color="purple"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <DataCard title="Stage Progression">
                        <div className="flex items-center w-full gap-2">
                            {STAGE_ORDER.map((stage, idx) => {
                                const isActive = currentIdx >= 0 && idx <= currentIdx;
                                return (
                                    <div key={stage} className="flex-1 flex flex-col items-center gap-2">
                                        <div className={`w-full h-2 rounded-full transition-colors ${isActive ? "bg-[var(--nexus-accent-primary)]" : "bg-[var(--nexus-bg-secondary)]"}`} />
                                        <span className={`text-[10px] uppercase font-bold tracking-wider ${isActive ? "text-[var(--nexus-text-primary)]" : "text-[var(--nexus-text-tertiary)]"}`}>
                                            {stage}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        {deal.stage === "lost" && deal.loss_reason && (
                            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900/50">
                                <p className="font-semibold text-sm">Lost reason</p>
                                <p className="text-sm mt-1">{deal.loss_reason}</p>
                            </div>
                        )}
                        {deal.notes && (
                            <div className="mt-6">
                                <h4 className="text-sm font-medium text-[var(--nexus-text-secondary)] mb-2">Notes</h4>
                                <p className="text-sm text-[var(--nexus-text-primary)] whitespace-pre-wrap">{deal.notes}</p>
                            </div>
                        )}
                    </DataCard>
                </div>

                <div>
                    <DataCard title="Customer">
                        {deal.customer ? (
                            <button
                                type="button"
                                onClick={() => navigate(`/command-center/sell/customers/${deal.customer_id}`)}
                                className="text-left text-sm text-[var(--nexus-accent-primary)] hover:underline"
                            >
                                {deal.customer.business_name}
                            </button>
                        ) : (
                            <p className="text-sm text-[var(--nexus-text-secondary)] py-2">No customer linked.</p>
                        )}
                        {deal.contact && (
                            <div className="mt-4 text-sm">
                                <p className="text-[var(--nexus-text-primary)] font-medium">{deal.contact.name}</p>
                                {deal.contact.email && (
                                    <p className="text-[var(--nexus-text-tertiary)]">{deal.contact.email}</p>
                                )}
                            </div>
                        )}
                    </DataCard>
                </div>
            </div>

            <ConfirmDialog
                open={pendingStage !== null}
                onOpenChange={(open) => { if (!open) setPendingStage(null); }}
                title={pendingStage === "lost" ? "Mark deal as lost" : pendingStage === "won" ? "Mark deal as won" : "Advance deal stage"}
                description={
                    pendingStage === "lost"
                        ? `Move ${deal.name} to Lost?`
                        : pendingStage === "won"
                            ? `Move ${deal.name} to Won?`
                            : `Move ${deal.name} to the ${pendingStage} stage?`
                }
                confirmLabel={pendingStage === "lost" ? "Mark Lost" : pendingStage === "won" ? "Mark Won" : "Advance"}
                variant={pendingStage === "lost" ? "destructive" : "default"}
                isLoading={transitionDeal.isPending}
                onConfirm={runTransition}
            />
        </div>
    );
}
