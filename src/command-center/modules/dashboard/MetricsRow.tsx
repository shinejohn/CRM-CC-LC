import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Users, DollarSign, Mail, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface Metric {
  id: string;
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface MetricsRowProps {
  metrics: Metric[];
  isLoading: boolean;
}

const defaultMetrics: Metric[] = [
  { id: 'revenue', label: 'Revenue', value: '$12,450', change: 12.5, icon: DollarSign, color: 'emerald' },
  { id: 'customers', label: 'Customers', value: 156, change: 8, icon: Users, color: 'blue' },
  { id: 'emails', label: 'Emails Sent', value: '2,340', change: -3, icon: Mail, color: 'purple' },
  { id: 'meetings', label: 'Meetings', value: 24, change: 15, icon: Calendar, color: 'orange' },
];

export function MetricsRow({ metrics = defaultMetrics, isLoading }: MetricsRowProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
    >
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        const isPositive = (metric.change || 0) >= 0;
        const TrendIcon = isPositive ? TrendingUp : TrendingDown;
        
        return (
          <motion.div
            key={metric.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 + index * 0.05 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500 dark:text-slate-400">
                    {metric.label}
                  </span>
                  <div className={`p-2 rounded-lg bg-${metric.color}-100 dark:bg-${metric.color}-900/30`}>
                    <Icon className={`w-4 h-4 text-${metric.color}-600 dark:text-${metric.color}-400`} />
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metric.value}
                  </span>
                  {metric.change !== undefined && (
                    <div className={`flex items-center text-sm ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                      <TrendIcon className="w-3 h-3 mr-1" />
                      <span>{Math.abs(metric.change)}%</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

