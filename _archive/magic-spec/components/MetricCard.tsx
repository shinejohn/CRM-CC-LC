import React from 'react';
import { ArrowUp, ArrowDown, Minus, BoxIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
// New API props
interface NewMetricCardProps {
  label: string;
  value: string;
  trend: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
    color?: string;
  };
  icon: BoxIcon;
  iconColor: string;
  iconBg: string;
  subtext?: string;
  progress?: {
    current: number;
    target: number;
    label?: string;
  };
  sparklineData?: number[];
  // Old API compatibility
  title?: never;
  color?: never;
}
// Old API props (for backward compatibility)
interface OldMetricCardProps {
  title: string;
  value: string;
  trend: {
    value: number;
    isPositive: boolean;
  };
  icon: BoxIcon;
  color: 'blue' | 'emerald' | 'purple' | 'amber' | 'red';
  // New API compatibility
  label?: never;
  iconColor?: never;
  iconBg?: never;
  direction?: never;
}
type MetricCardProps = NewMetricCardProps | OldMetricCardProps;
export function MetricCard(props: MetricCardProps) {
  // Detect which API is being used
  const isOldAPI = 'title' in props && props.title !== undefined;
  if (isOldAPI) {
    // Old API - render with Card wrapper
    const {
      title,
      value,
      trend,
      icon: Icon,
      color
    } = props as OldMetricCardProps;
    const colorMap = {
      blue: {
        iconColor: 'text-blue-600',
        iconBg: 'bg-blue-100',
        trendColor: trend.isPositive ? 'text-emerald-600' : 'text-red-600'
      },
      emerald: {
        iconColor: 'text-emerald-600',
        iconBg: 'bg-emerald-100',
        trendColor: trend.isPositive ? 'text-emerald-600' : 'text-red-600'
      },
      purple: {
        iconColor: 'text-purple-600',
        iconBg: 'bg-purple-100',
        trendColor: trend.isPositive ? 'text-emerald-600' : 'text-red-600'
      },
      amber: {
        iconColor: 'text-amber-600',
        iconBg: 'bg-amber-100',
        trendColor: trend.isPositive ? 'text-emerald-600' : 'text-red-600'
      },
      red: {
        iconColor: 'text-red-600',
        iconBg: 'bg-red-100',
        trendColor: trend.isPositive ? 'text-emerald-600' : 'text-red-600'
      }
    };
    const colors = colorMap[color];
    const TrendIcon = trend.isPositive ? ArrowUp : ArrowDown;
    return <motion.div whileHover={{
      y: -2
    }} transition={{
      duration: 0.2
    }} className="h-full">
        <Card className="h-full">
          <CardContent className="p-6 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg ${colors.iconBg}`}>
                <Icon className={`w-6 h-6 ${colors.iconColor}`} />
              </div>
              <Badge variant="secondary" className={`${colors.trendColor} bg-slate-50 border-0`}>
                <TrendIcon className="w-3 h-3 mr-1" />
                {trend.value}%
              </Badge>
            </div>

            <div className="flex-1">
              <h3 className="text-slate-500 text-sm font-medium mb-1">
                {title}
              </h3>
              <div className="text-2xl font-bold text-slate-900 mb-1">
                {value}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>;
  }
  // New API - render without Card wrapper (for gradient backgrounds)
  const {
    label,
    value,
    trend,
    icon: Icon,
    iconColor,
    iconBg,
    subtext,
    progress,
    sparklineData
  } = props as NewMetricCardProps;
  const trendColor = trend.direction === 'up' ? 'text-emerald-700' : trend.direction === 'down' ? 'text-red-700' : 'text-slate-600';
  const TrendIcon = trend.direction === 'up' ? ArrowUp : trend.direction === 'down' ? ArrowDown : Minus;
  return <motion.div whileHover={{
    y: -2
  }} transition={{
    duration: 0.2
  }} className="h-full">
      <div className="h-full bg-transparent">
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-lg ${iconBg} backdrop-blur-sm shadow-sm`}>
              <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
            <Badge variant="secondary" className={`${trendColor} bg-white/60 backdrop-blur-sm border-0 shadow-sm`}>
              <TrendIcon className="w-3 h-3 mr-1" />
              {trend.value}
            </Badge>
          </div>

          <div className="flex-1">
            <h3 className="text-slate-600 text-sm font-bold mb-1">{label}</h3>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              {value}
            </div>
            {subtext && <p className="text-xs font-medium text-slate-500">{subtext}</p>}
          </div>

          {progress && <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-600">
                  {progress.label || 'Progress'}
                </span>
                <span className="font-bold text-slate-800">
                  {Math.round(progress.current / progress.target * 100)}%
                </span>
              </div>
              <div className="h-2 bg-white/50 rounded-full overflow-hidden border border-white/20">
                <motion.div initial={{
              width: 0
            }} animate={{
              width: `${progress.current / progress.target * 100}%`
            }} transition={{
              duration: 1,
              ease: 'easeOut'
            }} className="h-full bg-blue-600 rounded-full" />
              </div>
            </div>}

          {sparklineData && <div className="mt-4 h-8 flex items-end space-x-1">
              {sparklineData.map((val, i) => <motion.div key={i} initial={{
            height: 0
          }} animate={{
            height: `${val}%`
          }} transition={{
            duration: 0.5,
            delay: i * 0.05
          }} className="flex-1 bg-blue-500/20 rounded-sm hover:bg-blue-500/40 transition-colors" style={{
            minHeight: '4px'
          }} />)}
            </div>}
        </div>
      </div>
    </motion.div>;
}