import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Share, Check, MessageSquare, Edit, X, Loader2 } from 'lucide-react';
import { quotesApi, type Quote } from '../../src/services/crm/quotes-api';

function formatCurrency(value: string | number): string {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(n)) return '$0';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n);
}

export function ProposalDetailPage({
  onBack,
  quoteId,
}: {
  onBack: () => void;
  quoteId?: string;
}) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!quoteId) {
      setLoading(false);
      setQuote(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    quotesApi
      .get(quoteId)
      .then((q) => {
        if (!cancelled) setQuote(q);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load quote');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [quoteId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-slate-600">Loading proposal...</span>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="max-w-4xl mx-auto py-12 flex flex-col items-center">
        <p className="text-red-600 mb-4">{error || 'Proposal not found'}</p>
        <button onClick={onBack} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Back
        </button>
      </div>
    );
  }

  const statusLabel = (quote.status || 'draft').toUpperCase();
  const statusColor =
    quote.status === 'accepted'
      ? 'bg-emerald-100 text-emerald-700'
      : quote.status === 'sent'
        ? 'bg-amber-100 text-amber-700'
        : 'bg-slate-100 text-slate-700';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto pb-12 space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Proposals
        </button>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" /> Download PDF
          </button>
          <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Share className="w-4 h-4" /> Share
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          {quote.quote_number} – {quote.customer?.business_name || 'Proposal'}
        </h1>
        <div className="flex items-center gap-4 text-sm">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${statusColor}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" /> {statusLabel}
          </span>
          <span className="text-slate-500">
            Created: {quote.created_at ? new Date(quote.created_at).toLocaleDateString('en-US') : '—'}
          </span>
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">Line Items</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 text-xs font-bold text-slate-500 uppercase">Description</th>
              <th className="text-right py-3 text-xs font-bold text-slate-500 uppercase">Qty</th>
              <th className="text-right py-3 text-xs font-bold text-slate-500 uppercase">Rate</th>
              <th className="text-right py-3 text-xs font-bold text-slate-500 uppercase">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(quote.items ?? []).map((item, i) => (
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
        <div className="flex justify-end mt-6">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Subtotal:</span>
              <span className="font-medium text-slate-900">{formatCurrency(quote.subtotal)}</span>
            </div>
            {Number(quote.tax) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Tax:</span>
                <span className="font-medium text-slate-900">{formatCurrency(quote.tax)}</span>
              </div>
            )}
            {Number(quote.discount) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Discount:</span>
                <span className="font-medium text-slate-900">-{formatCurrency(quote.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold border-t border-slate-200 pt-3">
              <span className="text-slate-900">TOTAL:</span>
              <span className="text-slate-900">{formatCurrency(quote.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decision Section */}
      {quote.status !== 'accepted' && quote.status !== 'rejected' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-6">Decision</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-left hover:bg-emerald-100 transition-colors group">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-3 group-hover:bg-emerald-200 transition-colors">
                <Check className="w-5 h-5 text-emerald-600" />
              </div>
              <h4 className="font-bold text-emerald-900 mb-1">Accept & Implement</h4>
              <p className="text-xs text-emerald-700">Start today</p>
            </button>
            <button className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-left hover:bg-blue-100 transition-colors group">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-bold text-blue-900 mb-1">Discuss with AI</h4>
              <p className="text-xs text-blue-700">Ask questions</p>
            </button>
            <button className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-left hover:bg-amber-100 transition-colors group">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mb-3 group-hover:bg-amber-200 transition-colors">
                <Edit className="w-5 h-5 text-amber-600" />
              </div>
              <h4 className="font-bold text-amber-900 mb-1">Modify Proposal</h4>
              <p className="text-xs text-amber-700">Adjust scope</p>
            </button>
          </div>
          <button className="w-full py-3 border border-slate-200 text-slate-500 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
            <X className="w-4 h-4" /> Decline Proposal
          </button>
        </div>
      )}
    </motion.div>
  );
}
