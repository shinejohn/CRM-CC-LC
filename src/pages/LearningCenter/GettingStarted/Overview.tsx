import React from 'react';
import { LearningLayout } from '@/components/LearningCenter/Layout/LearningLayout';
import { BookOpen, Layers, Bot, Database, Sparkles, Zap, Shield, TrendingUp, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router';

export const GettingStartedOverviewPage: React.FC = () => {
  const breadcrumbs = [
    { label: 'Learning Center', href: '/learning' },
    { label: 'Getting Started', href: '/learn/getting-started' },
    { label: 'Platform Overview' },
  ];

  const architectureFeatures = [
    {
      icon: <Layers size={24} className="text-indigo-600" />,
      title: 'Three-Layer Architecture',
      description: 'Our system combines Template, Industry, and Customer data to create personalized presentations',
      items: [
        'Template Layer: Base structure and design',
        'Industry Layer: Vertical-specific content',
        'Customer Layer: Business-specific data',
      ],
      color: 'indigo',
    },
    {
      icon: <Bot size={24} className="text-emerald-600" />,
      title: 'AI-Enhanced Learning',
      description: 'Every interaction with AI agents improves the knowledge base through automatic FAQ generation and data capture',
      items: [
        'Semantic search with vector embeddings',
        'Real-time FAQ generation from conversations',
        'Context-aware responses',
      ],
      color: 'emerald',
    },
    {
      icon: <Database size={24} className="text-purple-600" />,
      title: 'Knowledge Base',
      description: 'Manage 410+ FAQs across 56 industry subcategories with multi-source validation',
      items: [
        '410 FAQ questions',
        '56 industry subcategories',
        'Vector-based semantic search',
      ],
      color: 'purple',
    },
    {
      icon: <BookOpen size={24} className="text-amber-600" />,
      title: 'Business Profiles',
      description: '375-question survey across 30 sections to capture comprehensive business data',
      items: [
        '30 survey sections',
        'Multi-format questions',
        'AI-powered data capture',
      ],
      color: 'amber',
    },
  ];

  const keyCapabilities = [
    {
      title: 'Semantic Search',
      description: 'Vector embeddings enable intelligent search that understands meaning and context',
      icon: <Sparkles size={20} />,
    },
    {
      title: 'Multi-Source Validation',
      description: 'Validate content from Google, SERP API, websites, and owner input',
      icon: <Shield size={20} />,
    },
    {
      title: 'Real-Time Learning',
      description: 'AI agents learn from every conversation, improving responses automatically',
      icon: <Zap size={20} />,
    },
    {
      title: 'Fine-Grained Access Control',
      description: 'Control which AI agents can access which knowledge through permissions',
      icon: <Shield size={20} />,
    },
  ];

  return (
    <LearningLayout title="Platform Overview" breadcrumbs={breadcrumbs}>
      <div className="max-w-5xl space-y-6 sm:space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 sm:p-8 border border-blue-200 lc-animate-fade-in">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Layers className="text-blue-600" size={24} />
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                Architecture & Concepts
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Platform Overview
            </h1>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              The Fibonacco Learning Center is a comprehensive knowledge management system that powers AI agents 
              across multiple services. Understand how templates, industry data, and customer information combine 
              to create intelligent, personalized experiences.
            </p>
          </div>
        </div>

        {/* Architecture Overview */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
            <Layers size={24} className="text-indigo-600" />
            System Architecture
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {architectureFeatures.map((feature, index) => {
              const colorClasses = {
                indigo: 'bg-indigo-50 border-indigo-200',
                emerald: 'bg-emerald-50 border-emerald-200',
                purple: 'bg-purple-50 border-purple-200',
                amber: 'bg-amber-50 border-amber-200',
              };

              return (
                <div
                  key={index}
                  className={`p-5 sm:p-6 border-2 rounded-xl ${colorClasses[feature.color as keyof typeof colorClasses]} lc-animate-scale-in hover:shadow-md transition-all`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <div className="flex-shrink-0">{feature.icon}</div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{feature.title}</h3>
                  </div>
                  <p className="text-sm sm:text-base text-gray-700 mb-4 leading-relaxed">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Key Capabilities */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 lc-animate-fade-in">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap size={20} className="text-indigo-600" />
            Key Capabilities
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {keyCapabilities.map((capability, index) => (
              <div 
                key={index} 
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors lc-animate-scale-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 flex-shrink-0">
                    {capability.icon}
                  </div>
                  <div className="font-semibold text-gray-900">{capability.title}</div>
                </div>
                <p className="text-sm text-gray-600">{capability.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6 sm:p-8 lc-animate-fade-in">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
            <TrendingUp size={24} className="text-indigo-600" />
            How It Works
          </h2>
          <div className="space-y-4 sm:space-y-6">
            {[
              {
                step: 1,
                title: 'Create Knowledge Base',
                description: 'Build your knowledge base with FAQs, articles, and business profile data. Use categories, tags, and industry codes to organize content effectively.',
              },
              {
                step: 2,
                title: 'Generate Vector Embeddings',
                description: 'Automatic vector embeddings enable semantic search. Content is processed and stored with embeddings for intelligent retrieval.',
              },
              {
                step: 3,
                title: 'Configure AI Agents',
                description: 'Assign knowledge to specific AI agents with fine-grained permissions. Control which agents can access which content.',
              },
              {
                step: 4,
                title: 'Enable Intelligent Conversations',
                description: 'AI agents use semantic search to find relevant knowledge and generate context-aware responses. Every conversation improves the system.',
              },
            ].map((item, index) => (
              <div 
                key={item.step} 
                className="flex gap-4 lc-animate-slide-in-right"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
                  {item.step}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{item.title}</h3>
                  <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 lc-animate-fade-in">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h2>
          <p className="text-gray-700 mb-4 text-sm sm:text-base">
            Now that you understand the platform architecture, explore our guides to get started:
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/learn/quickstart"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2"
            >
              Quick Start Guide
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/learning/faqs"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2"
            >
              Explore FAQs
            </Link>
            <Link
              to="/learning/training"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2"
            >
              Configure AI Agents
            </Link>
          </div>
        </div>
      </div>
    </LearningLayout>
  );
};
