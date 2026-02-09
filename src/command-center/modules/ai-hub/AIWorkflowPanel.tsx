import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap, Play, Pause, CheckCircle, Clock, AlertCircle,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress: number;
}

interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  output?: string;
}

const predefinedWorkflows: Workflow[] = [
  {
    id: 'lead-nurture',
    name: 'Lead Nurture Sequence',
    description: 'Automatically nurture new leads with personalized content',
    steps: [
      { id: '1', name: 'Analyze lead profile', status: 'pending' },
      { id: '2', name: 'Generate personalized content', status: 'pending' },
      { id: '3', name: 'Schedule follow-up emails', status: 'pending' },
      { id: '4', name: 'Set reminders', status: 'pending' },
    ],
    status: 'idle',
    progress: 0,
  },
  {
    id: 'content-repurpose',
    name: 'Content Repurposing',
    description: 'Transform one piece of content into multiple formats',
    steps: [
      { id: '1', name: 'Analyze source content', status: 'pending' },
      { id: '2', name: 'Generate social posts', status: 'pending' },
      { id: '3', name: 'Create email newsletter', status: 'pending' },
      { id: '4', name: 'Draft blog summary', status: 'pending' },
    ],
    status: 'idle',
    progress: 0,
  },
  {
    id: 'competitor-analysis',
    name: 'Competitor Analysis',
    description: 'Analyze competitor presence and generate insights',
    steps: [
      { id: '1', name: 'Gather competitor data', status: 'pending' },
      { id: '2', name: 'Analyze pricing', status: 'pending' },
      { id: '3', name: 'Compare features', status: 'pending' },
      { id: '4', name: 'Generate report', status: 'pending' },
    ],
    status: 'idle',
    progress: 0,
  },
];

export function AIWorkflowPanel() {
  const [workflows, setWorkflows] = useState(predefinedWorkflows);
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null);

  const runWorkflow = async (workflowId: string) => {
    setActiveWorkflow(workflowId);
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId ? { ...w, status: 'running' as const, progress: 0 } : w
    ));

    // Simulate workflow execution
    for (let i = 0; i < 4; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setWorkflows(prev => prev.map(w => {
        if (w.id !== workflowId) return w;
        const newSteps = w.steps.map((step, index) => ({
          ...step,
          status: index <= i ? 'completed' as const : index === i + 1 ? 'running' as const : 'pending' as const,
        }));
        return { ...w, steps: newSteps, progress: ((i + 1) / 4) * 100 };
      }));
    }

    setWorkflows(prev => prev.map(w => 
      w.id === workflowId ? { ...w, status: 'completed' as const } : w
    ));
    setActiveWorkflow(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Workflows</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">Automate complex tasks with AI-powered workflows</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workflows.map((workflow) => (
          <WorkflowCard
            key={workflow.id}
            workflow={workflow}
            isActive={activeWorkflow === workflow.id}
            onRun={() => runWorkflow(workflow.id)}
          />
        ))}
      </div>
    </div>
  );
}

function WorkflowCard({
  workflow,
  isActive,
  onRun,
}: {
  workflow: Workflow;
  isActive: boolean;
  onRun: () => void;
}) {
  const statusIcons = {
    idle: <Clock className="w-4 h-4 text-gray-400" />,
    running: <Zap className="w-4 h-4 text-yellow-500 animate-pulse" />,
    completed: <CheckCircle className="w-4 h-4 text-green-500" />,
    failed: <AlertCircle className="w-4 h-4 text-red-500" />,
  };

  return (
    <motion.div whileHover={{ y: -4 }}>
      <Card className={`transition-all ${isActive ? 'ring-2 ring-purple-500' : ''}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {statusIcons[workflow.status]}
              <CardTitle className="text-base">{workflow.name}</CardTitle>
            </div>
            <Badge variant={workflow.status === 'running' ? 'default' : 'outline'}>
              {workflow.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{workflow.description}</p>

          {workflow.status === 'running' && (
            <div className="mb-4">
              <Progress value={workflow.progress} className="h-2" />
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                {Math.round(workflow.progress)}% complete
              </p>
            </div>
          )}

          {/* Steps */}
          <div className="space-y-2 mb-4">
            {workflow.steps.map((step, index) => (
              <div
                key={step.id}
                className={`
                  flex items-center gap-2 text-sm
                  ${step.status === 'completed' ? 'text-green-600 dark:text-green-400' : ''}
                  ${step.status === 'running' ? 'text-purple-600 dark:text-purple-400 font-medium' : ''}
                  ${step.status === 'pending' ? 'text-gray-400 dark:text-slate-500' : ''}
                `}
              >
                <span className="w-4 text-center">{index + 1}.</span>
                <span className="flex-1">{step.name}</span>
                {step.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                {step.status === 'running' && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    <Zap className="w-3 h-3" />
                  </motion.div>
                )}
              </div>
            ))}
          </div>

          <Button
            className="w-full"
            onClick={onRun}
            disabled={workflow.status === 'running'}
          >
            {workflow.status === 'running' ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Workflow
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

