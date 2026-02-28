import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Edit,
  CheckCircle2,
  Star,
  Calendar,
  Mail,
  Phone,
  FileText,
  DollarSign,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import { MarkDealWonModal } from '../components/MarkDealWonModal';
import { MarkDealLostModal } from '../components/MarkDealLostModal';
import { dealsApi, type Deal } from '../../src/services/crm/deals-api';

function formatCurrency(value: string | number): string {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(n)) return '$0';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);
}

const STAGE_LABELS: Record<string, string> = {
  hook: 'Lead',
  engagement: 'Qualified',
  sales: 'Proposal',
  retention: 'Negotiate',
  won: 'Won',
  lost: 'Lost',
};

export function DealDetailPage({
  onBack,
  dealId,
}: {
  onBack: () => void;
  dealId?: string;
}) {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wonModalOpen, setWonModalOpen] = useState(false);
  const [lostModalOpen, setLostModalOpen] = useState(false);

  useEffect(() => {
    if (!dealId) {
      setLoading(false);
      setDeal(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    dealsApi
      .get(dealId)
      .then((d) => {
        if (!cancelled) setDeal(d);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load deal');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dealId]);

  const handleMarkWon = async (_data: { value?: string; date?: string; reason?: string; notes?: string }) => {
    if (!dealId) return;
    try {
      await dealsApi.transition(dealId, 'won');
      if (deal) setDeal({ ...deal, stage: 'won', probability: 100 });
      setWonModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark won');
    }
  };

  const handleMarkLost = async (data: { reason: string; competitor?: string; notes?: string }) => {
    if (!dealId) return;
    try {
      await dealsApi.transition(dealId, 'lost', data.reason);
      if (deal) setDeal({ ...deal, stage: 'lost', probability: 0, loss_reason: data.reason });
      setLostModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark lost');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-slate-600">Loading deal...</span>
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="max-w-6xl mx-auto py-12 flex flex-col items-center">
        <p className="text-red-600 mb-4">{error || 'Deal not found'}</p>
        <button onClick={onBack} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Back to Pipeline
        </button>
      </div>
    );
  }

  const stages = ['hook', 'engagement', 'sales', 'retention', 'won'];
  const currentIdx = stages.indexOf(deal.stage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto pb-12 space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Pipeline
        </button>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Edit className="w-4 h-4" /> Edit
          </button>
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
            <FileText className="w-4 h-4" /> Create Proposal
          </button>
          {!['won', 'lost'].includes(deal.stage) && (
            <>
              <button
                onClick={() => setWonModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Mark Won
              </button>
              <button
                onClick={() => setLostModalOpen(true)}
                className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm flex items-center gap-2"
              >
                Mark Lost
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-900">{deal.name}</h1>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i <= (deal.probability ?? 0) / 25 ? 'text-amber-400 fill-current' : 'text-slate-200'}`}
                />
              ))}
            </div>
          </div>
          <p className="text-lg text-slate-600">{deal.customer?.business_name || 'Unknown'}</p>
        </div>
      </div>

      {/* Pipeline Stage */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div className="relative flex justify-between items-center">
          <div className="absolute left-0 right-0 top-1/2 h-1 bg-slate-100 -z-10" />
          {stages.map((stage, i) => {
            const status =
              i < currentIdx ? 'completed' : i === currentIdx ? 'current' : 'upcoming';
            return (
              <div key={stage} className="flex flex-col items-center gap-2 bg-white px-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    status === 'completed'
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : status === 'current'
                        ? 'bg-white border-blue-600 text-blue-600'
                        : 'bg-white border-slate-200 text-slate-300'
                  }`}
                >
                  {status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-current" />
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${status === 'upcoming' ? 'text-slate-400' : 'text-slate-900'}`}
                >
                  {STAGE_LABELS[stage] || stage}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Expected Revenue', value: formatCurrency(deal.value), icon: DollarSign },
          { label: 'Probability', value: `${deal.probability ?? 0}%`, icon: TrendingUp },
          {
            label: 'Prorated Revenue',
            value: formatCurrency((Number(deal.value) * (deal.probability ?? 0)) / 100),
            icon: DollarSign,
          },
          {
            label: 'Close Date',
            value: deal.expected_close_at
              ? new Date(deal.expected_close_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : '—',
            icon: Calendar,
          },
        ].map((metric, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <p className="text-sm font-medium text-slate-500 mb-1">{metric.label}</p>
            <h3 className="text-2xl font-bold text-slate-900">{metric.value}</h3>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="border-b border-slate-100 flex overflow-x-auto">
              {['Overview', 'Proposals', 'Invoices', 'Activities', 'Files', 'Notes'].map((tab, i) => (
                <button
                  key={tab}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                    i === 0 ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-6 space-y-8">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 uppercase text-sm tracking-wide">Proposals</h3>
                  <button className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
                    <FileText className="w-4 h-4" /> New Proposal
                  </button>
                </div>
                <p className="text-sm text-slate-500">No proposals yet.</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 uppercase text-sm tracking-wide">Activity Feed</h3>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-700">
                      + Activity
                    </button>
                    <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-700">
                      + Note
                    </button>
                  </div>
                </div>
                <p className="text-sm text-slate-500">No activities yet.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">Deal Info</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Owner</p>
                <p className="text-sm font-medium text-slate-900">
                  {deal.contact?.name || 'Unassigned'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Stage</p>
                <p className="text-sm font-medium text-slate-900">{STAGE_LABELS[deal.stage] || deal.stage}</p>
              </div>
              {deal.notes && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Notes</p>
                  <p className="text-sm text-slate-700">{deal.notes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">Account & Contact</h3>
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 bg-slate-100 rounded">🏢</div>
                  <span className="font-bold text-slate-900">{deal.customer?.business_name || 'Unknown'}</span>
                </div>
                <button className="text-sm font-medium text-blue-600 hover:underline">View Account →</button>
              </div>
              {deal.contact && (
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1 bg-slate-100 rounded">👤</div>
                    <span className="font-bold text-slate-900">{deal.contact.name}</span>
                  </div>
                  {deal.contact.email && (
                    <p className="text-sm text-slate-600 mb-1">{deal.contact.email}</p>
                  )}
                  <div className="flex gap-2">
                    <button className="flex-1 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm font-medium text-slate-700 hover:bg-slate-100">
                      <Mail className="w-4 h-4 inline mr-1" /> Email
                    </button>
                    <button className="flex-1 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm font-medium text-slate-700 hover:bg-slate-100">
                      <Phone className="w-4 h-4 inline mr-1" /> Call
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <MarkDealWonModal
        isOpen={wonModalOpen}
        onClose={() => setWonModalOpen(false)}
        dealName={deal.name}
        onMarkWon={handleMarkWon}
      />
      <MarkDealLostModal
        isOpen={lostModalOpen}
        onClose={() => setLostModalOpen(false)}
        dealName={deal.name}
        expectedValue={formatCurrency(deal.value)}
        onMarkLost={handleMarkLost}
      />
    </motion.div>
  );
}
