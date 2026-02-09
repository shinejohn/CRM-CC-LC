import React, { useState } from 'react';
import { Home, Users, Calendar, TrendingUp, Settings, BookOpen, MessageSquare, CreditCard, Briefcase, ClipboardList, FileText, DollarSign, Building2, Wrench, Star, Gift, Package, ChevronLeft, ChevronRight, Menu, LayoutDashboard, Megaphone } from 'lucide-react';
import { useBusinessMode } from '../contexts/BusinessModeContext';
import { cn } from '../lib/utils';
interface SidebarProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
  isCollapsed?: boolean;
  toggleCollapse?: () => void;
}
export function Sidebar({
  currentPage = 'overview',
  onNavigate = () => {},
  isCollapsed = false,
  toggleCollapse
}: SidebarProps) {
  const {
    mode,
    terminology
  } = useBusinessMode();
  const [isHovered, setIsHovered] = useState(false);
  const isExpanded = !isCollapsed || isHovered;
  const commandCenterItems = [{
    id: 'overview',
    label: terminology.dashboard,
    icon: Home
  }, {
    id: 'performance',
    label: 'Performance',
    icon: TrendingUp
  }, {
    id: 'business',
    label: 'My Business',
    icon: Building2
  }];
  const crmItems = [{
    id: 'customers',
    label: terminology.customers,
    icon: Users
  }, {
    id: 'schedule',
    label: terminology.activities,
    icon: Calendar
  }];
  const servicesItems = [{
    id: 'services',
    label: 'My Services',
    icon: Package
  }];
  const marketingItems = [{
    id: 'marketing-wizard',
    label: 'Campaign Wizard',
    icon: Megaphone
  }];
  const modeSpecificItems = {
    'b2b-pipeline': [{
      id: 'contacts',
      label: 'Contacts',
      icon: Building2
    }, {
      id: 'pipeline',
      label: terminology.deals,
      icon: Briefcase
    }, {
      id: 'quotes',
      label: terminology.quotes,
      icon: FileText
    }, {
      id: 'invoices',
      label: 'Invoices',
      icon: DollarSign
    }],
    'b2c-services': [{
      id: 'jobs',
      label: terminology.deals,
      icon: Wrench
    }, {
      id: 'quotes',
      label: 'Quotes & Invoices',
      icon: FileText
    }],
    'b2c-retail': [{
      id: 'loyalty',
      label: 'Loyalty',
      icon: Star
    }, {
      id: 'promotions',
      label: 'Promotions',
      icon: Gift
    }]
  };
  const bottomNavItems = [{
    id: 'learning',
    label: 'Learning',
    icon: BookOpen
  }, {
    id: 'consulting',
    label: 'AI Consulting',
    icon: MessageSquare
  }, {
    id: 'billing',
    label: 'Billing',
    icon: CreditCard
  }, {
    id: 'settings',
    label: 'Settings',
    icon: Settings
  }];
  const renderNavItem = (item: any) => {
    const Icon = item.icon;
    const isActive = currentPage === item.id;
    return <button key={item.id} onClick={() => onNavigate(item.id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors relative group ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'} ${!isExpanded ? 'justify-center px-2' : ''}`} title={!isExpanded ? item.label : undefined}>
        <Icon className={`w-5 h-5 flex-shrink-0 ${!isExpanded ? 'mx-auto' : ''}`} />

        <span className={`text-sm font-medium whitespace-nowrap transition-all duration-300 overflow-hidden ${isExpanded ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0 hidden'}`}>
          {item.label}
        </span>

        {!isExpanded && <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none z-50 whitespace-nowrap">
            {item.label}
          </div>}
      </button>;
  };
  const renderSectionHeader = (title: string) => {
    if (!isExpanded) return <div className="h-4" />;
    return <div className="px-6 py-3 transition-opacity duration-300">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap overflow-hidden">
          {title}
        </p>
      </div>;
  };
  return <div className={`bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-16 z-30 transition-all duration-300 ease-in-out ${isExpanded ? 'w-64 shadow-xl' : 'w-20'}`} onMouseEnter={() => isCollapsed && setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {/* Home Button - Navigate to Main Dashboard */}
      <div className="px-3 pt-4 pb-2">
        <button onClick={() => onNavigate('unified-command')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative group ${currentPage === 'unified-command' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'} ${!isExpanded ? 'justify-center px-2' : ''}`} title={!isExpanded ? 'Command Center' : undefined}>
          <LayoutDashboard className={`w-5 h-5 flex-shrink-0 ${!isExpanded ? 'mx-auto' : ''}`} />

          <span className={`text-sm font-semibold whitespace-nowrap transition-all duration-300 overflow-hidden ${isExpanded ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0 hidden'}`}>
            Command Center
          </span>

          {!isExpanded && <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none z-50 whitespace-nowrap">
              Command Center
            </div>}
        </button>
      </div>

      {/* Toggle Button */}
      {toggleCollapse && <button onClick={e => {
      e.stopPropagation();
      toggleCollapse();
      setIsHovered(false);
    }} className={`absolute -right-3 top-8 bg-blue-600 text-white p-1 rounded-full shadow-md hover:bg-blue-700 transition-opacity duration-200 z-50 ${isExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 scrollbar-thin scrollbar-thumb-slate-700">
        {renderSectionHeader('Command Center')}
        <div className="space-y-1 px-3">
          {commandCenterItems.map(renderNavItem)}
        </div>

        {renderSectionHeader('CRM')}
        <div className="space-y-1 px-3">{crmItems.map(renderNavItem)}</div>

        {renderSectionHeader('Services')}
        <div className="space-y-1 px-3">{servicesItems.map(renderNavItem)}</div>

        {renderSectionHeader('Marketing')}
        <div className="space-y-1 px-3">
          {marketingItems.map(renderNavItem)}
        </div>

        {modeSpecificItems[mode].length > 0 && <>
            {renderSectionHeader(mode === 'b2b-pipeline' ? 'Sales' : mode === 'b2c-services' ? 'Operations' : 'Engagement')}
            <div className="space-y-1 px-3">
              {modeSpecificItems[mode].map(renderNavItem)}
            </div>
          </>}

        {renderSectionHeader('Platform')}
        <div className="space-y-1 px-3">
          {bottomNavItems.map(renderNavItem)}
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-800">
        <div className={`flex items-center gap-3 ${!isExpanded ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
            JD
          </div>
          <div className={`flex-1 overflow-hidden transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}>
            <p className="text-sm font-medium whitespace-nowrap">John Doe</p>
            <p className="text-xs text-slate-400 whitespace-nowrap">
              ABC Home Services
            </p>
          </div>
        </div>
      </div>
    </div>;
}