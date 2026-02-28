import React, { useState } from 'react';
import { useLocation } from 'react-router';
import { NavigationRail } from '../components/layout/NavigationRail';
import { CommandCenterHeader } from '../components/layout/CommandCenterHeader';
import { RightSidebar } from '../components/layout/RightSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { AccountManagerProvider } from '../hooks/useAccountManager';
import { AccountManagerBar } from '../components/ai/AccountManagerBar';

export interface CommandCenterLayoutProps {
    children: React.ReactNode;
    businessName?: string;
}

export function CommandCenterLayout({ children, businessName = "Fibonacco" }: CommandCenterLayoutProps) {
    const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
    const location = useLocation();

    return (
        <AccountManagerProvider>
            <div className="h-screen w-full flex bg-[var(--nexus-bg-page)] overflow-hidden font-sans text-[var(--nexus-text-primary)] transition-colors relative">

                {/* Navigation Rail (256px expanded / 64px collapsed) */}
                <NavigationRail />

                {/* Main Container - uses ml matching sidebar default width */}
                <div className="flex-1 flex flex-col ml-[var(--cc-sidebar-width)] relative transition-all duration-300">

                    <CommandCenterHeader
                        businessName={businessName}
                        onToggleRightSidebar={() => setRightSidebarOpen(!rightSidebarOpen)}
                    />

                    <AccountManagerBar />

                    {/* Main Content Viewport */}
                    <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                                className="h-full"
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </main>
                </div>

                {/* 320px Right Quick-Access Sidebar */}
                <AnimatePresence>
                    {rightSidebarOpen && (
                        <RightSidebar onClose={() => setRightSidebarOpen(false)} />
                    )}
                </AnimatePresence>
            </div>
        </AccountManagerProvider>
    );
}
