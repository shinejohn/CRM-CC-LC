import React, { ReactNode, useEffect } from 'react';
import { BrowserRouter } from 'react-router';
import { AuthProvider } from './core/AuthContext';
import { ThemeProvider } from './core/ThemeProvider';
import { LayoutProvider } from './core/LayoutContext';
import { Toaster } from '@/components/ui/toaster';
import { initializeEventBridge } from './config/events';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  useEffect(() => {
    // Initialize WebSocket to EventBus bridge when app loads
    initializeEventBridge();
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <LayoutProvider>
            {children}
            <Toaster />
          </LayoutProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

