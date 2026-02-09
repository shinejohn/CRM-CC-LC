// Command Center Stores - Main Exports
// CC-SVC-03: State Management

export { useUIStore } from './rootStore';
export { usePreferencesStore } from './preferencesStore';
export type { UserPreferences } from './preferencesStore';
export { useCacheStore, cacheKeys } from './cacheStore';
export { useSelectionStore } from './selectionStore';

// Combined selector hooks
import { useUIStore } from './rootStore';
import { usePreferencesStore } from './preferencesStore';

export function useLayout() {
  return useUIStore(state => ({
    sidebarCollapsed: state.sidebarCollapsed,
    rightPanelOpen: state.rightPanelOpen,
    aiMode: state.aiMode,
    activeNavItem: state.activeNavItem,
    toggleSidebar: state.toggleSidebar,
    toggleRightPanel: state.toggleRightPanel,
    toggleAiMode: state.toggleAiMode,
    setActiveNavItem: state.setActiveNavItem,
  }));
}

export function useThemePreference() {
  return usePreferencesStore(state => ({
    theme: state.theme,
    setTheme: state.setTheme,
  }));
}

export function useDashboardPreferences() {
  return usePreferencesStore(state => ({
    ...state.dashboard,
    setCardColor: state.setCardColor,
    hideCard: state.hideCard,
    showCard: state.showCard,
    reorderCards: state.reorderCards,
  }));
}

