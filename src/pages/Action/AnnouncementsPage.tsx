import React from 'react';
import { ComingSoon } from '@/components/ComingSoon';

export const AnnouncementsPage: React.FC = () => {
  return (
    <ComingSoon
      title="Announcements"
      description="Create and manage business announcements."
      backPath="/"
    />
  );
};
