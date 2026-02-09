import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  Users,
  MessageCircle,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  BarChart3,
  Calendar,
  ArrowRight,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import { getCrmAnalytics, CrmAnalytics } from '@/services/crm/dashboard-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const CrmDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<CrmAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCrmAnalytics(days);
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
      console.error('Error loading CRM analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [days]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  if (loading && !analytics) {
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-800">Error: {error}</p>
            </div>
            <button
              onClick={loadAnalytics}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">CRM Dashboard</h1>
            <p className="text-gray-600 mt-1">Overview of your customer relationships and sales</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last year</option>
            </select>
            <button
              onClick={loadAnalytics}
              className="p-2 text-indigo-600 hover:text-indigo-900 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
              title="Refresh analytics"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Customers', value: analytics.customers.total, icon: Users, color: 'bg-blue-500' },
            { label: 'New Deals', value: analytics.revenue.deal_count, icon: ShoppingCart, color: 'bg-emerald-500' },
            { label: 'Open Conversations', value: analytics.interactions.open_conversations, icon: MessageCircle, color: 'bg-indigo-500' },
            { label: 'Avg. Value', value: formatCurrency(analytics.revenue.average_deal_value), icon: DollarSign, color: 'bg-purple-500' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer Pipeline */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Customer Pipeline</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {analytics.customers.by_stage.map((stage) => (
                  <div key={stage.stage}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-900 capitalize">{stage.stage}</span>
                      <span className="text-sm text-gray-600">{stage.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full"
                        style={{
                          width: `${(stage.count / analytics.customers.total) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Interactions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {analytics.interactions.recent.map((interaction) => (
                <div key={interaction.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {interaction.type === 'message' ? (
                        <MessageCircle className="h-5 w-5 text-blue-500" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      )}
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{interaction.customer_name}</p>
                      <p className="text-sm text-gray-500 truncate">{interaction.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{interaction.time_ago}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-200 text-center">
              <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                View all activity
              </button>
            </div>
          </div>
        </div>

        {/* Industry Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Industry Breakdown</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analytics.customers.by_industry.map((item) => (
                  <div key={item.industry}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-900">{item.industry}</span>
                      <span className="text-sm text-gray-600">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(item.count / analytics.customers.total) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Subscriptions by Tier</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analytics.subscriptions.by_tier.map((item) => (
                  <div key={item.tier}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {item.tier}
                      </span>
                      <span className="text-sm text-gray-600">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(item.count / analytics.subscriptions.active) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
