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

