import { motion } from 'framer-motion';
import { Zap, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ToolCall } from '@/types/command-center';

interface ToolCallWithStatus extends ToolCall {
  status?: 'pending' | 'running' | 'completed' | 'error';
}

interface ToolCallIndicatorProps {
  toolCall: ToolCallWithStatus;
}

export function ToolCallIndicator({ toolCall }: ToolCallIndicatorProps) {
  const status = toolCall.status || 'pending';
  
  const statusIcons: Record<string, JSX.Element> = {
    pending: <Loader2 className="w-3 h-3 animate-spin" />,
    running: <Zap className="w-3 h-3 animate-pulse" />,
    completed: <CheckCircle className="w-3 h-3 text-green-500" />,
    error: <XCircle className="w-3 h-3 text-red-500" />,
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400',
    running: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    completed: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    error: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`
        flex items-center gap-2 p-3 rounded-lg border
        ${statusColors[status] || statusColors.pending}
        border-gray-200 dark:border-slate-700
      `}
    >
      <div className="flex-shrink-0">
        {statusIcons[status] || statusIcons.pending}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{toolCall.name}</span>
          <Badge variant="outline" className="text-xs">
            {status}
          </Badge>
        </div>
        {toolCall.arguments && Object.keys(toolCall.arguments).length > 0 && (
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 truncate">
            {JSON.stringify(toolCall.arguments)}
          </p>
        )}
      </div>
    </motion.div>
  );
}

