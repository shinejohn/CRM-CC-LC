import { PageHeader, DataCard, DataTable, StatusBadge, ColumnDef } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Copy, Eye, FileText, Plus, Send, CheckCircle, Clock } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function ClientProposalPage() {
    const proposals = [
        { id: "1", title: "Enterprise Software License", client: "Acme Corp", value: 125000, status: "sent", date: new Date().toISOString() },
        { id: "2", title: "Q3 Marketing Retainer", client: "TechStart Inc", value: 15000, status: "draft", date: new Date().toISOString() },
        { id: "3", title: "Security Audit", client: "Global Bank", value: 45000, status: "accepted", date: new Date(Date.now() - 86400000 * 5).toISOString() },
    ];

    const columns: ColumnDef<any>[] = [
        { header: "Proposal Name", accessorKey: "title", cell: (row) => <span className="font-medium text-[var(--nexus-text-primary)]">{row.title}</span> },
        { header: "Client", accessorKey: "client" },
        { header: "Value", accessorKey: "value", cell: (row) => formatCurrency(row.value) },
        { header: "Created", accessorKey: "date", cell: (row) => formatDate(row.date) },
        { header: "Status", accessorKey: "status", cell: (row) => <StatusBadge status={row.status} /> },
        {
            header: "Actions",
            accessorKey: "id",
            cell: () => (
                <div className="flex gap-2 justify-end pr-4">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[var(--nexus-text-secondary)] hover:bg-[var(--nexus-bg-secondary)]"><Eye className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[var(--nexus-text-secondary)] hover:bg-[var(--nexus-bg-secondary)]"><Copy className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[var(--nexus-brand-primary)] hover:bg-[var(--nexus-brand-primary)]/10"><Send className="w-4 h-4" /></Button>
                </div>
            )
        },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Proposals & Contracts"
                subtitle="Manage client proposals, quotes, and legal documents."
                actions={
                    <Button className="bg-[var(--nexus-button-bg)] text-white hover:bg-[var(--nexus-button-hover)] shadow-sm">
                        <Plus className="w-4 h-4 mr-2" /> Create Proposal
                    </Button>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <DataCard className="flex items-center p-6 gap-4 bg-gradient-to-br from-[var(--nexus-card-bg)] to-[var(--nexus-bg-secondary)] border border-[var(--nexus-card-border)]">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-[var(--nexus-text-secondary)]">Active Proposals</p>
                        <h3 className="text-2xl font-bold text-[var(--nexus-text-primary)]">12</h3>
                    </div>
                </DataCard>
                <DataCard className="flex items-center p-6 gap-4 bg-gradient-to-br from-[var(--nexus-card-bg)] to-[var(--nexus-bg-secondary)] border border-[var(--nexus-card-border)]">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-[var(--nexus-text-secondary)]">Accepted (YTD)</p>
                        <h3 className="text-2xl font-bold text-[var(--nexus-text-primary)]">48</h3>
                    </div>
                </DataCard>
                <DataCard className="flex items-center p-6 gap-4 bg-gradient-to-br from-[var(--nexus-card-bg)] to-[var(--nexus-bg-secondary)] border border-[var(--nexus-card-border)]">
                    <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-[var(--nexus-text-secondary)]">Pending Review</p>
                        <h3 className="text-2xl font-bold text-[var(--nexus-text-primary)]">4</h3>
                    </div>
                </DataCard>
            </div>

            <DataCard>
                <DataTable
                    columns={columns}
                    data={proposals}
                    searchable
                    searchPlaceholder="Search proposals..."
                />
            </DataCard>
        </div>
    );
}
