import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Edit, Loader2, Mail, Phone, Globe, MapPin, TrendingUp, Building2 } from 'lucide-react';
import { customerApi, conversationApi, type Customer, type Conversation } from '@/services/crm/crm-api';

export const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadCustomer();
      loadConversations();
    }
  }, [id]);

  const loadCustomer = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await customerApi.get(id!);
      setCustomer(data);
    } catch (err) {
      console.error('Failed to load customer:', err);
      setError(err instanceof Error ? err.message : 'Failed to load customer');
    } finally {
      setLoading(false);
    }
  };

  const loadConversations = async () => {
    if (!id) return;
    try {
      const response = await conversationApi.list({ customer_id: id }, 1, 10);
      setConversations(response.data);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error || 'Customer not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/crm/customers')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Customers
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{customer.business_name}</h1>
              {customer.owner_name && (
                <p className="mt-1 text-lg text-gray-600">{customer.owner_name}</p>
              )}
            </div>
            <button
              onClick={() => navigate(`/crm/customers/${customer.id}/edit`)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Edit size={20} />
              Edit
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Business Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Business Information</h2>
              <div className="grid grid-cols-2 gap-4">
                {customer.business_description && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="mt-1 text-gray-900">{customer.business_description}</p>
                  </div>
                )}
                {customer.industry_category && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Industry</label>
                    <p className="mt-1 text-gray-900">
                      {customer.industry_category}
                      {customer.industry_subcategory && ` - ${customer.industry_subcategory}`}
                    </p>
                  </div>
                )}
                {customer.city && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Location</label>
                    <p className="mt-1 text-gray-900">
                      {customer.city}
                      {customer.state && `, ${customer.state}`}
                    </p>
                  </div>
                )}
                {customer.service_area && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500">Service Area</label>
                    <p className="mt-1 text-gray-900">{customer.service_area}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-3">
                {customer.email && (
                  <div className="flex items-center gap-3">
                    <Mail size={20} className="text-gray-400" />
                    <a href={`mailto:${customer.email}`} className="text-indigo-600 hover:underline">
                      {customer.email}
                    </a>
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center gap-3">
                    <Phone size={20} className="text-gray-400" />
                    <a href={`tel:${customer.phone}`} className="text-indigo-600 hover:underline">
                      {customer.phone}
                    </a>
                  </div>
                )}
                {customer.website && (
                  <div className="flex items-center gap-3">
                    <Globe size={20} className="text-gray-400" />
                    <a
                      href={customer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline"
                    >
                      {customer.website}
                    </a>
                  </div>
                )}
                {customer.address_line1 && (
                  <div className="flex items-start gap-3">
                    <MapPin size={20} className="text-gray-400 mt-1" />
                    <div>
                      <p className="text-gray-900">{customer.address_line1}</p>
                      {customer.address_line2 && <p className="text-gray-900">{customer.address_line2}</p>}
                      <p className="text-gray-900">
                        {customer.city}, {customer.state} {customer.zip}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Conversations */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Conversations</h2>
              {conversations.length === 0 ? (
                <p className="text-gray-500">No conversations yet</p>
              ) : (
                <div className="space-y-3">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/crm/conversations/${conversation.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {conversation.entry_point || 'Conversation'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(conversation.started_at).toLocaleDateString()}
                          </p>
                        </div>
                        {conversation.outcome && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {conversation.outcome}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Lead Score */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Lead Score</h2>
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24">
                  <svg className="transform -rotate-90 w-24 h-24">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(customer.lead_score / 100) * 251.2} 251.2`}
                      className={
                        customer.lead_score >= 70
                          ? 'text-green-500'
                          : customer.lead_score >= 40
                          ? 'text-yellow-500'
                          : 'text-gray-400'
                      }
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">{customer.lead_score}</span>
                  </div>
                </div>
                <div>
                  <TrendingUp
                    size={24}
                    className={
                      customer.lead_score >= 70
                        ? 'text-green-500'
                        : customer.lead_score >= 40
                        ? 'text-yellow-500'
                        : 'text-gray-400'
                    }
                  />
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Lead Source</label>
                  <p className="mt-1 text-gray-900">{customer.lead_source || '—'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="mt-1">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        customer.subscription_tier
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {customer.subscription_tier || 'Lead'}
                    </span>
                  </p>
                </div>
                {customer.first_contact_at && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">First Contact</label>
                    <p className="mt-1 text-gray-900">
                      {new Date(customer.first_contact_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {customer.onboarded_at && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Onboarded</label>
                    <p className="mt-1 text-gray-900">
                      {new Date(customer.onboarded_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
