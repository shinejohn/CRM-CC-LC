import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { LearningLayout } from '@/components/LearningCenter/Layout/LearningLayout';
import { ArrowLeft } from 'lucide-react';

export const ServiceCheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  // This page would typically be shown after selecting services
  // For now, it's a placeholder that would redirect to the actual checkout flow

  return (
    <LearningLayout title="Checkout" breadcrumbs={[{ label: 'Services', href: '/learning/services' }, { label: 'Checkout' }]}>
      <div className="max-w-2xl mx-auto space-y-6">
        <button
          onClick={() => navigate('/learning/services')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} />
          Back to Catalog
        </button>

        <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>
          <p className="text-gray-600">
            Please select services from the catalog to proceed to checkout.
          </p>
          <button
            onClick={() => navigate('/learning/services')}
            className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Browse Services
          </button>
        </div>
      </div>
    </LearningLayout>
  );
};
