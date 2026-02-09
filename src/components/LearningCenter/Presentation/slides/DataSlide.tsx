import React from 'react';
import { BarChart3 } from 'lucide-react';
import { StatsSlide } from './StatsSlide';

interface DataSlideProps {
  content: {
    title: string;
    stats: Array<{
      value: string | number;
      label: string;
      icon?: string;
      trend?: string;
    }>;
    layout?: 'grid' | 'list';
  };
  isActive: boolean;
  theme?: 'blue' | 'green' | 'purple' | 'orange';
}

// DataSlide is essentially the same as StatsSlide, so we'll use it as a wrapper
export const DataSlide: React.FC<DataSlideProps> = (props) => {
  return <StatsSlide {...props} />;
};





