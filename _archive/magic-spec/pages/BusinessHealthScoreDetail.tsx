import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, DollarSign, Users, Mail, Wrench, Star, AlertCircle } from 'lucide-react';
import { useDashboardAnalytics } from '@/hooks/useAnalytics';

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

export function BusinessHealthScoreDetail({
  onBack
}: {
  onBack: () => void;
}) {
  const { data: analytics, isLoading } = useDashboardAnalytics();
  const orders = (analytics as { orders?: { total_revenue?: number; paid?: number; recent_revenue?: number } })?.orders;
  const customers = (analytics as { customers?: { total?: number; new?: number } })?.customers;
  const conversion = (analytics as { conversion?: { rate?: number } })?.conversion;
  const totalRevenue = orders?.total_revenue ?? 0;
  const paidOrders = orders?.paid ?? 0;
  const customerCount = customers?.total ?? 0;
  const newCustomers = customers?.new ?? 0;
  const conversionRate = conversion?.rate ?? 0;
  const revenueScore = Math.min(100, Math.round((totalRevenue / 10000) * 25));
  const customerScore = Math.min(100, customerCount * 2);
  const conversionScore = Math.min(100, Math.round(conversionRate));
  const overallScore = Math.round((revenueScore + customerScore + conversionScore) / 3);
  const aov = paidOrders > 0 ? totalRevenue / paidOrders : 0;

  const factors = [{
    title: 'Revenue Health',
    score: revenueScore,
    icon: DollarSign,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    barColor: 'bg-emerald-500',
    metrics: [`Monthly revenue: ${formatCurrency(totalRevenue)}`, `Revenue goal progress: ${Math.round((totalRevenue / 16000) * 100)}% on track`, `Average order value: ${formatCurrency(aov)}`],
    tip: totalRevenue > 0 ? "You're on track! Consider upselling to existing customers." : undefined
  }, {
    title: 'Customer Health',
    score: customerScore,
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    barColor: 'bg-blue-500',
    metrics: [`Active customers: ${customerCount} (▲ ${newCustomers} this period)`, 'Track at-risk customers', 'Customer satisfaction: —'],
    warning: customerCount === 0 ? 'Add customers to improve your score' : undefined,
    action: 'View At-Risk Customers'
  }, {
    title: 'Marketing Health',
    score: conversionScore,
    icon: Mail,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    barColor: 'bg-purple-500',
    metrics: [`Conversion rate: ${conversionRate.toFixed(1)}%`, 'Campaign performance', 'List growth: —'],
    success: conversionRate >= 50 ? 'Excellent! Your conversion is strong.' : undefined
  }, {
    title: 'Operations Health',
    score: Math.min(100, paidOrders * 2),
    icon: Wrench,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    barColor: 'bg-amber-500',
    metrics: [`Paid orders: ${paidOrders}`, 'Order completion rate', 'Overdue invoices: —'],
    warning: paidOrders === 0 ? 'Complete orders to improve operations score' : undefined,
    action: 'View Overdue Invoices'
  }, {
    title: 'Reputation Health',
    score: Math.min(100, customerCount + conversionRate),
    icon: Star,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    barColor: 'bg-yellow-500',
    metrics: ['Average rating: —', 'Reviews this month: —', 'Response rate: —'],
    tip: 'Request reviews from recent happy customers.',
    action: 'Send Review Requests'
  }];
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} className="max-w-5xl mx-auto pb-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Overview
        </button>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <span className="text-2xl">📊</span> Business Health Score Breakdown
        </h1>
        <div className="w-24" /> {/* Spacer */}
      </div>

      {/* Overall Score Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 flex flex-col items-center justify-center text-center">
          <h3 className="text-lg font-bold text-slate-900 mb-6">
            Overall Score
          </h3>
          <div className="relative w-48 h-24 overflow-hidden mb-4">
            <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[20px] border-slate-100 border-b-0 border-l-0 border-r-0 rotate-[-45deg]" />
            <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[20px] border-emerald-500 border-b-transparent border-l-transparent border-r-transparent rotate-[-45deg]" style={{
            clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)',
            transform: 'rotate(-45deg)'
          }} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
              <div className="text-5xl font-bold text-slate-900">{isLoading ? '—' : overallScore}</div>
              <div className={`text-sm font-medium ${overallScore >= 80 ? 'text-emerald-600' : overallScore >= 60 ? 'text-blue-600' : overallScore >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                {isLoading ? '—' : overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Good' : overallScore >= 40 ? 'Needs Work' : 'Critical'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-emerald-600 font-medium bg-emerald-50 px-3 py-1 rounded-full">
            <TrendingUp className="w-4 h-4" />
            <span>+5 from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Score History</h3>
            <button className="text-sm text-blue-600 font-medium hover:underline">
              View Full History
            </button>
          </div>
          <div className="h-40 flex items-end justify-between gap-2 px-2">
            {[75, 78, 82, 85, 87].map((val, i) => <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                <div className="relative w-full flex justify-center">
                  <div className="w-full max-w-[40px] bg-blue-100 rounded-t-lg group-hover:bg-blue-200 transition-colors relative" style={{
                height: `${val * 1.5}px`
              }}>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {val}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {['Sep', 'Oct', 'Nov', 'Dec', 'Jan'][i]}
                </span>
              </div>)}
          </div>
        </div>
      </div>

      {/* Contributing Factors */}
      <div>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">
          Contributing Factors
        </h2>
        <div className="space-y-6">
          {factors.map((factor, index) => <motion.div key={index} initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: index * 0.1
        }} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${factor.bgColor} flex items-center justify-center ${factor.color}`}>
                      <factor.icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-900">{factor.title}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-slate-900">
                      {factor.score}
                    </span>
                    <span className="text-slate-400 text-sm">/100</span>
                  </div>
                </div>

                <div className="h-2 bg-slate-100 rounded-full mb-6 overflow-hidden">
                  <motion.div initial={{
                width: 0
              }} animate={{
                width: `${factor.score}%`
              }} transition={{
                duration: 1,
                delay: 0.5 + index * 0.1
              }} className={`h-full rounded-full ${factor.barColor}`} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {factor.metrics.map((metric, i) => <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="text-slate-300 mt-1">•</span>
                      {metric}
                    </div>)}
                </div>

                {factor.tip && <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-3">
                    <span className="text-lg">💡</span>
                    <p className="text-sm text-blue-800 font-medium mt-0.5">
                      {factor.tip}
                    </p>
                    {factor.action && <button className="ml-auto text-xs font-bold text-blue-600 hover:underline whitespace-nowrap mt-1">
                        {factor.action}
                      </button>}
                  </div>}

                {factor.warning && <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    <p className="text-sm text-amber-800 font-medium mt-0.5">
                      {factor.warning}
                    </p>
                    {factor.action && <button className="ml-auto text-xs font-bold text-amber-700 hover:underline whitespace-nowrap mt-1">
                        {factor.action}
                      </button>}
                  </div>}

                {factor.success && <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 flex items-start gap-3">
                    <span className="text-lg">🌟</span>
                    <p className="text-sm text-emerald-800 font-medium mt-0.5">
                      {factor.success}
                    </p>
                  </div>}
              </div>
            </motion.div>)}
        </div>
      </div>

      {/* Improvement Recommendations */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h2 className="font-bold text-slate-900 mb-6">
          Improvement Recommendations
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
            <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            <span className="font-medium text-slate-900">
              Collect $1,200 in overdue invoices
            </span>
            <span className="ml-auto text-sm font-bold text-emerald-600">
              +2 points
            </span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
            <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <span className="font-medium text-slate-900">
              Re-engage 3 at-risk customers
            </span>
            <span className="ml-auto text-sm font-bold text-emerald-600">
              +3 points
            </span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="font-medium text-slate-900">
              Request 5 more reviews
            </span>
            <span className="ml-auto text-sm font-bold text-emerald-600">
              +2 points
            </span>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-600">
            Potential score with all improvements:{' '}
            <span className="font-bold text-slate-900">94/100</span>
          </p>
        </div>
      </div>
    </motion.div>;
}