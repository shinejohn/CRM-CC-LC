import React from 'react';
import { ComingSoon } from '@/components/ComingSoon';

export const SubscriptionsPage: React.FC = () => {
  return (
    <ComingSoon
      title="Subscriptions"
      description="Manage your service subscriptions and billing."
      backPath="/profile"
    />
  );
};
