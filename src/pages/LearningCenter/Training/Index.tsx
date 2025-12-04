import React from 'react';
import { LearningLayout } from '@/components/LearningCenter/Layout/LearningLayout';
import { TrainingOverview } from '@/components/LearningCenter/AITraining/TrainingOverview';

export const TrainingIndexPage: React.FC = () => {
  return (
    <LearningLayout
      title="AI Training"
      breadcrumbs={[
        { label: 'Learning Center', href: '/learning' },
        { label: 'Training' },
      ]}
    >
      <TrainingOverview />
    </LearningLayout>
  );
};


