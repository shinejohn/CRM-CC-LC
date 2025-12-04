import React from 'react';
import { LearningLayout } from '@/components/LearningCenter/Layout/LearningLayout';
import { ProfileSurveyBuilder } from '@/components/LearningCenter/BusinessProfile/ProfileSurveyBuilder';

export const BusinessProfileIndexPage: React.FC = () => {
  return (
    <LearningLayout
      title="Business Profile Survey"
      breadcrumbs={[
        { label: 'Learning Center', href: '/learning' },
        { label: 'Business Profile' },
      ]}
    >
      <ProfileSurveyBuilder />
    </LearningLayout>
  );
};


