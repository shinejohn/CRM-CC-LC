import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Phone, Mail, MessageSquare, Calendar, FileText,
  CheckCircle2, Clock, AlertCircle, MoreVertical,
  ChevronRight, User
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Activity, ActivityType } from '@/types/command-center';

interface ActivityCardProps {
  activity: Activity;
  onComplete: () => void;
  onCancel: () => void;
  onClick?: () => void;
}

const activityIcons: Record<ActivityType, React.ComponentType<any>> = {
  phone_call: Phone,
  email: Mail,
  sms: MessageSquare,
  meeting: Calendar,
  task: FileText,
  note: FileText,
  deal_update: FileText,
  campaign: Mail,
};

const priorityColors = {
  urgent: 'border-l-red-500 bg-red-50 dark:bg-red-900/10',
  high: 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/10',
  normal: 'border-l-blue-500',
  low: 'border-l-gray-400',
};

const statusBadgeVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'success' | 'outline'> = {
  pending: 'secondary',
  in_progress: 'default',
  completed: 'success',
  cancelled: 'outline',
};

export function ActivityCard({ activity, onComplete, onCancel, onClick }: ActivityCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const Icon = activityIcons[activity.type] || FileText;
  const priorityClass = priorityColors[activity.metadata?.priority as keyof typeof priorityColors] || priorityColors.normal;
  const scheduledAt = activity.metadata?.scheduledAt || activity.metadata?.dueAt || activity.timestamp;
  const isOverdue = activity.status === 'pending' && 
                    activity.metadata?.dueAt && 
                    new Date(activity.metadata.dueAt) < new Date();

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card 
        className={`
          border-l-4 ${priorityClass}
          hover:shadow-md transition-all cursor-pointer
          ${isOverdue ? 'ring-2 ring-red-200 dark:ring-red-900' : ''}
        `}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className={`
              p-2 rounded-lg
              ${activity.status === 'completed' 
                ? 'bg-green-100 dark:bg-green-900/30' 
                : 'bg-gray-100 dark:bg-slate-700'
              }
            `}>
              {activity.status === 'completed' ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <Icon className="w-5 h-5 text-gray-600 dark:text-slate-400" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={`
                  font-medium truncate
                  ${activity.status === 'completed' 
                    ? 'text-gray-500 line-through' 
                    : 'text-gray-900 dark:text-white'
                  }
                `}>
                  {activity.title}
                </h4>
                <Badge variant={statusBadgeVariants[activity.status] || 'secondary'}>
                  {activity.status.replace('_', ' ')}
                </Badge>
                {isOverdue && (
                  <Badge variant="destructive">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Overdue
                  </Badge>
                )}
              </div>

              {activity.description && (
                <p className="text-sm text-gray-500 dark:text-slate-400 truncate mb-2">
                  {activity.description}
                </p>
              )}

              <div className="flex items-center gap-4 text-xs text-gray-400">
                {activity.customerId && (
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {activity.metadata?.customerName || 'Customer'}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(scheduledAt)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {activity.status === 'pending' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovered ? 1 : 0 }}
                >
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600 border-green-200 hover:bg-green-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onComplete();
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Complete
                  </Button>
                </motion.div>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem>Reschedule</DropdownMenuItem>
                  <DropdownMenuItem>Assign</DropdownMenuItem>
                  {activity.status === 'pending' && (
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={onCancel}
                    >
                      Cancel
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const hours = Math.abs(diff) / (1000 * 60 * 60);

  if (hours < 1) {
    const minutes = Math.abs(diff) / (1000 * 60);
    return diff > 0 
      ? `In ${Math.round(minutes)} min`
      : `${Math.round(minutes)} min ago`;
  }

  if (hours < 24) {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  }

  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
}

