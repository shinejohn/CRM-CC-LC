import React from 'react';
import { motion } from 'framer-motion';
import { Building2, ArrowRight, Globe, FileText, MessageSquare, Users, Sparkles } from 'lucide-react';

export interface SourceCompleteness {
  source: string;
  label: string;
  completeness: number;
}

interface ProfileStrengthIndicatorProps {
  /** 0-100 overall profile completeness. When undefined, shows loading state. */
  strength?: number;
  /** Per-source completeness (Google, Website, Survey, Customer Survey, AI Context) */
  sourceBreakdown?: SourceCompleteness[];
  onCompleteClick?: () => void;
}

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  google_places: <Globe className="w-4 h-4" />,
  website_scan: <Globe className="w-4 h-4" />,
  owner_survey: <FileText className="w-4 h-4" />,
  customer_survey: <Users className="w-4 h-4" />,
  ai_context: <Sparkles className="w-4 h-4" />,
};

export function ProfileStrengthIndicator({
  strength = 0,
  sourceBreakdown,
  onCompleteClick,
}: ProfileStrengthIndicatorProps) {
  const displayStrength = strength ?? 0;
  const hasBreakdown = sourceBreakdown && sourceBreakdown.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">My Business Profile</h2>
            <p className="text-sm text-slate-500">
              Complete your profile to help your AI employees serve customers better.
            </p>
          </div>
        </div>

        <div className="flex-1 max-w-md">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-medium text-slate-700">Profile Strength</span>
            <span className="text-lg font-bold text-blue-600">{displayStrength}%</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${displayStrength}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
            />
          </div>
        </div>

        <button
          onClick={onCompleteClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          Complete Now <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {hasBreakdown && (
        <div className="pt-4 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
            Completeness by source
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {sourceBreakdown.map(({ source, label, completeness }) => (
              <div key={source} className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                  {SOURCE_ICONS[source] ?? <MessageSquare className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700 truncate">{label}</p>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-0.5">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${completeness}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500">{completeness}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}