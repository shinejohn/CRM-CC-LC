import { PageHeader, DataCard } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Bell, CheckSquare, Clock } from "lucide-react";

export default function NotificationsPage() {
    const notifications = [
        { id: 1, title: "New Deal Created", desc: "A new deal was created in the pipeline.", time: "2 hours ago", read: false },
        { id: 2, title: "Invoice Paid", desc: "Payment received from Acme Corp.", time: "5 hours ago", read: true },
        { id: 3, title: "Meeting Scheduled", desc: "Q3 Review with the board.", time: "1 day ago", read: true },
    ];

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            <PageHeader
                title="Notifications"
                subtitle="Updates and alerts from across your Command Center."
                actions={
                    <Button variant="outline" className="text-[var(--nexus-text-primary)] border-[var(--nexus-card-border)] hover:bg-[var(--nexus-bg-secondary)]">
                        <CheckSquare className="w-4 h-4 mr-2" /> Mark all as read
                    </Button>
                }
            />

            <DataCard className="p-0 overflow-hidden">
                <div className="divide-y divide-[var(--nexus-divider)]">
                    {notifications.map((notif) => (
                        <div key={notif.id} className={`p-4 flex items-start gap-4 transition-colors hover:bg-[var(--nexus-card-bg-hover)] ${!notif.read ? 'bg-[var(--nexus-bg-secondary)]' : ''}`}>
                            <div className={`mt-1 p-2 rounded-full ${!notif.read ? 'bg-[var(--nexus-brand-primary)]/10 text-[var(--nexus-brand-primary)]' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                                <Bell className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className={`font-medium ${!notif.read ? 'text-[var(--nexus-text-primary)]' : 'text-[var(--nexus-text-secondary)]'}`}>
                                        {notif.title}
                                    </h4>
                                    <span className="text-xs flex items-center gap-1 text-[var(--nexus-text-tertiary)]">
                                        <Clock className="w-3 h-3" /> {notif.time}
                                    </span>
                                </div>
                                <p className={`text-sm ${!notif.read ? 'text-[var(--nexus-text-secondary)]' : 'text-[var(--nexus-text-tertiary)]'}`}>
                                    {notif.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </DataCard>
        </div>
    );
}
