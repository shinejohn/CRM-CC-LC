import React from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CustomerStage } from '@/types/command-center';

interface CustomerFiltersProps {
  filters: {
    stage: CustomerStage | null;
    tags: string[];
    engagementMin: number;
    engagementMax: number;
  };
  onChange: (filters: CustomerFiltersProps['filters']) => void;
}

export function CustomerFilters({ filters, onChange }: CustomerFiltersProps) {
  const stages: CustomerStage[] = ['lead', 'prospect', 'customer', 'advocate', 'churned'];

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm">
        <Filter className="w-4 h-4 mr-2" />
        Filters
      </Button>
      {filters.stage && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange({ ...filters, stage: null })}
        >
          {filters.stage} ×
        </Button>
      )}
    </div>
  );
}

