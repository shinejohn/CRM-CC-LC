import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, MessageSquare, BarChart2, FileText,
  Settings, Brain, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AIChat } from './AIChat';
import { AIWorkflowPanel } from './AIWorkflowPanel';
import { AIAnalysisPanel } from './AIAnalysisPanel';
import { AIPersonalitySelector } from './AIPersonalitySelector';
import { AICapabilities } from './AICapabilities';
import { useAI } from '../../hooks/useAI';

export function AIHubPage() {
  const [activeTab, setActiveTab] = useState('chat');
  const [, setShowSettings] = useState(false);
  
  const { 
    currentPersonality,
    isLoading,
  } = useAI();

  const quickActions: Array<{ id: string; label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = [
    { id: 'write', label: 'Write Content', icon: FileText, color: 'purple' },
    { id: 'analyze', label: 'Analyze Data', icon: BarChart2, color: 'blue' },
    { id: 'brainstorm', label: 'Brainstorm Ideas', icon: Sparkles, color: 'pink' },
    { id: 'email', label: 'Draft Email', icon: MessageSquare, color: 'green' },
    { id: 'report', label: 'Generate Report', icon: FileText, color: 'orange' },
  ];

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              AI Hub
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${!isLoading ? 'bg-green-500' : 'bg-red-500'}`} />
              {currentPersonality?.name || 'Default Assistant'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <AIPersonalitySelector />
          <Button variant="outline" size="icon" onClick={() => setShowSettings(true)}>
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {quickActions.map((action) => (
            <QuickActionButton key={action.id} action={action} />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="px-6 pt-4">
            <TabsList>
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="workflows" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Workflows
              </TabsTrigger>
              <TabsTrigger value="analysis" className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4" />
                Analysis
              </TabsTrigger>
              <TabsTrigger value="capabilities" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Capabilities
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="chat" className="flex-1 overflow-hidden mt-0">
            <AIChat />
          </TabsContent>

          <TabsContent value="workflows" className="flex-1 overflow-hidden p-6">
            <AIWorkflowPanel />
          </TabsContent>

          <TabsContent value="analysis" className="flex-1 overflow-hidden p-6">
            <AIAnalysisPanel />
          </TabsContent>

          <TabsContent value="capabilities" className="flex-1 overflow-hidden p-6">
            <AICapabilities />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function QuickActionButton({ action }: { action: { id: string; label: string; icon: React.ComponentType<{ className?: string }>; color: string } }) {
  const Icon = action.icon;
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap
        bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm
        hover:shadow-md transition-all
      `}
    >
      <Icon className={`w-4 h-4 text-${action.color}-500`} />
      <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{action.label}</span>
    </motion.button>
  );
}

