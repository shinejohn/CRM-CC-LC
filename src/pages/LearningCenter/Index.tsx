import React, { useState, useEffect } from 'react';
import { LearningLayout } from '@/components/LearningCenter/Layout/LearningLayout';
import { 
  BookOpen, 
  Search, 
  GraduationCap, 
  FileText, 
  BarChart3, 
  ArrowRight, 
  ShoppingCart,
  Zap,
  TrendingUp,
  Users,
  CheckCircle2,
  Sparkles,
  Database,
  Brain,
  BookMarked,
  PlayCircle,
  Shield,
  Rocket,
  Clock,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router';
import { contentApi, type Content } from '@/services/learning/content-api';

export const LearningCenterIndexPage: React.FC = () => {
  const breadcrumbs = [{ label: 'Learning Center' }];
  const [content, setContent] = useState<Content[]>([]);
  const [contentLoading, setContentLoading] = useState(true);

  useEffect(() => {
    contentApi.getContent({ type: undefined, per_page: 12 }).then((res) => {
      setContent(res.data ?? []);
    }).catch(() => setContent([])).finally(() => setContentLoading(false));
  }, []);

  const quickLinks = [
    {
      title: 'Getting Started',
      description: 'New to the platform? Start here with step-by-step guides and tutorials',
      href: '/learn/getting-started',
      icon: <Rocket size={24} />,
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500',
      badge: 'New',
    },
    {
      title: 'Knowledge Base & FAQs',
      description: 'Manage your comprehensive FAQ database with 410+ questions across 56 industry subcategories',
      href: '/learning/faqs',
      icon: <BookOpen size={24} />,
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-500',
      badge: '410+',
      highlight: true,
    },
    {
      title: 'Business Profile Survey',
      description: 'Configure and manage the 375-question business profile survey across 30 sections',
      href: '/learning/business-profile',
      icon: <Users size={24} />,
      color: 'purple',
      gradient: 'from-purple-500 to-pink-500',
      badge: '375 Qs',
    },
    {
      title: 'AI Training & Agents',
      description: 'Configure and train your AI agents with semantic search, embeddings, and knowledge management',
      href: '/learning/training',
      icon: <Brain size={24} />,
      color: 'orange',
      gradient: 'from-orange-500 to-red-500',
      badge: 'AI',
    },
    {
      title: 'Semantic Search',
      description: 'Test and explore vector-based semantic search with hybrid search capabilities',
      href: '/learning/search',
      icon: <Search size={24} />,
      color: 'indigo',
      gradient: 'from-indigo-500 to-purple-500',
    },
    {
      title: 'Articles & Documentation',
      description: 'Create and manage knowledge articles, documentation, and learning resources',
      href: '/learning/articles',
      icon: <FileText size={24} />,
      color: 'cyan',
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      title: 'Service Catalog',
      description: 'Browse and purchase services for your business across all Fibonacco platforms',
      href: '/learning/services',
      icon: <ShoppingCart size={24} />,
      color: 'green',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Campaign Landing Pages',
      description: 'View and manage all 60 email campaign landing pages with AI-powered content',
      href: '/learning/campaigns',
      icon: <Sparkles size={24} />,
      color: 'pink',
      gradient: 'from-pink-500 to-rose-500',
      badge: '60',
    },
  ];

  const features = [
    {
      icon: <Database size={20} />,
      title: 'Comprehensive Knowledge Base',
      description: '410+ FAQs, 375 survey questions, and unlimited articles',
      stat: '785+ Items',
    },
    {
      icon: <Brain size={20} />,
      title: 'AI-Powered Search',
      description: 'Vector embeddings and semantic search for intelligent content discovery',
      stat: '100% Vector',
    },
    {
      icon: <Shield size={20} />,
      title: 'Multi-Source Validation',
      description: 'Validate content from Google, SERP API, websites, and owner input',
      stat: '4 Sources',
    },
    {
      icon: <Zap size={20} />,
      title: 'Real-Time Learning',
      description: 'AI agents learn from every conversation and interaction',
      stat: 'Live',
    },
  ];

  const stats = [
    { 
      label: 'FAQs', 
      value: '410+', 
      href: '/learning/faqs',
      description: 'Questions',
      icon: <BookOpen size={20} className="text-emerald-600" />,
      trend: '+12 this week'
    },
    { 
      label: 'Business Profiles', 
      value: '375', 
      href: '/learning/business-profile',
      description: 'Survey Questions',
      icon: <Users size={20} className="text-purple-600" />,
      trend: '30 sections'
    },
    { 
      label: 'Articles', 
      value: '0', 
      href: '/learning/articles',
      description: 'Knowledge Articles',
      icon: <FileText size={20} className="text-cyan-600" />,
      trend: 'Get started'
    },
    { 
      label: 'Categories', 
      value: '56', 
      href: '/learning/settings/categories',
      description: 'Industry Subcategories',
      icon: <BookMarked size={20} className="text-indigo-600" />,
      trend: 'Organized'
    },
  ];

  return (
    <LearningLayout title="Learning Center" breadcrumbs={breadcrumbs}>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-indigo-50 via-white to-emerald-50 rounded-xl p-8 border border-indigo-100">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Sparkles className="text-indigo-600" size={24} />
              </div>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-full">
                AI-Powered Knowledge Platform
              </span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to the Learning Center
            </h1>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              Your comprehensive knowledge management hub for training AI agents, managing FAQs, and powering 
              intelligent conversations across all Fibonacco services. Build, validate, and optimize your knowledge 
              base with advanced semantic search and multi-source validation.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/learn/getting-started"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm hover:shadow-md"
              >
                <PlayCircle size={20} />
                Get Started Guide
              </Link>
              <Link
                to="/learning/faqs"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors font-medium"
              >
                <BookOpen size={20} />
                Explore FAQs
              </Link>
              <Link
                to="/learning/search"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <Search size={20} />
                Try Search
              </Link>
            </div>
          </div>
        </div>

        {/* Courses & Lessons - Real API */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <GraduationCap size={24} className="text-indigo-600" />
            Courses & Lessons
          </h2>
          {contentLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : content.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {content.map((item) => (
                <Link
                  key={item.slug}
                  to={`/learning/content/${item.slug}`}
                  className="group p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-indigo-300 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                      <PlayCircle size={20} className="text-indigo-600" />
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">
                      {item.type}
                    </span>
                  </div>
                  <div className="font-semibold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                    {item.title}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock size={12} />
                    {Math.round((item.duration_seconds ?? 0) / 60)} min
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 bg-gray-50 border border-gray-200 rounded-xl text-center text-gray-600">
              No courses or lessons available yet.
            </div>
          )}
        </div>

        {/* Stats Grid - Enhanced */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 size={24} className="text-indigo-600" />
            Knowledge Base Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Link
                key={stat.label}
                to={stat.href}
                className="group p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-indigo-300 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                    {stat.icon}
                  </div>
                  <TrendingUp size={16} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm font-semibold text-gray-700 mb-1">{stat.label}</div>
                <div className="text-xs text-gray-500 mb-2">{stat.description}</div>
                <div className="text-xs text-indigo-600 font-medium">{stat.trend}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    {feature.icon}
                  </div>
                  <div className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                    {feature.stat}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links - Enhanced Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Quick Access</h2>
            <Link
              to="/learn/getting-started"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              View all guides <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickLinks.map((link, index) => (
              <Link
                key={link.title}
                to={link.href}
                className={`
                  group relative flex items-start gap-4 p-6 bg-white border-2 rounded-xl
                  hover:shadow-xl transition-all duration-200 overflow-hidden
                  ${link.highlight 
                    ? 'border-emerald-300 bg-gradient-to-br from-emerald-50 to-white' 
                    : 'border-gray-200 hover:border-indigo-300'
                  }
                `}
              >
                {/* Gradient background accent */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${link.gradient} opacity-5 group-hover:opacity-10 transition-opacity rounded-full -mr-16 -mt-16`} />
                
                <div className={`
                  p-3 rounded-xl text-white shadow-sm flex-shrink-0
                  bg-gradient-to-br ${link.gradient}
                  group-hover:scale-110 transition-transform duration-200
                `}>
                  {link.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {link.title}
                    </h3>
                    {link.badge && (
                      <span className={`
                        px-2.5 py-1 text-xs font-bold rounded-full flex-shrink-0
                        ${link.badge === 'New' 
                          ? 'bg-blue-100 text-blue-700' 
                          : link.badge === 'AI'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-indigo-100 text-indigo-700'
                        }
                      `}>
                        {link.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-3">{link.description}</p>
                  <div className="flex items-center gap-2 text-sm font-medium text-indigo-600 group-hover:text-indigo-700">
                    <span>Explore</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-gradient-to-r from-indigo-50 to-emerald-50 border border-indigo-200 rounded-xl p-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Sparkles className="text-indigo-600" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Need Help Getting Started?</h2>
            </div>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Whether you're new to the platform or looking to optimize your knowledge base, we have resources 
              to help you succeed. Explore our guides, tutorials, and documentation.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/learn/getting-started"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                <PlayCircle size={18} />
                Getting Started Guide
              </Link>
              <Link
                to="/learn/overview"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <BookOpen size={18} />
                Platform Overview
              </Link>
              <Link
                to="/learning/articles"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <FileText size={18} />
                Documentation
              </Link>
              <Link
                to="/learning/search"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <Search size={18} />
                Search Knowledge Base
              </Link>
            </div>
          </div>
        </div>
      </div>
    </LearningLayout>
  );
};
