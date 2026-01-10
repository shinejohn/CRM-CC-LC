import React from 'react';
import { LearningLayout } from '@/components/LearningCenter/Layout/LearningLayout';
import { ProfileSurveyBuilder } from '@/components/LearningCenter/BusinessProfile/ProfileSurveyBuilder';
import { 
  Users, 
  FileText,
  CheckCircle2,
  BarChart3,
  Database,
  Sparkles,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import { Link } from 'react-router';

export const BusinessProfileIndexPage: React.FC = () => {
  return (
    <LearningLayout
      title="Business Profile Survey"
      breadcrumbs={[
        { label: 'Learning Center', href: '/learning' },
        { label: 'Business Profile' },
      ]}
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="text-purple-600" size={24} />
              </div>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full">
                Business Intelligence
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Business Profile Survey
            </h1>
            <p className="text-gray-700 leading-relaxed mb-4">
              Configure and manage the comprehensive 375-question business profile survey across 30 sections. 
              Capture detailed business information including operations, services, target markets, pain points, 
              and objectives. This data powers personalized AI conversations and enables intelligent business insights.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/learning/faqs"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                <BookOpen size={16} />
                View FAQs
              </Link>
              <Link
                to="/learning/search"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                <Sparkles size={16} />
                Search Profiles
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-white border-2 border-purple-200 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <FileText className="text-purple-600" size={20} />
              <TrendingUp size={16} className="text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">375</div>
            <div className="text-sm font-medium text-gray-700">Survey Questions</div>
          </div>
          <div className="p-5 bg-white border-2 border-purple-200 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="text-purple-600" size={20} />
              <TrendingUp size={16} className="text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">30</div>
            <div className="text-sm font-medium text-gray-700">Survey Sections</div>
          </div>
          <div className="p-5 bg-white border-2 border-purple-200 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <Database className="text-purple-600" size={20} />
              <TrendingUp size={16} className="text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">56</div>
            <div className="text-sm font-medium text-gray-700">Industry Categories</div>
          </div>
        </div>

        {/* Key Features */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-purple-600" />
            Survey Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="font-semibold text-gray-900 mb-2">Question Types</div>
              <p className="text-sm text-gray-600">
                Support for text, select, multi-select, scale, date, currency, phone, email, address, media, and more
              </p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg">
              <div className="font-semibold text-gray-900 mb-2">Section Organization</div>
              <p className="text-sm text-gray-600">
                30 organized sections covering business operations, services, markets, goals, and challenges
              </p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-lg">
              <div className="font-semibold text-gray-900 mb-2">AI Integration</div>
              <p className="text-sm text-gray-600">
                Profile data powers personalized AI conversations and intelligent business insights
              </p>
            </div>
          </div>
        </div>

        {/* Survey Builder Component */}
        <div>
          <ProfileSurveyBuilder />
        </div>

        {/* Usage Information */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-indigo-100 rounded-lg flex-shrink-0">
              <CheckCircle2 className="text-indigo-600" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-3">Using Business Profiles</h3>
              <p className="text-gray-700 mb-4 text-sm">
                Business profile data is used throughout the Fibonacco platform to personalize experiences, 
                generate targeted content, and enable AI agents to have context-aware conversations with business owners.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="font-medium text-gray-900 mb-2">Data Collection</div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• 375 questions across 30 sections</li>
                    <li>• Multiple question types and formats</li>
                    <li>• Industry-specific customization</li>
                    <li>• Validation and data quality checks</li>
                  </ul>
                </div>
                <div>
                  <div className="font-medium text-gray-900 mb-2">Applications</div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Personalized AI conversations</li>
                    <li>• Targeted content generation</li>
                    <li>• Business intelligence and insights</li>
                    <li>• Service recommendations</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LearningLayout>
  );
};
