import { PageHeader, DataTable, ColumnDef, AvatarInitials } from "@/components/shared";
import { useContacts } from "@/hooks/useCrmData";
import { Contact } from "@/services/types/crm.types";
import { formatPhone } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export default function ContactsListPage() {
    const { contacts, isLoading } = useContacts();
    const navigate = useNavigate();

    const columns: ColumnDef<Contact>[] = [
        {
            header: "Contact",
            accessorKey: "name",
            cell: (row) => (
                <div className="flex items-center gap-3">
                    <AvatarInitials name={row.name} size="sm" />
                    <span className="font-medium">{row.name}</span>
                </div>
            ),
        },
        {
            header: "Role",
            accessorKey: "role",
        },
        {
            header: "Email",
            accessorKey: "email",
        },
        {
            header: "Phone",
            accessorKey: "phone",
            cell: (row) => formatPhone(row.phone),
        },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Contacts"
                subtitle="Address book for your business."
            />
            <DataTable
                columns={columns}
                data={contacts}
                isLoading={isLoading}
                searchable
                searchPlaceholder="Search contacts..."
                pagination
                pageSize={15}
                onRowClick={(row) => navigate(`/crm/contacts/${row.id}`)}
            />
        </div>
    );
}
