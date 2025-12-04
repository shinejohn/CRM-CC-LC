import React, { useState } from 'react';
import { Eye, ThumbsUp, ThumbsDown, Bot } from 'lucide-react';

interface UsageStatsProps {
  views: number;
  helpfulCount: number;
  notHelpfulCount: number;
  agentCount?: number;
  lastUsed?: string;
  compact?: boolean;
  className?: string;
}

export const UsageStats: React.FC<UsageStatsProps> = ({
  views,
  helpfulCount,
  notHelpfulCount,
  agentCount,
  lastUsed,
  compact = false,
  className = '',
}) => {
  const [expanded, setExpanded] = useState(false);
  const total = helpfulCount + notHelpfulCount;
  const helpfulnessPercentage = total > 0 ? Math.round((helpfulCount / total) * 100) : 0;

  if (compact) {
    return (
      <div className={`flex items-center gap-4 text-sm text-gray-600 ${className}`}>
        <div className="flex items-center gap-1">
          <Eye size={14} />
          <span>{views}</span>
        </div>
        <div className="flex items-center gap-1">
          <ThumbsUp size={14} className="text-emerald-600" />
          <span>{helpfulnessPercentage}%</span>
        </div>
        {agentCount !== undefined && (
          <div className="flex items-center gap-1">
            <Bot size={14} className="text-indigo-600" />
            <span>{agentCount}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-4 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <div className="flex items-center gap-1">
          <Eye size={14} />
          <span>{views} views</span>
        </div>
        <div className="flex items-center gap-1">
          <ThumbsUp size={14} className="text-emerald-600" />
          <span>{helpfulCount} helpful ({helpfulnessPercentage}%)</span>
        </div>
        {expanded && (
          <>
            <div className="flex items-center gap-1">
              <ThumbsDown size={14} className="text-red-600" />
              <span>{notHelpfulCount} not helpful</span>
            </div>
            {agentCount !== undefined && (
              <div className="flex items-center gap-1">
                <Bot size={14} className="text-indigo-600" />
                <span>Used by {agentCount} agents</span>
              </div>
            )}
            {lastUsed && (
              <div className="text-xs text-gray-500">
                Last used: {new Date(lastUsed).toLocaleDateString()}
              </div>
            )}
          </>
        )}
      </button>
    </div>
  );
};


