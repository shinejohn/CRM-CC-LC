import React from 'react';
import { LearningLayout } from '@/components/LearningCenter/Layout/LearningLayout';
import { CreateEmailCampaignPage as CreateEmailCampaign } from '@/pages/Outbound/Email/Create';

export const CreateEmailCampaignPage: React.FC = () => {
  return (
    <LearningLayout 
      title="Create Email Campaign"
      breadcrumbs={[
        { label: 'Outbound', href: '/learning/outbound' },
        { label: 'Create Email Campaign' },
      ]}
    >
      <CreateEmailCampaign />
    </LearningLayout>
  );
};



