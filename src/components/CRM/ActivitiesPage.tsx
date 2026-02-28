import { PageHeader, DataCard, LoadingState, AvatarInitials } from "@/components/shared";
import { useActivities } from "@/hooks/useCrmData";
import { Activity } from "@/services/types/crm.types";
import { formatDate } from "@/lib/utils";
import { Mail, Phone, Calendar as CalendarIcon, FileText } from "lucide-react";

export default function ActivitiesPage() {
    const { activities, isLoading } = useActivities();

    const getIcon = (type: Activity["type"]) => {
        switch (type) {
            case "call": return <Phone className="w-4 h-4 text-emerald-500" />;
            case "email": return <Mail className="w-4 h-4 text-blue-500" />;
            case "meeting": return <CalendarIcon className="w-4 h-4 text-purple-500" />;
            case "note": return <FileText className="w-4 h-4 text-amber-500" />;
            default: return <FileText className="w-4 h-4 text-[var(--nexus-text-tertiary)]" />;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Activity Log"
                subtitle="Track team interactions and events across all contacts."
            />

            <DataCard isLoading={isLoading} className="bg-transparent border-0 shadow-none p-0 flex flex-col gap-4">
                {activities.length === 0 && !isLoading ? (
                    <div className="text-center py-12 bg-[var(--nexus-card-bg)] rounded-xl border border-[var(--nexus-card-border)] text-[var(--nexus-text-secondary)]">
                        No recent activities found.
                    </div>
                ) : (
                    activities.map(act => (
                        <div key={act.id} className="bg-[var(--nexus-card-bg)] p-4 rounded-xl border border-[var(--nexus-card-border)] shadow-sm flex items-start gap-4 hover:border-[var(--nexus-accent-primary)] transition-colors">
                            <div className="w-10 h-10 rounded-full bg-[var(--nexus-bg-secondary)] flex items-center justify-center shrink-0">
                                {getIcon(act.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="min-w-0">
                                        <p className="font-medium text-[var(--nexus-text-primary)] truncate">{act.description}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <AvatarInitials name="Agent" size="sm" />
                                            <span className="text-sm text-[var(--nexus-text-tertiary)] truncate">Logged by team member</span>
                                        </div>
                                    </div>
                                    <span className="text-xs font-semibold text-[var(--nexus-text-tertiary)] whitespace-nowrap bg-[var(--nexus-bg-secondary)] px-2 py-1 rounded-full">
                                        {formatDate(act.date, "relative")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </DataCard>
        </div>
    );
}
