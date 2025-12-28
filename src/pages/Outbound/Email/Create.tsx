import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router';
import {
  Mail,
  ArrowLeft,
  Save,
  Send,
  Calendar,
  Users,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  X,
} from 'lucide-react';
import {
  createEmailCampaign,
  getEmailTemplates,
  type EmailTemplate,
  type CreateEmailCampaignRequest,
} from '@/services/outbound/email-api';
import { getCampaignRecipients } from '@/services/outbound/campaign-api';

export const CreateEmailCampaignPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [recipientCount, setRecipientCount] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateEmailCampaignRequest>({
    name: '',
    subject: '',
    message: '',
    scheduled_at: undefined,
    recipient_segments: {},
  });
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [segments, setSegments] = useState({
    industry_category: '',
    lead_score_min: '',
    lead_score_max: '',
    has_email: true,
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await getEmailTemplates();
      setTemplates(data);
    } catch (err) {
      console.error('Error loading templates:', err);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setFormData({
        ...formData,
        subject: template.subject,
        message: template.html_content,
      });
    }
  };

  const handleSegmentChange = (key: string, value: any) => {
    const newSegments = { ...segments, [key]: value };
    setSegments(newSegments);
    
    // Build recipient_segments object
    const recipientSegments: Record<string, any> = {};
    if (newSegments.industry_category) {
      recipientSegments.industry_category = newSegments.industry_category;
    }
    if (newSegments.lead_score_min) {
      recipientSegments.lead_score_min = parseInt(newSegments.lead_score_min);
    }
    if (newSegments.lead_score_max) {
      recipientSegments.lead_score_max = parseInt(newSegments.lead_score_max);
    }
    if (newSegments.has_email) {
      recipientSegments.has_email = true;
    }

    setFormData({ ...formData, recipient_segments: recipientSegments });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const campaign = await createEmailCampaign({
        ...formData,
        template_id: selectedTemplate || undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/outbound');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/outbound" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Email Campaign</h1>
              <p className="text-gray-600 mt-1">Send email campaigns to your customers</p>
            </div>
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

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <p className="text-green-800">Campaign created successfully! Redirecting...</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Campaign Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Weekly Newsletter"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Special Offer Inside!"
                />
              </div>
            </div>
          </div>

          {/* Template Selection */}
          {templates.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Template</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Template (Optional)
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">None - Write custom message</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Message Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Content</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HTML Content <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={12}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                placeholder="Enter HTML email content here..."
              />
              <p className="mt-2 text-sm text-gray-500">
                Use HTML for formatting. You can use variables like {'{{customer_name}}'} and {'{{business_name}}'}.
              </p>
            </div>
          </div>

          {/* Segmentation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recipient Segmentation</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry Category
                </label>
                <input
                  type="text"
                  value={segments.industry_category}
                  onChange={(e) => handleSegmentChange('industry_category', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Restaurants"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Lead Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={segments.lead_score_min}
                    onChange={(e) => handleSegmentChange('lead_score_min', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Lead Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={segments.lead_score_max}
                    onChange={(e) => handleSegmentChange('lead_score_max', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={segments.has_email}
                    onChange={(e) => handleSegmentChange('has_email', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Only include customers with email addresses</span>
                </label>
              </div>
            </div>
          </div>

          {/* Scheduling */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Scheduling</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schedule For (Optional)
              </label>
              <input
                type="datetime-local"
                value={formData.scheduled_at || ''}
                onChange={(e) =>
                  setFormData({ ...formData, scheduled_at: e.target.value || undefined })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="mt-2 text-sm text-gray-500">
                Leave empty to save as draft. Campaign will be scheduled for the specified time.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Link
              to="/outbound"
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Campaign
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
