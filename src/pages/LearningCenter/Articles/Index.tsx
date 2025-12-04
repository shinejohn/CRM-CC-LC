import React from 'react';
import { LearningLayout } from '@/components/LearningCenter/Layout/LearningLayout';
import { ArticleList } from '@/components/LearningCenter/Articles/ArticleList';

export const ArticlesIndexPage: React.FC = () => {
  return (
    <LearningLayout
      title="Articles"
      breadcrumbs={[
        { label: 'Learning Center', href: '/learning' },
        { label: 'Articles' },
      ]}
    >
      <ArticleList />
    </LearningLayout>
  );
};


