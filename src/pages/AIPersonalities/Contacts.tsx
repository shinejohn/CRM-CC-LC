import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  ArrowLeft,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import {
  contactCustomer,
  scheduleContact,
  getContactPreferences,
  updateContactPreferences,
  type ContactPreferences,
} from '@/services/personalities/contact-api';
import { getCustomerPersonality, type PersonalityAssignment } from '@/services/personalities/personality-api';
import { getCustomer, type Customer } from '@/services/crm/crm-api';

export const AIPersonalityContactsPage: React.FC = () => {
  const [customerId, setCustomerId] = useState<string>('');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [assignment, setAssignment] = useState<PersonalityAssignment | null>(null);
  const [preferences, setPreferences] = useState<ContactPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [contactForm, setContactForm] = useState({
    contact_type: 'email' as 'email' | 'sms' | 'call' | 'phone',
    message: '',
    subject: '',
    purpose: '',
  });

  const [scheduleForm, setScheduleForm] = useState({
    contact_type: 'email' as 'email' | 'sms' | 'call' | 'phone',
    scheduled_at: '',
    message: '',
  });

  useEffect(() => {
    if (customerId) {
      loadCustomerData();
    }
  }, [customerId]);

  const loadCustomerData = async () => {
    if (!customerId) return;
    
    setLoading(true);
    try {
      const [customerData, assignmentData, preferencesData] = await Promise.all([
        getCustomer(customerId),
        getCustomerPersonality(customerId),
        getContactPreferences(customerId),
      ]);
      setCustomer(customerData);
      setAssignment(assignmentData);
      setPreferences(preferencesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customer data');
    } finally {
      setLoading(false);
    }
  };

  const handleContact = async () => {
    if (!customerId) {
      setError('Customer ID is required');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await contactCustomer({
        customer_id: customerId,
        contact_type: contactForm.contact_type,
        message: contactForm.message || undefined,
        subject: contactForm.subject || undefined,
        purpose: contactForm.purpose || undefined,
      });
      setSuccess(true);
      setContactForm({ contact_type: 'email', message: '', subject: '', purpose: '' });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to contact customer');
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async () => {
    if (!customerId) {
      setError('Customer ID is required');
      return;
    }

    if (!scheduleForm.scheduled_at) {
      setError('Please select a date and time');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await scheduleContact({
        customer_id: customerId,
        contact_type: scheduleForm.contact_type,
        scheduled_at: scheduleForm.scheduled_at,
        options: {
          message: scheduleForm.message || undefined,
        },
      });
      setSuccess(true);
      setScheduleForm({ contact_type: 'email', scheduled_at: '', message: '' });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule contact');
    } finally {
      setLoading(false);
    }
  };

  // Get customer ID from URL params or prompt
  const handleCustomerIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerId(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              to="/ai-personalities"
              className="text-gray-600 hover:text-gray-900 inline-flex items-center"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Personality Contacts</h1>
              <p className="text-gray-600 mt-1">Contact customers using their assigned personality</p>
            </div>
          </div>
        </div>

        {/* Customer ID Input */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer ID
          </label>
          <input
            type="text"
            value={customerId}
            onChange={handleCustomerIdChange}
            placeholder="Enter customer ID"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            onClick={loadCustomerData}
            className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Load Customer
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <p className="text-green-800">Operation completed successfully</p>
            </div>
          </div>
        )}

        {customer && (
          <>
            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Business Name</p>
                  <p className="font-medium text-gray-900">{customer.business_name}</p>
                </div>
                {assignment && (
                  <div>
                    <p className="text-sm text-gray-500">Assigned Personality</p>
                    <p className="font-medium text-gray-900">
                      {assignment.personality?.identity || 'None'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Preferences */}
            {preferences && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Preferences</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Preferred Channel</p>
                    <p className="font-medium text-gray-900">{preferences.preferred_channel}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Allowed Channels</p>
                    <p className="font-medium text-gray-900">
                      {preferences.allowed_channels.join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Send Contact */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Send Contact</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Type
                  </label>
                  <select
                    value={contactForm.contact_type}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, contact_type: e.target.value as any })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="call">Phone Call</option>
                  </select>
                </div>

                {contactForm.contact_type === 'email' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Email subject"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message (Optional - will use personality AI if not provided)
                  </label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Leave empty for AI-generated message"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purpose (Optional)
                  </label>
                  <input
                    type="text"
                    value={contactForm.purpose}
                    onChange={(e) => setContactForm({ ...contactForm, purpose: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., follow-up, onboarding, support"
                  />
                </div>

                <button
                  onClick={handleContact}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Contact
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Schedule Contact */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Schedule Contact</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Type
                  </label>
                  <select
                    value={scheduleForm.contact_type}
                    onChange={(e) =>
                      setScheduleForm({ ...scheduleForm, contact_type: e.target.value as any })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="call">Phone Call</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scheduled Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduleForm.scheduled_at}
                    onChange={(e) =>
                      setScheduleForm({ ...scheduleForm, scheduled_at: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    value={scheduleForm.message}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, message: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Leave empty for AI-generated message"
                  />
                </div>

                <button
                  onClick={handleSchedule}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Contact
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
