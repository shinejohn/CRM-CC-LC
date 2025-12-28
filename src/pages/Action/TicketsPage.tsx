import React from 'react';
import { ComingSoon } from '@/components/ComingSoon';

export const TicketsPage: React.FC = () => {
  return (
    <ComingSoon
      title="Tickets"
      description="Sell and manage event tickets."
      backPath="/"
    />
  );
};
