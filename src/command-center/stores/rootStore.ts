import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';

// Root UI State
interface UIState {
  sidebarCollapsed: boolean;
  rightPanelOpen: boolean;
  aiMode: boolean;
  activeNavItem: string;
  commandPaletteOpen: boolean;
  modalStack: string[];
  
  // Actions
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setRightPanelOpen: (open: boolean) => void;
  toggleRightPanel: () => void;
  setAiMode: (mode: boolean) => void;
  toggleAiMode: () => void;
  setActiveNavItem: (item: string) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  pushModal: (modalId: string) => void;
  popModal: () => void;
  clearModals: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      subscribeWithSelector((set, get) => ({
        // Initial state
        sidebarCollapsed: false,
        rightPanelOpen: true,
        aiMode: false,
        activeNavItem: 'dashboard',
        commandPaletteOpen: false,
        modalStack: [],

        // Actions
        setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
        toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),
        
        setRightPanelOpen: (open) => set({ rightPanelOpen: open }),
        toggleRightPanel: () => set(state => ({ rightPanelOpen: !state.rightPanelOpen })),
        
        setAiMode: (mode) => set({ aiMode: mode }),
        toggleAiMode: () => set(state => ({ aiMode: !state.aiMode })),
        
        setActiveNavItem: (item) => set({ activeNavItem: item }),
        
        setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
        
        pushModal: (modalId) => set(state => ({ 
          modalStack: [...state.modalStack, modalId] 
        })),
        popModal: () => set(state => ({ 
          modalStack: state.modalStack.slice(0, -1) 
        })),
        clearModals: () => set({ modalStack: [] }),
      })),
      {
        name: 'cc-ui-store',
        partialize: (state) => ({
          sidebarCollapsed: state.sidebarCollapsed,
          aiMode: state.aiMode,
        }),
      }
    ),
    { name: 'UIStore' }
  )
);

