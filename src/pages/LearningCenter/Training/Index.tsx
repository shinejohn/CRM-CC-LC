import React from 'react';
import { LearningLayout } from '@/components/LearningCenter/Layout/LearningLayout';
import { TrainingOverview } from '@/components/LearningCenter/AITraining/TrainingOverview';
import { 
  Brain, 
  Sparkles,
  Database,
  Shield,
  Zap,
  TrendingUp,
  BookOpen,
  CheckCircle2,
  BarChart3,
  Cpu
} from 'lucide-react';
import { Link } from 'react-router';

export const TrainingIndexPage: React.FC = () => {
  return (
    <LearningLayout
      title="AI Training & Knowledge Configuration"
      breadcrumbs={[
        { label: 'Learning Center', href: '/learning' },
        { label: 'Training' },
      ]}
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-200">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Brain className="text-orange-600" size={24} />
              </div>
              <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-semibold rounded-full">
                AI Agent Training
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              AI Training & Knowledge Configuration
            </h1>
            <p className="text-gray-700 leading-relaxed mb-4">
              Configure and train your AI agents with fine-grained knowledge access control. Specify which agents 
              can access which FAQs, articles, and business profile data. Manage training datasets, monitor agent 
              performance, and optimize knowledge distribution across your AI ecosystem.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/learning/faqs"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                <BookOpen size={16} />
                Manage Knowledge Base
              </Link>
              <Link
                to="/learning/search"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                <Sparkles size={16} />
                Test Semantic Search
              </Link>
            </div>
          </div>
        </div>

        {/* Key Concepts */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-orange-600" />
            How AI Training Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
              <div className="flex items-center gap-2 mb-2">
                <Database size={18} className="text-orange-600" />
                <div className="font-semibold text-gray-900">Knowledge Base</div>
              </div>
              <p className="text-sm text-gray-600">
                FAQs, articles, and business profiles are stored with vector embeddings for semantic search
              </p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={18} className="text-indigo-600" />
                <div className="font-semibold text-gray-900">Access Control</div>
              </div>
              <p className="text-sm text-gray-600">
                Configure which AI agents can access which knowledge through fine-grained permissions
              </p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={18} className="text-emerald-600" />
                <div className="font-semibold text-gray-900">Real-Time Learning</div>
              </div>
              <p className="text-sm text-gray-600">
                Agents learn from every conversation, improving responses and generating new FAQs automatically
              </p>
            </div>
          </div>
        </div>

        {/* Training Overview Component */}
        <div>
          <TrainingOverview />
        </div>

        {/* Best Practices */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-indigo-100 rounded-lg flex-shrink-0">
              <CheckCircle2 className="text-indigo-600" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-3">Best Practices for AI Training</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="font-medium text-gray-900 mb-2">Knowledge Organization</div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Organize FAQs by category and industry</li>
                    <li>• Use tags and metadata for better discovery</li>
                    <li>• Validate content from multiple sources</li>
                    <li>• Keep knowledge base up to date</li>
                  </ul>
                </div>
                <div>
                  <div className="font-medium text-gray-900 mb-2">Agent Configuration</div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Assign relevant knowledge to each agent</li>
                    <li>• Monitor agent performance metrics</li>
                    <li>• Review and refine access permissions</li>
                    <li>• Test agents with semantic search</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-indigo-200">
                <Link
                  to="/learn/getting-started"
                  className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Learn more about AI training
                  <TrendingUp size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LearningLayout>
  );
};
