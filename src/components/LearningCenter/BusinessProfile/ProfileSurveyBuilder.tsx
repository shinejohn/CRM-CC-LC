import React, { useState, useEffect } from 'react';
import { Plus, GripVertical, Edit2, Eye, ChevronRight } from 'lucide-react';
import { surveyApi } from '@/services/learning/survey-api';
import type { SurveySection } from '@/types/learning';

export const ProfileSurveyBuilder: React.FC = () => {
  const [sections, setSections] = useState<SurveySection[]>([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sectionsData, analyticsData] = await Promise.all([
        surveyApi.getSections(),
        surveyApi.getAnalytics(),
      ]);
      setSections(sectionsData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load survey data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Business Profile Survey</h2>
          <p className="text-sm text-gray-600 mt-1">
            375 questions • 30 sections • Powers AI agent responses
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Eye size={16} />
          Preview Survey
        </button>
      </div>

      {/* Completion Stats */}
      {analytics && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Survey Completion Stats (across all businesses)
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">Average Completion</span>
                <span className="text-sm font-medium text-gray-900">
                  {analytics.avg_completion}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-indigo-600 h-3 rounded-full transition-all"
                  style={{ width: `${analytics.avg_completion}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-900 mb-1">Most completed:</div>
                <div className="text-gray-600">
                  {analytics.most_completed?.join(' • ') || 'N/A'}
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-900 mb-1">Least completed:</div>
                <div className="text-gray-600">
                  {analytics.least_completed?.join(' • ') || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Sections</h3>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
            <Plus size={16} />
            Add Section
          </button>
        </div>
        <p className="text-sm text-gray-600">Drag to reorder sections</p>

        {sections.map((section) => (
          <SectionCard key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
};

interface SectionCardProps {
  section: SurveySection;
}

const SectionCard: React.FC<SectionCardProps> = ({ section }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <button className="text-gray-400 hover:text-gray-600 cursor-move">
          <GripVertical size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-500">
              {section.order}.
            </span>
            <h4 className="text-base font-semibold text-gray-900">{section.name}</h4>
            <span className="text-sm text-gray-600">
              {section.questions.length} questions
            </span>
            {section.completion_percentage !== undefined && (
              <span className="text-sm font-medium text-gray-700">
                {section.completion_percentage}%
              </span>
            )}
          </div>
          {section.description && (
            <p className="text-sm text-gray-600 mt-1 ml-8">{section.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2 ml-8">
            {section.is_required && (
              <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded">
                Required
              </span>
            )}
            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
              All industries
            </span>
          </div>
        </div>
        <a
          href={`/learning/business-profile/section/${section.id}`}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded transition-colors"
        >
          <span>Edit</span>
          <ChevronRight size={14} />
        </a>
      </div>
    </div>
  );
};


