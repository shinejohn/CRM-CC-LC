import React, { useState, useEffect } from 'react';
import { Settings, Bot, Database, AlertCircle } from 'lucide-react';
import { trainingApi } from '@/services/learning/training-api';
import type { TrainingDataset } from '@/types/learning';

export const TrainingOverview: React.FC = () => {
  const [datasets, setDatasets] = useState<TrainingDataset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await trainingApi.getDatasets();
      setDatasets(data);
    } catch (error) {
      console.error('Failed to load training data:', error);
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
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Training & Knowledge</h2>
        <p className="text-sm text-gray-600">
          Configure what each AI agent knows and can access
        </p>
      </div>

      {/* AI Agents */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Agents</h3>
        <div className="space-y-4">
          <AgentCard
            name="CRM Manager"
            type="crm"
            faqs={410}
            articles={156}
            accuracy={94}
            lastTrained="2 hours ago"
          />
          <AgentCard
            name="Email Agent"
            type="email"
            faqs={210}
            articles={45}
            accuracy={91}
            lastTrained="1 day ago"
          />
          <AgentCard
            name="SMS Agent"
            type="sms"
            faqs={150}
            articles={20}
            accuracy={88}
            lastTrained="3 days ago"
          />
        </div>
      </div>

      {/* Training Datasets */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Training Datasets</h3>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
            Create Dataset
          </button>
        </div>
        <div className="space-y-3">
          {datasets.map((dataset) => (
            <DatasetCard key={dataset.id} dataset={dataset} />
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={AlertCircle} value="23" label="Pending Validation" color="amber" />
        <StatCard icon={AlertCircle} value="12" label="Low Helpfulness" color="red" />
        <StatCard icon={Database} value="98.2%" label="Embedding Coverage" color="emerald" />
        <StatCard icon={Bot} value="1.2s" label="Avg Query Time" color="blue" />
      </div>
    </div>
  );
};

interface AgentCardProps {
  name: string;
  type: string;
  faqs: number;
  articles: number;
  accuracy: number;
  lastTrained: string;
}

const AgentCard: React.FC<AgentCardProps> = ({
  name,
  type,
  faqs,
  articles,
  accuracy,
  lastTrained,
}) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
            <Bot size={24} className="text-indigo-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{name}</h4>
            <p className="text-sm text-gray-600">
              Access: {faqs} FAQs • {articles} Articles • All industries
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Last trained: {lastTrained} • Performance: {accuracy}% accuracy
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Settings size={16} />
          Configure
        </button>
      </div>
    </div>
  );
};

interface DatasetCardProps {
  dataset: TrainingDataset;
}

const DatasetCard: React.FC<DatasetCardProps> = ({ dataset }) => {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
      <div>
        <h4 className="font-semibold text-gray-900">{dataset.name}</h4>
        <p className="text-sm text-gray-600">
          {dataset.total_items} items • {dataset.verified_items} verified
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            dataset.status === 'active'
              ? 'bg-emerald-100 text-emerald-700'
              : dataset.status === 'draft'
              ? 'bg-gray-100 text-gray-700'
              : 'bg-blue-100 text-blue-700'
          }`}
        >
          {dataset.status}
        </span>
        <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
          Edit
        </button>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  value: string;
  label: string;
  color: 'emerald' | 'blue' | 'amber' | 'red';
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, value, label, color }) => {
  const colorClasses = {
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600',
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    amber: 'bg-amber-50 border-amber-200 text-amber-600',
    red: 'bg-red-50 border-red-200 text-red-600',
  };

  return (
    <div className={`border rounded-lg p-4 text-center ${colorClasses[color]}`}>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-sm font-medium">{label}</div>
    </div>
  );
};


