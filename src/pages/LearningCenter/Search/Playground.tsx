import React from 'react';
import { LearningLayout } from '@/components/LearningCenter/Layout/LearningLayout';
import { SearchPlayground } from '@/components/LearningCenter/VectorSearch/SearchPlayground';
import { 
  Search, 
  Sparkles,
  Database,
  Zap,
  TrendingUp,
  Brain,
  FileText,
  BookOpen,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router';

export const SearchPlaygroundPage: React.FC = () => {
  return (
    <LearningLayout
      title="Semantic Search Playground"
      breadcrumbs={[
        { label: 'Learning Center', href: '/learning' },
        { label: 'Search' },
      ]}
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Search className="text-purple-600" size={24} />
              </div>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full">
                Vector Search
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Semantic Search Playground
            </h1>
            <p className="text-gray-700 leading-relaxed mb-4">
              Test and explore vector-based semantic search powered by pgvector embeddings. Search across FAQs, 
              articles, and business profiles using natural language queries. Compare semantic, keyword, and hybrid 
              search modes to understand how AI agents discover and retrieve knowledge.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/learning/faqs"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                <BookOpen size={16} />
                View Knowledge Base
              </Link>
              <Link
                to="/learning/training"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                <Brain size={16} />
                Configure AI Agents
              </Link>
            </div>
          </div>
        </div>

        {/* Search Types Explanation */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-purple-600" />
            Search Modes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={18} className="text-purple-600" />
                <div className="font-semibold text-gray-900">Semantic Search</div>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Vector embeddings understand meaning and context, finding relevant content even with different wording
              </p>
              <div className="text-xs text-purple-700 font-medium">Best for: Natural language queries</div>
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={18} className="text-indigo-600" />
                <div className="font-semibold text-gray-900">Keyword Search</div>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Traditional full-text search matching exact keywords and phrases in content
              </p>
              <div className="text-xs text-indigo-700 font-medium">Best for: Specific terms</div>
            </div>
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={18} className="text-emerald-600" />
                <div className="font-semibold text-gray-900">Hybrid Search</div>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Combines semantic and keyword search for optimal results with relevance scoring
              </p>
              <div className="text-xs text-emerald-700 font-medium">Best for: Comprehensive results</div>
            </div>
          </div>
        </div>

        {/* Search Playground Component */}
        <div>
          <SearchPlayground />
        </div>

        {/* Tips Section */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-indigo-100 rounded-lg flex-shrink-0">
              <TrendingUp className="text-indigo-600" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-3">Search Tips & Best Practices</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="font-medium text-gray-900 mb-2">Query Optimization</div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Use natural language questions</li>
                    <li>• Be specific about your topic</li>
                    <li>• Try different phrasings for better results</li>
                    <li>• Use hybrid search for comprehensive results</li>
                  </ul>
                </div>
                <div>
                  <div className="font-medium text-gray-900 mb-2">Understanding Results</div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Relevance scores indicate match quality</li>
                    <li>• Vector embeddings enable semantic matching</li>
                    <li>• Results ranked by similarity and relevance</li>
                    <li>• Filter by category, industry, or source</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LearningLayout>
  );
};
