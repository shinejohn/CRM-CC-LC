import React from 'react';
import { motion } from 'framer-motion';
import { Eye, MousePointerClick, Users, DollarSign, ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';
interface ServiceMetrics {
  views: number;
  clicks: number;
  leads: number;
  sales: number;
  viewsTrend?: number;
  clicksTrend?: number;
  leadsTrend?: number;
  salesTrend?: number;
}
interface ServiceMetricsCardProps {
  id: string;
  name: string;
  category: string;
  type: string;
  status: 'active' | 'paused';
  price: string;
  metrics: ServiceMetrics;
  onViewContent: () => void;
  onClick: () => void;
}
export function ServiceMetricsCard({
  id,
  name,
  category,
  type,
  status,
  price,
  metrics,
  onViewContent,
  onClick
}: ServiceMetricsCardProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };
  const renderTrend = (trend?: number) => {
    if (!trend) return null;
    const isPositive = trend > 0;
    return <span className={`flex items-center text-xs font-medium ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
        {Math.abs(trend)}%
      </span>;
  };
  return <motion.div whileHover={{
    y: -4
  }} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group" onClick={onClick}>
      {/* Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 text-sm leading-tight mb-1">
              {name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{category}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="font-medium text-slate-700">{price}</span>
            </div>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
            {status === 'active' ? 'Active' : 'Paused'}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Views */}
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-4 h-4 text-slate-500" />
              <span className="text-xs text-slate-600 font-medium">Views</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-bold text-slate-900">
                {formatNumber(metrics.views)}
              </span>
              {renderTrend(metrics.viewsTrend)}
            </div>
          </div>

          {/* Clicks */}
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <MousePointerClick className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-blue-700 font-medium">Clicks</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-bold text-blue-900">
                {formatNumber(metrics.clicks)}
              </span>
              {renderTrend(metrics.clicksTrend)}
            </div>
          </div>

          {/* Leads */}
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-purple-700 font-medium">Leads</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-bold text-purple-900">
                {formatNumber(metrics.leads)}
              </span>
              {renderTrend(metrics.leadsTrend)}
            </div>
          </div>

          {/* Sales */}
          <div className="bg-emerald-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span className="text-xs text-emerald-700 font-medium">
                Sales
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-bold text-emerald-900">
                {formatNumber(metrics.sales)}
              </span>
              {renderTrend(metrics.salesTrend)}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <button onClick={e => {
        e.stopPropagation();
        onViewContent();
      }} className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors group-hover:bg-blue-600">
          <ExternalLink className="w-4 h-4" />
          View Content Page
        </button>
      </div>
    </motion.div>;
}