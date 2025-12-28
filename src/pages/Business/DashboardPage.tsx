import React from 'react';
import { ComingSoon } from '@/components/ComingSoon';

export const DashboardPage: React.FC = () => {
  return (
    <ComingSoon
      title="Business Dashboard"
      description="View your business analytics and performance metrics."
      backPath="/profile"
    />
  );
};
