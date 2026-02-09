import React from 'react';
import { AppShell } from './core';

interface CommandCenterProps {
  children?: React.ReactNode;
  businessName?: string;
}

/**
 * Root Command Center component
 * Wraps all Command Center pages with the AppShell layout
 */
export function CommandCenter({ children, businessName }: CommandCenterProps) {
  return (
    <AppShell businessName={businessName}>
      {children || (
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Command Center
          </h1>
          <p className="text-gray-600 dark:text-slate-400">
            Your unified dashboard for managing all aspects of your business.
          </p>
        </div>
      )}
    </AppShell>
  );
}

