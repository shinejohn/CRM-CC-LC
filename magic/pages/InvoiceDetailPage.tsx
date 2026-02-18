import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Edit,
  Download,
  Send,
  CheckCircle2,
  Calendar,
  DollarSign,
  Clock,
  AlertCircle,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { RecordPaymentModal } from '../components/RecordPaymentModal';
import { SendPaymentReminderModal } from '../components/SendPaymentReminderModal';
import { invoicesApi, type Invoice } from '../../src/services/crm/invoices-api';

function formatCurrency(value: string | number): string {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(n)) return '$0.00';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n);
}

function daysOverdue(dueDate?: string): number {
  if (!dueDate) return 0;
  const due = new Date(dueDate);
  const now = new Date();
  if (due >= now) return 0;
  return Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
}

export function InvoiceDetailPage({
  onBack,
  invoiceId,
}: {
  onBack: () => void;
  invoiceId?: string;
}) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);
  const [sendReminderOpen, setSendReminderOpen] = useState(false);

  const loadInvoice = () => {
    if (!invoiceId) return;
    setLoading(true);
    setError(null);
    invoicesApi
      .get(invoiceId)
      .then(setInvoice)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load invoice'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!invoiceId) {
      setLoading(false);
      setInvoice(null);
      return;
    }
    loadInvoice();
  }, [invoiceId]);

  const handleRecordPayment = async (data: { amount: string; date?: string; method?: string; reference?: string }) => {
    if (!invoiceId) return;
    try {
      const amount = parseFloat(String(data.amount).replace(/[$,]/g, '')) || 0;
      if (amount <= 0) return;
      await invoicesApi.recordPayment(invoiceId, {
        amount,
        payment_method: data.method,
        reference: data.reference,
      });
      loadInvoice();
      setRecordPaymentOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record payment');
    }
  };

  const handleSendReminder = async () => {
    if (!invoiceId) return;
    try {
      await invoicesApi.send(invoiceId);
      loadInvoice();
      setSendReminderOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reminder');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-slate-600">Loading invoice...</span>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="max-w-5xl mx-auto py-12 flex flex-col items-center">
        <p className="text-red-600 mb-4">{error || 'Invoice not found'}</p>
        <button onClick={onBack} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Back to Invoices
        </button>
      </div>
    );
  }

  const isOverdue = daysOverdue(invoice.due_date) > 0 && (typeof invoice.balance_due === 'number' ? invoice.balance_due : parseFloat(String(invoice.balance_due))) > 0;
  const balanceDue = typeof invoice.balance_due === 'number' ? invoice.balance_due : parseFloat(String(invoice.balance_due)) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto pb-12 space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Invoices
        </button>
        <div className="flex gap-3">
          <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Edit className="w-4 h-4" /> Edit
          </button>
          <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" /> PDF
          </button>
          {invoice.status !== 'sent' && invoice.status !== 'paid' && (
            <button
              onClick={() => setSendReminderOpen(true)}
              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" /> Send
            </button>
          )}
          {balanceDue > 0 && (
            <button
              onClick={() => setRecordPaymentOpen(true)}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Record Payment
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Invoice #{invoice.invoice_number}</h1>
        {isOverdue ? (
          <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-bold rounded-full flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> OVERDUE ({daysOverdue(invoice.due_date)} days)
          </span>
        ) : (
          <span className="px-3 py-1 bg-slate-100 text-slate-700 text-sm font-bold rounded-full">
            {invoice.status?.toUpperCase()}
          </span>
        )}
      </div>

      {/* Invoice Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">From</h3>
            <div className="text-sm text-slate-700 space-y-1">
              <p className="font-bold text-slate-900">Your Company</p>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">To</h3>
            <div className="text-sm text-slate-700 space-y-1">
              <p className="font-bold text-slate-900">{invoice.customer?.business_name}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 border-b border-slate-100">
          <div className="p-6 border-r border-slate-100">
            <p className="text-xs text-slate-500 uppercase mb-1">Invoice Date</p>
            <p className="font-medium text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />{' '}
              {invoice.created_at ? new Date(invoice.created_at).toLocaleDateString('en-US') : '—'}
            </p>
          </div>
          <div className="p-6 border-r border-slate-100">
            <p className="text-xs text-slate-500 uppercase mb-1">Due Date</p>
            <p className="font-medium text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />{' '}
              {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-US') : '—'}
            </p>
          </div>
          <div className="p-6 border-r border-slate-100">
            <p className="text-xs text-slate-500 uppercase mb-1">Amount Due</p>
            <p className="font-medium text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-slate-400" /> {formatCurrency(invoice.balance_due)}
            </p>
          </div>
          <div className={`p-6 ${isOverdue ? 'bg-red-50' : ''}`}>
            <p className={`text-xs uppercase mb-1 ${isOverdue ? 'text-red-600' : 'text-slate-500'}`}>
              Days Overdue
            </p>
            <p className={`font-bold flex items-center gap-2 ${isOverdue ? 'text-red-700' : 'text-slate-900'}`}>
              <Clock className="w-4 h-4" /> {daysOverdue(invoice.due_date)} days
            </p>
          </div>
        </div>

        <div className="p-8">
          <table className="w-full mb-8">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 text-xs font-bold text-slate-500 uppercase">Description</th>
                <th className="text-right py-3 text-xs font-bold text-slate-500 uppercase">Qty</th>
                <th className="text-right py-3 text-xs font-bold text-slate-500 uppercase">Rate</th>
                <th className="text-right py-3 text-xs font-bold text-slate-500 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(invoice.items ?? []).map((item, i) => (
                <tr key={i}>
                  <td className="py-4 text-sm text-slate-900">{item.description}</td>
                  <td className="py-4 text-right text-sm text-slate-600">{item.quantity}</td>
                  <td className="py-4 text-right text-sm text-slate-600">{formatCurrency(item.unit_price)}</td>
                  <td className="py-4 text-right text-sm font-medium text-slate-900">
                    {formatCurrency((item.quantity || 0) * (item.unit_price || 0))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal:</span>
                <span className="font-medium text-slate-900">{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Tax:</span>
                <span className="font-medium text-slate-900">{formatCurrency(invoice.tax)}</span>
              </div>
              <div className="flex justify-between text-base font-bold border-t border-slate-200 pt-3">
                <span className="text-slate-900">TOTAL:</span>
                <span className="text-slate-900">{formatCurrency(invoice.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Amount Paid:</span>
                <span className="font-medium text-slate-900">{formatCurrency(invoice.amount_paid)}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg flex justify-between text-base font-bold border border-slate-200">
                <span className="text-slate-900">BALANCE DUE:</span>
                <span className="text-slate-900">{formatCurrency(invoice.balance_due)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity & Related */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-6">Activity Timeline</h3>
          <div className="space-y-6 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-0 before:w-0.5 before:bg-slate-200">
            {(invoice.payments ?? []).map((pay, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Payment received: {formatCurrency(pay.amount)}</p>
                    <p className="text-xs text-slate-500">{pay.payment_method || '—'}</p>
                  </div>
                  <span className="text-xs text-slate-500">
                    {pay.paid_at ? new Date(pay.paid_at).toLocaleDateString('en-US') : '—'}
                  </span>
                </div>
              </div>
            ))}
            {(!invoice.payments || invoice.payments.length === 0) && (
              <p className="text-sm text-slate-500">No payments recorded yet.</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">Related</h3>
            <div className="space-y-3">
              {invoice.quote_id && (
                <button className="w-full flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm">
                  <span className="font-medium text-slate-700">View Proposal</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>
              )}
              <button className="w-full flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm">
                <span className="font-medium text-slate-700">View Account</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <RecordPaymentModal
        isOpen={recordPaymentOpen}
        onClose={() => setRecordPaymentOpen(false)}
        invoiceNumber={invoice.invoice_number}
        customer={invoice.customer?.business_name || 'Unknown'}
        amountDue={formatCurrency(invoice.balance_due)}
        onRecordPayment={handleRecordPayment}
      />
      <SendPaymentReminderModal
        isOpen={sendReminderOpen}
        onClose={() => setSendReminderOpen(false)}
        invoiceNumber={invoice.invoice_number}
        customer={invoice.customer?.business_name || 'Unknown'}
        amount={formatCurrency(invoice.balance_due)}
        daysOverdue={daysOverdue(invoice.due_date)}
        onSendReminder={() => handleSendReminder()}
      />
    </motion.div>
  );
}
