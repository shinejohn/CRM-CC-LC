import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router';
import {
  Phone,
  ArrowLeft,
  Save,
  Calendar,
  Users,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import {
  createPhoneCampaign,
  getPhoneScripts,
  type PhoneScript,
  type CreatePhoneCampaignRequest,
} from '@/services/outbound/phone-api';

export const CreatePhoneCampaignPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [scripts, setScripts] = useState<PhoneScript[]>([]);
  const [formData, setFormData] = useState<CreatePhoneCampaignRequest>({
    name: '',
    message: '',
    scheduled_at: undefined,
    recipient_segments: {},
  });
  const [selectedScript, setSelectedScript] = useState<string>('');
  const [segments, setSegments] = useState({
    industry_category: '',
    lead_score_min: '',
    lead_score_max: '',
    has_phone: true,
  });

  useEffect(() => {
    loadScripts();
  }, []);

  const loadScripts = async () => {
    try {
      const data = await getPhoneScripts();
      setScripts(data);
    } catch (err) {
      console.error('Error loading scripts:', err);
    }
  };

  const handleScriptChange = (scriptId: string) => {
    const script = scripts.find((s) => s.id === scriptId);
    if (script) {
      setSelectedScript(scriptId);
      setFormData({ ...formData, message: script.script });
    }
  };

  const handleSegmentChange = (key: string, value: any) => {
    const newSegments = { ...segments, [key]: value };
    setSegments(newSegments);
    
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
    if (newSegments.has_phone) {
      recipientSegments.has_phone = true;
    }

    setFormData({ ...formData, recipient_segments: recipientSegments });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const campaign = await createPhoneCampaign({
        ...formData,
        template_id: selectedScript || undefined,
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/outbound" className="text-gray-600 hover:text-gray-900 inline-flex items-center">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Phone Campaign</h1>
              <p className="text-gray-600 mt-1">Make automated phone calls to your customers</p>
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
                  placeholder="e.g., Follow-up Calls"
                />
              </div>
            </div>
          </div>

          {scripts.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Call Script</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Script (Optional)
                </label>
                <select
                  value={selectedScript}
                  onChange={(e) => handleScriptChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">None - Write custom script</option>
                  {scripts.map((script) => (
                    <option key={script.id} value={script.id}>
                      {script.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Call Script Content</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Script Text <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={10}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter the script that will be read during the call..."
              />
              <p className="mt-2 text-sm text-gray-500">
                This will be converted to speech using text-to-speech. Use variables like {'{{customer_name}}'} and {'{{business_name}}'}.
              </p>
            </div>
          </div>

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
                    checked={segments.has_phone}
                    onChange={(e) => handleSegmentChange('has_phone', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Only include customers with phone numbers</span>
                </label>
              </div>
            </div>
          </div>

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
