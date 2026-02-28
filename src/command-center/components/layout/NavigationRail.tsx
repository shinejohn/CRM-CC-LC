import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Building2, Megaphone, TrendingUp,
  Package, BarChart3, Bot, GraduationCap, Settings,
  ChevronLeft, ChevronRight, ChevronDown,
  UserCircle, ClipboardList, HelpCircle,
  Stethoscope, Layers, FileText, Calendar,
  Kanban, FileCheck, Users, Activity,
  Briefcase, ShoppingCart, CreditCard, Gauge,
  Cpu, Workflow, Cog,
} from 'lucide-react';
import { useBusinessMode } from '@/hooks/useBusinessMode';

interface NavChild {
  label: string | (() => string);
  href: string;
  icon: React.ElementType;
}

interface VerbSection {
  verb: string;
  label: string;
  href: string;
  icon: React.ElementType;
  children: NavChild[];
}

const useNavSections = (): VerbSection[] => {
  const { t } = useBusinessMode();

  return [
    {
      verb: 'define',
      label: 'Define',
      href: '/command-center/define',
      icon: Building2,
      children: [
        { label: 'Business Profile', href: '/command-center/define/profile', icon: UserCircle },
        { label: 'Survey', href: '/command-center/define/survey', icon: ClipboardList },
        { label: 'FAQ', href: '/command-center/define/faq', icon: HelpCircle },
      ],
    },
    {
      verb: 'attract',
      label: 'Attract',
      href: '/command-center/attract',
      icon: Megaphone,
      children: [
        { label: 'Diagnostic', href: '/command-center/attract/diagnostic', icon: Stethoscope },
        { label: 'Campaigns', href: '/command-center/attract/campaigns', icon: Layers },
        { label: 'Articles', href: '/command-center/attract/articles', icon: FileText },
        { label: 'Events', href: '/command-center/attract/events', icon: Calendar },
      ],
    },
    {
      verb: 'sell',
      label: 'Sell',
      href: '/command-center/sell',
      icon: TrendingUp,
      children: [
        { label: () => t('pipeline'), href: '/command-center/sell/pipeline', icon: Kanban },
        { label: () => t('proposals'), href: '/command-center/sell/proposals', icon: FileCheck },
        { label: () => t('customers'), href: '/command-center/sell/customers', icon: Users },
        { label: () => t('activities'), href: '/command-center/sell/activities', icon: Activity },
      ],
    },
    {
      verb: 'deliver',
      label: 'Deliver',
      href: '/command-center/deliver',
      icon: Package,
      children: [
        { label: 'Services', href: '/command-center/deliver', icon: Briefcase },
        { label: 'Orders', href: '/command-center/deliver/orders', icon: ShoppingCart },
        { label: 'Invoices', href: '/command-center/deliver/billing', icon: CreditCard },
        { label: 'Platforms', href: '/command-center/deliver/platforms', icon: Gauge },
      ],
    },
    {
      verb: 'measure',
      label: 'Measure',
      href: '/command-center/measure',
      icon: BarChart3,
      children: [
        { label: 'Performance', href: '/command-center/measure', icon: BarChart3 },
        { label: 'Reports', href: '/command-center/measure/reports', icon: FileText },
        { label: 'Analytics', href: '/command-center/measure/analytics', icon: Activity },
      ],
    },
    {
      verb: 'automate',
      label: 'Automate',
      href: '/command-center/automate',
      icon: Bot,
      children: [
        { label: 'AI Employees', href: '/command-center/automate', icon: Cpu },
        { label: 'Workflows', href: '/command-center/automate/workflows', icon: Workflow },
        { label: 'Processes', href: '/command-center/automate/processes', icon: Cog },
      ],
    },
  ];
};

function getChildLabel(label: string | (() => string)): string {
  return typeof label === 'function' ? label() : label;
}

export function NavigationRail({ className }: { className?: string }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedVerbs, setExpandedVerbs] = useState<Set<string>>(() => {
    const path = location.pathname;
    const initial = new Set<string>();
    if (path.includes('/define')) initial.add('define');
    if (path.includes('/attract')) initial.add('attract');
    if (path.includes('/sell')) initial.add('sell');
    if (path.includes('/deliver')) initial.add('deliver');
    if (path.includes('/measure')) initial.add('measure');
    if (path.includes('/automate')) initial.add('automate');
    return initial;
  });

  const sections = useNavSections();
  const width = collapsed ? 64 : 256;

  const toggleVerb = (verb: string) => {
    setExpandedVerbs((prev) => {
      const next = new Set(prev);
      if (next.has(verb)) {
        next.delete(verb);
      } else {
        next.add(verb);
      }
      return next;
    });
  };

  const isPathActive = (href: string) => {
    if (href === '/command-center/') {
      return location.pathname === '/command-center' || location.pathname === '/command-center/';
    }
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const isVerbActive = (section: VerbSection) => {
    return location.pathname.startsWith(section.href);
  };

  return (
    <motion.nav
      animate={{ width }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-[var(--nexus-nav-bg)] border-r border-[var(--nexus-nav-border)] ${className || ''}`}
    >
      {/* Home / Dashboard */}
      <div className="px-2 pt-4 pb-2">
        <NavLink
          to="/command-center/"
          end
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mx-1 text-sm font-medium transition-colors ${
            isPathActive('/command-center/')
              ? 'bg-[var(--nexus-nav-active)] text-[var(--nexus-accent-primary)] border-l-2 border-[var(--nexus-accent-primary)]'
              : 'text-[var(--nexus-text-secondary)] hover:bg-[var(--nexus-bg-secondary)]'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 shrink-0" />
          {!collapsed && <span>My Business</span>}
        </NavLink>
      </div>

      {/* Verb Sections */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 pb-2 no-scrollbar">
        {sections.map((section) => {
          const expanded = expandedVerbs.has(section.verb);
          const verbActive = isVerbActive(section);

          return (
            <div key={section.verb} className="mb-1">
              {/* Verb Header */}
              <button
                onClick={() => {
                  if (collapsed) return;
                  toggleVerb(section.verb);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 mx-1 rounded-lg transition-colors text-left ${
                  verbActive
                    ? 'text-[var(--nexus-accent-primary)]'
                    : 'text-[var(--nexus-text-tertiary)] hover:text-[var(--nexus-text-secondary)]'
                }`}
                title={collapsed ? section.label : undefined}
              >
                <section.icon className="w-5 h-5 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="text-[10px] uppercase tracking-widest font-semibold flex-1">
                      {section.label}
                    </span>
                    <motion.div
                      animate={{ rotate: expanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </motion.div>
                  </>
                )}
              </button>

              {/* Verb Children */}
              <AnimatePresence initial={false}>
                {expanded && !collapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    {section.children.map((child) => {
                      const active = isPathActive(child.href);
                      const childLabel = getChildLabel(child.label);

                      return (
                        <NavLink
                          key={child.href}
                          to={child.href}
                          className={`flex items-center gap-3 px-4 py-2 rounded-lg mx-2 ml-5 text-sm font-medium transition-colors ${
                            active
                              ? 'bg-[var(--nexus-nav-active)] text-[var(--nexus-accent-primary)] border-l-2 border-[var(--nexus-accent-primary)]'
                              : 'text-[var(--nexus-text-secondary)] hover:bg-[var(--nexus-bg-secondary)]'
                          }`}
                        >
                          <child.icon className="w-4 h-4 shrink-0" />
                          <span className="truncate">{childLabel}</span>
                        </NavLink>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="mx-3 h-px bg-[var(--nexus-divider)]" />

      {/* Learn */}
      <div className="px-2 py-2">
        <NavLink
          to="/command-center/learn"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mx-1 text-sm font-medium transition-colors ${
            isPathActive('/command-center/learn')
              ? 'bg-[var(--nexus-nav-active)] text-[var(--nexus-accent-primary)] border-l-2 border-[var(--nexus-accent-primary)]'
              : 'text-[var(--nexus-text-secondary)] hover:bg-[var(--nexus-bg-secondary)]'
          }`}
        >
          <GraduationCap className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Learn</span>}
        </NavLink>
      </div>

      {/* Bottom-pinned: Settings + Collapse toggle */}
      <div className="px-2 pb-3 mt-auto">
        <NavLink
          to="/command-center/settings"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mx-1 text-sm font-medium transition-colors ${
            isPathActive('/command-center/settings')
              ? 'bg-[var(--nexus-nav-active)] text-[var(--nexus-accent-primary)] border-l-2 border-[var(--nexus-accent-primary)]'
              : 'text-[var(--nexus-text-secondary)] hover:bg-[var(--nexus-bg-secondary)]'
          }`}
        >
          <Settings className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </NavLink>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 mt-2 rounded-lg mx-1 text-[var(--nexus-text-tertiary)] hover:bg-[var(--nexus-bg-secondary)] hover:text-[var(--nexus-text-secondary)] transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.nav>
  );
}
