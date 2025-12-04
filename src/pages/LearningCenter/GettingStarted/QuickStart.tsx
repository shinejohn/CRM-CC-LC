import React from 'react';
import { LearningLayout } from '@/components/LearningCenter/Layout/LearningLayout';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const GettingStartedQuickStartPage: React.FC = () => {
  const breadcrumbs = [
    { label: 'Learning Center', href: '/learning' },
    { label: 'Getting Started', href: '/learn/getting-started' },
    { label: 'Quick Start Guide' },
  ];

  const steps = [
    {
      id: 1,
      title: 'Create Your First FAQ',
      description: 'Add a frequently asked question to your knowledge base',
      href: '/learning/faqs',
      completed: false,
    },
    {
      id: 2,
      title: 'Set Up Business Profile Survey',
      description: 'Configure your business profile questions',
      href: '/learning/business-profile',
      completed: false,
    },
    {
      id: 3,
      title: 'Test Semantic Search',
      description: 'Try out the vector search functionality',
      href: '/learning/search',
      completed: false,
    },
    {
      id: 4,
      title: 'Train Your AI Agents',
      description: 'Configure which agents can access which knowledge',
      href: '/learning/training',
      completed: false,
    },
  ];

  return (
    <LearningLayout title="Quick Start Guide" breadcrumbs={breadcrumbs}>
      <div className="max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Quick Start Guide</h1>
          <p className="text-lg text-gray-600">
            Get your Learning Center up and running in just a few steps. Follow this guide to set up your knowledge base and start training AI agents.
          </p>
        </div>

        <div className="space-y-6">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="flex gap-6 p-6 bg-white border border-gray-200 rounded-lg"
            >
              <div className="flex-shrink-0">
                {step.completed ? (
                  <CheckCircle size={32} className="text-emerald-600" />
                ) : (
                  <div className="w-8 h-8 rounded-full border-2 border-indigo-600 flex items-center justify-center">
                    <span className="text-indigo-600 font-semibold">{step.id}</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 mb-4">{step.description}</p>
                <Link
                  to={step.href}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Get Started
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-indigo-50 border border-indigo-200 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Next Steps
          </h2>
          <p className="text-gray-600 mb-4">
            Once you've completed these steps, explore our documentation to learn about advanced features like bulk imports, category management, and AI training.
          </p>
          <Link
            to="/learning/articles"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Browse Full Documentation
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </LearningLayout>
  );
};


