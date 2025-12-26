import React from 'react';
import { Link } from 'react-router';
import { MainNavigationHeader } from '@/components/MainNavigationHeader';
import { FileText, ArrowRight } from 'lucide-react';

export const SurveyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavigationHeader />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <FileText size={64} className="mx-auto text-indigo-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Business Profile Survey</h1>
            <p className="text-lg text-gray-600">
              Complete your business profile survey to unlock personalized features and improve your AI assistant's knowledge of your business.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <h3 className="font-semibold text-gray-900 mb-2">375 Questions Across 30 Sections</h3>
              <p className="text-sm text-gray-600">Comprehensive survey covering all aspects of your business.</p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Insights</h3>
              <p className="text-sm text-gray-600">Your responses help train AI assistants to better serve your business.</p>
            </div>
          </div>

          <Link
            to="/learning/business-profile"
            className="w-full bg-indigo-600 text-white px-6 py-4 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 font-semibold"
          >
            Go to Business Profile Survey
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
};






