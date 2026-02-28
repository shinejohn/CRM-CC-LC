import { PageHeader, DataTable, StatusBadge, ColumnDef } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useOrders } from "@/hooks/useBillingData";
import { Order } from "@/services/types/billing.types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Download } from "lucide-react";

export default function OrderHistoryPage() {
    const { orders, isLoading } = useOrders();

    const columns: ColumnDef<Order>[] = [
        { header: "Order ID", accessorKey: "id", cell: (row) => <span className="font-medium">ORD-{row.id.substring(0, 8)}</span> },
        { header: "Customer", accessorKey: "customer_name" },
        { header: "Date", accessorKey: "date", cell: (row) => formatDate(row.date) },
        { header: "Total", accessorKey: "amount", cell: (row) => <span className="font-bold">{formatCurrency(row.amount)}</span> },
        { header: "Status", accessorKey: "status", cell: (row) => <StatusBadge status={row.status as any} /> },
        {
            header: "Receipt",
            accessorKey: "id",
            cell: () => (
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[var(--nexus-text-secondary)] hover:text-[var(--nexus-text-primary)] hover:bg-[var(--nexus-bg-secondary)]">
                    <Download className="w-4 h-4" />
                </Button>
            )
        },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Order History"
                subtitle="View all past service and subscription orders."
            />

            <div className="bg-[var(--nexus-card-bg)] p-6 rounded-xl border border-[var(--nexus-card-border)] mb-6 shadow-sm">
                <h3 className="text-lg font-bold text-[var(--nexus-text-primary)] mb-4">Your Recent Purchases</h3>
                <DataTable
                    columns={columns}
                    data={orders}
                    isLoading={isLoading}
                    searchable
                    searchPlaceholder="Search orders..."
                    pagination
                    pageSize={10}
                />
            </div>
        </div>
    );
}
