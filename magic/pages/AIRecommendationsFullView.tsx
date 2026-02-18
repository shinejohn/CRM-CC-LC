import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, DollarSign, Users, Clock, TrendingUp, Search } from 'lucide-react';

const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:8000/api/v1';

interface Recommendation {
  priority: string;
  category: string;
  title: string;
  impact: string;
  description: string;
  actions: string[];
}

type RecWithStyle = Recommendation & { icon?: typeof DollarSign; color?: string; bgColor?: string; borderColor?: string };

const iconMap: Record<string, typeof DollarSign> = {
  engagement: Users,
  sales: DollarSign,
  marketing: TrendingUp,
  general: Search,
};

export function AIRecommendationsFullView({
  onBack
}: {
  onBack: () => void;
}) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
    fetch(`${API_BASE}/crm/recommendations`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
    })
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((res) => setRecommendations(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setRecommendations([]))
      .finally(() => setLoading(false));
  }, []);

  const fallbackRecommendations: RecWithStyle[] = [{
    priority: 'high',
    category: 'revenue',
    title: 'Collect Overdue Revenue',
    impact: '$1,200',
    description: '2 invoices are 30+ days overdue. This affects cash flow and business health score.',
    actions: ['Start Collections Sequence', 'View Invoices'],
    icon: DollarSign,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200'
  }, {
    priority: 'medium',
    category: 'engagement',
    title: 'Re-engage At-Risk Customers',
    impact: '$2,400 potential',
    description: "3 customers haven't booked in 60+ days. Historical value: $2,400/yr.",
    actions: ['Launch Re-engagement Campaign', 'View Customers'],
    icon: Users,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-200'
  }, {
    priority: 'medium',
    category: 'operations',
    title: 'Set Up Recurring Billing',
    impact: 'Save 5hrs',
    description: '15 customers are eligible for automatic monthly billing. This would save ~5 hours/month in manual invoicing.',
    actions: ['View Eligible Customers', 'Enable Recurring Billing'],
    icon: Clock,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-200'
  }, {
    priority: 'opportunity',
    category: 'marketing',
    title: 'Increase Email Frequency',
    impact: '+$800/mo',
    description: 'Your email open rates (28%) are 28% above industry average (22%). Increasing from 2x to 3x monthly could generate additional leads.',
    actions: ['Schedule Strategy Call', 'Adjust Email Frequency'],
    icon: TrendingUp,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    borderColor: 'border-emerald-200'
  }, {
    priority: 'opportunity',
    category: 'general',
    title: 'Add Jennifer (Content Creator)',
    impact: '+40% SEO',
    description: 'Your website has low organic traffic. Regular blog content could improve SEO by 40% and generate 10+ leads/month.',
    actions: ['Add Jennifer', 'View Details'],
    icon: Search,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    borderColor: 'border-emerald-200'
  }];

  const displayRecs: RecWithStyle[] = recommendations.length > 0
    ? recommendations.map((r) => ({
        ...r,
        icon: iconMap[r.category] ?? DollarSign,
        color: r.priority === 'high' ? 'text-red-600' : r.priority === 'medium' ? 'text-amber-600' : 'text-emerald-600',
        bgColor: r.priority === 'high' ? 'bg-red-100' : r.priority === 'medium' ? 'bg-amber-100' : 'bg-emerald-100',
        borderColor: r.priority === 'high' ? 'border-red-200' : r.priority === 'medium' ? 'border-amber-200' : 'border-emerald-200',
      }))
    : fallbackRecommendations;

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto pb-12">
        <div className="flex justify-center py-16 text-slate-600">Loading recommendations...</div>
      </motion.div>
    );
  }

  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} className="max-w-4xl mx-auto pb-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Overview
        </button>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <span className="text-2xl">💡</span> AI Recommendations
        </h1>
        <div className="w-24" /> {/* Spacer */}
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <select className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
          <option>Filter: All</option>
          <option>High Priority</option>
          <option>Medium Priority</option>
          <option>Opportunities</option>
        </select>
        <select className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
          <option>Category: All</option>
          <option>Revenue</option>
          <option>Marketing</option>
          <option>Operations</option>
        </select>
      </div>

      {/* Recommendations List */}
      <div className="space-y-8">
        {/* High Priority */}
        <div>
          <h3 className="text-sm font-bold text-red-600 uppercase tracking-wide mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600" /> High Priority
            (Action Required)
          </h3>
          <div className="space-y-4">
            {displayRecs.filter(r => r.priority === 'high').map((rec, index) => <RecommendationCard key={index} recommendation={rec} />)}
          </div>
        </div>

        {/* Medium Priority */}
        <div>
          <h3 className="text-sm font-bold text-amber-600 uppercase tracking-wide mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-600" /> Medium
            Priority (Attention Needed)
          </h3>
          <div className="space-y-4">
            {displayRecs.filter(r => r.priority === 'medium').map((rec, index) => <RecommendationCard key={index} recommendation={rec} />)}
          </div>
        </div>

        {/* Opportunities */}
        <div>
          <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wide mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />{' '}
            Opportunities (Growth Potential)
          </h3>
          <div className="space-y-4">
            {displayRecs.filter(r => r.priority === 'opportunity').map((rec, index) => <RecommendationCard key={index} recommendation={rec} />)}
          </div>
        </div>
      </div>
    </motion.div>;
}
function RecommendationCard({
  recommendation
}: {
  recommendation: RecWithStyle;
}) {
  const Icon = recommendation.icon ?? DollarSign;
  const bgColor = recommendation.bgColor ?? 'bg-slate-100';
  const color = recommendation.color ?? 'text-slate-600';
  return <motion.div initial={{
    opacity: 0,
    y: 10
  }} animate={{
    opacity: 1,
    y: 0
  }} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center ${color} shrink-0`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-lg">
                {recommendation.title}
              </h4>
              <p className="text-slate-600 mt-1 leading-relaxed">
                {recommendation.description}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${bgColor} ${color}`}>
              Impact: {recommendation.impact}
            </span>
          </div>
        </div>

        <div className="flex gap-3 pl-16">
          {recommendation.actions.map((action: string, i: number) => <button key={i} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${i === 0 ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
              {action}
            </button>)}
          <button className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors ml-auto">
            Dismiss
          </button>
        </div>
      </div>
    </motion.div>;
}