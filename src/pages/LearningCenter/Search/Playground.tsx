import React from 'react';
import { LearningLayout } from '@/components/LearningCenter/Layout/LearningLayout';
import { SearchPlayground } from '@/components/LearningCenter/VectorSearch/SearchPlayground';

export const SearchPlaygroundPage: React.FC = () => {
  return (
    <LearningLayout
      title="Search Playground"
      breadcrumbs={[
        { label: 'Learning Center', href: '/learning' },
        { label: 'Search' },
      ]}
    >
      <SearchPlayground />
    </LearningLayout>
  );
};


