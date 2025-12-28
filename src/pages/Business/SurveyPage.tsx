import React from 'react';
import { ComingSoon } from '@/components/ComingSoon';

export const SurveyPage: React.FC = () => {
  return (
    <ComingSoon
      title="Business Profile Survey"
      description="Complete your business profile survey to help us serve you better."
      backPath="/profile"
    />
  );
};
