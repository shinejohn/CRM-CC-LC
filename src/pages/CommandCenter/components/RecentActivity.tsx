import React from 'react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import type { PublishingDashboard } from '@/services/command-center/publishing-api';

interface Props {
  dashboard: PublishingDashboard;
}

export const RecentActivity: React.FC<Props> = ({ dashboard }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Content</h2>
        </div>
        <div className="p-6">
          {dashboard.recent_content.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No content yet</p>
          ) : (
            <div className="space-y-4">
              {dashboard.recent_content.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-500">
                      {item.type} • {item.status}
                    </p>
                  </div>
                  <Link
                    to={`/command-center/content/${item.id}`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
          <Link
            to="/command-center/content"
            className="mt-4 block text-center text-indigo-600 hover:text-indigo-900 text-sm font-medium"
          >
            View all content →
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Ads</h2>
        </div>
        <div className="p-6">
          {dashboard.recent_ads.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No ads yet</p>
          ) : (
            <div className="space-y-4">
              {dashboard.recent_ads.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.platform} • {item.status}
                    </p>
                  </div>
                  <Link
                    to={`/command-center/ads/${item.id}`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
          <Link
            to="/command-center/ads"
            className="mt-4 block text-center text-indigo-600 hover:text-indigo-900 text-sm font-medium"
          >
            View all ads →
          </Link>
        </div>
      </div>
    </div>
  );
};
