import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  FileText,
  Megaphone,
  Calendar,
  TrendingUp,
  Plus,
  RefreshCw,
  ArrowRight,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  BarChart3,
} from 'lucide-react';
import {
  getPublishingDashboard,
  type PublishingDashboard,
} from '@/services/command-center/publishing-api';
import { operationsApi } from '@/services/operations/operations-api';
import type { OperationsDashboardSnapshot } from '@/types/operations';

export const CommandCenterDashboardPage: React.FC = () => {
  const [dashboard, setDashboard] = useState<PublishingDashboard | null>(null);
  const [operationsSnapshot, setOperationsSnapshot] = useState<OperationsDashboardSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [operationsError, setOperationsError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    setOperationsError(null);
    try {
      const [publishingData, operationsData] = await Promise.all([
        getPublishingDashboard(),
        operationsApi.getDashboardSnapshot(),
      ]);
      setDashboard(publishingData);
      setOperationsSnapshot(operationsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      console.error('Error loading dashboard:', err);
      try {
        const operationsData = await operationsApi.getDashboardSnapshot();
        setOperationsSnapshot(operationsData);
      } catch (opsErr) {
        setOperationsError(
          opsErr instanceof Error ? opsErr.message : 'Failed to load operations snapshot'
        );
        console.error('Error loading operations snapshot:', opsErr);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && !dashboard) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="animate-spin h-8 w-8 text-indigo-600" />
          </div>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Command Center</h1>
            <p className="text-gray-600 mt-1">Content generation, ad creation, and publishing</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={loadDashboard}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Stats */}
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

        {/* Operations Snapshot */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Operations Snapshot</h2>
              {operationsSnapshot && (
                <p className="text-sm text-gray-500">
                  As of {operationsSnapshot.asOf.toLocaleString()}
                </p>
              )}
            </div>
            <BarChart3 className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="p-6">
            {operationsError && (
              <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                  <p className="text-yellow-800">{operationsError}</p>
                </div>
              </div>
            )}
            {operationsSnapshot ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-500">Overall Status</p>
                  <p className="text-xl font-semibold text-gray-900 capitalize">
                    {operationsSnapshot.infrastructure.overallStatus}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {operationsSnapshot.infrastructure.componentsHealthy} healthy ·{' '}
                    {operationsSnapshot.infrastructure.componentsDegraded} degraded
                  </p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-500">Active Alerts</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {operationsSnapshot.alerts.activeTotal}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {operationsSnapshot.alerts.activeCritical} critical ·{' '}
                    {operationsSnapshot.alerts.activeWarning} warning
                  </p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-500">Queue Depth</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {operationsSnapshot.system.queueDepthTotal.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Oldest item {operationsSnapshot.system.oldestQueueItemAge}s
                  </p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-500">MRR</p>
                  <p className="text-xl font-semibold text-gray-900">
                    ${operationsSnapshot.financial.mrr.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {operationsSnapshot.financial.mrrChangePercent30d}% 30d change
                  </p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-500">Costs (MTD)</p>
                  <p className="text-xl font-semibold text-gray-900">
                    ${operationsSnapshot.costs.mtdTotal.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Budget ${operationsSnapshot.costs.mtdBudget.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-500">Deliverability</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {operationsSnapshot.email.overallDeliverability.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {operationsSnapshot.email.ipsBlacklisted} IPs blacklisted
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No operations snapshot available yet.</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/command-center/content/create"
            className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Create Content</h3>
                <p className="text-sm text-gray-500">Generate articles, blogs, social posts</p>
              </div>
              <FileText className="h-8 w-8 text-indigo-600" />
            </div>
          </Link>
          <Link
            to="/command-center/ads/create"
            className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Create Ad</h3>
                <p className="text-sm text-gray-500">Generate ads for all platforms</p>
              </div>
              <Megaphone className="h-8 w-8 text-blue-600" />
            </div>
          </Link>
          <Link
            to="/command-center/publishing/calendar"
            className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Publishing Calendar</h3>
                <p className="text-sm text-gray-500">View scheduled content and ads</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </Link>
        </div>

        {/* Recent Content */}
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

          {/* Recent Ads */}
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

        {/* Content Breakdown */}
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
      </div>
    </div>
  );
};
