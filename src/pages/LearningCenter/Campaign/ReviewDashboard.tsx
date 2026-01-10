import React, { useState, useEffect, useCallback } from 'react';
import { LearningLayout } from '@/components/LearningCenter/Layout/LearningLayout';
import { 
  Search, 
  Filter, 
  CheckCircle2,
  XCircle,
  Clock,
  Circle,
  Eye,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  FileText,
  Mail,
  X
} from 'lucide-react';
import { campaignApi, type CampaignLandingPage, type CampaignData } from '@/services/learning/campaign-api';
import ReactMarkdown from 'react-markdown';

type ReviewStatus = 'not_started' | 'in_progress' | 'needs_fix' | 'complete';

interface ReviewStatusData {
  [slug: string]: {
    status: ReviewStatus;
    notes: string;
    lastReviewed?: string;
  };
}

// Store review status in localStorage
const STORAGE_KEY = 'landing_pages_review_status';

function loadReviewStatus(): ReviewStatusData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveReviewStatus(status: ReviewStatusData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(status));
  } catch (error) {
    console.error('Failed to save review status:', error);
  }
}

export const ReviewDashboard: React.FC = () => {
  const [campaigns, setCampaigns] = useState<CampaignLandingPage[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<CampaignLandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [reviewStatus, setReviewStatus] = useState<ReviewStatusData>(loadReviewStatus());
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignLandingPage | null>(null);
  const [notes, setNotes] = useState('');
  const [campaignDetails, setCampaignDetails] = useState<Record<string, CampaignData>>({});
  const [previewMode, setPreviewMode] = useState<'preview' | 'article' | 'emails'>('preview');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewCampaignSlug, setPreviewCampaignSlug] = useState<string | null>(null);

  useEffect(() => {
    loadCampaigns();
  }, []);

  useEffect(() => {
    filterCampaigns();
  }, [searchQuery, filterType, filterStatus, campaigns, reviewStatus]);

  useEffect(() => {
    if (selectedCampaign) {
      const status = reviewStatus[selectedCampaign.landing_page_slug];
      setNotes(status?.notes || '');
    }
  }, [selectedCampaign, reviewStatus]);

  const loadCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const allCampaigns = await campaignApi.getAllCampaigns();
      console.log('Loaded campaigns:', allCampaigns.length);
      if (allCampaigns.length === 0) {
        setError('No campaigns found. Please check that landing_pages_master.json exists in public/campaigns/');
      }
      setCampaigns(allCampaigns);
      setFilteredCampaigns(allCampaigns);
      
      // Load campaign details to check migration status (load all for preview)
      const details: Record<string, CampaignData> = {};
      for (const campaign of allCampaigns) {
        try {
          const data = await campaignApi.getCampaignBySlug(campaign.landing_page_slug);
          if (data) {
            details[campaign.landing_page_slug] = data;
          }
        } catch (err) {
          console.error(`Failed to load details for ${campaign.landing_page_slug}:`, err);
        }
      }
      setCampaignDetails(details);
      
      // Auto-select first campaign for preview
      if (allCampaigns.length > 0 && !previewCampaignSlug) {
        setPreviewCampaignSlug(allCampaigns[0].landing_page_slug);
      }
    } catch (error) {
      console.error('Failed to load campaigns:', error);
      setError(`Failed to load campaigns: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

    // Filter by review status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((campaign) => {
        const status = reviewStatus[campaign.landing_page_slug]?.status || 'not_started';
        return status === filterStatus;
      });
    }

    setFilteredCampaigns(filtered);
  };

  const getCampaignType = (campaignId: string) => {
    if (campaignId.startsWith('HOOK')) return 'Hook';
    if (campaignId.startsWith('EDU')) return 'Educational';
    if (campaignId.startsWith('HOWTO')) return 'How-To';
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
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status: ReviewStatus) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 size={16} className="text-green-600" />;
      case 'needs_fix':
        return <XCircle size={16} className="text-red-600" />;
      case 'in_progress':
        return <Clock size={16} className="text-yellow-600" />;
      default:
        return <Circle size={16} className="text-gray-400" />;
    }
  };

  const getStatusLabel = (status: ReviewStatus) => {
    switch (status) {
      case 'complete':
        return 'Complete';
      case 'needs_fix':
        return 'Needs Fix';
      case 'in_progress':
        return 'In Progress';
      default:
        return 'Not Started';
    }
  };

  const getStatusColor = (status: ReviewStatus) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'needs_fix':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const updateStatus = useCallback((slug: string, status: ReviewStatus, notesText?: string) => {
    const newStatus = {
      ...reviewStatus,
      [slug]: {
        status,
        notes: notesText !== undefined ? notesText : reviewStatus[slug]?.notes || '',
        lastReviewed: new Date().toISOString(),
      },
    };
    setReviewStatus(newStatus);
    saveReviewStatus(newStatus);
  }, [reviewStatus]);

  const handleStatusChange = (campaign: CampaignLandingPage, newStatus: ReviewStatus) => {
    updateStatus(campaign.landing_page_slug, newStatus, notes);
    if (selectedCampaign?.landing_page_slug === campaign.landing_page_slug) {
      setSelectedCampaign(null);
    }
  };

  const handleNotesSave = () => {
    if (selectedCampaign) {
      const currentStatus = reviewStatus[selectedCampaign.landing_page_slug]?.status || 'not_started';
      updateStatus(selectedCampaign.landing_page_slug, currentStatus, notes);
    }
  };

  const getStatusCounts = () => {
    const counts = {
      not_started: 0,
      in_progress: 0,
      needs_fix: 0,
      complete: 0,
    };

    campaigns.forEach((campaign) => {
      const status = reviewStatus[campaign.landing_page_slug]?.status || 'not_started';
      counts[status]++;
    });

    return counts;
  };

  const statusCounts = getStatusCounts();
  const progress = campaigns.length > 0 
    ? Math.round((statusCounts.complete / campaigns.length) * 100) 
    : 0;

  const breadcrumbs = [
    { label: 'Learning Center', href: '/learning' },
    { label: 'Landing Pages Review' },
  ];

  if (loading) {
    return (
      <LearningLayout title="Landing Pages Review Dashboard" breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600">Loading campaigns...</p>
          </div>
        </div>
      </LearningLayout>
    );
  }

  if (error) {
    return (
      <LearningLayout title="Landing Pages Review Dashboard" breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center py-16">
          <div className="text-center max-w-md">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Campaigns</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadCampaigns}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Retry
            </button>
            <div className="mt-6 text-left bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
              <p className="font-semibold mb-2">Troubleshooting:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Check browser console for detailed errors</li>
                <li>Verify <code className="bg-gray-200 px-1 rounded">public/campaigns/landing_pages_master.json</code> exists</li>
                <li>Ensure dev server is running: <code className="bg-gray-200 px-1 rounded">npm run dev</code></li>
                <li>Check network tab for failed requests</li>
              </ul>
            </div>
          </div>
        </div>
      </LearningLayout>
    );
  }

  const uniqueTypes = campaigns.length > 0
    ? Array.from(new Set(campaigns.map((c) => getCampaignType(c.campaign_id))))
    : [];

  // Debug: Log current state
  console.log('ReviewDashboard render:', {
    loading,
    error,
    campaignsCount: campaigns.length,
    filteredCount: filteredCampaigns.length,
  });

  return (
    <LearningLayout title="Landing Pages Review Dashboard" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Landing Pages Review Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Review and track progress for all {campaigns.length} landing pages
          </p>
          <div className="mt-2 text-sm text-gray-500">
            {Object.keys(campaignDetails).length > 0 && (
              <span>
                {Object.keys(campaignDetails).filter(slug => isMigrated(slug)).length} campaigns with full content migrated
              </span>
            )}
          </div>
          {campaigns.length === 0 && !loading && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                <strong>No campaigns loaded.</strong> Check browser console for errors.
              </p>
            </div>
          )}
        </div>

        {/* Progress Overview */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold mb-1">Review Progress</h2>
              <p className="text-indigo-100">{progress}% Complete</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{statusCounts.complete}/{campaigns.length}</div>
              <div className="text-indigo-100 text-sm">Pages Reviewed</div>
            </div>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3 mb-4">
            <div
              className="bg-white rounded-full h-3 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-white/80">Not Started</div>
              <div className="text-2xl font-bold">{statusCounts.not_started}</div>
            </div>
            <div>
              <div className="text-white/80">In Progress</div>
              <div className="text-2xl font-bold">{statusCounts.in_progress}</div>
            </div>
            <div>
              <div className="text-white/80">Needs Fix</div>
              <div className="text-2xl font-bold">{statusCounts.needs_fix}</div>
            </div>
            <div>
              <div className="text-white/80">Complete</div>
              <div className="text-2xl font-bold">{statusCounts.complete}</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search campaigns..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <Filter size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
              >
                <option value="all">All Types</option>
                {uniqueTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="needs_fix">Needs Fix</option>
                <option value="complete">Complete</option>
              </select>
            </div>
          </div>
        </div>

        <div className={`grid gap-6 ${isFullscreen ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
          {/* Campaign List */}
          {!isFullscreen && (
          <div className="lg:col-span-1">
            {filteredCampaigns.length === 0 ? (
              <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
                <p className="text-gray-600 mb-4">No campaigns found matching your criteria.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterType('all');
                    setFilterStatus('all');
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCampaigns.map((campaign) => {
                  const type = getCampaignType(campaign.campaign_id);
                  const status = reviewStatus[campaign.landing_page_slug]?.status || 'not_started';
                  const isSelected = selectedCampaign?.landing_page_slug === campaign.landing_page_slug;
                  
                  return (
                    <div
                      key={campaign.landing_page_slug}
                      className={`bg-white border-2 rounded-lg p-4 transition-all ${
                        isSelected 
                          ? 'border-indigo-500 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusIcon(status)}
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium border ${getTypeColor(
                                type
                              )}`}
                            >
                              {type}
                            </span>
                            <span className="text-xs text-gray-500">{campaign.campaign_id}</span>
                            {isMigrated(campaign.landing_page_slug) && (
                              <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700 border border-green-300">
                                ✓ Migrated
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {campaign.template_name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              /learn/{campaign.landing_page_slug}
                            </code>
                            <span>{campaign.slide_count} slides</span>
                          </div>
                          {reviewStatus[campaign.landing_page_slug]?.notes && (
                            <p className="text-sm text-gray-600 italic mb-2">
                              {reviewStatus[campaign.landing_page_slug].notes.substring(0, 100)}
                              {reviewStatus[campaign.landing_page_slug].notes.length > 100 ? '...' : ''}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <button
                            onClick={() => {
                              if (isSelected) {
                                setSelectedCampaign(null);
                              } else {
                                setSelectedCampaign(campaign);
                                const statusData = reviewStatus[campaign.landing_page_slug];
                                setNotes(statusData?.notes || '');
                              }
                            }}
                            className={`px-3 py-1 text-xs rounded ${
                              isSelected
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {isSelected ? 'Hide Notes' : 'Add Notes'}
                          </button>
                          <button
                            onClick={() => {
                              setPreviewCampaignSlug(campaign.landing_page_slug);
                              setPreviewMode('preview');
                            }}
                            className={`px-3 py-1 text-xs rounded flex items-center gap-1 ${
                              previewCampaignSlug === campaign.landing_page_slug
                                ? 'bg-indigo-600 text-white'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}
                          >
                            <Eye size={12} />
                            {previewCampaignSlug === campaign.landing_page_slug ? 'Viewing' : 'View'}
                          </button>
                        </div>
                      </div>

                      {/* Status Selector */}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600 font-medium">Status:</span>
                          <div className="flex gap-1">
                            {(['not_started', 'in_progress', 'needs_fix', 'complete'] as ReviewStatus[]).map((s) => (
                              <button
                                key={s}
                                onClick={() => handleStatusChange(campaign, s)}
                                className={`px-2 py-1 text-xs rounded border transition-all ${
                                  status === s
                                    ? getStatusColor(s) + ' font-semibold'
                                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                {getStatusLabel(s)}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Notes Editor */}
                      {isSelected && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Review Notes
                          </label>
                          <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add notes about this page..."
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            rows={3}
                          />
                          <button
                            onClick={handleNotesSave}
                            className="mt-2 px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
                          >
                            Save Notes
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          )}

          {/* Preview Panel */}
          <div className={`${isFullscreen ? 'col-span-1' : 'lg:col-span-2'}`}>
            {previewCampaignSlug ? (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {/* Preview Header */}
                <div className="bg-gray-50 border-b border-gray-200 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const currentIndex = filteredCampaigns.findIndex(c => c.landing_page_slug === previewCampaignSlug);
                          if (currentIndex > 0) {
                            setPreviewCampaignSlug(filteredCampaigns[currentIndex - 1].landing_page_slug);
                          }
                        }}
                        disabled={filteredCampaigns.findIndex(c => c.landing_page_slug === previewCampaignSlug) === 0}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <span className="text-sm text-gray-600">
                        {filteredCampaigns.findIndex(c => c.landing_page_slug === previewCampaignSlug) + 1} / {filteredCampaigns.length}
                      </span>
                      <button
                        onClick={() => {
                          const currentIndex = filteredCampaigns.findIndex(c => c.landing_page_slug === previewCampaignSlug);
                          if (currentIndex < filteredCampaigns.length - 1) {
                            setPreviewCampaignSlug(filteredCampaigns[currentIndex + 1].landing_page_slug);
                          }
                        }}
                        disabled={filteredCampaigns.findIndex(c => c.landing_page_slug === previewCampaignSlug) === filteredCampaigns.length - 1}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                    <div className="h-6 w-px bg-gray-300" />
                    <div className="text-sm font-medium text-gray-900">
                      {filteredCampaigns.find(c => c.landing_page_slug === previewCampaignSlug)?.template_name || previewCampaignSlug}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* View Mode Tabs */}
                    <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-gray-200">
                      <button
                        onClick={() => setPreviewMode('preview')}
                        className={`px-3 py-1 text-xs rounded transition-colors ${
                          previewMode === 'preview'
                            ? 'bg-indigo-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        Preview
                      </button>
                      {campaignDetails[previewCampaignSlug]?.article && (
                        <button
                          onClick={() => setPreviewMode('article')}
                          className={`px-3 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
                            previewMode === 'article'
                              ? 'bg-indigo-600 text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <FileText size={12} />
                          Article
                        </button>
                      )}
                      {campaignDetails[previewCampaignSlug]?.emails && Object.keys(campaignDetails[previewCampaignSlug].emails || {}).length > 0 && (
                        <button
                          onClick={() => setPreviewMode('emails')}
                          className={`px-3 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
                            previewMode === 'emails'
                              ? 'bg-indigo-600 text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <Mail size={12} />
                          Emails
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg"
                      title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                    >
                      {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                    </button>
                    <button
                      onClick={() => window.open(`/learn/${previewCampaignSlug}`, '_blank')}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg"
                      title="Open in new tab"
                    >
                      <Eye size={20} />
                    </button>
                  </div>
                </div>

                {/* Preview Content */}
                <div className={`${isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-[800px]'} overflow-auto`}>
                  {previewMode === 'preview' && (
                    <div className="h-full">
                      <iframe
                        src={`/learn/${previewCampaignSlug}`}
                        className="w-full h-full border-0"
                        title={`Preview: ${previewCampaignSlug}`}
                      />
                    </div>
                  )}
                  
                  {previewMode === 'article' && campaignDetails[previewCampaignSlug]?.article && (
                    <div className="p-6">
                      <div className="bg-white rounded-lg shadow-lg">
                        <div className="flex items-center justify-between p-6 border-b">
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900">{campaignDetails[previewCampaignSlug].article!.title}</h2>
                            {campaignDetails[previewCampaignSlug].article!.subtitle && (
                              <p className="text-gray-600 mt-1">{campaignDetails[previewCampaignSlug].article!.subtitle}</p>
                            )}
                            {campaignDetails[previewCampaignSlug].article!.word_count && (
                              <p className="text-sm text-gray-500 mt-1">{campaignDetails[previewCampaignSlug].article!.word_count} words</p>
                            )}
                          </div>
                        </div>
                        <div className="p-6 prose prose-lg max-w-none">
                          <ReactMarkdown>{campaignDetails[previewCampaignSlug].article!.content}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {previewMode === 'emails' && campaignDetails[previewCampaignSlug]?.emails && (
                    <div className="p-6 space-y-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Email Templates</h3>
                      {Object.entries(campaignDetails[previewCampaignSlug].emails || {}).map(([key, template]) => (
                        <div key={key} className="bg-white border border-gray-200 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-gray-900">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{key}</span>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <label className="text-xs font-semibold text-gray-600 uppercase">Subject</label>
                              <div className="mt-1 p-3 bg-gray-50 rounded border border-gray-200 font-medium">
                                {template.subject}
                              </div>
                            </div>
                            {template.preview_text && (
                              <div>
                                <label className="text-xs font-semibold text-gray-600 uppercase">Preview Text</label>
                                <div className="mt-1 p-3 bg-gray-50 rounded border border-gray-200 text-sm text-gray-600">
                                  {template.preview_text}
                                </div>
                              </div>
                            )}
                            <div>
                              <label className="text-xs font-semibold text-gray-600 uppercase">Body</label>
                              <div className="mt-1 p-4 bg-gray-50 rounded border border-gray-200 whitespace-pre-wrap text-sm text-gray-800 font-mono">
                                {template.body}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                <Eye size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">No campaign selected</p>
                <p className="text-sm text-gray-500">Click "View" on a campaign to preview it</p>
              </div>
            )}
          </div>

          {/* Sidebar - Quick Actions */}
          {!isFullscreen && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    const nextNotStarted = campaigns.find(
                      (c) => (reviewStatus[c.landing_page_slug]?.status || 'not_started') === 'not_started'
                    );
                    if (nextNotStarted) {
                      window.open(`/learn/${nextNotStarted.landing_page_slug}`, '_blank');
                    }
                  }}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
                >
                  Review Next Page
                </button>
                <button
                  onClick={() => {
                    const needsFix = campaigns.filter(
                      (c) => (reviewStatus[c.landing_page_slug]?.status || 'not_started') === 'needs_fix'
                    );
                    if (needsFix.length > 0) {
                      window.open(`/learn/${needsFix[0].landing_page_slug}`, '_blank');
                    }
                  }}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                >
                  Fix Next Issue
                </button>
                <button
                  onClick={() => {
                    const dataStr = JSON.stringify(reviewStatus, null, 2);
                    const dataBlob = new Blob([dataStr], { type: 'application/json' });
                    const url = URL.createObjectURL(dataBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `landing-pages-review-${new Date().toISOString().split('T')[0]}.json`;
                    link.click();
                  }}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
                >
                  Export Review Data
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Review Guide</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Page loads without errors</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Presentation displays correctly</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span>All slides render properly</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span>CTA buttons function correctly</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Mobile responsive</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Content is accurate</span>
                </div>
              </div>
            </div>
            </div>
          </div>
          )}
        </div>
      </LearningLayout>
    );
  };

