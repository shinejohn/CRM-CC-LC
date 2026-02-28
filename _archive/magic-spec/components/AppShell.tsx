import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AIAssistantWidget } from './AIAssistantWidget';
import { motion } from 'framer-motion';
import { ConnectionStatus } from '@/components/ConnectionStatus';
interface AppShellProps {
  children: ReactNode;
}
export function AppShell({
  children
}: AppShellProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  return <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      <div className="fixed top-4 right-4 z-40">
        <ConnectionStatus showLabel={false} />
      </div>
      <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
    // Providing default props since AppShell might be used in a context where navigation is handled differently
    // or these props are optional in Sidebar now
    currentPage="overview" onNavigate={() => {}} />

      <motion.div animate={{
      marginLeft: isSidebarCollapsed ? 80 : 256
    }} transition={{
      duration: 0.3,
      ease: 'easeInOut'
    }} className="flex-1 flex flex-col min-w-0">
        <Header toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

        <main className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </motion.div>

      <AIAssistantWidget />
    </div>;
}