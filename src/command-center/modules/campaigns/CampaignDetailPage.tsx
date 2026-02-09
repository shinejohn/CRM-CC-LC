// ============================================
// CAMPAIGN DETAIL PAGE - Command Center
// CC-FT-05: Campaigns Module
// ============================================

import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, BarChart2, Users, Mail, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCampaigns } from './useCampaigns';

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { campaigns, getCampaignStats, isLoading } = useCampaigns({});

  const campaign = campaigns.find(c => c.id === id);

  if (isLoading) {
    return <div>Loading campaign...</div>;
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Campaign not found</p>
        <Button onClick={() => navigate('/command-center/campaigns')} className="mt-4">
          Back to Campaigns
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/command-center/campaigns')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{campaign.name}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Created {new Date(campaign.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Audience</p>
                <p className="text-2xl font-bold">{campaign.audience.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Mail className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Sent</p>
                <p className="text-2xl font-bold">{campaign.sent.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BarChart2 className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Open Rate</p>
                <p className="text-2xl font-bold">
                  {campaign.sent > 0 ? Math.round((campaign.opened / campaign.sent) * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-500">Click Rate</p>
                <p className="text-2xl font-bold">
                  {campaign.sent > 0 ? Math.round((campaign.clicked / campaign.sent) * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Details */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Campaign Details</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium text-gray-900 dark:text-white capitalize">{campaign.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Channel</p>
              <p className="font-medium text-gray-900 dark:text-white capitalize">{campaign.channel}</p>
            </div>
            {campaign.subject && (
              <div>
                <p className="text-sm text-gray-500">Subject</p>
                <p className="font-medium text-gray-900 dark:text-white">{campaign.subject}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500 mb-2">Content</p>
              <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <p className="text-sm whitespace-pre-wrap text-gray-900 dark:text-white">{campaign.content}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

