import React from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Clock } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description?: string;
  backPath?: string;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({ title, description, backPath = '/' }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <Clock className="mx-auto h-16 w-16 text-indigo-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          {description && (
            <p className="text-gray-600">{description}</p>
          )}
          <p className="text-gray-500 mt-4">This feature is coming soon!</p>
        </div>
        
        <Link
          to={backPath}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Link>
      </div>
    </div>
  );
};
