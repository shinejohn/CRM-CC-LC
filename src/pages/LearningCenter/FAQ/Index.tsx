import React, { useState } from 'react';
import { LearningLayout } from '@/components/LearningCenter/Layout/LearningLayout';
import { FAQList } from '@/components/LearningCenter/FAQ/FAQList';
import { FAQEditor } from '@/components/LearningCenter/FAQ/FAQEditor';
import { FAQBulkImport } from '@/components/LearningCenter/FAQ/FAQBulkImport';
import { 
  FileText, 
  Upload, 
  Plus, 
  BookOpen, 
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router';

export const FAQIndexPage: React.FC = () => {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorFAQId, setEditorFAQId] = useState<string | undefined>();
  const [importOpen, setImportOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddFAQ = () => {
    setEditorFAQId(undefined);
    setEditorOpen(true);
  };

  const handleEditFAQ = (id: string) => {
    setEditorFAQId(id);
    setEditorOpen(true);
  };

  const handleViewFAQ = (id: string) => {
    // Navigate to FAQ detail view
    window.location.href = `/learning/faqs/${id}`;
  };

  const handleSave = () => {
    setRefreshKey((k) => k + 1);
  };

  const stats = [
    { label: 'Total FAQs', value: '410+', icon: FileText, color: 'indigo' },
    { label: 'Categories', value: '56', icon: BookOpen, color: 'emerald' },
    { label: 'Validated', value: '387', icon: CheckCircle2, color: 'green' },
    { label: 'Pending Review', value: '23', icon: AlertCircle, color: 'amber' },
  ];

  return (
    <LearningLayout
      title="Knowledge Base & FAQs"
      breadcrumbs={[
        { label: 'Learning Center', href: '/learning' },
        { label: 'FAQs' },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setImportOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <Upload size={16} />
            Bulk Import
          </button>
          <button
            onClick={handleAddFAQ}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus size={16} />
            Add FAQ
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-emerald-50 to-indigo-50 rounded-xl p-6 border border-emerald-200">
          <div className="flex items-start justify-between">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <BookOpen className="text-emerald-600" size={24} />
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-full">
                  Knowledge Management
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Knowledge Base & FAQs
              </h1>
              <p className="text-gray-700 leading-relaxed mb-4">
                Manage your comprehensive FAQ database with 410+ questions across 56 industry subcategories. 
                Create, validate, and optimize knowledge articles that power AI agents across all Fibonacco services. 
                Use semantic search, multi-source validation, and vector embeddings for intelligent content discovery.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/learning/search"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                  <Search size={16} />
                  Test Semantic Search
                </Link>
                <Link
                  to="/learning/training"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                  <Sparkles size={16} />
                  Configure AI Agents
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const colorClasses = {
              indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
              emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
              green: 'bg-green-50 text-green-600 border-green-200',
              amber: 'bg-amber-50 text-amber-600 border-amber-200',
            };
            
            return (
              <div
                key={stat.label}
                className={`p-5 border-2 rounded-xl ${colorClasses[stat.color as keyof typeof colorClasses]}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon size={20} />
                  <TrendingUp size={16} className="opacity-50" />
                </div>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm font-medium opacity-80">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Key Features */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-indigo-600" />
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="font-semibold text-gray-900 mb-2">Semantic Search</div>
              <p className="text-sm text-gray-600">
                Vector embeddings enable intelligent search that understands meaning, not just keywords
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="font-semibold text-gray-900 mb-2">Multi-Source Validation</div>
              <p className="text-sm text-gray-600">
                Validate content from Google, SERP API, websites, and owner input for accuracy
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="font-semibold text-gray-900 mb-2">AI Agent Integration</div>
              <p className="text-sm text-gray-600">
                Control which AI agents can access which knowledge through fine-grained permissions
              </p>
            </div>
          </div>
        </div>

        {/* FAQ List */}
        <div>
          <FAQList
            key={refreshKey}
            onAddFAQ={handleAddFAQ}
            onEditFAQ={handleEditFAQ}
            onViewFAQ={handleViewFAQ}
          />
        </div>

        {/* Editor Modal */}
        {editorOpen && (
          <FAQEditor
            faqId={editorFAQId}
            onClose={() => setEditorOpen(false)}
            onSave={handleSave}
          />
        )}

        {/* Import Modal */}
        {importOpen && (
          <FAQBulkImport
            onClose={() => setImportOpen(false)}
            onComplete={handleSave}
          />
        )}
      </div>
    </LearningLayout>
  );
};
