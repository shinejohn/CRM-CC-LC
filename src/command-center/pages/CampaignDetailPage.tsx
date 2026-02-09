import React from 'react';
import { useParams } from 'react-router';

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Campaign Detail
      </h1>
      <p className="text-gray-600 dark:text-slate-400">
        Campaign ID: {id}
      </p>
      <p className="text-gray-600 dark:text-slate-400 mt-2">
        Campaign detail module - Coming soon
      </p>
    </div>
  );
}

