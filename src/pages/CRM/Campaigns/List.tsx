import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  Plus,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Eye,
  Calendar,
  Filter,
  CheckCircle,
} from 'lucide-react';
import {
  getCampaignTemplates,
  generateCampaign,
  type CampaignTemplate,
  type GenerateCampaignRequest,
} from '@/services/crm/campaign-generation-api';
import { getCampaignPerformance, CampaignPerformance } from '@/services/crm/analytics-api';

export const CampaignListPage: React.FC = () => {
  const [templates, setTemplates] = useState<CampaignTemplate[]>([]);
  const [performance, setPerformance] = useState<CampaignPerformance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<CampaignTemplate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationForm, setGenerationForm] = useState<Partial<GenerateCampaignRequest>>({
    type: 'Educational',
    objective: '',
    topic: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [templatesData, performanceData] = await Promise.all([
        getCampaignTemplates(),
        getCampaignPerformance(30),
      ]);
      setTemplates(templatesData);
      setPerformance(performanceData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error loading campaign data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedTemplate || !generationForm.objective) {
      setError('Please select a template and provide an objective');
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      const request: GenerateCampaignRequest = {
        type: selectedTemplate.type,
        objective: generationForm.objective || '',
        topic: generationForm.topic || undefined,
        target_audience: generationForm.target_audience || undefined,
      };

      const campaign = await generateCampaign(request);
      // Show success message
      setError(null);
      setSuccessMessage(`Campaign ${campaign.campaign.id} generated successfully!`);
      // Reset form
      setSelectedTemplate(null);
      setGenerationForm({ type: 'Educational', objective: '', topic: '' });
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
      // Reload data to show new campaign
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate campaign');
      console.error('Error generating campaign:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
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
            <h1 className="text-3xl font-bold text-gray-900">Campaign Management</h1>
            <p className="text-gray-600 mt-1">Create and manage AI-powered marketing campaigns</p>
          </div>
          <Link
            to="/crm/dashboard"
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Back to Dashboard
          </Link>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <p className="text-green-800">{successMessage}</p>
              </div>
              <button
                onClick={() => setSuccessMessage(null)}
                className="text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Campaign Performance Summary */}
        {performance && performance.campaign_performance.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Campaign Performance</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {performance.campaign_performance.map((campaign, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="text-sm font-medium text-gray-900 capitalize mb-2">
                      {campaign.campaign_type}
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Sessions:</span>
                        <span className="font-medium">{campaign.total_sessions}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Conversions:</span>
                        <span className="font-medium text-green-600">{campaign.conversions}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Conversion Rate:</span>
                        <span className="font-medium">{campaign.conversion_rate}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Engagement:</span>
                        <span className="font-medium">{campaign.engagement_rate}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Campaign Templates */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Campaign Templates</h3>
            <p className="text-sm text-gray-600 mt-1">Choose a template to generate a new campaign</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div
                  key={template.type}
                  onClick={() => {
                    setSelectedTemplate(template);
                    setGenerationForm({ ...generationForm, type: template.type });
                  }}
                  className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedTemplate?.type === template.type
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-gray-900">{template.name}</h4>
                    {selectedTemplate?.type === template.type && (
                      <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500">
                      <strong>Best for:</strong> {template.best_for}
                    </div>
                    <div className="text-xs text-gray-500">
                      <strong>Duration:</strong> {template.duration} seconds ({template.slides} slides)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Campaign Generation Form */}
        {selectedTemplate && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Generate {selectedTemplate.name} Campaign
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Objective <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={generationForm.objective || ''}
                    onChange={(e) =>
                      setGenerationForm({ ...generationForm, objective: e.target.value })
                    }
                    placeholder="Describe the objective of this campaign (e.g., 'Educate SMBs about AI search replacing traditional SEO')"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                  <input
                    type="text"
                    value={generationForm.topic || ''}
                    onChange={(e) =>
                      setGenerationForm({ ...generationForm, topic: e.target.value })
                    }
                    placeholder="Optional: Specific topic or subject"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Audience
                  </label>
                  <input
                    type="text"
                    value={generationForm.target_audience || ''}
                    onChange={(e) =>
                      setGenerationForm({ ...generationForm, target_audience: e.target.value })
                    }
                    placeholder="Optional: Target audience (e.g., 'Small restaurants')"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      setSelectedTemplate(null);
                      setGenerationForm({ type: 'Educational', objective: '', topic: '' });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !generationForm.objective}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Generate Campaign
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Link to Campaign Landing Pages */}
        <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-indigo-900">View All Campaigns</h4>
              <p className="text-sm text-indigo-700 mt-1">
                Browse all campaign landing pages and manage existing campaigns
              </p>
            </div>
            <Link
              to="/learning/campaigns"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 inline-flex items-center"
            >
              View Campaigns <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
