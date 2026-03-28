import React from 'react';
import { FileText, Megaphone, Eye, TrendingUp } from 'lucide-react';
import type { PublishingDashboard } from '@/services/command-center/publishing-api';

interface Props {
  dashboard: PublishingDashboard;
}

export const StatsOverview: React.FC<Props> = ({ dashboard }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-600">Total Content</p>
          <FileText className="h-5 w-5 text-indigo-600" />
        </div>
        <p className="text-3xl font-bold text-gray-900">{dashboard.content_stats.total}</p>
        <p className="text-sm text-gray-500 mt-1">
          {dashboard.content_stats.published} published
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-600">Total Ads</p>
          <Megaphone className="h-5 w-5 text-blue-600" />
        </div>
        <p className="text-3xl font-bold text-gray-900">{dashboard.ad_stats.total}</p>
        <p className="text-sm text-gray-500 mt-1">
          {dashboard.ad_stats.active} active
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-600">Ad Impressions</p>
          <Eye className="h-5 w-5 text-green-600" />
        </div>
        <p className="text-3xl font-bold text-gray-900">
          {dashboard.ad_stats.total_impressions.toLocaleString()}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {dashboard.ad_stats.total_clicks.toLocaleString()} clicks
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-600">Ad Spend</p>
          <TrendingUp className="h-5 w-5 text-purple-600" />
        </div>
        <p className="text-3xl font-bold text-gray-900">
          ${dashboard.ad_stats.total_spend.toFixed(2)}
        </p>
        <p className="text-sm text-gray-500 mt-1">Total spend</p>
      </div>
    </div>
  );
};
