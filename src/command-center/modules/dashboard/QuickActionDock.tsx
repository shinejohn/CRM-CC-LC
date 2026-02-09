import React from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Mail, Phone, FileText, Calendar,
  Users, Sparkles, MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  onClick: () => void;
}

export function QuickActionDock() {
  const actions: QuickAction[] = [
    { id: 'new', label: 'New Item', icon: Plus, color: 'bg-blue-500', onClick: () => {} },
    { id: 'email', label: 'Send Email', icon: Mail, color: 'bg-purple-500', onClick: () => {} },
    { id: 'call', label: 'Log Call', icon: Phone, color: 'bg-green-500', onClick: () => {} },
    { id: 'content', label: 'Create Content', icon: FileText, color: 'bg-orange-500', onClick: () => {} },
    { id: 'meeting', label: 'Schedule Meeting', icon: Calendar, color: 'bg-pink-500', onClick: () => {} },
    { id: 'customer', label: 'Add Customer', icon: Users, color: 'bg-cyan-500', onClick: () => {} },
    { id: 'ai', label: 'Ask AI', icon: Sparkles, color: 'bg-gradient-to-r from-purple-500 to-pink-500', onClick: () => {} },
  ];

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
    >
      <div className="bg-white dark:bg-slate-800 rounded-full shadow-2xl border border-gray-200 dark:border-slate-700 px-4 py-3 flex items-center gap-2">
        <TooltipProvider>
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Tooltip key={action.id} content={action.label}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`
                      w-12 h-12 rounded-full ${action.color} text-white
                      hover:scale-110 transition-transform shadow-lg
                    `}
                    onClick={action.onClick}
                    aria-label={action.label}
                  >
                    <Icon className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
              </Tooltip>
            );
          })}
          
          {/* More Options */}
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-500"
            aria-label="More options"
          >
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </TooltipProvider>
      </div>
    </motion.div>
  );
}

