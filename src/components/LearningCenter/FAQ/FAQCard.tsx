import React from 'react';
import { Edit2, Eye, Copy, MoreVertical, ThumbsUp, ThumbsDown } from 'lucide-react';
import { SourceBadge } from '../Common/SourceBadge';
import { ValidationIndicator } from '../Common/ValidationIndicator';
import { UsageStats } from '../Common/UsageStats';
import { EmbeddingIndicator } from '../Common/EmbeddingIndicator';
import type { FAQItem } from '@/types/learning';

interface FAQCardProps {
  faq: FAQItem;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  className?: string;
}

export const FAQCard: React.FC<FAQCardProps> = ({
  faq,
  isSelected = false,
  onSelect,
  onEdit,
  onView,
  onDuplicate,
  className = '',
}) => {
  const needsValidation = faq.validation_status === 'unverified' || faq.validation_status === 'disputed';
  const helpfulnessScore = faq.helpful_count + faq.not_helpful_count > 0
    ? Math.round((faq.helpful_count / (faq.helpful_count + faq.not_helpful_count)) * 100)
    : 0;

  return (
    <div
      className={`
        bg-white rounded-lg border-2 transition-all
        ${isSelected ? 'border-indigo-500 shadow-md' : 'border-gray-200 hover:border-gray-300'}
        ${needsValidation ? 'border-amber-300' : ''}
        ${className}
      `}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            {onSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect(faq.id)}
                className="mt-1 w-4 h-4 text-indigo-600 focus:ring-indigo-500 rounded"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {faq.category && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700">
                    {faq.category}
                  </span>
                )}
                {faq.industry_codes && faq.industry_codes.length > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700">
                    {faq.industry_codes[0]}
                  </span>
                )}
                <div className="ml-auto flex items-center gap-2">
                  <SourceBadge source={faq.source} size="sm" />
                </div>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                {faq.question}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-sm text-gray-600 line-clamp-3 mb-4">
          {faq.answer}
        </p>

        {/* Status indicators */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <ValidationIndicator
            status={faq.validation_status}
            verifiedAt={faq.validated_at}
          />
          {faq.embedding_status !== 'completed' && (
            <EmbeddingIndicator status={faq.embedding_status} />
          )}
        </div>

        {/* Stats */}
        <UsageStats
          views={faq.usage_count}
          helpfulCount={faq.helpful_count}
          notHelpfulCount={faq.not_helpful_count}
          agentCount={faq.allowed_agents?.length || 0}
          compact
        />
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit?.(faq.id)}
            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onView?.(faq.id)}
            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
            title="Preview"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => onDuplicate?.(faq.id)}
            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
            title="Duplicate"
          >
            <Copy size={16} />
          </button>
        </div>
        <button className="p-1.5 text-gray-500 hover:text-gray-700 rounded transition-colors">
          <MoreVertical size={16} />
        </button>
      </div>
    </div>
  );
};


