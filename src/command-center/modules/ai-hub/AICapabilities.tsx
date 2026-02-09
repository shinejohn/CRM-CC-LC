import React from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare, FileText, BarChart2, Zap,
  Mail, Calendar, Users, TrendingUp
} from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Capability {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
}

const capabilities: Capability[] = [
  {
    id: 'chat',
    name: 'Conversational AI',
    description: 'Natural language conversations with context awareness',
    icon: MessageSquare,
    category: 'Communication',
  },
  {
    id: 'content-generation',
    name: 'Content Generation',
    description: 'Create emails, articles, social posts, and more',
    icon: FileText,
    category: 'Content',
  },
  {
    id: 'data-analysis',
    name: 'Data Analysis',
    description: 'Analyze customer data, trends, and performance metrics',
    icon: BarChart2,
    category: 'Analytics',
  },
  {
    id: 'workflow-automation',
    name: 'Workflow Automation',
    description: 'Automate complex multi-step tasks',
    icon: Zap,
    category: 'Automation',
  },
  {
    id: 'email-drafting',
    name: 'Email Drafting',
    description: 'Generate personalized email content',
    icon: Mail,
    category: 'Communication',
  },
  {
    id: 'scheduling',
    name: 'Smart Scheduling',
    description: 'AI-powered scheduling and calendar management',
    icon: Calendar,
    category: 'Automation',
  },
  {
    id: 'customer-insights',
    name: 'Customer Insights',
    description: 'Generate insights about customer behavior and preferences',
    icon: Users,
    category: 'Analytics',
  },
  {
    id: 'predictive-analytics',
    name: 'Predictive Analytics',
    description: 'Forecast trends and predict outcomes',
    icon: TrendingUp,
    category: 'Analytics',
  },
];

export function AICapabilities() {
  const categories = Array.from(new Set(capabilities.map(c => c.category)));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">AI Capabilities</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Explore what the AI can do for your business
        </p>
      </div>

      {categories.map((category) => (
        <div key={category}>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3 uppercase tracking-wide">
            {category}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {capabilities
              .filter(c => c.category === category)
              .map((capability) => {
                const Icon = capability.icon;
                return (
                  <motion.div
                    key={capability.id}
                    whileHover={{ y: -2 }}
                  >
                    <Card>
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                              {capability.name}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-slate-400">
                              {capability.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}

