import { PageHeader, DataCard, MetricCard } from "@/components/shared";
import { DataReportPanel } from "@/components/dashboard/DataReportPanel";
import { TrendingUp, Users, MousePointerClick, Target } from "lucide-react";

export default function MarketingReportPage() {
    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Marketing Analytics"
                subtitle="Track campaign performance and acquisition metrics."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard label="Total Impressions" value="1.2M" icon={Users} color="blue" change={{ value: 12.5, direction: "up" }} />
                <MetricCard label="Click-Through Rate" value="4.8%" icon={MousePointerClick} color="green" change={{ value: 0.4, direction: "up" }} />
                <MetricCard label="Conversions" value="3,492" icon={Target} color="purple" change={{ value: 8.2, direction: "up" }} />
                <MetricCard label="Cost per Acquisition" value="$42.50" icon={TrendingUp} color="amber" change={{ value: 2.1, direction: "down" }} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DataReportPanel title="Traffic Over Time" />
                <DataReportPanel title="Lead Generation" />
            </div>

            <DataCard title="Top Performing Campaigns">
                <div className="space-y-4 pt-4">
                    <div className="text-center text-[var(--nexus-text-secondary)] py-8">
                        Campaign data loading...
                    </div>
                </div>
            </DataCard>
        </div>
    );
}
