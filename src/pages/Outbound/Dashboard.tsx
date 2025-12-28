import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  Mail,
  Phone,
  MessageSquare,
  Plus,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Play,
  Pause,
} from 'lucide-react';
import { listEmailCampaigns, type EmailCampaign } from '@/services/outbound/email-api';
import { listPhoneCampaigns, type PhoneCampaign } from '@/services/outbound/phone-api';
import { listSmsCampaigns, type SmsCampaign } from '@/services/outbound/sms-api';
import { getCampaignAnalytics, startCampaign } from '@/services/outbound/campaign-api';

type Campaign = EmailCampaign | PhoneCampaign | SmsCampaign;

export const OutboundDashboardPage: React.FC = () => {
  const [emailCampaigns, setEmailCampaigns] = useState<EmailCampaign[]>([]);
  const [phoneCampaigns, setPhoneCampaigns] = useState<PhoneCampaign[]>([]);
  const [smsCampaigns, setSmsCampaigns] = useState<SmsCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'email' | 'phone' | 'sms'>('all');

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const [email, phone, sms] = await Promise.all([
        listEmailCampaigns(),
        listPhoneCampaigns(),
        listSmsCampaigns(),
      ]);
      setEmailCampaigns(email);
      setPhoneCampaigns(phone);
      setSmsCampaigns(sms);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load campaigns');
      console.error('Error loading campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartCampaign = async (campaignId: string) => {
    try {
      await startCampaign(campaignId);
      loadCampaigns();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start campaign');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'running':
        return <Play className="h-4 w-4 text-blue-600" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-600" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-purple-100 text-purple-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const allCampaigns: Campaign[] = [
    ...emailCampaigns,
    ...phoneCampaigns,
    ...smsCampaigns,
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const filteredCampaigns = filter === 'all'
    ? allCampaigns
    : allCampaigns.filter((c) => c.type === filter);

  const stats = {
    total: allCampaigns.length,
    email: emailCampaigns.length,
    phone: phoneCampaigns.length,
    sms: smsCampaigns.length,
    running: allCampaigns.filter((c) => c.status === 'running').length,
    completed: allCampaigns.filter((c) => c.status === 'completed').length,
  };

  if (loading && allCampaigns.length === 0) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Outbound Campaigns</h1>
            <p className="text-gray-600 mt-1">Manage email, phone, and SMS campaigns</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={loadCampaigns}
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
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Campaigns</p>
              <TrendingUp className="h-5 w-5 text-indigo-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Email</p>
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.email}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Phone</p>
              <Phone className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.phone}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">SMS</p>
              <MessageSquare className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.sms}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Running</p>
              <Play className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.running}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Completed</p>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/outbound/email/create"
            className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Create Email Campaign</h3>
                <p className="text-sm text-gray-500">Send email campaigns to customers</p>
              </div>
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
          </Link>
          <Link
            to="/outbound/phone/create"
            className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Create Phone Campaign</h3>
                <p className="text-sm text-gray-500">Make automated phone calls</p>
              </div>
              <Phone className="h-8 w-8 text-green-600" />
            </div>
          </Link>
          <Link
            to="/outbound/sms/create"
            className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Create SMS Campaign</h3>
                <p className="text-sm text-gray-500">Send SMS messages</p>
              </div>
              <MessageSquare className="h-8 w-8 text-purple-600" />
            </div>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setFilter('all')}
              className={`${
                filter === 'all'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setFilter('email')}
              className={`${
                filter === 'email'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Email ({stats.email})
            </button>
            <button
              onClick={() => setFilter('phone')}
              className={`${
                filter === 'phone'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Phone ({stats.phone})
            </button>
            <button
              onClick={() => setFilter('sms')}
              className={`${
                filter === 'sms'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              SMS ({stats.sms})
            </button>
          </nav>
        </div>

        {/* Campaigns List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recipients
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No campaigns found. Create your first campaign using the buttons above.
                    </td>
                  </tr>
                ) : (
                  filteredCampaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                          {campaign.type === 'email' && 'subject' in campaign && (
                            <div className="text-sm text-gray-500">{campaign.subject}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full capitalize">
                          {campaign.type === 'email' && (
                            <span className="bg-blue-100 text-blue-800 flex items-center">
                              <Mail className="h-3 w-3 mr-1" /> Email
                            </span>
                          )}
                          {campaign.type === 'phone' && (
                            <span className="bg-green-100 text-green-800 flex items-center">
                              <Phone className="h-3 w-3 mr-1" /> Phone
                            </span>
                          )}
                          {campaign.type === 'sms' && (
                            <span className="bg-purple-100 text-purple-800 flex items-center">
                              <MessageSquare className="h-3 w-3 mr-1" /> SMS
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(campaign.status)}
                          <span
                            className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                              campaign.status
                            )}`}
                          >
                            {campaign.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {campaign.total_recipients}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {campaign.sent_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {campaign.status === 'draft' && (
                            <button
                              onClick={() => handleStartCampaign(campaign.id)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Start
                            </button>
                          )}
                          <Link
                            to={`/outbound/campaigns/${campaign.id}`}
                            className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                          >
                            View <ArrowRight className="h-4 w-4 ml-1" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
