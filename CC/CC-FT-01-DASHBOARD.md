# CC-FT-01: Dashboard Module

## Module Overview

| Property | Value |
|----------|-------|
| Module ID | CC-FT-01 |
| Name | Dashboard Module |
| Phase | 3 - Feature Modules |
| Dependencies | All Phase 2 Services |
| Estimated Time | 6 hours |
| Agent Assignment | Agent 11 |

---

## Purpose

Create the main dashboard view that serves as the landing page for the Command Center. This is the unified hub displaying metrics, quick access cards, recent activity, and actionable insights.

---

## UI Pattern References

**Primary Reference:** `/magic/patterns/UnifiedCommandCenter.tsx`

Key patterns to extract:
- Card grid layout with expandable cards
- Color-coded card system
- Metrics display
- Quick action dock
- Revenue/financial cards

**Secondary Reference:** `/magic/patterns/CentralCommandDashboard.tsx`

Key patterns to extract:
- Search bar styling
- Goal progress cards
- Notification indicators

**Tertiary Reference:** `/magic/patterns/DashboardWidgets.tsx`

Key patterns to extract:
- Widget component structure
- Data visualization patterns

---

## API Endpoints Used

```
GET    /v1/dashboard/metrics          # Key business metrics
GET    /v1/dashboard/widgets          # Widget configuration
PUT    /v1/dashboard/widgets/{id}     # Update widget position/settings
GET    /v1/dashboard/recent-activity  # Recent activity feed
GET    /v1/interactions               # Pending interactions
GET    /v1/customers?limit=5          # Recent customers
```

---

## Deliverables

### 1. Dashboard Page

```typescript
// src/command-center/modules/dashboard/Dashboard.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTheme } from '../../core/ThemeProvider';
import { MetricsRow } from './MetricsRow';
import { DashboardGrid } from './DashboardGrid';
import { QuickActionDock } from './QuickActionDock';
import { useDashboard } from '../../hooks/useDashboard';

export function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const { isDarkMode } = useTheme();
  const { metrics, widgets, activities, isLoading, refreshDashboard } = useDashboard();

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search activities, customers, content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 shadow-sm rounded-xl"
          />
        </div>
      </motion.div>

      {/* Quick Action Button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-slate-700 rounded-xl h-12"
        >
          <Plus className="w-4 h-4 mr-2" />
          Quick Action
          <ChevronDown className="w-4 h-4 ml-auto" />
        </Button>
      </motion.div>

      {/* Metrics Row */}
      <MetricsRow metrics={metrics} isLoading={isLoading} />

      {/* Main Dashboard Grid */}
      <DashboardGrid widgets={widgets} activities={activities} />

      {/* Quick Action Dock (Fixed at bottom) */}
      <QuickActionDock />
    </div>
  );
}
```

### 2. Metrics Row

```typescript
// src/command-center/modules/dashboard/MetricsRow.tsx

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
  icon: React.ComponentType<any>;
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
```

### 3. Dashboard Grid

```typescript
// src/command-center/modules/dashboard/DashboardGrid.tsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, MessageSquare, CheckSquare, Calendar, FileText,
  Share2, Voicemail, BookOpen, PenTool, Megaphone,
  Maximize2, MoreVertical, ChevronDown, ChevronUp
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '../../core/ThemeProvider';
import { ColorPicker } from '../../components/ui/ColorPicker';
import { DashboardCard } from '@/types/command-center';

interface DashboardGridProps {
  widgets: DashboardCard[];
  activities: any[];
}

const defaultCards: DashboardCard[] = [
  { id: 'tasks', type: 'tasks', title: 'Tasks', defaultColor: 'lavender', position: { row: 0, col: 0 }, size: { rows: 1, cols: 1 } },
  { id: 'email', type: 'email', title: 'Email', defaultColor: 'sky', position: { row: 0, col: 1 }, size: { rows: 1, cols: 1 } },
  { id: 'messages', type: 'messages', title: 'Messages', defaultColor: 'rose', position: { row: 0, col: 2 }, size: { rows: 1, cols: 1 } },
  { id: 'calendar', type: 'calendar', title: 'Calendar', defaultColor: 'mint', position: { row: 1, col: 0 }, size: { rows: 1, cols: 1 } },
  { id: 'files', type: 'files', title: 'Files', defaultColor: 'ocean', position: { row: 1, col: 1 }, size: { rows: 1, cols: 1 } },
  { id: 'articles', type: 'articles', title: 'Articles', defaultColor: 'peach', position: { row: 1, col: 2 }, size: { rows: 1, cols: 1 } },
];

const cardIcons: Record<string, React.ComponentType<any>> = {
  tasks: CheckSquare,
  email: Mail,
  messages: MessageSquare,
  calendar: Calendar,
  files: FileText,
  articles: BookOpen,
  content: PenTool,
  social: Share2,
  voicemail: Voicemail,
  advertisements: Megaphone,
};

export function DashboardGrid({ widgets = defaultCards, activities }: DashboardGridProps) {
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const { getColorScheme, isDarkMode } = useTheme();

  const toggleCard = (cardId: string) => {
    setExpandedCards(prev => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.25 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {widgets.map((card, index) => {
        const Icon = cardIcons[card.type] || FileText;
        const scheme = getColorScheme(card.id, card.defaultColor);
        const isExpanded = expandedCards[card.id];

        return (
          <motion.div
            key={card.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 + index * 0.05 }}
            layout
          >
            <Card
              className={`
                bg-gradient-to-br ${scheme.gradient}
                border-2 ${scheme.border}
                overflow-hidden shadow-lg hover:shadow-xl
                transition-all cursor-pointer rounded-xl
              `}
            >
              {/* Card Header */}
              <div
                className={`
                  p-4 flex items-center justify-between
                  border-b ${isDarkMode ? 'border-white/10 bg-black/20' : 'border-white/50 bg-white/30'}
                  backdrop-blur-sm
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${scheme.iconBg}`}>
                    <Icon className={`w-5 h-5 ${scheme.iconColor}`} />
                  </div>
                  <h3 className={`font-semibold ${scheme.text}`}>{card.title}</h3>
                </div>
                <div className="flex items-center gap-1">
                  <ColorPicker cardId={card.id} currentColor={card.defaultColor} />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-50 hover:opacity-100"
                    onClick={() => toggleCard(card.id)}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-50 hover:opacity-100">
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Card Content */}
              <CardContent className={`p-4 ${isDarkMode ? 'bg-black/20' : 'bg-white/60'}`}>
                <DashboardCardContent
                  cardType={card.type}
                  isExpanded={isExpanded}
                  isDarkMode={isDarkMode}
                />
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

// Card Content based on type
function DashboardCardContent({
  cardType,
  isExpanded,
  isDarkMode,
}: {
  cardType: string;
  isExpanded: boolean;
  isDarkMode: boolean;
}) {
  // Mock data - in real implementation, this comes from API
  const mockData: Record<string, any[]> = {
    tasks: [
      { id: '1', title: 'Review marketing copy', status: 'In Progress' },
      { id: '2', title: 'Update quarterly goals', status: 'Pending' },
    ],
    email: [
      { id: '1', from: 'Acme Corp', subject: 'New proposal' },
      { id: '2', from: 'Client Services', subject: 'Follow-up needed' },
    ],
    messages: [
      { id: '1', from: 'Sarah', message: 'Can we reschedule?' },
      { id: '2', from: 'Alex', message: 'Client approved!' },
    ],
    calendar: [
      { id: '1', event: 'Team Meeting', time: '2:00 PM' },
      { id: '2', event: 'Client Call', time: 'Tomorrow' },
    ],
  };

  const items = mockData[cardType] || [];
  const displayItems = isExpanded ? items : items.slice(0, 2);

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {displayItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`
              p-3 rounded-lg
              ${isDarkMode ? 'bg-black/20 hover:bg-black/30' : 'bg-white/60 hover:bg-white/80'}
              transition-colors cursor-pointer
            `}
          >
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {item.title || item.subject || item.event || item.message}
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              {item.status || item.from || item.time}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>

      {items.length > 2 && !isExpanded && (
        <p className="text-xs text-center text-gray-400 dark:text-slate-500 pt-2">
          +{items.length - 2} more items
        </p>
      )}
    </div>
  );
}
```

### 4. Quick Action Dock

```typescript
// src/command-center/modules/dashboard/QuickActionDock.tsx

import React from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Mail, Phone, FileText, Calendar,
  Users, Sparkles, MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
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
              <Tooltip key={action.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`
                      w-12 h-12 rounded-full ${action.color} text-white
                      hover:scale-110 transition-transform shadow-lg
                    `}
                    onClick={action.onClick}
                  >
                    <Icon className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{action.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
          
          {/* More Options */}
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-500"
          >
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </TooltipProvider>
      </div>
    </motion.div>
  );
}
```

### 5. useDashboard Hook

```typescript
// src/command-center/hooks/useDashboard.ts

import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api.service';
import { DashboardCard } from '@/types/command-center';

interface DashboardMetric {
  id: string;
  label: string;
  value: string | number;
  change?: number;
  icon: any;
  color: string;
}

interface UseDashboardReturn {
  metrics: DashboardMetric[];
  widgets: DashboardCard[];
  activities: any[];
  isLoading: boolean;
  error: string | null;
  refreshDashboard: () => Promise<void>;
  updateWidgetPosition: (widgetId: string, position: { row: number; col: number }) => Promise<void>;
}

export function useDashboard(): UseDashboardReturn {
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [widgets, setWidgets] = useState<DashboardCard[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [metricsRes, widgetsRes, activitiesRes] = await Promise.all([
        apiService.get('/v1/dashboard/metrics'),
        apiService.get('/v1/dashboard/widgets'),
        apiService.get('/v1/dashboard/recent-activity?limit=10'),
      ]);

      setMetrics(metricsRes.data || []);
      setWidgets(widgetsRes.data || []);
      setActivities(activitiesRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const updateWidgetPosition = useCallback(async (
    widgetId: string,
    position: { row: number; col: number }
  ) => {
    try {
      await apiService.put(`/v1/dashboard/widgets/${widgetId}`, { position });
      setWidgets(prev =>
        prev.map(w => (w.id === widgetId ? { ...w, position } : w))
      );
    } catch (err) {
      console.error('Failed to update widget position:', err);
    }
  }, []);

  return {
    metrics,
    widgets,
    activities,
    isLoading,
    error,
    refreshDashboard: fetchDashboardData,
    updateWidgetPosition,
  };
}
```

### 6. Dashboard Index

```typescript
// src/command-center/modules/dashboard/index.ts

export { Dashboard } from './Dashboard';
export { MetricsRow } from './MetricsRow';
export { DashboardGrid } from './DashboardGrid';
export { QuickActionDock } from './QuickActionDock';
export { useDashboard } from '../../hooks/useDashboard';
```

---

## Testing Requirements

```typescript
// src/command-center/modules/dashboard/__tests__/Dashboard.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import { Dashboard } from '../Dashboard';
import { ThemeProvider } from '../../../core/ThemeProvider';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('Dashboard', () => {
  it('renders search bar', () => {
    render(<Dashboard />, { wrapper });
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('renders metrics row', async () => {
    render(<Dashboard />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText(/revenue/i)).toBeInTheDocument();
    });
  });

  it('renders dashboard cards', async () => {
    render(<Dashboard />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText(/tasks/i)).toBeInTheDocument();
    });
  });
});
```

---

## Acceptance Criteria

- [ ] Dashboard loads with metrics, widgets, and activities
- [ ] Search bar is functional
- [ ] Quick action button opens dropdown
- [ ] Metrics display with trend indicators
- [ ] Cards are color-coded and expandable
- [ ] Color picker allows customization
- [ ] Quick action dock is visible and functional
- [ ] Loading states show skeletons
- [ ] Error states display properly
- [ ] Mobile responsive layout
- [ ] Dark mode fully supported

---

## Handoff

When complete, this module provides:

1. `Dashboard` - Main dashboard page
2. `MetricsRow` - Metrics display component
3. `DashboardGrid` - Card grid layout
4. `QuickActionDock` - Floating action bar
5. `useDashboard` - Data fetching hook

Other agents import:
```typescript
import { Dashboard, useDashboard } from '@/command-center/modules/dashboard';
```
