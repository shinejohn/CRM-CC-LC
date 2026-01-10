import React from 'react';
import { LearningLayout } from '@/components/LearningCenter/Layout/LearningLayout';
import { ArticleList } from '@/components/LearningCenter/Articles/ArticleList';
import { 
  FileText, 
  BookOpen,
  Sparkles,
  TrendingUp,
  Search,
  Plus,
  Database,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router';

export const ArticlesIndexPage: React.FC = () => {
  return (
    <LearningLayout
      title="Articles & Documentation"
      breadcrumbs={[
        { label: 'Learning Center', href: '/learning' },
        { label: 'Articles' },
      ]}
      actions={
        <Link
          to="/learning/articles/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus size={16} />
          New Article
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-200">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-cyan-100 rounded-lg">
                <FileText className="text-cyan-600" size={24} />
              </div>
              <span className="px-3 py-1 bg-cyan-100 text-cyan-700 text-sm font-semibold rounded-full">
                Knowledge Articles
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Articles & Documentation
            </h1>
            <p className="text-gray-700 leading-relaxed mb-4">
              Create and manage comprehensive knowledge articles, documentation, and learning resources. 
              Articles support markdown formatting, tags, categories, and vector embeddings for semantic search. 
              Build a searchable knowledge base that powers AI agents and helps users find information quickly.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/learning/search"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                <Search size={16} />
                Search Articles
              </Link>
              <Link
                to="/learning/faqs"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                <BookOpen size={16} />
                View FAQs
              </Link>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-cyan-50 rounded-lg">
                <Database className="text-cyan-600" size={20} />
              </div>
              <div className="font-semibold text-gray-900">Markdown Support</div>
            </div>
            <p className="text-sm text-gray-600">
              Write articles in Markdown with full formatting, code blocks, lists, and embedded media
            </p>
          </div>
          <div className="p-5 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Sparkles className="text-indigo-600" size={20} />
              </div>
              <div className="font-semibold text-gray-900">Vector Embeddings</div>
            </div>
            <p className="text-sm text-gray-600">
              Automatic vector embeddings enable semantic search and AI-powered content discovery
            </p>
          </div>
          <div className="p-5 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <CheckCircle2 className="text-emerald-600" size={20} />
              </div>
              <div className="font-semibold text-gray-900">Validation Ready</div>
            </div>
            <p className="text-sm text-gray-600">
              Integrate with multi-source validation workflow for content accuracy and verification
            </p>
          </div>
        </div>

        {/* Article List */}
        <div>
          <ArticleList />
        </div>

        {/* Empty State Helper */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-indigo-100 rounded-lg flex-shrink-0">
              <Sparkles className="text-indigo-600" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">Getting Started with Articles</h3>
              <p className="text-gray-700 mb-4 text-sm">
                Articles are perfect for longer-form content, documentation, tutorials, and guides. 
                Use markdown formatting to create rich, structured content that's easy to read and search.
              </p>
              <ul className="text-sm text-gray-600 space-y-1 mb-4">
                <li>• Use markdown for formatting and structure</li>
                <li>• Add tags and categories for organization</li>
                <li>• Vector embeddings enable semantic search</li>
                <li>• Link articles to FAQs and business profiles</li>
              </ul>
              <Link
                to="/learn/getting-started"
                className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                Learn more in the Getting Started guide
                <TrendingUp size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </LearningLayout>
  );
};
