import React, { useState, useEffect } from 'react';
import { RefreshCw, Play, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { knowledgeApi } from '@/services/learning/knowledge-api';

export const EmbeddingStatus: React.FC = () => {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    try {
      const data = await knowledgeApi.getEmbeddingStatus();
      setStatus(data);
    } catch (error) {
      console.error('Failed to load embedding status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessAll = async () => {
    try {
      await knowledgeApi.generateEmbedding('all');
      await loadStatus();
    } catch (error) {
      console.error('Failed to process all embeddings:', error);
      alert('Failed to start processing. Please try again.');
    }
  };

  if (loading || !status) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const total = status.total || 0;
  const completed = status.completed || 0;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Embedding Status</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={loadStatus}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button
            onClick={handleProcessAll}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            <Play size={16} />
            Process All
          </button>
        </div>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={CheckCircle2}
          value={status.completed || 0}
          label="Embedded"
          color="emerald"
        />
        <StatCard
          icon={Clock}
          value={status.processing || 0}
          label="Processing"
          color="blue"
          animate
        />
        <StatCard
          icon={AlertCircle}
          value={status.pending || 0}
          label="Pending"
          color="amber"
        />
        <StatCard
          icon={XCircle}
          value={status.failed || 0}
          label="Failed"
          color="red"
        />
      </div>

      {/* Progress */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm font-medium text-gray-900">
            {completed}/{total} ({percentage}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-indigo-600 h-3 rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Processing Queue */}
      {status.processing > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Processing Queue ({status.processing})
          </h3>
          <div className="space-y-2">
            {status.processing > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock size={16} className="text-blue-600 animate-spin" />
                <span>Processing {status.processing} embedding{status.processing > 1 ? 's' : ''}...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Failed Items */}
      {status.failed > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Failed Items ({status.failed})
            </h3>
            <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              Retry All
            </button>
          </div>
          <div className="space-y-2">
            {status.failed > 0 && (
              <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded">
                <div>
                  <div className="text-sm font-medium text-red-900">
                    {status.failed} item{status.failed > 1 ? 's' : ''} failed
                  </div>
                  <div className="text-xs text-red-700">
                    Check logs for details. Use retry to regenerate.
                  </div>
                </div>
                <button
                  onClick={async () => {
                    try {
                      await knowledgeApi.generateEmbedding('retry-failed');
                      await loadStatus();
                    } catch (error) {
                      console.error('Failed to retry:', error);
                    }
                  }}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Retry All
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface StatCardProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  value: number;
  label: string;
  color: 'emerald' | 'blue' | 'amber' | 'red';
  animate?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, value, label, color, animate }) => {
  const colorClasses = {
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600',
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    amber: 'bg-amber-50 border-amber-200 text-amber-600',
    red: 'bg-red-50 border-red-200 text-red-600',
  };

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color]}`}>
      <div className="flex items-center gap-3 mb-2">
        <Icon size={24} className={animate ? 'animate-spin' : ''} />
        <div className="text-2xl font-bold">{value}</div>
      </div>
      <div className="text-sm font-medium">{label}</div>
    </div>
  );
};

