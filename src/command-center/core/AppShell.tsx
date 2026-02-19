import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { RightPanel } from './RightPanel';
import { LayoutProvider, useLayout } from './LayoutContext';
import { ConnectionStatus } from '@/components/ConnectionStatus';

interface AppShellProps {
  children: React.ReactNode;
  businessName?: string;
}

function AppShellContent({ children, businessName }: AppShellProps) {
  const location = useLocation();
  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    rightPanelOpen,
    setRightPanelOpen,
    aiMode,
    setAiMode,
    activeNavItem,
    setActiveNavItem,
  } = useLayout();

  // Update active nav item based on route
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/dashboard')) {
      setActiveNavItem('dashboard');
    } else if (path.includes('/activities')) {
      setActiveNavItem('activities');
    } else if (path.includes('/customers')) {
      setActiveNavItem('customers');
    } else if (path.includes('/content')) {
      setActiveNavItem('content');
    } else if (path.includes('/campaigns')) {
      setActiveNavItem('campaigns');
    } else if (path.includes('/services')) {
      setActiveNavItem('services');
    } else if (path.includes('/ai')) {
      setActiveNavItem('ai-hub');
    } else if (path.includes('/settings')) {
      setActiveNavItem('settings');
    }
  }, [location.pathname, setActiveNavItem]);

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-slate-900 transition-colors">
      {/* Connection status - top-right corner */}
      <div className="fixed top-4 right-4 z-40">
        <ConnectionStatus showLabel={false} />
      </div>
      {/* Fixed Header */}
      <Header 
        isAIMode={aiMode}
        onToggleMode={() => setAiMode(!aiMode)}
        businessName={businessName}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden pt-16">
        {/* Left Sidebar */}
        <Sidebar 
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          activeItem={activeNavItem}
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

export function AppShell({ children, businessName }: AppShellProps) {
  return (
    <LayoutProvider>
      <AppShellContent businessName={businessName}>
        {children}
      </AppShellContent>
    </LayoutProvider>
  );
}

