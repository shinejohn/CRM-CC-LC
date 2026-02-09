# CC-CORE-01: App Shell & Layout

## Module Overview

| Property | Value |
|----------|-------|
| Module ID | CC-CORE-01 |
| Name | App Shell & Layout |
| Phase | 1 - Foundation |
| Dependencies | None |
| Estimated Time | 2 hours |
| Agent Assignment | Agent 1 |

---

## Purpose

Create the foundational application shell that provides the structural layout for the entire Command Center. This includes the main container, navigation sidebar, header, and content area scaffolding.

---

## UI Pattern References

**Primary Reference:** `/magic/patterns/UnifiedCommandCenter.tsx`

Key patterns to extract:
- Three-column layout (sidebar, main, right panel)
- Responsive breakpoints
- Animated transitions (framer-motion)
- Collapsible sections

**Secondary Reference:** `/magic/patterns/CentralCommandDashboard.tsx`

Key patterns to extract:
- Header structure
- Profile dropdown
- Mode toggle (CC/PA or UI/AI)

---

## Deliverables

### 1. AppShell.tsx

The root component that wraps the entire Command Center.

```typescript
// src/command-center/core/AppShell.tsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { RightPanel } from './RightPanel';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [aiMode, setAiMode] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-slate-900 transition-colors">
      {/* Fixed Header */}
      <Header 
        isAIMode={aiMode}
        onToggleMode={() => setAiMode(!aiMode)}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden pt-16">
        {/* Left Sidebar */}
        <Sidebar 
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
        {/* Main Content */}
        <main className={`
          flex-1 overflow-y-auto transition-all duration-300
          ${sidebarCollapsed ? 'ml-16' : 'ml-64'}
          ${rightPanelOpen ? 'mr-80' : 'mr-0'}
        `}>
          <AnimatePresence mode="wait">
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
        
        {/* Right Panel (AI Assistant / Quick Actions) */}
        <AnimatePresence>
          {rightPanelOpen && (
            <RightPanel 
              isAIMode={aiMode}
              onClose={() => setRightPanelOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
```

### 2. Header.tsx

The fixed header component with mode toggle and user controls.

```typescript
// src/command-center/core/Header.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, ChevronDown, Search, Settings, LogOut, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  isAIMode: boolean;
  onToggleMode: () => void;
  businessName?: string;
}

export function Header({ isAIMode, onToggleMode, businessName = 'My Business' }: HeaderProps) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="h-16 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 shadow-sm">
      {/* Left: Logo & Business Name */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center font-bold text-lg text-white shadow-md">
          F
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            Command Center
          </h1>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            {businessName}
          </p>
        </div>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-xl mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search customers, content, campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 bg-gray-100 dark:bg-slate-600 px-1.5 py-0.5 rounded">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Mode Toggle, Notifications, Profile */}
      <div className="flex items-center gap-4">
        {/* Mode Toggle: CC (Command Center) / PA (Personal Assistant) */}
        <ModeToggle isAIMode={isAIMode} onToggle={onToggleMode} />
        
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-gray-500 dark:text-slate-400" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </Button>

        {/* Profile Dropdown */}
        <ProfileDropdown 
          isOpen={profileMenuOpen}
          onToggle={() => setProfileMenuOpen(!profileMenuOpen)}
        />
      </div>
    </header>
  );
}

// Mode Toggle Sub-component
function ModeToggle({ isAIMode, onToggle }: { isAIMode: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="relative w-16 h-8 bg-gray-200 dark:bg-slate-700 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
    >
      <motion.div
        className={`absolute top-1 left-1 w-14 h-6 rounded-full flex items-center justify-between px-1 ${
          isAIMode
            ? 'bg-gradient-to-r from-purple-500 to-pink-500'
            : 'bg-gradient-to-r from-blue-500 to-cyan-500'
        }`}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        <span className={`text-[10px] font-bold text-white ${isAIMode ? 'opacity-40' : 'opacity-100'}`}>
          CC
        </span>
        <span className={`text-[10px] font-bold text-white ${isAIMode ? 'opacity-100' : 'opacity-40'}`}>
          PA
        </span>
      </motion.div>
      <motion.div
        className="absolute top-0.5 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center"
        animate={{ left: isAIMode ? 'calc(100% - 1.875rem)' : '0.125rem' }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        <span className="text-[10px] font-bold text-gray-700">
          {isAIMode ? 'PA' : 'CC'}
        </span>
      </motion.div>
    </button>
  );
}

// Profile Dropdown Sub-component
function ProfileDropdown({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 bg-gray-100 dark:bg-slate-700 rounded-full px-3 py-2 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-sm font-bold text-white">
          JD
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 py-2"
        >
          <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-700">
            <p className="font-medium text-gray-900 dark:text-white">John Doe</p>
            <p className="text-sm text-gray-500 dark:text-slate-400">john@business.com</p>
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 text-left">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700 dark:text-slate-300">Profile</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 text-left">
            <Settings className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700 dark:text-slate-300">Settings</span>
          </button>
          <hr className="my-2 border-gray-100 dark:border-slate-700" />
          <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-left">
            <LogOut className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-600 dark:text-red-400">Sign Out</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}
```

### 3. Sidebar.tsx

The collapsible navigation sidebar.

```typescript
// src/command-center/core/Sidebar.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Users, FileText, Megaphone, 
  ShoppingBag, MessageSquare, Calendar, Settings,
  ChevronLeft, ChevronRight, Sparkles, Activity
} from 'lucide-react';
import { NavItem } from '@/types/command-center';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  activeItem?: string;
  onNavigate?: (path: string) => void;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/command-center' },
  { id: 'activities', label: 'Activities', icon: Activity, path: '/command-center/activities', badge: 5 },
  { id: 'customers', label: 'Customers', icon: Users, path: '/command-center/customers' },
  { id: 'content', label: 'Content', icon: FileText, path: '/command-center/content' },
  { id: 'campaigns', label: 'Campaigns', icon: Megaphone, path: '/command-center/campaigns' },
  { id: 'services', label: 'Services', icon: ShoppingBag, path: '/command-center/services' },
  { id: 'ai-hub', label: 'AI Hub', icon: Sparkles, path: '/command-center/ai-hub' },
  { id: 'calendar', label: 'Calendar', icon: Calendar, path: '/command-center/calendar' },
  { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/command-center/messages', badge: 3 },
];

export function Sidebar({ collapsed, onToggle, activeItem = 'dashboard', onNavigate }: SidebarProps) {
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
            const isActive = activeItem === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate?.(item.path)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                      : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left text-sm font-medium">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {item.badge}
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
          onClick={() => onNavigate?.('/command-center/settings')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Settings</span>}
        </button>
        
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 mt-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
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
```

### 4. RightPanel.tsx

The right panel for AI Assistant or Quick Actions.

```typescript
// src/command-center/core/RightPanel.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { X, Mic, Send, Paperclip } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface RightPanelProps {
  isAIMode: boolean;
  onClose: () => void;
}

export function RightPanel({ isAIMode, onClose }: RightPanelProps) {
  return (
    <motion.aside
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed right-0 top-16 bottom-0 w-80 bg-white dark:bg-slate-800 border-l border-gray-200 dark:border-slate-700 z-30 flex flex-col shadow-xl"
    >
      {/* Panel Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-gray-200 dark:border-slate-700">
        <h2 className="font-semibold text-gray-900 dark:text-white">
          {isAIMode ? 'AI Assistant' : 'Quick Actions'}
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isAIMode ? <AIAssistantContent /> : <QuickActionsContent />}
      </div>

      {/* AI Input (only in AI mode) */}
      {isAIMode && (
        <div className="p-4 border-t border-gray-200 dark:border-slate-700">
          <div className="relative">
            <Input
              placeholder="Ask anything..."
              className="pr-20 bg-gray-50 dark:bg-slate-700"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Paperclip className="w-4 h-4 text-gray-400" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Mic className="w-4 h-4 text-gray-400" />
              </Button>
              <Button size="icon" className="h-7 w-7 bg-purple-500 hover:bg-purple-600">
                <Send className="w-3 h-3 text-white" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.aside>
  );
}

// AI Assistant Content
function AIAssistantContent() {
  return (
    <div className="space-y-4">
      {/* AI Status */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span>AI Ready</span>
      </div>

      {/* Suggested Actions */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">
          Suggested Actions
        </h3>
        {['Draft follow-up email', 'Analyze this week\'s metrics', 'Create social post'].map((action) => (
          <button
            key={action}
            className="w-full text-left px-3 py-2 text-sm bg-gray-50 dark:bg-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
          >
            {action}
          </button>
        ))}
      </div>

      {/* Recent Conversations */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">
          Recent Conversations
        </h3>
        {/* Placeholder for conversation history */}
        <p className="text-sm text-gray-400 dark:text-slate-500 italic">
          Start a conversation to see history here
        </p>
      </div>
    </div>
  );
}

// Quick Actions Content
function QuickActionsContent() {
  const quickActions = [
    { label: 'New Customer', color: 'bg-blue-500' },
    { label: 'Create Content', color: 'bg-purple-500' },
    { label: 'Send Campaign', color: 'bg-green-500' },
    { label: 'Schedule Call', color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => (
          <button
            key={action.label}
            className={`${action.color} text-white text-sm font-medium px-4 py-3 rounded-lg hover:opacity-90 transition-opacity`}
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Recent Activity Preview */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">
          Recent Activity
        </h3>
        {/* Activity items will be populated by ActivityFeed component */}
        <p className="text-sm text-gray-400 dark:text-slate-500 italic">
          Loading recent activity...
        </p>
      </div>
    </div>
  );
}
```

### 5. Layout Context

```typescript
// src/command-center/core/LayoutContext.tsx

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LayoutContextType {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  rightPanelOpen: boolean;
  setRightPanelOpen: (open: boolean) => void;
  aiMode: boolean;
  setAiMode: (mode: boolean) => void;
  activeNavItem: string;
  setActiveNavItem: (item: string) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [aiMode, setAiMode] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState('dashboard');

  return (
    <LayoutContext.Provider
      value={{
        sidebarCollapsed,
        setSidebarCollapsed,
        rightPanelOpen,
        setRightPanelOpen,
        aiMode,
        setAiMode,
        activeNavItem,
        setActiveNavItem,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/command-center/core/__tests__/AppShell.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { AppShell } from '../AppShell';

describe('AppShell', () => {
  it('renders children content', () => {
    render(<AppShell><div>Test Content</div></AppShell>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('toggles sidebar collapse', () => {
    render(<AppShell><div>Content</div></AppShell>);
    const collapseButton = screen.getByRole('button', { name: /collapse/i });
    fireEvent.click(collapseButton);
    // Assert sidebar width change
  });

  it('toggles AI mode', () => {
    render(<AppShell><div>Content</div></AppShell>);
    const modeToggle = screen.getByRole('button', { name: /cc|pa/i });
    fireEvent.click(modeToggle);
    // Assert mode change
  });
});
```

---

## Acceptance Criteria

- [ ] AppShell renders with header, sidebar, main content, and right panel
- [ ] Sidebar collapses/expands with smooth animation
- [ ] Right panel shows/hides with smooth animation
- [ ] Mode toggle switches between CC and PA modes
- [ ] Navigation items highlight active state
- [ ] Profile dropdown opens/closes correctly
- [ ] Search input accepts keyboard shortcut (⌘K)
- [ ] Dark mode fully supported
- [ ] Mobile responsive (sidebar becomes overlay)
- [ ] All components pass TypeScript strict mode
- [ ] Unit tests pass with >80% coverage

---

## Handoff

When complete, this module provides:

1. `AppShell` - Root layout component
2. `Header` - Fixed header with search and controls
3. `Sidebar` - Collapsible navigation
4. `RightPanel` - AI/Quick Actions panel
5. `LayoutContext` - Shared layout state

Other agents can import:
```typescript
import { AppShell, useLayout } from '@/command-center/core';
```
