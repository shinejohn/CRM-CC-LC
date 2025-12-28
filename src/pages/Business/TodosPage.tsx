import React from 'react';
import { ComingSoon } from '@/components/ComingSoon';

export const TodosPage: React.FC = () => {
  return (
    <ComingSoon
      title="To-Do List"
      description="Manage your business tasks and to-do items."
      backPath="/profile"
    />
  );
};
