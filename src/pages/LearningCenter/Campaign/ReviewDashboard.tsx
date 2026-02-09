import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { LearningLayout } from '@/components/LearningCenter/Layout/LearningLayout';
import { Search, Play, Filter, ChevronRight, AlertTriangle } from 'lucide-react';
import { campaignApi, type CampaignLandingPage } from '@/services/learning/campaign-api';

export const ReviewDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [campaigns, setCampaigns] = useState<CampaignLandingPage[]>([]);
    const [filteredCampaigns, setFilteredCampaigns] = useState<CampaignLandingPage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
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
        setError(null);
        try {
            // Debug logging as per troubleshooting guide
            console.log('ReviewDashboard: Loading campaigns...');
            const allCampaigns = await campaignApi.getAllCampaigns();
            console.log('ReviewDashboard: Loaded campaigns', allCampaigns.length);

            setCampaigns(allCampaigns);
            setFilteredCampaigns(allCampaigns);
        } catch (error) {
            console.error('ReviewDashboard: Failed to load campaigns:', error);
            setError('Failed to load campaigns. Please check console for details.');
        } finally {
            setLoading(false);
        }
    };

    const filterCampaigns = () => {
        let filtered = [...campaigns];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (campaign) =>
                    campaign.template_name.toLowerCase().includes(query) ||
                    campaign.landing_page_slug.toLowerCase().includes(query) ||
                    campaign.campaign_id.toLowerCase().includes(query) ||
                    (campaign.ai_persona && campaign.ai_persona.toLowerCase().includes(query))
            );
        }

        if (filterType !== 'all') {
            filtered = filtered.filter((campaign) =>
                campaign.campaign_id.startsWith(filterType.toUpperCase())
            );
        }

        setFilteredCampaigns(filtered);

        // Debug logging
        console.log('ReviewDashboard render:', {
            loading,
            error,
            campaignsCount: campaigns.length,
            filteredCount: filtered.length
        });
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
            case 'Hook': return 'bg-red-100 text-red-700 border-red-300';
            case 'Educational': return 'bg-blue-100 text-blue-700 border-blue-300';
            case 'How-To': return 'bg-emerald-100 text-emerald-700 border-emerald-300';
            case 'Case Study': return 'bg-purple-100 text-purple-700 border-purple-300';
            default: return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    const breadcrumbs = [
        { label: 'Learning Center', href: '/learning' },
        { label: 'Campaign Review Dashboard' },
    ];

    if (loading) {
        return (
            <LearningLayout title="Campaign Review Dashboard" breadcrumbs={breadcrumbs}>
                <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                        <p className="text-gray-600">Loading campaigns data...</p>
                    </div>
                </div>
            </LearningLayout>
        );
    }

    if (error) {
        return (
            <LearningLayout title="Campaign Review Dashboard" breadcrumbs={breadcrumbs}>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Dashboard</h3>
                    <p className="text-red-700 mb-4">{error}</p>
                    <button
                        onClick={loadCampaigns}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </LearningLayout>
        );
    }

    const uniqueTypes = Array.from(new Set(campaigns.map((c) => getCampaignType(c.campaign_id))));

    return (
        <LearningLayout title="Campaign Review Dashboard" breadcrumbs={breadcrumbs}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Dashboard</h1>
                    <p className="text-lg text-gray-600">
                        Internal review tool for {campaigns.length} campaign landing pages.
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="relative">
                            <Filter size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 appearance-none bg-white"
                            >
                                <option value="all">All Types</option>
                                {uniqueTypes.map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="grid grid-cols-1 gap-4">
                    {filteredCampaigns.map((campaign) => {
                        const type = getCampaignType(campaign.campaign_id);
                        return (
                            <div key={campaign.landing_page_slug} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className={`px-2 py-1 rounded text-xs font-medium border ${getTypeColor(type)} w-24 text-center`}>
                                        {type}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{campaign.template_name}</h3>
                                        <div className="text-sm text-gray-500 flex gap-4">
                                            <span>ID: {campaign.campaign_id}</span>
                                            <span>Slug: {campaign.landing_page_slug}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate(`/learn/${campaign.landing_page_slug}`)}
                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full"
                                >
                                    <Play size={20} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </LearningLayout>
    );
};
