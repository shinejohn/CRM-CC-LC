import {
  LayoutDashboard, Users, FileText, Megaphone,
  Package, Brain, Calendar, Settings, Activity
} from 'lucide-react';
import { NavItem } from '@/types/command-center';

export const mainNavigation: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/command-center/dashboard',
  },
  {
    id: 'activities',
    label: 'Activities',
    icon: Activity,
    path: '/command-center/activities',
    badge: 'dynamic', // Will show pending count
  },
  {
    id: 'customers',
    label: 'Customers',
    icon: Users,
    path: '/command-center/customers',
  },
  {
    id: 'content',
    label: 'Content',
    icon: FileText,
    path: '/command-center/content',
  },
  {
    id: 'campaigns',
    label: 'Campaigns',
    icon: Megaphone,
    path: '/command-center/campaigns',
  },
  {
    id: 'services',
    label: 'Services',
    icon: Package,
    path: '/command-center/services',
  },
  {
    id: 'ai-hub',
    label: 'AI Hub',
    icon: Brain,
    path: '/command-center/ai',
  },
  {
    id: 'intelligence-hub',
    label: 'Intelligence Hub',
    icon: Brain,
    path: '/command-center/intelligence-hub',
  },
];

export const secondaryNavigation: NavItem[] = [
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/command-center/settings',
  },
];

