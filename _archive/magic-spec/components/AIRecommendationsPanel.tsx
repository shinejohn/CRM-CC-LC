import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, ArrowRight, Lightbulb } from 'lucide-react';

const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:8000/api/v1';

interface Recommendation {
  priority: string;
  category: string;
  title: string;
  impact: string;
  description: string;
  actions: string[];
}

const iconMap: Record<string, typeof TrendingUp> = {
  engagement: TrendingUp,
  sales: DollarSign,
  marketing: TrendingUp,
  general: Lightbulb,
};

const styleMap: Record<string, { icon: string; badge: string }> = {
  high: { icon: 'bg-emerald-100 text-emerald-600', badge: 'text-emerald-600 bg-emerald-50' },
  medium: { icon: 'bg-blue-100 text-blue-600', badge: 'text-blue-600 bg-blue-50' },
  opportunity: { icon: 'bg-emerald-100 text-emerald-600', badge: 'text-emerald-600 bg-emerald-50' },
};

export function AIRecommendationsPanel({ onSeeAll }: { onSeeAll?: () => void }) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
    fetch(`${API_BASE}/crm/recommendations`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
    })
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((res) => setRecommendations(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setRecommendations([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100 h-full">
        <div className="flex items-center justify-center py-8 text-indigo-600">Loading recommendations...</div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100 h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-indigo-900 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-indigo-600" /> AI Recommendations
        </h3>
        {onSeeAll && (
          <button onClick={onSeeAll} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
            See All <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {recommendations.length === 0 ? (
          <p className="text-sm text-slate-600">No recommendations at this time.</p>
        ) : (
          recommendations.slice(0, 3).map((rec, i) => {
            const Icon = iconMap[rec.category] ?? Lightbulb;
            const style = styleMap[rec.priority] ?? styleMap.medium;
            return (
              <motion.div
                key={rec.title + i}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 * i }}
                className="bg-white rounded-lg p-5 shadow-sm border border-indigo-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg shrink-0 ${style.icon}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">{rec.title}</h4>
                    <p className="text-sm text-slate-600 mb-3 leading-relaxed">{rec.description}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${style.badge}`}>
                        {rec.impact}
                      </span>
                      {rec.actions[0] && (
                        <button className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                          {rec.actions[0]} <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}