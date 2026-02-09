// ============================================
// CAMPAIGN CARD - Command Center
// CC-FT-05: Campaigns Module
// ============================================

import React from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import {
  Mail, MessageSquare, Phone, Radio, Calendar,
  Users, MoreVertical, Play, Pause
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Campaign } from './campaign.types';

const channelIcons = {
  email: Mail,
  sms: MessageSquare,
  phone: Phone,
  rvm: Radio,
};

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  paused: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  completed: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
};

interface CampaignCardProps {
  campaign: Campaign;
  onPause?: (id: string) => void;
  onResume?: (id: string) => void;
}

export function CampaignCard({ campaign, onPause, onResume }: CampaignCardProps) {
  const navigate = useNavigate();
  const ChannelIcon = channelIcons[campaign.channel];
  const openRate = campaign.sent > 0 ? Math.round((campaign.opened / campaign.sent) * 100) : 0;

  const handleCardClick = () => {
    navigate(`/command-center/campaigns/${campaign.id}`);
  };

  const handlePause = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPause?.(campaign.id);
  };

  const handleResume = (e: React.MouseEvent) => {
    e.stopPropagation();
    onResume?.(campaign.id);
  };

  return (
    <motion.div whileHover={{ y: -4 }}>
      <Card
        className="cursor-pointer hover:shadow-lg transition-all"
        onClick={handleCardClick}
      >
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg">
                <ChannelIcon className="w-4 h-4 text-gray-600 dark:text-slate-300" />
              </div>
              <Badge className={statusColors[campaign.status]}>
                {campaign.status}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            {campaign.name}
          </h3>
          {campaign.templateName && (
            <p className="text-xs text-gray-500 mb-3">
              Template: {campaign.templateName}
            </p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {campaign.audience.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Audience</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {campaign.sent.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Sent</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-green-600">
                {openRate}%
              </p>
              <p className="text-xs text-gray-500">Open Rate</p>
            </div>
          </div>

          {/* Progress */}
          {campaign.status === 'active' && campaign.audience > 0 && (
            <div className="mb-3">
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((campaign.sent / campaign.audience) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round((campaign.sent / campaign.audience) * 100)}% complete
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-slate-700">
            {campaign.scheduledAt && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(campaign.scheduledAt).toLocaleDateString()}
              </span>
            )}
            {campaign.status === 'active' && (
              <Button variant="outline" size="sm" onClick={handlePause}>
                <Pause className="w-3 h-3 mr-1" />
                Pause
              </Button>
            )}
            {campaign.status === 'paused' && (
              <Button variant="outline" size="sm" onClick={handleResume}>
                <Play className="w-3 h-3 mr-1" />
                Resume
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

