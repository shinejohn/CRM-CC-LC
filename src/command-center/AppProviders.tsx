import React, { ReactNode, useEffect } from 'react';
import { BrowserRouter } from 'react-router';
import { ThemeProvider } from './core/ThemeProvider';
import { LayoutProvider } from './core/LayoutContext';
import { Toaster } from '@/components/ui/toaster';
import { initializeEventBridge } from './config/events';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  useEffect(() => {
    initializeEventBridge();
  }, []);

  return (
    <BrowserRouter>
      <ThemeProvider>
        <LayoutProvider>
          {children}
          <Toaster />
        </LayoutProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
