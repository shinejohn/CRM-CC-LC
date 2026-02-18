import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, ChevronDown, Layout, List, Calendar, TrendingUp, Loader2 } from 'lucide-react';
import { DealCard } from '../components/DealCard';
import { dealsApi, type Deal, type DealStage } from '../../src/services/crm/deals-api';

const PIPELINE_STAGES: { id: DealStage; title: string; color: string }[] = [
  { id: 'hook', title: 'HOOK', color: 'border-blue-500' },
  { id: 'engagement', title: 'ENGAGEMENT', color: 'border-indigo-500' },
  { id: 'sales', title: 'SALES', color: 'border-purple-500' },
  { id: 'retention', title: 'RETENTION', color: 'border-emerald-500' },
];

function formatCurrency(value: string | number): string {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(n)) return '$0';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);
}

function dealToCardProps(deal: Deal) {
  const dueDate = deal.expected_close_at
    ? new Date(deal.expected_close_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '—';
  const owner = deal.contact?.name || deal.customer?.business_name || 'Unassigned';
  return {
    id: deal.id,
    company: deal.customer?.business_name || 'Unknown',
    title: deal.name,
    amount: formatCurrency(deal.value),
    probability: deal.probability ?? 0,
    owner,
    dueDate,
    priority: 'medium' as const,
    nextAction: {
      type: 'call' as const,
      date: dueDate,
      status: 'upcoming' as const,
    },
  };
}

export function PipelinePage({
  onNavigate,
}: {
  onNavigate: (page: string, id?: string) => void;
}) {
  const [byStage, setByStage] = useState<Record<DealStage, Deal[]>>({
    hook: [],
    engagement: [],
    sales: [],
    retention: [],
    won: [],
    lost: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [draggedDeal, setDraggedDeal] = useState<{ deal: Deal; fromStage: DealStage } | null>(null);
  const [targetStage, setTargetStage] = useState<DealStage | null>(null);

  const loadPipeline = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dealsApi.pipeline();
      setByStage({
        hook: data.hook ?? [],
        engagement: data.engagement ?? [],
        sales: data.sales ?? [],
        retention: data.retention ?? [],
        won: data.won ?? [],
        lost: data.lost ?? [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pipeline');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPipeline();
  }, [loadPipeline]);

  const handleStageTransition = async (dealId: string, newStage: DealStage) => {
    try {
      await dealsApi.transition(dealId, newStage);
      await loadPipeline();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update deal');
    }
  };

  const handleDragStart = (deal: Deal, stage: DealStage) => {
    if (['won', 'lost'].includes(stage)) return;
    setDraggedDeal({ deal, fromStage: stage });
  };

  const handleDragOver = (e: React.DragEvent, stage: DealStage) => {
    e.preventDefault();
    if (['won', 'lost'].includes(stage)) return;
    setTargetStage(stage);
  };

  const handleDragLeave = () => setTargetStage(null);

  const handleDrop = async (e: React.DragEvent, stage: DealStage) => {
    e.preventDefault();
    setTargetStage(null);
    if (draggedDeal && draggedDeal.fromStage !== stage) {
      await handleStageTransition(draggedDeal.deal.id, stage);
    }
    setDraggedDeal(null);
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-6rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-slate-600">Loading pipeline...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-6rem)] flex flex-col items-center justify-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadPipeline}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-[calc(100vh-6rem)] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-slate-900">💼 Pipeline</h1>
        <button
          onClick={() => onNavigate('deal-detail')}
          className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Deal
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 mb-6 shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
              <button className="p-1.5 bg-white shadow-sm rounded text-blue-600">
                <Layout className="w-4 h-4" />
              </button>
              <button className="p-1.5 text-slate-500 hover:text-slate-700">
                <List className="w-4 h-4" />
              </button>
              <button className="p-1.5 text-slate-500 hover:text-slate-700">
                <Calendar className="w-4 h-4" />
              </button>
              <button className="p-1.5 text-slate-500 hover:text-slate-700">
                <TrendingUp className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg w-64">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search deals..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent outline-none text-sm flex-1"
              />
            </div>

            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-medium text-slate-700 flex items-center gap-1">
                Owner <ChevronDown className="w-4 h-4" />
              </button>
              <button className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-medium text-slate-700 flex items-center gap-1">
                Account <ChevronDown className="w-4 h-4" />
              </button>
              <button className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-medium text-slate-700">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-medium text-slate-700 flex items-center gap-1">
            Group By <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 h-full min-w-max pb-4">
          {PIPELINE_STAGES.map((column) => {
            const deals = (byStage[column.id] ?? []).filter(
              (d) =>
                !search ||
                d.name.toLowerCase().includes(search.toLowerCase()) ||
                d.customer?.business_name?.toLowerCase().includes(search.toLowerCase())
            );
            const stageValue = deals.reduce((sum, d) => sum + (typeof d.value === 'number' ? d.value : parseFloat(String(d.value)) || 0), 0);

            return (
              <div
                key={column.id}
                className={`w-80 flex flex-col h-full rounded-xl border-2 transition-colors ${
                  targetStage === column.id ? 'border-blue-400 bg-blue-50/50' : 'border-transparent'
                }`}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {/* Column Header */}
                <div className={`bg-slate-100 rounded-t-xl p-4 border-t-4 ${column.color} shrink-0`}>
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-slate-700 text-sm">{column.title}</h3>
                    <span className="text-xs font-medium text-slate-500">{deals.length} deals</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">{formatCurrency(stageValue)}</span>
                    <div className="h-1.5 w-16 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-400"
                        style={{ width: `${Math.min(100, (deals.length / 10) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Deals List */}
                <div className="bg-slate-50/50 border-x border-b border-slate-200 rounded-b-xl p-3 flex-1 overflow-y-auto space-y-3">
                  {deals.map((deal) => (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={() => handleDragStart(deal, column.id)}
                      className={draggedDeal?.deal.id === deal.id ? 'opacity-50' : ''}
                    >
                      <DealCard
                        {...dealToCardProps(deal)}
                        onClick={() => onNavigate('deal-detail', deal.id)}
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => onNavigate('deal-detail')}
                    className="w-full py-2 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition-all text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> New Deal
                  </button>
                </div>
              </div>
            );
          })}

          {/* Won Column (Collapsed) */}
          <div
            className="w-12 bg-emerald-50 rounded-xl border border-emerald-100 flex flex-col items-center py-4 cursor-pointer hover:bg-emerald-100 transition-colors"
            onClick={() => onNavigate('deal-detail')}
          >
            <div
              className="writing-vertical text-emerald-800 font-bold text-sm tracking-wide rotate-180"
              style={{ writingMode: 'vertical-rl' }}
            >
              WON ({byStage.won?.length ?? 0})
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
