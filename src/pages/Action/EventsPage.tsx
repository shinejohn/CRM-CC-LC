import React from 'react';
import { ComingSoon } from '@/components/ComingSoon';

export const EventsPage: React.FC = () => {
  return (
    <ComingSoon
      title="Events"
      description="Create and manage events for your business."
      backPath="/"
    />
  );
};
