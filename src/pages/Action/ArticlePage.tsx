import React from 'react';
import { ComingSoon } from '@/components/ComingSoon';

export const ArticlePage: React.FC = () => {
  return (
    <ComingSoon
      title="Articles"
      description="Create and manage articles for your business."
      backPath="/"
    />
  );
};
