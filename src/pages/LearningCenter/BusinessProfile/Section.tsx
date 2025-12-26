import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Plus, GripVertical, Edit2, Trash2 } from 'lucide-react';
import { LearningLayout } from '@/components/LearningCenter/Layout/LearningLayout';
import { surveyApi } from '@/services/learning/survey-api';
import type { SurveySection, SurveyQuestion } from '@/types/learning';

export const BusinessProfileSectionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [section, setSection] = useState<SurveySection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadSection();
    }
  }, [id]);

  const loadSection = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await surveyApi.getSections();
      const found = data.find((s) => s.id === id);
      if (found) {
        const questions = await surveyApi.getQuestions(id);
        setSection({ ...found, questions });
      }
    } catch (error) {
      console.error('Failed to load section:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !section) {
    return (
      <LearningLayout title="Loading...">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </LearningLayout>
    );
  }

  return (
    <LearningLayout
      title={`Section: ${section.name}`}
      breadcrumbs={[
        { label: 'Learning Center', href: '/learning' },
        { label: 'Business Profile', href: '/learning/business-profile' },
        { label: section.name },
      ]}
      actions={
        <button
          onClick={() => navigate('/learning/business-profile')}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft size={16} />
          Back to Survey
        </button>
      }
    >
      <div className="space-y-6">
        {/* Section Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Section Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                defaultValue={section.name}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                defaultValue={section.description}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked={section.is_required} />
                <span className="text-sm text-gray-700">Required section</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked={section.is_conditional} />
                <span className="text-sm text-gray-700">Industry-specific questions</span>
              </label>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Questions ({section.questions.length})
            </h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
              <Plus size={16} />
              Add Question
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-4">Drag to reorder</p>

          <div className="space-y-3">
            {section.questions.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>
        </div>
      </div>
    </LearningLayout>
  );
};

interface QuestionCardProps {
  question: SurveyQuestion;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
      <div className="flex items-start gap-3">
        <button className="text-gray-400 hover:text-gray-600 cursor-move mt-1">
          <GripVertical size={16} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-700">
              Q{question.order}. {question.question_text}
            </span>
            {question.is_required && (
              <span className="text-xs text-red-600">*</span>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span>Type: {question.question_type}</span>
            <span>•</span>
            <span>{question.is_required ? 'Required' : 'Optional'}</span>
            <span>•</span>
            <span>All industries</span>
            {question.auto_populate_source && question.auto_populate_source !== 'none' && (
              <>
                <span>•</span>
                <span className="text-indigo-600">
                  Auto-populate: {question.auto_populate_source}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded">
            <Edit2 size={16} />
          </button>
          <button className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};


