import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LearningLayout } from '@/components/LearningCenter/Layout/LearningLayout';
import { Search, Play, ExternalLink, Filter, ChevronRight } from 'lucide-react';
import { campaignApi, type CampaignLandingPage } from '@/services/learning/campaign-api';

export const CampaignListPage: React.FC = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<CampaignLandingPage[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<CampaignLandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadCampaigns();
  }, []);

  useEffect(() => {
    filterCampaigns();
  }, [searchQuery, filterType, campaigns]);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const allCampaigns = await campaignApi.getAllCampaigns();
      setCampaigns(allCampaigns);
      setFilteredCampaigns(allCampaigns);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCampaigns = () => {
    let filtered = [...campaigns];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (campaign) =>
          campaign.template_name.toLowerCase().includes(query) ||
          campaign.landing_page_slug.toLowerCase().includes(query) ||
          campaign.campaign_id.toLowerCase().includes(query) ||
          campaign.ai_persona?.toLowerCase().includes(query)
      );
    }

    // Filter by type (campaign_id prefix)
    if (filterType !== 'all') {
      filtered = filtered.filter((campaign) =>
        campaign.campaign_id.startsWith(filterType.toUpperCase())
      );
    }

    setFilteredCampaigns(filtered);
  };

  const getCampaignType = (campaignId: string) => {
    if (campaignId.startsWith('HOOK')) return 'Hook';
    if (campaignId.startsWith('EDU')) return 'Educational';
    if (campaignId.startsWith('HOWTO')) return 'How-To';
    if (campaignId.startsWith('CASE')) return 'Case Study';
    return 'Other';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Hook':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'Educational':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'How-To':
        return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'Case Study':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const breadcrumbs = [
    { label: 'Learning Center', href: '/learning' },
    { label: 'Campaign Landing Pages' },
  ];

  if (loading) {
    return (
      <LearningLayout title="Campaign Landing Pages" breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600">Loading campaigns...</p>
          </div>
        </div>
      </LearningLayout>
    );
  }

  const uniqueTypes = Array.from(
    new Set(campaigns.map((c) => getCampaignType(c.campaign_id)))
  );

  return (
    <LearningLayout title="Campaign Landing Pages" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Campaign Landing Pages
          </h1>
          <p className="text-lg text-gray-600">
            {campaigns.length} landing pages available for your email campaigns
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search campaigns by name, slug, or ID..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <Filter size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
              >
                <option value="all">All Types</option>
                {uniqueTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600">{campaigns.length}</div>
            <div className="text-sm text-gray-600">Total Campaigns</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {campaigns.filter((c) => c.campaign_id.startsWith('HOOK')).length}
            </div>
            <div className="text-sm text-gray-600">Hook Campaigns</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {campaigns.filter((c) => c.campaign_id.startsWith('EDU')).length}
            </div>
            <div className="text-sm text-gray-600">Educational</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {campaigns.filter((c) => c.campaign_id.startsWith('HOWTO')).length}
            </div>
            <div className="text-sm text-gray-600">How-To Guides</div>
          </div>
        </div>

        {/* Campaign List */}
        {filteredCampaigns.length === 0 ? (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
            <p className="text-gray-600 mb-4">No campaigns found matching your criteria.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterType('all');
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => {
              const type = getCampaignType(campaign.campaign_id);
              return (
                <div
                  key={campaign.landing_page_slug}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/learn/${campaign.landing_page_slug}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium border ${getTypeColor(
                            type
                          )}`}
                        >
                          {type}
                        </span>
                        <span className="text-xs text-gray-500">{campaign.campaign_id}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {campaign.template_name}
                      </h3>
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Slug:</span>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        /learn/{campaign.landing_page_slug}
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Slides:</span>
                      <span>{campaign.slide_count}</span>
                      <span className="text-gray-400">•</span>
                      <span className="font-medium">Duration:</span>
                      <span>{campaign.duration_seconds}s</span>
                    </div>
                    {campaign.ai_persona && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">AI Persona:</span>
                        <span>{campaign.ai_persona}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/learn/${campaign.landing_page_slug}`);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Play size={16} />
                      View Landing Page
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </LearningLayout>
  );
};


