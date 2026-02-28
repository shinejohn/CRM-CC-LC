import { PageHeader, DataTable, StatusBadge, ColumnDef } from "@/components/shared";
import { useCustomers } from "@/hooks/useCrmData";
import { Customer } from "@/services/types/crm.types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export default function CustomersListPage() {
    const { customers, isLoading } = useCustomers();
    const navigate = useNavigate();

    const columns: ColumnDef<Customer>[] = [
        {
            header: "Name",
            accessorKey: "name",
        },
        {
            header: "Email",
            accessorKey: "email",
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (row) => <StatusBadge status={row.status} />,
        },
        {
            header: "LTV",
            accessorKey: "ltv",
            cell: (row) => formatCurrency(row.ltv),
        },
        {
            header: "Last Contact",
            accessorKey: "last_contact",
            cell: (row) => formatDate(row.last_contact, "relative"),
        },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Customers"
                subtitle="Manage your business customers and view analytics."
            />
            <DataTable
                columns={columns}
                data={customers}
                isLoading={isLoading}
                searchable
                searchPlaceholder="Search customers..."
                pagination
                pageSize={10}
                onRowClick={(row) => navigate(`/crm/customers/${row.id}`)}
            />
        </div>
    );
}
