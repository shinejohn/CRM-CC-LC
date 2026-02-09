import React from 'react';
import { LearningLayout } from '@/components/LearningCenter/Layout/LearningLayout';
import { Phone } from 'lucide-react';

export const CallsPage: React.FC = () => {
  return (
    <LearningLayout 
      title="Inbound Phone Calls"
      breadcrumbs={[
        { label: 'Inbound', href: '/learning/inbound' },
        { label: 'Phone Calls' },
      ]}
    >
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <Phone className="mx-auto text-gray-400" size={48} />
        <p className="mt-4 text-gray-600">Inbound calls system coming soon</p>
        <p className="text-sm text-gray-500 mt-2">This will show incoming phone calls from customers</p>
      </div>
    </LearningLayout>
  );
};



