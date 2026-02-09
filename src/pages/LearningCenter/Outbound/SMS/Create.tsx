import React from 'react';
import { LearningLayout } from '@/components/LearningCenter/Layout/LearningLayout';
import { CreateSmsCampaignPage as CreateSmsCampaign } from '@/pages/Outbound/SMS/Create';

export const CreateSmsCampaignPage: React.FC = () => {
  return (
    <LearningLayout 
      title="Create SMS Campaign"
      breadcrumbs={[
        { label: 'Outbound', href: '/learning/outbound' },
        { label: 'Create SMS Campaign' },
      ]}
    >
      <CreateSmsCampaign />
    </LearningLayout>
  );
};



