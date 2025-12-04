import React, { useState, useEffect } from 'react';
import { X, Save, Eye, Sparkles, CheckCircle2 } from 'lucide-react';
import { SourceBadge } from '../Common/SourceBadge';
import { AgentAccessSelector } from '../Common/AgentAccessSelector';
import { knowledgeApi } from '@/services/learning/knowledge-api';
import type { FAQItem, ValidationSource } from '@/types/learning';

interface FAQEditorProps {
  faqId?: string;
  onClose: () => void;
  onSave: () => void;
}

export const FAQEditor: React.FC<FAQEditorProps> = ({
  faqId,
  onClose,
  onSave,
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<FAQItem>>({
    question: '',
    answer: '',
    short_answer: '',
    category: '',
    source: 'owner',
    validation_status: 'unverified',
    is_public: true,
    allowed_agents: [],
    tags: [],
    applies_to_industries: [],
  });

  useEffect(() => {
    if (faqId) {
      loadFAQ();
    }
  }, [faqId]);

  const loadFAQ = async () => {
    if (!faqId) return;
    setLoading(true);
    try {
      const faq = await knowledgeApi.getFAQ(faqId);
      setFormData(faq);
    } catch (error) {
      console.error('Failed to load FAQ:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (faqId) {
        await knowledgeApi.updateFAQ(faqId, formData);
      } else {
        await knowledgeApi.createFAQ(formData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save FAQ:', error);
      alert('Failed to save FAQ. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateEmbedding = async () => {
    if (!faqId) return;
    try {
      await knowledgeApi.generateEmbedding(faqId);
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {faqId ? 'Edit FAQ' : 'Create New FAQ'}
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
          {/* Question */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question *
            </label>
            <input
              type="text"
              value={formData.question || ''}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="How do I set up online ordering for my restaurant?"
            />
          </div>

          {/* Answer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Answer *
            </label>
            <textarea
              value={formData.answer || ''}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="To set up online ordering for your restaurant..."
            />
          </div>

          {/* Short Answer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Short Answer (for quick responses)
            </label>
            <input
              type="text"
              value={formData.short_answer || ''}
              onChange={(e) => setFormData({ ...formData, short_answer: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Set up through our partner platforms like..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select category</option>
              </select>
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry Subcategory
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All industries</option>
              </select>
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
            <div className="flex flex-wrap gap-2">
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
              <input
                type="text"
                placeholder="Add tag..."
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
          {faqId && (
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

