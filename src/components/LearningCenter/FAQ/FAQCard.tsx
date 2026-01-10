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
    <article
      className={`
        lc-surface lc-radius-lg border-2 lc-transition lc-animate-scale-in
        ${isSelected ? 'lc-shadow-md' : 'lc-shadow-sm hover:lc-shadow-md'}
        ${needsValidation ? 'border-amber-300' : ''}
        ${className}
        group
      `}
      style={{
        borderColor: isSelected 
          ? 'var(--lc-primary)' 
          : needsValidation 
            ? 'var(--lc-accent)' 
            : 'var(--lc-border)',
        backgroundColor: 'var(--lc-surface)',
      }}
      aria-labelledby={`faq-question-${faq.id}`}
      aria-describedby={`faq-answer-${faq.id}`}
    >
      {/* Header */}
      <div className="p-4 border-b lc-border">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            {onSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect(faq.id)}
                className="mt-1 w-4 h-4 lc-transition"
                style={{
                  accentColor: 'var(--lc-primary)',
                }}
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {faq.category && (
                  <span 
                    className="inline-flex items-center px-2 py-0.5 lc-radius-md text-xs font-medium lc-transition"
                    style={{
                      backgroundColor: 'var(--lc-primary-bg)',
                      color: 'var(--lc-primary-dark)',
                    }}
                  >
                    {faq.category}
                  </span>
                )}
                {faq.industry_codes && faq.industry_codes.length > 0 && (
                  <span 
                    className="inline-flex items-center px-2 py-0.5 lc-radius-md text-xs font-medium lc-transition"
                    style={{
                      backgroundColor: 'rgba(139, 92, 246, 0.1)',
                      color: '#7c3aed',
                    }}
                  >
                    {faq.industry_codes[0]}
                  </span>
                )}
                <div className="ml-auto flex items-center gap-2">
                  <SourceBadge source={faq.source} size="sm" />
                </div>
              </div>
              <h3 
                id={`faq-question-${faq.id}`}
                className="text-base font-semibold lc-text-primary mb-2 group-hover:text-indigo-600 lc-transition" 
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {faq.question}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p 
          id={`faq-answer-${faq.id}`}
          className="text-sm lc-text-secondary line-clamp-3 mb-4"
        >
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
      <div 
        className="px-4 py-3 border-t lc-border flex items-center justify-between lc-transition"
        style={{ backgroundColor: 'var(--lc-surface-hover)' }}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit?.(faq.id)}
            className="p-1.5 lc-text-secondary hover:lc-text-primary lc-surface-hover lc-radius-md lc-transition focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2"
            title="Edit"
            aria-label={`Edit ${faq.question}`}
            style={{ backgroundColor: 'transparent' }}
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onView?.(faq.id)}
            className="p-1.5 lc-text-secondary hover:lc-text-primary lc-surface-hover lc-radius-md lc-transition focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2"
            title="Preview"
            aria-label={`Preview ${faq.question}`}
            style={{ backgroundColor: 'transparent' }}
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => onDuplicate?.(faq.id)}
            className="p-1.5 lc-text-secondary hover:lc-text-primary lc-surface-hover lc-radius-md lc-transition focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2"
            title="Duplicate"
            aria-label={`Duplicate ${faq.question}`}
            style={{ backgroundColor: 'transparent' }}
          >
            <Copy size={16} />
          </button>
        </div>
        <button 
          className="p-1.5 lc-text-secondary hover:lc-text-primary lc-surface-hover lc-radius-md lc-transition focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2"
          aria-label="More options"
          aria-haspopup="true"
        >
          <MoreVertical size={16} />
        </button>
      </div>
    </article>
  );
};


