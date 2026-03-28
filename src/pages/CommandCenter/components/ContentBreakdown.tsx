import React from 'react';
import type { PublishingDashboard } from '@/services/command-center/publishing-api';

interface Props {
  dashboard: PublishingDashboard;
}

export const ContentBreakdown: React.FC<Props> = ({ dashboard }) => {
  return (
    <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Content Breakdown</h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{dashboard.content_stats.articles}</p>
            <p className="text-sm text-gray-500">Articles</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{dashboard.content_stats.blogs}</p>
            <p className="text-sm text-gray-500">Blogs</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{dashboard.content_stats.social}</p>
            <p className="text-sm text-gray-500">Social</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{dashboard.content_stats.review}</p>
            <p className="text-sm text-gray-500">In Review</p>
          </div>
        </div>
      </div>
    </div>
  );
};
