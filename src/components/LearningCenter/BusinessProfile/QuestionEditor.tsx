import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import type { SurveyQuestion, QuestionType } from '@/types/learning';

interface QuestionEditorProps {
  question?: SurveyQuestion;
  sectionId: string;
  onClose: () => void;
  onSave: (question: Partial<SurveyQuestion>) => void;
}

export const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  sectionId,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<SurveyQuestion>>({
    question_text: question?.question_text || '',
    help_text: question?.help_text || '',
    question_type: question?.question_type || 'text',
    is_required: question?.is_required || false,
    validation_rules: question?.validation_rules || [],
    options: question?.options || [],
    scale_config: question?.scale_config,
    is_conditional: question?.is_conditional || false,
    auto_populate_source: question?.auto_populate_source || 'none',
    requires_owner_verification: question?.requires_owner_verification || false,
    industry_specific: question?.industry_specific || false,
    ...question,
    section_id: sectionId,
  });

  const questionTypes: QuestionType[] = [
    'text',
    'textarea',
    'select',
    'multi_select',
    'scale',
    'date',
    'time',
    'datetime',
    'number',
    'currency',
    'phone',
    'email',
    'url',
    'address',
    'media',
    'file',
    'boolean',
    'rating',
  ];

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {question ? 'Edit Question' : 'Create Question'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              <Save size={16} />
              Save
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Question Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Text *
            </label>
            <input
              type="text"
              value={formData.question_text}
              onChange={(e) =>
                setFormData({ ...formData, question_text: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="What products or services do you offer?"
            />
          </div>

          {/* Help Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Help Text
            </label>
            <input
              type="text"
              value={formData.help_text || ''}
              onChange={(e) => setFormData({ ...formData, help_text: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="List your main offerings. Be specific..."
            />
          </div>

          {/* Question Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Type *
            </label>
            <select
              value={formData.question_type}
              onChange={(e) =>
                setFormData({ ...formData, question_type: e.target.value as QuestionType })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              {questionTypes.map((type) => (
                <option key={type} value={type}>
                  {type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          {/* Options for Select/Multi-select */}
          {(formData.question_type === 'select' || formData.question_type === 'multi_select') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Options
              </label>
              <div className="space-y-2">
                {(formData.options || []).map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={option.label}
                      onChange={(e) => {
                        const newOptions = [...(formData.options || [])];
                        newOptions[index] = { ...option, label: e.target.value };
                        setFormData({ ...formData, options: newOptions });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <button
                      onClick={() => {
                        setFormData({
                          ...formData,
                          options: formData.options?.filter((_, i) => i !== index),
                        });
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    setFormData({
                      ...formData,
                      options: [
                        ...(formData.options || []),
                        { id: Date.now().toString(), label: '', value: '', order: (formData.options?.length || 0) + 1, is_other: false },
                      ],
                    });
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  + Add Option
                </button>
              </div>
            </div>
          )}

          {/* Scale Config */}
          {formData.question_type === 'scale' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min</label>
                <input
                  type="number"
                  value={formData.scale_config?.min || 1}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      scale_config: {
                        ...formData.scale_config,
                        min: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max</label>
                <input
                  type="number"
                  value={formData.scale_config?.max || 10}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      scale_config: {
                        ...formData.scale_config,
                        max: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Validation */}
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_required}
                onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">Required</span>
            </label>
          </div>

          {/* Data Enrichment */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Auto-populate from:
            </label>
            <div className="flex items-center gap-4">
              {(['none', 'serpapi', 'google'] as const).map((source) => (
                <label key={source} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="auto_populate"
                    value={source}
                    checked={formData.auto_populate_source === source}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        auto_populate_source: e.target.value as any,
                      })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700 capitalize">{source}</span>
                </label>
              ))}
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.requires_owner_verification}
                onChange={(e) =>
                  setFormData({ ...formData, requires_owner_verification: e.target.checked })
                }
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">
                Requires owner verification after auto-populate
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};


