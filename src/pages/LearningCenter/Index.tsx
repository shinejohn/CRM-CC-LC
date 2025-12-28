import React from 'react';
import { LearningLayout } from '@/components/LearningCenter/Layout/LearningLayout';
import { BookOpen, Search, GraduationCap, FileText, BarChart3, ArrowRight, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router';

export const LearningCenterIndexPage: React.FC = () => {
  const breadcrumbs = [{ label: 'Learning Center' }];

  const quickLinks = [
    {
      title: 'Service Catalog',
      description: 'Browse and purchase services for your business',
      href: '/learning/services',
      icon: <ShoppingCart size={24} />,
      color: 'green',
    },
    {
      title: 'Campaign Landing Pages',
      description: 'View all 60 email campaign landing pages',
      href: '/learning/campaigns',
      icon: <FileText size={24} />,
      color: 'indigo',
      badge: '60',
    },
    {
      title: 'Getting Started',
      description: 'New to the platform? Start here',
      href: '/learn/getting-started',
      icon: <BookOpen size={24} />,
      color: 'blue',
    },
    {
      title: 'FAQs',
      description: 'Manage your knowledge base of 410+ questions',
      href: '/learning/faqs',
      icon: <FileText size={24} />,
      color: 'emerald',
    },
    {
      title: 'Search',
      description: 'Test semantic search and find content',
      href: '/learning/search',
      icon: <Search size={24} />,
      color: 'purple',
    },
    {
      title: 'AI Training',
      description: 'Configure and train your AI agents',
      href: '/learning/training',
      icon: <GraduationCap size={24} />,
      color: 'orange',
    },
  ];

  const stats = [
    { label: 'FAQs', value: '410', href: '/learning/faqs' },
    { label: 'Business Profiles', value: '375', href: '/learning/business-profile' },
    { label: 'Articles', value: '0', href: '/learning/articles' },
    { label: 'Categories', value: '56', href: '/learning/settings/categories' },
  ];

  return (
    <LearningLayout title="Learning Center" breadcrumbs={breadcrumbs}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to the Learning Center</h1>
          <p className="text-lg text-gray-600">
            Manage your knowledge base, train AI agents, and power intelligent conversations across all Fibonacco services.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              to={stat.href}
              className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-center"
            >
              <div className="text-3xl font-bold text-indigo-600 mb-2">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </Link>
          ))}
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickLinks.map((link) => (
              <Link
                key={link.title}
                to={link.href}
                className="flex items-start gap-4 p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow relative"
              >
                <div className={`p-3 bg-${link.color}-100 rounded-lg text-${link.color}-600`}>
                  {link.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {link.title}
                    </h3>
                    {link.badge && (
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                        {link.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">{link.description}</p>
                </div>
                <ArrowRight size={20} className="text-gray-400" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </LearningLayout>
  );
};

