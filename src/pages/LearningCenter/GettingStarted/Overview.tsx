import React from 'react';
import { LearningLayout } from '@/components/LearningCenter/Layout/LearningLayout';
import { BookOpen, Layers, Bot, Database } from 'lucide-react';

export const GettingStartedOverviewPage: React.FC = () => {
  const breadcrumbs = [
    { label: 'Learning Center', href: '/learning' },
    { label: 'Getting Started', href: '/learn/getting-started' },
    { label: 'Platform Overview' },
  ];

  return (
    <LearningLayout title="Platform Overview" breadcrumbs={breadcrumbs}>
      <div className="max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Platform Overview</h1>
          <p className="text-lg text-gray-600">
            The Fibonacco Learning Center is a comprehensive knowledge management system that powers AI agents across multiple services. Understand how it all works together.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Layers size={24} className="text-indigo-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Three-Layer Architecture</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Our system combines Template, Industry, and Customer data to create personalized presentations.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Template Layer: Base structure and design</li>
              <li>• Industry Layer: Vertical-specific content</li>
              <li>• Customer Layer: Business-specific data</li>
            </ul>
          </div>

          <div className="p-6 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Bot size={24} className="text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">AI-Enhanced Learning</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Every interaction with AI agents improves the knowledge base through automatic FAQ generation and data capture.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Semantic search with vector embeddings</li>
              <li>• Real-time FAQ generation</li>
              <li>• Context-aware responses</li>
            </ul>
          </div>

          <div className="p-6 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Database size={24} className="text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Knowledge Base</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Manage 410+ FAQs across 56 industry subcategories with multi-source validation.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• 410 FAQ questions</li>
              <li>• 56 industry subcategories</li>
              <li>• Vector-based semantic search</li>
            </ul>
          </div>

          <div className="p-6 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 rounded-lg">
                <BookOpen size={24} className="text-amber-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Business Profiles</h2>
            </div>
            <p className="text-gray-600 mb-4">
              375-question survey across 30 sections to capture comprehensive business data.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• 30 survey sections</li>
              <li>• Multi-format questions</li>
              <li>• AI-powered data capture</li>
            </ul>
          </div>
        </div>
      </div>
    </LearningLayout>
  );
};


