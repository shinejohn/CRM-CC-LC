import React from 'react';
import { LearningLayout } from '@/components/LearningCenter/Layout/LearningLayout';
import { FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PlaceholderPageProps {
  title: string;
  description?: string;
  category?: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ 
  title, 
  description = 'This page is coming soon.',
  category 
}) => {
  const breadcrumbs = category 
    ? [
        { label: 'Learning Center', href: '/learning' },
        { label: category },
        { label: title },
      ]
    : [
        { label: 'Learning Center', href: '/learning' },
        { label: title },
      ];

  return (
    <LearningLayout title={title} breadcrumbs={breadcrumbs}>
      <div className="max-w-4xl mx-auto text-center py-16">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-indigo-100 rounded-full mb-6">
            <FileText size={48} className="text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
          <p className="text-xl text-gray-600 mb-8">{description}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
          <p className="text-gray-600 mb-6">
            This content is being prepared and will be available soon. Check back later or explore other sections of the Learning Center.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link
              to="/learning"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <ArrowLeft size={18} />
              Back to Learning Center
            </Link>
            <Link
              to="/learning/search"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Search Knowledge Base
            </Link>
          </div>
        </div>
      </div>
    </LearningLayout>
  );
};


