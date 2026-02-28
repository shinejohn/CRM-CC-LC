import { PageHeader, DataCard, MetricCard } from "@/components/shared";
import { useCollectionMetrics, useInvoices } from "@/hooks/useBillingData";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, AlertTriangle, TrendingUp, Calendar } from "lucide-react";

export default function CollectionsDashboard() {
    const { metrics, isLoading: metricsLoading } = useCollectionMetrics();
    const { invoices, isLoading: invoicesLoading } = useInvoices();

    const isLoading = metricsLoading || invoicesLoading;

    const mockMetrics = metrics || {
        total_outstanding: 45000,
        overdue_amount: 12500,
        collection_rate: 92.4,
        days_sales_outstanding: 42,
        active_invoices: 15
    };

    const overdueInvoices = invoices.filter(i => i.status === "overdue");

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Collections & Accounts Receivable"
                subtitle="Monitor outstanding balances, metrics, and overdue accounts."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    label="Total A/R"
                    value={formatCurrency(mockMetrics.total_outstanding)}
                    icon={DollarSign}
                    color="blue"
                    isLoading={isLoading}
                />
                <MetricCard
                    label="Overdue (30+ Days)"
                    value={formatCurrency(mockMetrics.overdue_amount)}
                    icon={AlertTriangle}
                    color="red"
                    isLoading={isLoading}
                />
                <MetricCard
                    label="Collection Rate"
                    value={`${mockMetrics.collection_rate}%`}
                    icon={TrendingUp}
                    color="emerald"
                    isLoading={isLoading}
                />
                <MetricCard
                    label="DSO"
                    value={`${mockMetrics.days_sales_outstanding} Days`}
                    icon={Calendar}
                    color="purple"
                    isLoading={isLoading}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DataCard title="Collection Priorities" isLoading={isLoading}>
                    <div className="space-y-4">
                        {overdueInvoices.length === 0 && !isLoading ? (
                            <div className="text-center py-8 text-[var(--nexus-text-secondary)]">No overdue accounts. Great job!</div>
                        ) : (
                            overdueInvoices.map(invoice => (
                                <div key={invoice.id} className="flex items-center justify-between p-4 bg-[var(--nexus-bg-secondary)] rounded-xl border border-[var(--nexus-card-border)] hover:border-red-200 dark:hover:border-red-900/50 transition-colors">
                                    <div>
                                        <a href={`/billing/invoices/${invoice.id}`} className="font-bold text-[var(--nexus-text-primary)] hover:text-red-500 transition-colors cursor-pointer">
                                            {invoice.customer_name}
                                        </a>
                                        <p className="text-sm text-[var(--nexus-text-secondary)] mt-1">INV-{invoice.id.substring(0, 6)} • Due {new Date(invoice.due_date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-red-600 dark:text-red-400">{formatCurrency(invoice.amount)}</p>
                                        <a href={`/billing/invoices/${invoice.id}`} className="text-xs font-semibold text-[var(--nexus-accent-primary)] hover:underline mt-1 inline-block">
                                            Review Account
                                        </a>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </DataCard>

                <DataCard title="A/R Aging Summary" isLoading={isLoading}>
                    <div className="space-y-6">
                        {[
                            { bracket: "0 - 30 Days", amount: 25000, percent: 55 },
                            { bracket: "31 - 60 Days", amount: 15000, percent: 33 },
                            { bracket: "61 - 90 Days", amount: 4000, percent: 9 },
                            { bracket: "90+ Days", amount: 1000, percent: 3 }
                        ].map((bucket, idx) => (
                            <div key={idx} className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="font-medium text-[var(--nexus-text-secondary)]">{bucket.bracket}</span>
                                    <span className="font-bold text-[var(--nexus-text-primary)]">{formatCurrency(bucket.amount)}</span>
                                </div>
                                <div className="w-full h-2 bg-[var(--nexus-bg-secondary)] rounded-full overflow-hidden">
                                    <div className="h-full bg-[var(--nexus-accent-primary)] rounded-full" style={{ width: `${bucket.percent}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </DataCard>
            </div>
        </div>
    );
}
