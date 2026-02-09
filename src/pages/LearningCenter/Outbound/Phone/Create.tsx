import React from 'react';
import { LearningLayout } from '@/components/LearningCenter/Layout/LearningLayout';
import { CreatePhoneCampaignPage as CreatePhoneCampaign } from '@/pages/Outbound/Phone/Create';

export const CreatePhoneCampaignPage: React.FC = () => {
  return (
    <LearningLayout 
      title="Create Phone Campaign"
      breadcrumbs={[
        { label: 'Outbound', href: '/learning/outbound' },
        { label: 'Create Phone Campaign' },
      ]}
    >
      <CreatePhoneCampaign />
    </LearningLayout>
  );
};



