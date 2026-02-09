import React from 'react';
import { LearningLayout } from '@/components/LearningCenter/Layout/LearningLayout';
import { OutboundDashboardPage as OutboundDashboard } from '@/pages/Outbound/Dashboard';

export const OutboundDashboardPage: React.FC = () => {
  return (
    <LearningLayout title="Outbound Campaigns">
      <OutboundDashboard />
    </LearningLayout>
  );
};



