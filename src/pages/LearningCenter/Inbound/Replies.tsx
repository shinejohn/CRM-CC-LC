import React from 'react';
import { LearningLayout } from '@/components/LearningCenter/Layout/LearningLayout';
import { Mail, MessageSquare } from 'lucide-react';

export const RepliesPage: React.FC = () => {
  return (
    <LearningLayout 
      title="Inbound Replies"
      breadcrumbs={[
        { label: 'Inbound', href: '/learning/inbound' },
        { label: 'Replies' },
      ]}
    >
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <MessageSquare className="mx-auto text-gray-400" size={48} />
        <p className="mt-4 text-gray-600">Inbound replies system coming soon</p>
        <p className="text-sm text-gray-500 mt-2">This will show email and SMS replies from customers</p>
      </div>
    </LearningLayout>
  );
};



