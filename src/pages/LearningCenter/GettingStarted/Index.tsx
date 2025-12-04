import React from 'react';
import { LearningLayout } from '@/components/LearningCenter/Layout/LearningLayout';
import { BookOpen, PlayCircle, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const GettingStartedIndexPage: React.FC = () => {
  const breadcrumbs = [
    { label: 'Learning Center', href: '/learning' },
    { label: 'Getting Started' },
  ];

  const sections = [
    {
      id: 'overview',
      title: 'Platform Overview',
      description: 'Understand the core concepts and architecture of the Fibonacco Learning Center',
      href: '/learn/overview',
      icon: <BookOpen size={24} />,
    },
    {
      id: 'quickstart',
      title: 'Quick Start Guide',
      description: 'Get up and running in minutes with our step-by-step quick start tutorial',
      href: '/learn/quickstart',
      icon: <PlayCircle size={24} />,
    },
    {
      id: 'tutorial',
      title: 'First Steps Tutorial',
      description: 'Complete walkthrough for your first presentation and AI interaction',
      href: '/learn/tutorial',
      icon: <FileText size={24} />,
    },
    {
      id: 'setup',
      title: 'Account Setup',
      description: 'Configure your account, permissions, and initial settings',
      href: '/learn/setup',
      icon: <ArrowRight size={24} />,
    },
  ];

  return (
    <LearningLayout title="Getting Started" breadcrumbs={breadcrumbs}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Getting Started</h1>
          <p className="text-lg text-gray-600">
            Welcome to the Fibonacco Learning Center. Follow these steps to get started with creating presentations, managing knowledge, and training your AI agents.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section) => (
            <Link
              key={section.id}
              to={section.href}
              className="block p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600">
                  {section.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {section.title}
                  </h3>
                  <p className="text-gray-600">{section.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 p-6 bg-indigo-50 border border-indigo-200 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Need Help?
          </h2>
          <p className="text-gray-600 mb-4">
            If you're stuck or have questions, check out our documentation or contact support.
          </p>
          <div className="flex gap-4">
            <Link
              to="/learning/articles"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Browse Documentation
            </Link>
            <Link
              to="/learning/search"
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Search Knowledge Base
            </Link>
          </div>
        </div>
      </div>
    </LearningLayout>
  );
};


