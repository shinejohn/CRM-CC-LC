import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router';
import {
  Mail, MessageSquare, CheckSquare, Calendar, FileText,
  Share2, Voicemail, BookOpen, PenTool, Megaphone,
  Maximize2, ChevronDown, ChevronUp,
  Newspaper, PartyPopper, CloudSun, Building, Mic2, ArrowRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '../../core/ThemeProvider';
import { ColorPicker } from '../../components/ui/ColorPicker';
import { DashboardCard, Activity } from '@/types/command-center';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';

interface DashboardCardItem {
  id: string;
  title?: string;
  status?: string;
  from?: string;
  subject?: string;
  message?: string;
  event?: string;
  time?: string;
}

interface DashboardGridProps {
  widgets: DashboardCard[];
  activities: Activity[];
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
      <TodaysPostCard isDarkMode={isDarkMode} />
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

const contentTypeConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; dayLabel: string }> = {
  news: { icon: Newspaper, label: 'Community News', dayLabel: 'Mon' },
  events: { icon: PartyPopper, label: 'Upcoming Events', dayLabel: 'Tue' },
  weather: { icon: CloudSun, label: 'Weather Update', dayLabel: 'Wed' },
  downtown: { icon: Building, label: 'Downtown Highlights', dayLabel: 'Thu' },
  spotlight: { icon: Mic2, label: 'Business Spotlight', dayLabel: 'Fri' },
};

function TodaysPostCard({ isDarkMode }: { isDarkMode: boolean }) {
  const { data, isLoading } = useQuery({
    queryKey: ['content-cards', 'today'],
    queryFn: () => apiClient.get('/content-cards/today').then(r => r.data),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const card = data?.card;
  const contentType = card?.content_type ?? data?.content_type ?? 'news';
  const config = contentTypeConfig[contentType] ?? contentTypeConfig.news;
  const TypeIcon = config.icon;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.55 }}
    >
      <Card className={`border-2 border-indigo-200 dark:border-indigo-800/50 overflow-hidden shadow-lg hover:shadow-xl transition-all rounded-xl ${isDarkMode ? 'bg-gradient-to-br from-indigo-950/40 to-violet-950/40' : 'bg-gradient-to-br from-indigo-50 to-violet-50'}`}>
        <div className={`p-4 flex items-center justify-between border-b ${isDarkMode ? 'border-white/10 bg-black/20' : 'border-white/50 bg-white/30'} backdrop-blur-sm`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-indigo-900/50' : 'bg-indigo-100'}`}>
              <TypeIcon className={`w-5 h-5 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`} />
            </div>
            <h3 className={`font-semibold ${isDarkMode ? 'text-indigo-200' : 'text-indigo-900'}`}>Today's Post</h3>
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${isDarkMode ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`}>
            {config.dayLabel}
          </span>
        </div>
        <CardContent className={`p-4 ${isDarkMode ? 'bg-black/20' : 'bg-white/60'}`}>
          {isLoading ? (
            <div className="animate-pulse space-y-2">
              <div className={`h-4 rounded ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
              <div className={`h-3 w-3/4 rounded ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
            </div>
          ) : (
            <div className="space-y-3">
              <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {config.label}
              </p>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'} line-clamp-2`}>
                {card?.caption_text ?? 'Content will be generated for your community today.'}
              </p>
              <Link
                to="/command-center/attract/content-cards"
                className={`inline-flex items-center gap-1.5 text-xs font-medium ${isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'} transition-colors`}
              >
                View & Post
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
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
  const mockData: Record<string, DashboardCardItem[]> = {
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

