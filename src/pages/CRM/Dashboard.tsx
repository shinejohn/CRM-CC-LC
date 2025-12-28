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

export const CrmDashboardPage: React.FC = () => {
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
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Customers */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Customers</p>
              <Users className="h-5 w-5 text-indigo-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{analytics.customers.total}</p>
            <p className="text-sm text-gray-500 mt-1">
              {analytics.customers.new} new in last {days} days
            </p>
            <Link
              to="/crm/customers"
              className="text-sm text-indigo-600 hover:text-indigo-700 mt-2 inline-flex items-center"
            >
              View all <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {/* Total Revenue */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(analytics.orders.total_revenue)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {formatCurrency(analytics.orders.recent_revenue)} in last {days} days
            </p>
          </div>

          {/* Active Subscriptions */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Active Subscriptions</p>
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{analytics.subscriptions.active}</p>
            <p className="text-sm text-gray-500 mt-1">Across all service tiers</p>
          </div>

          {/* Conversion Rate */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{analytics.conversion.rate}%</p>
            <p className="text-sm text-gray-500 mt-1">
              {analytics.conversion.conversations_with_purchase} purchases from conversations
            </p>
          </div>
        </div>

        {/* Quick Links to Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Link
            to="/crm/analytics/interest"
            className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Interest Monitoring</h3>
                <p className="text-sm text-gray-500 mt-1">Track customer interests</p>
              </div>
              <MessageCircle className="h-5 w-5 text-indigo-600" />
            </div>
          </Link>
          <Link
            to="/crm/analytics/purchases"
            className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Purchase Tracking</h3>
                <p className="text-sm text-gray-500 mt-1">Monitor sales & revenue</p>
              </div>
              <ShoppingCart className="h-5 w-5 text-green-600" />
            </div>
          </Link>
          <Link
            to="/crm/analytics/learning"
            className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Learning Analytics</h3>
                <p className="text-sm text-gray-500 mt-1">Track engagement</p>
              </div>
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
          </Link>
          <Link
            to="/crm/campaigns"
            className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Campaigns</h3>
                <p className="text-sm text-gray-500 mt-1">Manage campaigns</p>
              </div>
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
          </Link>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Conversations */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Conversations</h3>
              <MessageCircle className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-2xl font-bold text-gray-900">{analytics.conversations.total}</p>
                <p className="text-sm text-gray-500">Total conversations</p>
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-900">
                  {analytics.conversations.recent}
                </p>
                <p className="text-sm text-gray-500">In last {days} days</p>
              </div>
              {analytics.conversations.avg_duration_seconds && (
                <div>
                  <p className="text-xl font-semibold text-gray-900">
                    {formatDuration(analytics.conversations.avg_duration_seconds)}
                  </p>
                  <p className="text-sm text-gray-500">Average duration</p>
                </div>
              )}
            </div>
          </div>

          {/* Orders */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Orders</h3>
              <ShoppingCart className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-2xl font-bold text-gray-900">{analytics.orders.total}</p>
                <p className="text-sm text-gray-500">Total orders</p>
              </div>
              <div>
                <p className="text-xl font-semibold text-green-600">{analytics.orders.paid}</p>
                <p className="text-sm text-gray-500">Paid orders</p>
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-900">
                  {analytics.orders.recent}
                </p>
                <p className="text-sm text-gray-500">In last {days} days</p>
              </div>
            </div>
          </div>

          {/* Lead Score Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Lead Scores</h3>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">High (80+)</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {analytics.customers.by_lead_score.high}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${
                        (analytics.customers.by_lead_score.high / analytics.customers.total) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Medium (50-79)</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {analytics.customers.by_lead_score.medium}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${
                        (analytics.customers.by_lead_score.medium / analytics.customers.total) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Low (25-49)</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {analytics.customers.by_lead_score.low}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-600 h-2 rounded-full"
                    style={{
                      width: `${
                        (analytics.customers.by_lead_score.low / analytics.customers.total) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Cold (&lt;25)</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {analytics.customers.by_lead_score.cold}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gray-600 h-2 rounded-full"
                    style={{
                      width: `${
                        (analytics.customers.by_lead_score.cold / analytics.customers.total) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Customers */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Customers</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {analytics.recent_activity.customers.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No recent customers</div>
              ) : (
                analytics.recent_activity.customers.map((customer) => (
                  <Link
                    key={customer.id}
                    to={`/crm/customers/${customer.id}`}
                    className="p-4 hover:bg-gray-50 block"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{customer.business_name}</p>
                        {customer.email && (
                          <p className="text-sm text-gray-500 mt-1">{customer.email}</p>
                        )}
                        <div className="flex items-center mt-2">
                          <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-800 rounded">
                            Score: {customer.lead_score}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 ml-4">
                        {new Date(customer.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
            <div className="p-4 border-t border-gray-200">
              <Link
                to="/crm/customers"
                className="text-sm text-indigo-600 hover:text-indigo-700 inline-flex items-center"
              >
                View all customers <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {analytics.recent_activity.orders.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No recent orders</div>
              ) : (
                analytics.recent_activity.orders.map((order) => (
                  <div key={order.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{order.order_number}</p>
                        {order.customer?.business_name && (
                          <p className="text-sm text-gray-500 mt-1">
                            {order.customer.business_name}
                          </p>
                        )}
                        <div className="flex items-center mt-2 space-x-2">
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                            {formatCurrency(order.total)}
                          </span>
                          {order.payment_status === 'paid' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-600" />
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 ml-4">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Conversations */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Conversations</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {analytics.recent_activity.conversations.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No recent conversations</div>
              ) : (
                analytics.recent_activity.conversations.map((conversation) => (
                  <div key={conversation.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {conversation.customer?.business_name && (
                          <p className="font-medium text-gray-900">
                            {conversation.customer.business_name}
                          </p>
                        )}
                        {conversation.outcome && (
                          <p className="text-sm text-gray-500 mt-1 capitalize">
                            {conversation.outcome.replace('_', ' ')}
                          </p>
                        )}
                        <div className="flex items-center mt-2">
                          {conversation.duration_seconds && (
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                              {formatDuration(conversation.duration_seconds)}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 ml-4">
                        {new Date(conversation.started_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Industry Distribution & Subscription Tiers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customers by Industry */}
          {analytics.customers.by_industry.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Customers by Industry</h3>
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
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{
                            width: `${
                              (item.count / analytics.customers.total) * 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Subscriptions by Tier */}
          {analytics.subscriptions.by_tier.length > 0 && (
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
                            width: `${
                              (item.count / analytics.subscriptions.active) * 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
