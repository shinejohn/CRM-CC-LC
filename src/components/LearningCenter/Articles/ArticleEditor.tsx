import React, { useState, useEffect } from 'react';
import { X, Save, Eye, Sparkles, CheckCircle2 } from 'lucide-react';
import { SourceBadge } from '../Common/SourceBadge';
import { AgentAccessSelector } from '../Common/AgentAccessSelector';
import { knowledgeApi } from '@/services/learning/knowledge-api';
import type { KnowledgeArticle, ValidationSource } from '@/types/learning';

interface ArticleEditorProps {
  articleId?: string;
  onClose: () => void;
  onSave: () => void;
}

export const ArticleEditor: React.FC<ArticleEditorProps> = ({
  articleId,
  onClose,
  onSave,
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<KnowledgeArticle>>({
    title: '',
    content: '',
    category: '',
    source: 'owner',
    validation_status: 'unverified',
    is_public: true,
    allowed_agents: [],
    tags: [],
    metadata: {},
  });

  useEffect(() => {
    if (articleId) {
      loadArticle();
    }
  }, [articleId]);

  const loadArticle = async () => {
    if (!articleId) return;
    setLoading(true);
    try {
      const article = await knowledgeApi.getKnowledge(articleId);
      setFormData(article);
    } catch (error) {
      console.error('Failed to load article:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (articleId) {
        await knowledgeApi.updateKnowledge(articleId, formData);
      } else {
        await knowledgeApi.createKnowledge(formData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save article:', error);
      alert('Failed to save article. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateEmbedding = async () => {
    if (!articleId) return;
    try {
      await knowledgeApi.generateEmbedding(articleId);
      alert('Embedding generation started');
    } catch (error) {
      console.error('Failed to generate embedding:', error);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {articleId ? 'Edit Article' : 'Create New Article'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Article title"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <textarea
              value={formData.content || ''}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
              placeholder="Article content..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Supports Markdown formatting. Use **bold**, *italic*, `code`, etc.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <input
                type="text"
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Setup, Troubleshooting, Features"
              />
            </div>

            {/* Subcategory */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategory
              </label>
              <input
                type="text"
                value={formData.subcategory || ''}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Optional subcategory"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Source */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source *
              </label>
              <div className="flex items-center gap-4">
                {(['google', 'serpapi', 'website', 'owner'] as ValidationSource[]).map((source) => (
                  <label key={source} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="source"
                      value={source}
                      checked={formData.source === source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value as ValidationSource })}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <SourceBadge source={source} size="sm" showLabel />
                  </label>
                ))}
              </div>
            </div>

            {/* Source URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source URL
              </label>
              <input
                type="url"
                value={formData.source_url || ''}
                onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(formData.tags || []).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-sm"
                >
                  {tag}
                  <button
                    onClick={() => {
                      setFormData({
                        ...formData,
                        tags: formData.tags?.filter((_, i) => i !== index),
                      });
                    }}
                    className="text-indigo-700 hover:text-indigo-900"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add tag and press Enter..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  setFormData({
                    ...formData,
                    tags: [...(formData.tags || []), e.currentTarget.value],
                  });
                  e.currentTarget.value = '';
                }
              }}
            />
          </div>

          {/* AI Agent Access */}
          <div>
            <AgentAccessSelector
              agents={[
                { id: '1', name: 'CRM Manager', type: 'crm' },
                { id: '2', name: 'Email Agent', type: 'email' },
                { id: '3', name: 'SMS Agent', type: 'sms' },
              ]}
              selectedAgents={formData.allowed_agents || []}
              onChange={(ids) => setFormData({ ...formData, allowed_agents: ids })}
            />
          </div>

          {/* Embedding Status */}
          {articleId && (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-600" />
                <span className="text-sm font-medium text-gray-700">
                  Embedding Status
                </span>
                {formData.embedding_status === 'completed' && (
                  <CheckCircle2 size={16} className="text-emerald-600" />
                )}
              </div>
              <button
                onClick={handleGenerateEmbedding}
                className="px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Generate Embedding
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


