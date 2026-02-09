import React from 'react';
import { Building2, Mail, Phone, Calendar, TrendingUp } from 'lucide-react';
import type { Customer, PipelineStage } from '@/services/crm/crm-api';

interface PipelineStageCardProps {
  customer: Customer;
  onStageChange: (newStage: PipelineStage) => void;
}

const stageColors: Record<PipelineStage, string> = {
  hook: 'bg-blue-50 border-blue-200',
  engagement: 'bg-yellow-50 border-yellow-200',
  sales: 'bg-orange-50 border-orange-200',
  retention: 'bg-green-50 border-green-200',
  churned: 'bg-gray-50 border-gray-200',
};

const stageLabels: Record<PipelineStage, string> = {
  hook: 'Hook (Trial)',
  engagement: 'Engagement',
  sales: 'Sales',
  retention: 'Retention',
  churned: 'Churned',
};

export const PipelineStageCard: React.FC<PipelineStageCardProps> = ({
  customer,
  onStageChange,
}) => {
  const currentStage = customer.pipeline_stage || 'hook';
  const cardColor = stageColors[currentStage] || stageColors.hook;

  const daysInStage = customer.days_in_stage || 0;
  const engagementScore = customer.engagement_score || 0;
  const trialDaysRemaining = customer.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(customer.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('customerId', customer.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={`p-4 rounded-lg border-2 cursor-move hover:shadow-md transition-shadow ${cardColor}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm mb-1">
            {customer.business_name}
          </h3>
          {customer.owner_name && (
            <p className="text-xs text-gray-600 mb-1">{customer.owner_name}</p>
          )}
        </div>
      </div>

      <div className="space-y-2 text-xs">
        {customer.email && (
          <div className="flex items-center text-gray-600">
            <Mail className="w-3 h-3 mr-1" />
            <span className="truncate">{customer.email}</span>
          </div>
        )}

        {customer.phone && (
          <div className="flex items-center text-gray-600">
            <Phone className="w-3 h-3 mr-1" />
            <span>{customer.phone}</span>
          </div>
        )}

        {customer.city && customer.state && (
          <div className="flex items-center text-gray-600">
            <Building2 className="w-3 h-3 mr-1" />
            <span>{customer.city}, {customer.state}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <div className="flex items-center text-gray-600">
            <Calendar className="w-3 h-3 mr-1" />
            <span>{daysInStage} days</span>
          </div>
          {engagementScore > 0 && (
            <div className="flex items-center text-gray-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>{engagementScore}</span>
            </div>
          )}
        </div>

        {trialDaysRemaining !== null && currentStage === 'hook' && (
          <div className="pt-1 text-xs font-medium text-blue-600">
            {trialDaysRemaining} days left in trial
          </div>
        )}
      </div>

      <div className="mt-3 pt-2 border-t border-gray-200">
        <select
          value={currentStage}
          onChange={(e) => onStageChange(e.target.value as PipelineStage)}
          className="w-full text-xs px-2 py-1 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={(e) => e.stopPropagation()}
        >
          <option value="hook">Hook (Trial)</option>
          <option value="engagement">Engagement</option>
          <option value="sales">Sales</option>
          <option value="retention">Retention</option>
          <option value="churned">Churned</option>
        </select>
      </div>
    </div>
  );
};

