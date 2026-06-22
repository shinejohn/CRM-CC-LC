import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, CreditCard, AlertCircle } from "lucide-react";
import {
    PageHeader,
    DataCard,
    StatusBadge,
    LoadingState,
    ConfirmDialog,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useInvoice, useSendInvoice } from "@/hooks/useInvoices";
import { RecordPaymentModal } from "./RecordPaymentModal";

type BadgeStatus = Parameters<typeof StatusBadge>[0]["status"];

const STATUS_BADGE: Record<string, BadgeStatus> = {
    draft: "draft",
    sent: "pending",
    pending: "pending",
    partial: "pending",
    paid: "completed",
    overdue: "overdue",
    cancelled: "cancelled",
    void: "cancelled",
};

const num = (value: string | number | undefined): number => Number(value ?? 0) || 0;

const formatCurrency = (value: string | number | undefined): string =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num(value));

const formatDate = (value?: string): string =>
    value
        ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
        : "—";

export default function InvoiceDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: invoice, isLoading, isError, refetch } = useInvoice(id ?? "");
    const sendInvoice = useSendInvoice();

    const [paymentOpen, setPaymentOpen] = useState(false);
    const [sendOpen, setSendOpen] = useState(false);

    if (isLoading) return <LoadingState variant="detail" />;

    if (isError || !invoice) {
        return (
            <DataCard>
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-[var(--nexus-bg-secondary)] border border-[var(--nexus-card-border)] flex items-center justify-center mb-4">
                        <AlertCircle className="w-8 h-8 text-[var(--nexus-accent-danger)]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--nexus-text-primary)] mb-2">
                        Couldn’t load invoice
                    </h3>
                    <p className="text-sm text-[var(--nexus-text-secondary)] max-w-md mb-6">
                        This invoice may not exist or there was a problem fetching it.
                    </p>
                    <div className="flex gap-3">
                        <Button type="button" variant="outline" onClick={() => refetch()}>
                            Retry
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
                            Back
                        </Button>
                    </div>
                </div>
            </DataCard>
        );
    }

    const items = invoice.items ?? [];
    const balanceDue = num(invoice.balance_due);
    const isPaid = invoice.status === "paid" || balanceDue <= 0;
    const customerName = invoice.customer?.business_name ?? "—";

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="text-[var(--nexus-text-secondary)] hover:bg-[var(--nexus-bg-secondary)]"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <div className="flex gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSendOpen(true)}
                        disabled={sendInvoice.isPending}
                        className="text-[var(--nexus-text-primary)] border-[var(--nexus-card-border)] hover:bg-[var(--nexus-bg-secondary)]"
                    >
                        <Send className="w-4 h-4 mr-2" /> Send Invoice
                    </Button>
                    {!isPaid && (
                        <Button
                            type="button"
                            onClick={() => setPaymentOpen(true)}
                            className="bg-[var(--nexus-button-bg)] text-white hover:bg-[var(--nexus-button-hover)] border-0"
                        >
                            <CreditCard className="w-4 h-4 mr-2" /> Record Payment
                        </Button>
                    )}
                </div>
            </div>

            <PageHeader
                title={invoice.invoice_number}
                breadcrumbs={[
                    { label: "Billing", href: "/command-center/billing/collections" },
                    { label: "Invoices", href: "/command-center/deliver/invoices" },
                    { label: invoice.invoice_number },
                ]}
                actions={<StatusBadge status={STATUS_BADGE[invoice.status] ?? "draft"} size="md" />}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <DataCard className="relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--nexus-brand-primary)] opacity-5 rounded-bl-[100px] pointer-events-none" />

                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-[var(--nexus-text-primary)]">INVOICE</h3>
                                <p className="text-[var(--nexus-text-secondary)] mt-1">
                                    {invoice.invoice_number}
                                </p>
                            </div>
                            <div className="text-right">
                                <h4 className="font-bold text-[var(--nexus-text-primary)]">Fibonacco Platform</h4>
                                <p className="text-sm text-[var(--nexus-text-secondary)]">123 Tech Lane</p>
                                <p className="text-sm text-[var(--nexus-text-secondary)]">San Francisco, CA 94105</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-[var(--nexus-divider)]">
                            <div>
                                <p className="text-xs font-bold text-[var(--nexus-text-tertiary)] uppercase tracking-wider mb-2">
                                    Billed To
                                </p>
                                <p className="font-bold text-[var(--nexus-text-primary)]">{customerName}</p>
                                {invoice.customer?.id && (
                                    <Button
                                        type="button"
                                        variant="link"
                                        className="px-0 text-[var(--nexus-accent-primary)] h-auto"
                                        onClick={() => navigate(`/command-center/crm/customers/${invoice.customer?.id}`)}
                                    >
                                        View Customer Profile
                                    </Button>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-bold text-[var(--nexus-text-tertiary)] uppercase tracking-wider mb-1">
                                        Issue Date
                                    </p>
                                    <p className="font-medium text-[var(--nexus-text-primary)]">
                                        {formatDate(invoice.sent_at ?? invoice.created_at)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-[var(--nexus-text-tertiary)] uppercase tracking-wider mb-1">
                                        Due Date
                                    </p>
                                    <p className="font-medium text-[var(--nexus-text-primary)]">
                                        {formatDate(invoice.due_date)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-[var(--nexus-divider)]">
                                        <th className="py-3 px-2 text-sm font-semibold text-[var(--nexus-text-secondary)]">
                                            Description
                                        </th>
                                        <th className="py-3 px-2 text-sm font-semibold text-[var(--nexus-text-secondary)] text-right">
                                            Qty
                                        </th>
                                        <th className="py-3 px-2 text-sm font-semibold text-[var(--nexus-text-secondary)] text-right">
                                            Unit Price
                                        </th>
                                        <th className="py-3 px-2 text-sm font-semibold text-[var(--nexus-text-primary)] text-right">
                                            Amount
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--nexus-divider)]">
                                    {items.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="py-6 px-2 text-center text-[var(--nexus-text-tertiary)]"
                                            >
                                                No line items on this invoice.
                                            </td>
                                        </tr>
                                    ) : (
                                        items.map((item, index) => (
                                            <tr key={item.id ?? index}>
                                                <td className="py-4 px-2 text-[var(--nexus-text-primary)]">
                                                    {item.description}
                                                </td>
                                                <td className="py-4 px-2 text-[var(--nexus-text-secondary)] text-right">
                                                    {item.quantity}
                                                </td>
                                                <td className="py-4 px-2 text-[var(--nexus-text-secondary)] text-right">
                                                    {formatCurrency(item.unit_price)}
                                                </td>
                                                <td className="py-4 px-2 font-medium text-[var(--nexus-text-primary)] text-right">
                                                    {formatCurrency(item.total ?? num(item.unit_price) * num(item.quantity))}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-end mt-8 pt-8 border-t border-[var(--nexus-divider)]">
                            <div className="w-64 space-y-3">
                                <div className="flex justify-between text-[var(--nexus-text-secondary)]">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(invoice.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-[var(--nexus-text-secondary)]">
                                    <span>Discount</span>
                                    <span>{formatCurrency(invoice.discount)}</span>
                                </div>
                                <div className="flex justify-between text-[var(--nexus-text-secondary)]">
                                    <span>Tax</span>
                                    <span>{formatCurrency(invoice.tax)}</span>
                                </div>
                                <div className="flex justify-between pt-4 border-t border-[var(--nexus-divider)]">
                                    <span className="font-bold text-lg text-[var(--nexus-text-primary)]">Total</span>
                                    <span className="font-bold text-lg text-[var(--nexus-brand-primary)]">
                                        {formatCurrency(invoice.total)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </DataCard>
                </div>

                <div className="space-y-6">
                    <DataCard title="Payment">
                        <div className="space-y-4 text-center py-4">
                            {isPaid ? (
                                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                                    <p className="font-bold flex items-center justify-center gap-2">
                                        <CreditCard className="w-5 h-5" /> Paid in full
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="p-4 bg-[var(--nexus-bg-secondary)] rounded-xl border border-[var(--nexus-card-border)]">
                                        <p className="text-sm text-[var(--nexus-text-secondary)] mb-2">
                                            Remaining Balance
                                        </p>
                                        <p className="text-3xl font-bold text-[var(--nexus-text-primary)]">
                                            {formatCurrency(balanceDue)}
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={() => setPaymentOpen(true)}
                                        className="w-full bg-[var(--nexus-button-bg)] text-white hover:bg-[var(--nexus-button-hover)] shadow-sm"
                                    >
                                        <CreditCard className="w-4 h-4 mr-2" /> Record Payment
                                    </Button>
                                </div>
                            )}
                            <div className="flex justify-between text-sm text-[var(--nexus-text-secondary)] pt-2">
                                <span>Amount Paid</span>
                                <span className="font-medium text-[var(--nexus-text-primary)]">
                                    {formatCurrency(invoice.amount_paid)}
                                </span>
                            </div>
                        </div>
                    </DataCard>

                    {(invoice.payments?.length ?? 0) > 0 && (
                        <DataCard title="Payment History">
                            <div className="space-y-3">
                                {invoice.payments?.map((payment) => (
                                    <div
                                        key={payment.id}
                                        className="flex items-start justify-between border-b border-[var(--nexus-divider)] pb-3 last:border-0 last:pb-0"
                                    >
                                        <div>
                                            <p className="font-medium text-[var(--nexus-text-primary)]">
                                                {formatCurrency(payment.amount)}
                                            </p>
                                            <p className="text-xs text-[var(--nexus-text-tertiary)]">
                                                {payment.payment_method ?? "Payment"}
                                                {payment.reference ? ` · ${payment.reference}` : ""}
                                            </p>
                                        </div>
                                        <p className="text-xs text-[var(--nexus-text-secondary)]">
                                            {formatDate(payment.paid_at)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </DataCard>
                    )}
                </div>
            </div>

            <RecordPaymentModal
                open={paymentOpen}
                onOpenChange={setPaymentOpen}
                invoiceId={invoice.id}
                balanceDue={balanceDue}
            />

            <ConfirmDialog
                open={sendOpen}
                onOpenChange={setSendOpen}
                title="Send invoice"
                description={`Send ${invoice.invoice_number} to ${customerName}? They will receive an email with the invoice.`}
                confirmLabel="Send"
                isLoading={sendInvoice.isPending}
                onConfirm={async () => {
                    try {
                        await sendInvoice.mutateAsync(invoice.id);
                        setSendOpen(false);
                    } catch {
                        // Error surfaces via the global api-error event; keep dialog open.
                    }
                }}
            />
        </div>
    );
}
