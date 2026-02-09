import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, MessageSquare, CheckSquare, Calendar, FileText,
  Share2, Voicemail, BookOpen, PenTool, Megaphone,
  Maximize2, ChevronDown, ChevronUp
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

const cardIcons: Record<string, React.ComponentType<{ className?: string }>> = {
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
                    aria-label={isExpanded ? 'Collapse card' : 'Expand card'}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-50 hover:opacity-100" aria-label="Maximize card">
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

