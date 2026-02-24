import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';
import {
  LayoutDashboard, Users, FileText, Megaphone,
  ShoppingBag, MessageSquare, Calendar, Settings,
  ChevronLeft, ChevronRight, Sparkles, Activity,
  Shield, Brain
} from 'lucide-react';
import { NavItem } from '@/types/command-center';
import { useFeatureFlags } from '@/hooks/useFeatureFlag';
import { useNotificationBadge } from '@/hooks/useNotificationBadge';
import { useCurrentUser } from '../hooks/useCurrentUser';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  activeItem?: string;
  onNavigate?: (path: string) => void;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/command-center' },
  { id: 'activities', label: 'Activities', icon: Activity, path: '/command-center/activities', badge: 'dynamic' },
  { id: 'customers', label: 'Customers', icon: Users, path: '/command-center/customers' },
  { id: 'content', label: 'Content', icon: FileText, path: '/command-center/content' },
  { id: 'campaigns', label: 'Campaigns', icon: Megaphone, path: '/command-center/campaigns' },
  { id: 'commerce', label: 'Promote & Advertise', icon: Megaphone, path: '/command-center/commerce' },
  { id: 'services', label: 'Services', icon: ShoppingBag, path: '/command-center/services' },
  { id: 'ai-hub', label: 'AI Hub', icon: Sparkles, path: '/command-center/ai-hub' },
  { id: 'intelligence-hub', label: 'Intelligence Hub', icon: Brain, path: '/command-center/intelligence-hub' },
  { id: 'calendar', label: 'Calendar', icon: Calendar, path: '/command-center/calendar' },
  { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/command-center/messages', badge: 'dynamic' },
  { id: 'loyalty', label: 'Loyalty', icon: Sparkles, path: '/command-center/loyalty', featureFlag: 'loyalty_program' },
  { id: 'job-board', label: 'Job Board', icon: FileText, path: '/command-center/job-board', featureFlag: 'job_board' },
  { id: 'ops', label: 'Operations', icon: Shield, path: '/ops', adminOnly: true },
];

export function Sidebar({ collapsed, onToggle, activeItem = 'dashboard', onNavigate }: SidebarProps) {
  const navigate = useNavigate();
  const { unreadCount } = useNotificationBadge();
  const featureFlags = useFeatureFlags();
  const { isAdmin } = useCurrentUser();

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

  return (
    <motion.aside
      className="fixed left-0 top-16 bottom-0 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 z-30 flex flex-col"
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Navigation Items */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id || (item.path === '/ops' && typeof window !== 'undefined' && window.location.pathname.startsWith('/ops'));
            const featureEnabled = item.featureFlag ? featureFlags[item.featureFlag] : true;
            const showComingSoon = item.featureFlag && !featureEnabled;
            const adminOnly = item.adminOnly === true;
            const hideForNonAdmin = adminOnly && !isAdmin;
            if (hideForNonAdmin) return null;
            const badgeValue =
              item.badge === 'dynamic' && item.id === 'messages'
                ? unreadCount
                : item.badge === 'dynamic' && item.id === 'activities'
                  ? undefined
                  : item.badge;

            return (
              <li key={item.id}>
                <button
                  onClick={() => !showComingSoon && handleNavigate(item.path)}
                  disabled={showComingSoon}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                    ${showComingSoon ? 'opacity-60 cursor-not-allowed' : ''}
                    ${isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                    }
                  `}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left text-sm font-medium">
                        {item.label}
                      </span>
                      {showComingSoon && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                          Soon
                        </span>
                      )}
                      {!showComingSoon && badgeValue != null && badgeValue !== 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {badgeValue}
                        </span>
                      )}
                    </>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Settings & Collapse Toggle */}
      <div className="p-2 border-t border-gray-200 dark:border-slate-700">
        <button
          onClick={() => handleNavigate('/command-center/settings')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Settings</span>}
        </button>

        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 mt-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}

