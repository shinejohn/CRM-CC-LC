import React from 'react';
import { useBusinessMode } from '@/hooks/useBusinessMode';
import { PipelineDashboard } from '../modules/sell/PipelineDashboard';
import { JobBoardDashboard } from '../modules/sell/JobBoardDashboard';
import { RetailDashboard } from '../modules/sell/RetailDashboard';

export function SellIndex() {
  const { mode } = useBusinessMode();

  switch (mode) {
    case 'b2b-pipeline':
      return <PipelineDashboard />;
    case 'b2c-services':
      return <JobBoardDashboard />;
    case 'b2c-retail':
      return <RetailDashboard />;
  }
}
