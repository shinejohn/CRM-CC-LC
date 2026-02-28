import React from 'react';
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}
export function Skeleton({
  className,
  ...props
}: SkeletonProps) {
  return <div className={`animate-pulse rounded-md bg-slate-100 ${className || ''}`} {...props} />;
}
// Preset skeleton components for common use cases
export function SkeletonText({
  lines = 3,
  className
}: {
  lines?: number;
  className?: string;
}) {
  return <div className={`space-y-2 ${className || ''}`}>
      {Array.from({
      length: lines
    }).map((_, i) => <Skeleton key={i} className="h-4" style={{
      width: i === lines - 1 ? '80%' : '100%'
    }} />)}
    </div>;
}
export function SkeletonCard({
  className
}: {
  className?: string;
}) {
  return <div className={`rounded-lg border border-slate-200 p-6 ${className || ''}`}>
      <Skeleton className="h-6 w-2/3 mb-4" />
      <SkeletonText lines={3} />
    </div>;
}
export function SkeletonTable({
  rows = 5,
  columns = 4
}: {
  rows?: number;
  columns?: number;
}) {
  return <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4">
        {Array.from({
        length: columns
      }).map((_, i) => <Skeleton key={i} className="h-10 flex-1" />)}
      </div>
      {/* Rows */}
      {Array.from({
      length: rows
    }).map((_, rowIndex) => <div key={rowIndex} className="flex gap-4">
          {Array.from({
        length: columns
      }).map((_, colIndex) => <Skeleton key={colIndex} className="h-12 flex-1" />)}
        </div>)}
    </div>;
}