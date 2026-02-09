import React from 'react';
import { motion } from 'framer-motion';
import { Settings, BarChart2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Subscription } from '../../hooks/useServices';

const statusColors = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  cancelled: 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300',
  past_due: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

interface ActiveServiceCardProps {
  subscription: Subscription;
}

export function ActiveServiceCard({ subscription }: ActiveServiceCardProps) {
  const usagePercent = subscription.usage.limit > 0 
    ? (subscription.usage.current / subscription.usage.limit) * 100 
    : 0;
  const isHighUsage = usagePercent > 80;

  return (
    <motion.div whileHover={{ y: -4 }}>
      <Card className="hover:shadow-lg transition-all">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {subscription.serviceName}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={statusColors[subscription.status]}>
                  {subscription.status}
                </Badge>
                <Badge variant="outline">{subscription.tier}</Badge>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </div>

          {/* Pricing */}
          <div className="mb-4">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              ${subscription.price}
            </span>
            <span className="text-sm text-gray-500 dark:text-slate-400">
              /{subscription.billingCycle === 'monthly' ? 'mo' : 'yr'}
            </span>
          </div>

          {/* Usage */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-500 dark:text-slate-400">Usage</span>
              <span className={`text-sm font-medium ${isHighUsage ? 'text-orange-500' : 'text-gray-700 dark:text-slate-300'}`}>
                {subscription.usage.current.toLocaleString()} / {subscription.usage.limit.toLocaleString()} {subscription.usage.unit}
              </span>
            </div>
            <Progress
              value={usagePercent}
              className={isHighUsage ? '[&>div]:bg-orange-500' : ''}
            />
            {isHighUsage && (
              <p className="text-xs text-orange-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                High usage - consider upgrading
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-slate-700">
            <span className="text-xs text-gray-500 dark:text-slate-400">
              Next billing: {new Date(subscription.nextBillingDate).toLocaleDateString()}
            </span>
            <Button variant="link" size="sm" className="text-purple-600 dark:text-purple-400">
              <BarChart2 className="w-4 h-4 mr-1" />
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

