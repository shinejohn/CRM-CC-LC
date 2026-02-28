import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader, DataCard, LoadingState, AvatarInitials } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/services/api";
import { Contact, Activity } from "@/services/types/crm.types";
import { formatPhone, formatDate } from "@/lib/utils";
import { Mail, Phone, Building, Calendar, ArrowLeft } from "lucide-react";

export default function ContactDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [contact, setContact] = useState<Contact | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            setIsLoading(true);
            try {
                const [contRes, actRes] = await Promise.all([
                    apiClient.get(`/crm/contacts/${id}`).catch(() => ({ data: { data: null } })),
                    apiClient.get(`/crm/contacts/${id}/activities`).catch(() => ({ data: { data: [] } })),
                ]);

                setContact(contRes.data.data || {
                    id: id || "1",
                    customer_id: "1",
                    name: "John Doe (Placeholder)",
                    role: "Decision Maker",
                    email: "john.doe@example.com",
                    phone: "5551234567"
                });
                setActivities(actRes.data.data || []);
            } finally {
                setIsLoading(false);
            }
        };
        if (id) fetchAll();
    }, [id]);

    if (isLoading) return <LoadingState variant="detail" />;
    if (!contact) return <div>Contact not found</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 text-[var(--nexus-text-secondary)]">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-6">
                    <DataCard className="text-center">
                        <div className="flex justify-center mb-4">
                            <AvatarInitials name={contact.name} size="lg" />
                        </div>
                        <h2 className="text-xl font-bold text-[var(--nexus-text-primary)]">{contact.name}</h2>
                        <p className="text-[var(--nexus-text-secondary)]">{contact.role}</p>

                        <div className="mt-8 space-y-4 text-left">
                            <div className="flex items-center gap-3 text-[var(--nexus-text-secondary)]">
                                <Mail className="w-4 h-4 text-[var(--nexus-text-tertiary)]" />
                                <span className="text-sm font-medium">{contact.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-[var(--nexus-text-secondary)]">
                                <Phone className="w-4 h-4 text-[var(--nexus-text-tertiary)]" />
                                <span className="text-sm font-medium">{formatPhone(contact.phone)}</span>
                            </div>
                            <div className="flex items-center gap-3 text-[var(--nexus-text-secondary)]">
                                <Building className="w-4 h-4 text-[var(--nexus-text-tertiary)]" />
                                <button onClick={() => navigate(`/crm/customers/${contact.customer_id}`)} className="text-sm font-medium text-[var(--nexus-accent-primary)] hover:underline">
                                    View Company
                                </button>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-[var(--nexus-divider)] flex gap-3">
                            <Button className="flex-1 bg-[var(--nexus-button-bg)] text-white hover:bg-[var(--nexus-button-hover)]">Email</Button>
                            <Button variant="outline" className="flex-1 border-[var(--nexus-card-border)] text-[var(--nexus-text-primary)] hover:bg-[var(--nexus-bg-secondary)]">Call</Button>
                        </div>
                    </DataCard>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <DataCard title="Activity History">
                        <div className="space-y-6">
                            {activities.length === 0 ? (
                                <div className="text-center py-8 text-[var(--nexus-text-secondary)]">No activities found.</div>
                            ) : (
                                activities.map((act) => (
                                    <div key={act.id} className="relative pl-6 border-l-2 border-[var(--nexus-divider)]">
                                        <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-[var(--nexus-accent-primary)]" />
                                        <div className="flex gap-4">
                                            <Calendar className="w-5 h-5 text-[var(--nexus-text-tertiary)]" />
                                            <div>
                                                <p className="font-medium text-[var(--nexus-text-primary)]">{act.description}</p>
                                                <p className="text-xs text-[var(--nexus-text-tertiary)] mt-1">{formatDate(act.date, "long")}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </DataCard>
                </div>
            </div>
        </div>
    );
}
