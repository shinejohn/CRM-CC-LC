import React from 'react';
import { motion } from 'framer-motion';
import { Skeleton, SkeletonCard } from './ui/skeleton';
import { Card, CardContent } from './ui/card';
interface LoadingStateProps {
  rows?: number;
  showAvatar?: boolean;
}
export function LoadingState({
  rows = 3,
  showAvatar = false
}: LoadingStateProps) {
  return <div className="space-y-4">
      {Array.from({
      length: rows
    }).map((_, index) => <motion.div key={index} initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      delay: index * 0.1
    }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {showAvatar && <Skeleton className="w-12 h-12 rounded-full shrink-0" />}
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>)}
    </div>;
}
export function LoadingSpinner({
  size = 'md'
}: {
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4'
  };
  return <div className="flex items-center justify-center p-8">
      <div className={`${sizeClasses[size]} border-slate-200 border-t-blue-600 rounded-full animate-spin`} />
    </div>;
}
// Additional preset loading components
export function LoadingCards({
  count = 3
}: {
  count?: number;
}) {
  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({
      length: count
    }).map((_, i) => <motion.div key={i} initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: i * 0.1
    }}>
          <SkeletonCard />
        </motion.div>)}
    </div>;
}