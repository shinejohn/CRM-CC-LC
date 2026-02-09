import React, { useState, useEffect } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { PipelineStageCard } from '@/components/CRM/PipelineStageCard';
import { customerApi, type Customer, type PipelineStage } from '@/services/crm/crm-api';

const PIPELINE_STAGES: PipelineStage[] = ['hook', 'engagement', 'sales', 'retention'];

const stageLabels: Record<PipelineStage, string> = {
  hook: 'Hook (Trial)',
  engagement: 'Engagement',
  sales: 'Sales',
  retention: 'Retention',
  churned: 'Churned',
};

const stageColors: Record<PipelineStage, string> = {
  hook: 'bg-blue-100',
  engagement: 'bg-yellow-100',
  sales: 'bg-orange-100',
  retention: 'bg-green-100',
  churned: 'bg-gray-100',
};

export const KanbanBoard: React.FC = () => {
  const [customers, setCustomers] = useState<Record<PipelineStage, Customer[]>>({
    hook: [],
    engagement: [],
    sales: [],
    retention: [],
    churned: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggedCustomer, setDraggedCustomer] = useState<string | null>(null);
  const [targetStage, setTargetStage] = useState<PipelineStage | null>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const stageCustomers: Record<PipelineStage, Customer[]> = {
        hook: [],
        engagement: [],
        sales: [],
        retention: [],
        churned: [],
      };

      for (const stage of PIPELINE_STAGES) {
        try {
          const response = await customerApi.getCustomersByStage(stage);
          stageCustomers[stage] = response.data || [];
        } catch (err) {
          console.error(`Failed to load customers for stage ${stage}:`, err);
        }
      }

      setCustomers(stageCustomers);
    } catch (err) {
      console.error('Failed to load customers:', err);
      setError(err instanceof Error ? err.message : 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = async (customerId: string, newStage: PipelineStage) => {
    try {
      await customerApi.updatePipelineStage(customerId, newStage, 'manual');
      
      // Update local state optimistically
      const updatedCustomers = { ...customers };
      
      // Find customer in current stages
      let customer: Customer | undefined;
      for (const stage of PIPELINE_STAGES) {
        const index = updatedCustomers[stage].findIndex(c => c.id === customerId);
        if (index !== -1) {
          customer = updatedCustomers[stage][index];
          updatedCustomers[stage].splice(index, 1);
          break;
        }
      }
      
      // Add to new stage
      if (customer) {
        customer.pipeline_stage = newStage;
        updatedCustomers[newStage].push(customer);
        setCustomers(updatedCustomers);
      } else {
        // Reload if we couldn't find the customer
        await loadCustomers();
      }
    } catch (err) {
      console.error('Failed to update pipeline stage:', err);
      setError(err instanceof Error ? err.message : 'Failed to update pipeline stage');
      // Reload on error
      await loadCustomers();
    }
  };

  const handleDragStart = (customerId: string) => {
    setDraggedCustomer(customerId);
  };

  const handleDragOver = (e: React.DragEvent, stage: PipelineStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setTargetStage(stage);
  };

  const handleDragLeave = () => {
    setTargetStage(null);
  };

  const handleDrop = async (e: React.DragEvent, stage: PipelineStage) => {
    e.preventDefault();
    
    if (draggedCustomer) {
      await handleStageChange(draggedCustomer, stage);
    }
    
    setDraggedCustomer(null);
    setTargetStage(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading pipeline...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadCustomers}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const totalCustomers = Object.values(customers).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sales Pipeline</h1>
            <p className="text-gray-600 mt-1">
              {totalCustomers} customer{totalCustomers !== 1 ? 's' : ''} across all stages
            </p>
          </div>
          <button
            onClick={loadCustomers}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PIPELINE_STAGES.map((stage) => {
            const stageCustomers = customers[stage] || [];
            const isTarget = targetStage === stage;
            
            return (
              <div
                key={stage}
                onDragOver={(e) => handleDragOver(e, stage)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage)}
                className={`flex flex-col h-full min-h-[500px] rounded-lg border-2 transition-all ${
                  isTarget
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className={`p-4 rounded-t-lg ${stageColors[stage]}`}>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {stageLabels[stage]}
                    </h2>
                    <span className="px-2 py-1 bg-white rounded text-sm font-medium text-gray-700">
                      {stageCustomers.length}
                    </span>
                  </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {stageCustomers.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm py-8">
                      No customers in this stage
                    </div>
                  ) : (
                    stageCustomers.map((customer) => (
                      <PipelineStageCard
                        key={customer.id}
                        customer={customer}
                        onStageChange={(newStage) => handleStageChange(customer.id, newStage)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

