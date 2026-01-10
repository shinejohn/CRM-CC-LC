import React, { useState, useEffect } from 'react';
import { LearningLayout } from '@/components/LearningCenter/Layout/LearningLayout';
import { BookOpen, PlayCircle, FileText, ArrowRight, Rocket, Sparkles, CheckCircle2, TrendingUp, Clock, Users } from 'lucide-react';
import { Link } from 'react-router';

export const GettingStartedIndexPage: React.FC = () => {
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  
  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('getting-started-progress');
    if (saved) {
      try {
        setCompletedSections(new Set(JSON.parse(saved)));
      } catch (e) {
        console.error('Failed to load progress:', e);
      }
    }
  }, []);
  
  // Save progress to localStorage
  const markComplete = (sectionId: string) => {
    setCompletedSections(prev => {
      const next = new Set(prev);
      next.add(sectionId);
      localStorage.setItem('getting-started-progress', JSON.stringify(Array.from(next)));
      return next;
    });
  };
  
  const progressPercentage = (completedSections.size / sections.length) * 100;
  const breadcrumbs = [
    { label: 'Learning Center', href: '/learning' },
    { label: 'Getting Started' },
  ];

  const sections = [
    {
      id: 'overview',
      title: 'Platform Overview',
      description: 'Understand the core concepts, architecture, and capabilities of the Fibonacco Learning Center',
      href: '/learn/overview',
      icon: <BookOpen size={24} />,
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500',
      features: ['Three-layer architecture', 'AI-enhanced learning', 'Knowledge base structure'],
    },
    {
      id: 'quickstart',
      title: 'Quick Start Guide',
      description: 'Get up and running in minutes with our step-by-step quick start tutorial',
      href: '/learn/quickstart',
      icon: <PlayCircle size={24} />,
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-500',
      features: ['Create your first FAQ', 'Set up business profile', 'Test semantic search'],
      badge: 'Recommended',
    },
    {
      id: 'tutorial',
      title: 'First Steps Tutorial',
      description: 'Complete walkthrough for your first presentation creation and AI interaction',
      href: '/learn/tutorial',
      icon: <FileText size={24} />,
      color: 'purple',
      gradient: 'from-purple-500 to-pink-500',
      features: ['Presentation creation', 'AI chat interaction', 'Knowledge management'],
    },
    {
      id: 'setup',
      title: 'Account Setup',
      description: 'Configure your account, permissions, and initial settings for optimal use',
      href: '/learn/setup',
      icon: <Rocket size={24} />,
      color: 'orange',
      gradient: 'from-orange-500 to-red-500',
      features: ['Account configuration', 'Permission setup', 'Initial settings'],
    },
  ];

  const quickActions = [
    {
      title: 'Create Your First FAQ',
      description: 'Add a question to your knowledge base',
      href: '/learning/faqs',
      icon: <FileText size={20} />,
    },
    {
      title: 'Try Semantic Search',
      description: 'Test vector-based search capabilities',
      href: '/learning/search',
      icon: <Sparkles size={20} />,
    },
    {
      title: 'Explore Knowledge Base',
      description: 'Browse 410+ FAQs and articles',
      href: '/learning/faqs',
      icon: <BookOpen size={20} />,
    },
  ];

  return (
    <LearningLayout title="Getting Started" breadcrumbs={breadcrumbs}>
      <div className="space-y-6 sm:space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 rounded-xl p-6 sm:p-8 border border-indigo-200 lc-animate-fade-in">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Rocket className="text-indigo-600" size={24} />
              </div>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-full">
                Welcome to Learning Center
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Getting Started with Learning Center
            </h1>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6">
              Welcome to the Fibonacco Learning Center! This platform helps you manage knowledge, train AI agents, 
              and power intelligent conversations. Follow these guides to get started, or jump right in and explore 
              the features.
            </p>
            
            {/* Progress Bar */}
            {completedSections.size > 0 && (
              <div className="mb-6 p-4 bg-white rounded-lg border border-indigo-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Your Progress</span>
                  <span className="text-sm font-semibold text-indigo-600">
                    {completedSections.size} of {sections.length} completed
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                    role="progressbar"
                    aria-valuenow={progressPercentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
              </div>
            )}
            
            <div className="flex flex-wrap gap-3">
              <Link
                to="/learn/quickstart"
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium shadow-sm hover:shadow-md focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2"
              >
                <PlayCircle size={20} />
                Start Quick Guide
              </Link>
              <Link
                to="/learn/overview"
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-white border-2 border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-50 transition-all font-medium focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2"
              >
                <BookOpen size={20} />
                Read Overview
              </Link>
            </div>
          </div>
        </div>

        {/* Guide Sections */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
            <FileText size={24} className="text-indigo-600" />
            Learning Guides
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {sections.map((section, index) => {
              const isCompleted = completedSections.has(section.id);
              return (
                <Link
                  key={section.id}
                  to={section.href}
                  className="group relative block p-5 sm:p-6 bg-white border-2 border-gray-200 rounded-xl hover:shadow-xl hover:border-indigo-300 transition-all duration-200 overflow-hidden lc-animate-scale-in focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => markComplete(section.id)}
                >
                  {/* Gradient background accent */}
                  <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${section.gradient} opacity-5 group-hover:opacity-10 transition-opacity rounded-full -mr-20 -mt-20`} />
                  
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl text-white shadow-sm bg-gradient-to-br ${section.gradient} group-hover:scale-110 transition-transform duration-200 relative`}>
                        {section.icon}
                        {isCompleted && (
                          <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-1">
                            <CheckCircle2 size={12} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {section.badge && (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                            {section.badge}
                          </span>
                        )}
                        {isCompleted && (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full flex items-center gap-1">
                            <CheckCircle2 size={12} />
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      {section.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed">{section.description}</p>
                    {section.features && (
                      <ul className="space-y-1.5 mb-4">
                        {section.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="flex items-center gap-2 text-sm font-medium text-indigo-600 group-hover:text-indigo-700">
                      <span>{isCompleted ? 'Review guide' : 'Get started'}</span>
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 lc-animate-fade-in">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles size={20} className="text-indigo-600" />
            Quick Actions
          </h2>
          <p className="text-gray-600 mb-4 text-sm">
            Ready to dive in? Try these quick actions to get familiar with the platform:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.href}
                className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all group focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2 lc-animate-scale-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-100 transition-colors flex-shrink-0">
                    {action.icon}
                  </div>
                  <div className="font-semibold text-gray-900">{action.title}</div>
                </div>
                <p className="text-sm text-gray-600">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 border border-indigo-200 rounded-xl p-6 sm:p-8 lc-animate-fade-in">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Sparkles className="text-indigo-600" size={24} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Need More Help?</h2>
            </div>
            <p className="text-gray-700 mb-6 leading-relaxed text-sm sm:text-base">
              If you're stuck or have questions, we have resources to help you succeed. Explore our documentation, 
              search the knowledge base, or check out our tutorials.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/learning/articles"
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2"
              >
                <FileText size={18} />
                Browse Documentation
              </Link>
              <Link
                to="/learning/search"
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2"
              >
                <Sparkles size={18} />
                Search Knowledge Base
              </Link>
              <Link
                to="/learning/faqs"
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2"
              >
                <BookOpen size={18} />
                View FAQs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </LearningLayout>
  );
};
