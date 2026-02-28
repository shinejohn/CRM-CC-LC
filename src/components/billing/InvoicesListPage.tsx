import { PageHeader, DataTable, StatusBadge, ColumnDef } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useInvoices } from "@/hooks/useBillingData";
import { Invoice } from "@/services/types/billing.types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

export default function InvoicesListPage() {
    const { invoices, isLoading } = useInvoices();
    const navigate = useNavigate();

    const columns: ColumnDef<Invoice>[] = [
        { header: "Invoice ID", accessorKey: "id", cell: (row) => <span className="font-medium text-[var(--nexus-text-primary)]">INV-{row.id.substring(0, 6)}</span> },
        { header: "Customer", accessorKey: "customer_name" },
        { header: "Amount", accessorKey: "amount", cell: (row) => formatCurrency(row.amount) },
        { header: "Due Date", accessorKey: "due_date", cell: (row) => formatDate(row.due_date) },
        { header: "Status", accessorKey: "status", cell: (row) => <StatusBadge status={row.status as any} /> },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Invoices"
                subtitle="Manage billing, track payments, and follow up on overdue accounts."
                actions={
                    <Button onClick={() => { }} className="bg-[var(--nexus-button-bg)] text-white hover:bg-[var(--nexus-button-hover)] shadow-sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Invoice
                    </Button>
                }
            />
            <DataTable
                columns={columns}
                data={invoices}
                isLoading={isLoading}
                searchable
                searchPlaceholder="Search invoices..."
                pagination
                pageSize={15}
                onRowClick={(row) => navigate(`/billing/invoices/${row.id}`)}
            />
        </div>
    );
}
