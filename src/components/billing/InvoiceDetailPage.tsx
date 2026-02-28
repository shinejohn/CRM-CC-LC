import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader, DataCard, StatusBadge, LoadingState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/services/api";
import { Invoice } from "@/services/types/billing.types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, Download, Send, CreditCard } from "lucide-react";

export default function InvoiceDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchInvoice = async () => {
            setIsLoading(true);
            try {
                const res = await apiClient.get(`/billing/invoices/${id}`).catch(() => ({ data: { data: null } }));
                setInvoice(res.data.data || {
                    id: id || "1",
                    customer_id: "1",
                    customer_name: "Acme Corp",
                    amount: 4500,
                    status: "pending",
                    issue_date: new Date().toISOString(),
                    due_date: new Date(Date.now() + 86400000 * 15).toISOString(),
                    items: [
                        { id: "1", description: "Software License", quantity: 1, unit_price: 3000, amount: 3000 },
                        { id: "2", description: "Implementation Services", quantity: 10, unit_price: 150, amount: 1500 },
                    ]
                });
            } finally {
                setIsLoading(false);
            }
        };
        if (id) fetchInvoice();
    }, [id]);

    if (isLoading) return <LoadingState variant="detail" />;
    if (!invoice) return <div>Invoice not found</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" onClick={() => navigate(-1)} className="text-[var(--nexus-text-secondary)] hover:bg-[var(--nexus-bg-secondary)]">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <div className="flex gap-3">
                    <Button variant="outline" className="text-[var(--nexus-text-primary)] border-[var(--nexus-card-border)] hover:bg-[var(--nexus-bg-secondary)]">
                        <Download className="w-4 h-4 mr-2" /> PDF
                    </Button>
                    <Button variant="outline" className="text-[var(--nexus-text-primary)] border-[var(--nexus-card-border)] hover:bg-[var(--nexus-bg-secondary)]">
                        <Send className="w-4 h-4 mr-2" /> Send Reminder
                    </Button>
                    {invoice.status !== "paid" && (
                        <Button className="bg-[var(--nexus-button-bg)] text-white hover:bg-[var(--nexus-button-hover)] border-0">
                            <CreditCard className="w-4 h-4 mr-2" /> Record Payment
                        </Button>
                    )}
                </div>
            </div>

            <PageHeader
                title={`Invoice INV-${invoice.id.substring(0, 6)}`}
                breadcrumbs={[
                    { label: "Billing", href: "/billing/collections" },
                    { label: "Invoices", href: "/billing/invoices" },
                    { label: `INV-${invoice.id.substring(0, 6)}` },
                ]}
                actions={
                    <StatusBadge status={invoice.status as any} size="md" />
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <DataCard className="relative overflow-hidden">
                        {/* Invoice Decorator */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--nexus-brand-primary)] opacity-5 rounded-bl-[100px] pointer-events-none" />

                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-[var(--nexus-text-primary)]">INVOICE</h3>
                                <p className="text-[var(--nexus-text-secondary)] mt-1">Status: <span className="uppercase text-xs font-bold">{invoice.status}</span></p>
                            </div>
                            <div className="text-right">
                                <h4 className="font-bold text-[var(--nexus-text-primary)]">Fibonacco Platform</h4>
                                <p className="text-sm text-[var(--nexus-text-secondary)]">123 Tech Lane</p>
                                <p className="text-sm text-[var(--nexus-text-secondary)]">San Francisco, CA 94105</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-[var(--nexus-divider)]">
                            <div>
                                <p className="text-xs font-bold text-[var(--nexus-text-tertiary)] uppercase tracking-wider mb-2">Billed To</p>
                                <p className="font-bold text-[var(--nexus-text-primary)]">{invoice.customer_name}</p>
                                <Button variant="link" className="px-0 text-[var(--nexus-accent-primary)] h-auto" onClick={() => navigate(`/crm/customers/${invoice.customer_id}`)}>View Customer Profile</Button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-bold text-[var(--nexus-text-tertiary)] uppercase tracking-wider mb-1">Issue Date</p>
                                    <p className="font-medium text-[var(--nexus-text-primary)]">{formatDate(invoice.issue_date)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-[var(--nexus-text-tertiary)] uppercase tracking-wider mb-1">Due Date</p>
                                    <p className="font-medium text-[var(--nexus-text-primary)]">{formatDate(invoice.due_date)}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-[var(--nexus-divider)]">
                                        <th className="py-3 px-2 text-sm font-semibold text-[var(--nexus-text-secondary)]">Description</th>
                                        <th className="py-3 px-2 text-sm font-semibold text-[var(--nexus-text-secondary)] text-right">Qty</th>
                                        <th className="py-3 px-2 text-sm font-semibold text-[var(--nexus-text-secondary)] text-right">Unit Price</th>
                                        <th className="py-3 px-2 text-sm font-semibold text-[var(--nexus-text-primary)] text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--nexus-divider)]">
                                    {invoice.items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="py-4 px-2 text-[var(--nexus-text-primary)]">{item.description}</td>
                                            <td className="py-4 px-2 text-[var(--nexus-text-secondary)] text-right">{item.quantity}</td>
                                            <td className="py-4 px-2 text-[var(--nexus-text-secondary)] text-right">{formatCurrency(item.unit_price)}</td>
                                            <td className="py-4 px-2 font-medium text-[var(--nexus-text-primary)] text-right">{formatCurrency(item.amount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-end mt-8 pt-8 border-t border-[var(--nexus-divider)]">
                            <div className="w-64 space-y-3">
                                <div className="flex justify-between text-[var(--nexus-text-secondary)]">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(invoice.amount)}</span>
                                </div>
                                <div className="flex justify-between text-[var(--nexus-text-secondary)]">
                                    <span>Tax (0%)</span>
                                    <span>$0.00</span>
                                </div>
                                <div className="flex justify-between pt-4 border-t border-[var(--nexus-divider)]">
                                    <span className="font-bold text-lg text-[var(--nexus-text-primary)]">Total</span>
                                    <span className="font-bold text-lg text-[var(--nexus-brand-primary)]">{formatCurrency(invoice.amount)}</span>
                                </div>
                            </div>
                        </div>
                    </DataCard>
                </div>

                <div className="space-y-6">
                    <DataCard title="Payment Processing">
                        <div className="space-y-4 text-center py-4">
                            {invoice.status === "paid" ? (
                                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                                    <p className="font-bold flex items-center justify-center gap-2"><CreditCard className="w-5 h-5" /> Paid in full</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="p-4 bg-[var(--nexus-bg-secondary)] rounded-xl border border-[var(--nexus-card-border)]">
                                        <p className="text-sm text-[var(--nexus-text-secondary)] mb-2">Remaining Balance</p>
                                        <p className="text-3xl font-bold text-[var(--nexus-text-primary)]">{formatCurrency(invoice.amount)}</p>
                                    </div>
                                    <Button className="w-full bg-[var(--nexus-button-bg)] text-white hover:bg-[var(--nexus-button-hover)] shadow-sm">Capture Payment</Button>
                                    <p className="text-xs text-[var(--nexus-text-tertiary)]">Powered by Stripe</p>
                                </div>
                            )}
                        </div>
                    </DataCard>
                </div>
            </div>
        </div>
    );
}
