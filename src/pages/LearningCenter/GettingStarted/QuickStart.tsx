import React, { useState, useEffect } from 'react';
import { LearningLayout } from '@/components/LearningCenter/Layout/LearningLayout';
import { CheckCircle, Circle, ArrowRight, PlayCircle, BookOpen, Search, Brain, Sparkles, TrendingUp, Clock } from 'lucide-react';
import { Link } from 'react-router';

export const GettingStartedQuickStartPage: React.FC = () => {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  
  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('quickstart-progress');
    if (saved) {
      try {
        setCompletedSteps(new Set(JSON.parse(saved)));
      } catch (e) {
        console.error('Failed to load progress:', e);
      }
    }
  }, []);
  
  // Save progress to localStorage
  const toggleStep = (stepId: number) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      localStorage.setItem('quickstart-progress', JSON.stringify(Array.from(next)));
      return next;
    });
  };
  
  const progressPercentage = (completedSteps.size / steps.length) * 100;
  const breadcrumbs = [
    { label: 'Learning Center', href: '/learning' },
    { label: 'Getting Started', href: '/learn/getting-started' },
    { label: 'Quick Start Guide' },
  ];

  const steps = [
    {
      id: 1,
      title: 'Create Your First FAQ',
      description: 'Add a frequently asked question to your knowledge base. FAQs are the foundation of AI agent training and enable intelligent responses.',
      href: '/learning/faqs',
      icon: <BookOpen size={24} />,
      completed: false,
      tips: [
        'Use clear, specific questions',
        'Provide comprehensive answers',
        'Add relevant categories and tags',
        'Vector embeddings will be generated automatically',
      ],
      color: 'emerald',
    },
    {
      id: 2,
      title: 'Set Up Business Profile Survey',
      description: 'Configure your business profile questions. The 375-question survey captures comprehensive business data for personalized AI interactions.',
      href: '/learning/business-profile',
      icon: <Sparkles size={24} />,
      completed: false,
      tips: [
        'Organize questions into 30 sections',
        'Use appropriate question types',
        'Link questions to industry categories',
        'Test survey flow before deployment',
      ],
      color: 'purple',
    },
    {
      id: 3,
      title: 'Test Semantic Search',
      description: 'Try out the vector search functionality. Semantic search understands meaning and context, not just keywords.',
      href: '/learning/search',
      icon: <Search size={24} />,
      completed: false,
      tips: [
        'Try natural language queries',
        'Compare semantic vs keyword search',
        'Use hybrid search for best results',
        'Filter by category and industry',
      ],
      color: 'indigo',
    },
    {
      id: 4,
      title: 'Train Your AI Agents',
      description: 'Configure which agents can access which knowledge. Fine-grained permissions ensure agents have the right information.',
      href: '/learning/training',
      icon: <Brain size={24} />,
      completed: false,
      tips: [
        'Assign relevant knowledge to each agent',
        'Monitor agent performance metrics',
        'Review and refine permissions',
        'Test agent responses',
      ],
      color: 'orange',
    },
  ];

  const colorClasses = {
    emerald: 'from-emerald-500 to-teal-500 border-emerald-200 bg-emerald-50',
    purple: 'from-purple-500 to-pink-500 border-purple-200 bg-purple-50',
    indigo: 'from-indigo-500 to-purple-500 border-indigo-200 bg-indigo-50',
    orange: 'from-orange-500 to-red-500 border-orange-200 bg-orange-50',
  };

  return (
    <LearningLayout title="Quick Start Guide" breadcrumbs={breadcrumbs}>
      <div className="max-w-4xl space-y-6 sm:space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-emerald-50 to-indigo-50 rounded-xl p-6 sm:p-8 border border-emerald-200 lc-animate-fade-in">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <PlayCircle className="text-emerald-600" size={24} />
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-full">
                Step-by-Step Guide
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Quick Start Guide
            </h1>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6">
              Get your Learning Center up and running in just a few steps. Follow this guide to set up your 
              knowledge base, configure AI agents, and start training intelligent conversations.
            </p>
            
            {/* Progress Bar */}
            <div className="p-4 bg-white rounded-lg border border-emerald-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm font-semibold text-emerald-600">
                  {completedSteps.size} of {steps.length} steps completed
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                  role="progressbar"
                  aria-valuenow={progressPercentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4 sm:space-y-6">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.has(step.id);
            return (
              <div
                key={step.id}
                className={`
                  relative flex flex-col sm:flex-row gap-4 sm:gap-6 p-5 sm:p-6 bg-white border-2 rounded-xl
                  ${colorClasses[step.color as keyof typeof colorClasses].split(' ')[2]}
                  hover:shadow-lg transition-all duration-200 lc-animate-scale-in
                  focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2
                `}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Step Number */}
                <div className="flex-shrink-0 flex items-start gap-4">
                  <button
                    onClick={() => toggleStep(step.id)}
                    className="flex-shrink-0 focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2 rounded-full"
                    aria-label={isCompleted ? `Mark step ${step.id} as incomplete` : `Mark step ${step.id} as complete`}
                    aria-pressed={isCompleted}
                  >
                    {isCompleted ? (
                      <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-md hover:bg-emerald-600 transition-colors">
                        <CheckCircle size={24} className="text-white" />
                      </div>
                    ) : (
                      <div className={`
                        w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold text-lg
                        bg-gradient-to-br ${colorClasses[step.color as keyof typeof colorClasses].split(' ').slice(0, 2).join(' ')}
                        text-white border-white shadow-lg hover:scale-110 transition-transform
                      `}>
                        {step.id}
                      </div>
                    )}
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <div className={`
                          p-2 rounded-lg text-white flex-shrink-0
                          bg-gradient-to-br ${colorClasses[step.color as keyof typeof colorClasses].split(' ').slice(0, 2).join(' ')}
                        `}>
                          {step.icon}
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">{step.title}</h3>
                        {isCompleted && (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full flex items-center gap-1">
                            <CheckCircle size={12} />
                            Done
                          </span>
                        )}
                      </div>
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">{step.description}</p>
                    </div>
                  </div>

                  {/* Tips */}
                  {step.tips && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <TrendingUp size={16} className="text-indigo-500" />
                        Pro Tips:
                      </div>
                      <ul className="space-y-1.5">
                        {step.tips.map((tip, tipIndex) => (
                          <li key={tipIndex} className="flex items-start gap-2 text-sm text-gray-700">
                            <TrendingUp size={14} className="text-indigo-500 flex-shrink-0 mt-0.5" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Button */}
                  <Link
                    to={step.href}
                    className={`
                      inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-medium transition-all
                      bg-gradient-to-r ${colorClasses[step.color as keyof typeof colorClasses].split(' ').slice(0, 2).join(' ')}
                      text-white hover:shadow-md hover:scale-105 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2
                    `}
                  >
                    {isCompleted ? 'Review Step' : 'Get Started'}
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Completion Section */}
        {completedSteps.size === steps.length && (
          <div className="bg-gradient-to-r from-emerald-50 to-indigo-50 border border-emerald-200 rounded-xl p-6 sm:p-8 lc-animate-scale-up">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <CheckCircle className="text-emerald-600" size={24} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Congratulations! 🎉
                </h2>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed text-sm sm:text-base">
                You've completed all the quick start steps! You're now ready to explore advanced features like 
                bulk imports, category management, AI training optimization, and performance monitoring.
              </p>
            </div>
          </div>
        )}
        
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6 sm:p-8 lc-animate-fade-in">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Sparkles className="text-indigo-600" size={24} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Next Steps
              </h2>
            </div>
            <p className="text-gray-700 mb-6 leading-relaxed text-sm sm:text-base">
              Once you've completed these steps, explore our documentation to learn about advanced features like 
              bulk imports, category management, AI training optimization, and performance monitoring.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <Link
                to="/learning/articles"
                className="p-4 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2"
              >
                <div className="font-semibold text-gray-900 mb-1">Browse Documentation</div>
                <p className="text-sm text-gray-600">Explore articles and guides</p>
              </Link>
              <Link
                to="/learn/overview"
                className="p-4 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2"
              >
                <div className="font-semibold text-gray-900 mb-1">Platform Overview</div>
                <p className="text-sm text-gray-600">Understand the architecture</p>
              </Link>
            </div>
            <Link
              to="/learning/articles"
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2"
            >
              Browse Full Documentation
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </LearningLayout>
  );
};
