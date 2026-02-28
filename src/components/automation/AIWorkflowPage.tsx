import { PageHeader, DataCard, StatusBadge } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Play, Settings, Plus, Zap, Activity } from "lucide-react";

export default function AIWorkflowPage() {
    const workflows = [
        { id: "1", name: "Lead Qualification Agent", trigger: "Form Submission", status: "active", executions: 1245 },
        { id: "2", name: "Invoice Reminder Bot", trigger: "Overdue Invoice", status: "active", executions: 342 },
        { id: "3", name: "Social Syndication", trigger: "Blog Publish", status: "paused", executions: 0 },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="AI Automation & Workflows"
                subtitle="Configure autonomous agents to handle routine tasks."
                actions={
                    <Button className="bg-[var(--nexus-button-bg)] text-white hover:bg-[var(--nexus-button-hover)] shadow-sm">
                        <Plus className="w-4 h-4 mr-2" /> New Workflow
                    </Button>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workflows.map((wf) => (
                    <DataCard key={wf.id} className="flex flex-col h-full hover:border-[var(--nexus-brand-primary)] border border-[var(--nexus-card-border)] transition-colors group cursor-pointer shadow-sm hover:shadow-md">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-[var(--nexus-bg-secondary)] rounded-xl group-hover:bg-[var(--nexus-brand-primary)]/10 transition-colors">
                                <Zap className="w-6 h-6 text-[var(--nexus-brand-primary)]" />
                            </div>
                            <StatusBadge status={wf.status as any} />
                        </div>

                        <h3 className="text-xl font-bold text-[var(--nexus-text-primary)] mb-2 group-hover:text-[var(--nexus-brand-primary)] transition-colors">{wf.name}</h3>
                        <p className="text-sm text-[var(--nexus-text-secondary)] mb-6 flex-1 bg-[var(--nexus-bg-secondary)] p-3 rounded-lg border border-[var(--nexus-divider)]">
                            Triggered by: <span className="font-semibold text-[var(--nexus-text-primary)] ml-1">{wf.trigger}</span>
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-[var(--nexus-divider)]">
                            <div className="flex items-center gap-2 text-sm font-medium text-[var(--nexus-text-tertiary)] bg-[var(--nexus-bg-page)] px-3 py-1.5 rounded-full border border-[var(--nexus-divider)]">
                                <Activity className="w-4 h-4" /> {wf.executions.toLocaleString()} runs
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-[var(--nexus-text-secondary)] hover:bg-[var(--nexus-bg-secondary)]"><Settings className="w-4 h-4" /></Button>
                                {wf.status === 'active' ? (
                                    <Button variant="ghost" size="sm" className="h-9 px-4 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium">Pause</Button>
                                ) : (
                                    <Button variant="ghost" size="sm" className="h-9 px-4 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 font-medium"><Play className="w-4 h-4 mr-1" /> Start</Button>
                                )}
                            </div>
                        </div>
                    </DataCard>
                ))}
            </div>
        </div>
    );
}
