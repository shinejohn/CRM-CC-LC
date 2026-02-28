import { PageHeader, MetricCard, DataCard } from "@/components/shared";
import { DataReportPanel } from "./DataReportPanel";
import { DollarSign, Users, MousePointerClick, TrendingUp, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export default function CentralCommandDashboard() {
    const navigate = useNavigate();

    const metrics = [
        { label: "Total Revenue YTD", value: formatCurrency(124500), icon: DollarSign, color: "emerald", trend: "+14.5%" },
        { label: "Active Customers", value: "1,245", icon: Users, color: "blue", trend: "+5.2%" },
        { label: "Website Traffic", value: "45.2K", icon: MousePointerClick, color: "purple", trend: "+12.1%" },
        { label: "Conversion Rate", value: "3.4%", icon: TrendingUp, color: "orange", trend: "+1.2%" },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Command Center"
                subtitle="Welcome to your centralized business intelligence dashboard."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((m, i) => (
                    <MetricCard
                        key={i}
                        label={m.label}
                        value={m.value}
                        icon={m.icon}
                        color={m.color as any}
                        trend={m.trend}
                    />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <DataReportPanel title="Revenue Growth" />
                </div>

                <div className="space-y-6">
                    <DataCard title="Quick Actions">
                        <div className="space-y-3">
                            <button onClick={() => navigate('/crm/customers')} className="w-full flex items-center justify-between p-4 bg-[var(--nexus-bg-secondary)] hover:bg-[var(--nexus-card-bg-hover)] border border-[var(--nexus-card-border)] rounded-xl transition-colors group">
                                <span className="font-medium text-[var(--nexus-text-primary)]">Manage Customers</span>
                                <ArrowRight className="w-4 h-4 text-[var(--nexus-text-tertiary)] group-hover:text-[var(--nexus-accent-primary)] transition-colors" />
                            </button>
                            <button onClick={() => navigate('/billing/invoices')} className="w-full flex items-center justify-between p-4 bg-[var(--nexus-bg-secondary)] hover:bg-[var(--nexus-card-bg-hover)] border border-[var(--nexus-card-border)] rounded-xl transition-colors group">
                                <span className="font-medium text-[var(--nexus-text-primary)]">Create Invoice</span>
                                <ArrowRight className="w-4 h-4 text-[var(--nexus-text-tertiary)] group-hover:text-[var(--nexus-accent-primary)] transition-colors" />
                            </button>
                            <button onClick={() => navigate('/reports/marketing')} className="w-full flex items-center justify-between p-4 bg-[var(--nexus-bg-secondary)] hover:bg-[var(--nexus-card-bg-hover)] border border-[var(--nexus-card-border)] rounded-xl transition-colors group">
                                <span className="font-medium text-[var(--nexus-text-primary)]">View Analytics</span>
                                <ArrowRight className="w-4 h-4 text-[var(--nexus-text-tertiary)] group-hover:text-[var(--nexus-accent-primary)] transition-colors" />
                            </button>
                            <button onClick={() => navigate('/learn')} className="w-full flex items-center justify-between p-4 bg-[var(--nexus-bg-secondary)] hover:bg-[var(--nexus-card-bg-hover)] border border-[var(--nexus-card-border)] rounded-xl transition-colors group">
                                <span className="font-medium text-[var(--nexus-text-primary)]">Learning Center</span>
                                <ArrowRight className="w-4 h-4 text-[var(--nexus-text-tertiary)] group-hover:text-[var(--nexus-accent-primary)] transition-colors" />
                            </button>
                        </div>
                    </DataCard>

                    <DataCard title="Recent Activity">
                        <div className="space-y-4">
                            {/* Mock Activity List */}
                            {[
                                { action: "New invoice created", target: "Acme Corp", time: "2 hours ago" },
                                { action: "Payment received", target: "TechStart Inc", time: "5 hours ago" },
                                { action: "Deal stage updated", target: "Enterprise License", time: "1 day ago" },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-2 h-2 mt-2 rounded-full bg-[var(--nexus-brand-primary)] shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-[var(--nexus-text-primary)]">{item.action}</p>
                                        <p className="text-xs text-[var(--nexus-text-secondary)]">{item.target} • {item.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </DataCard>
                </div>
            </div>
        </div>
    );
}
