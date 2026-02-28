import { create } from "zustand";

interface NavigationState {
    isSidebarCollapsed: boolean;
    isCommandPaletteOpen: boolean;
    currentSection: string; // 'define' | 'attract' | 'sell' | 'deliver' | 'measure' | 'automate'
    toggleSidebar: () => void;
    openCommandPalette: () => void;
    closeCommandPalette: () => void;
    setCurrentSection: (section: string) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
    isSidebarCollapsed: false,
    isCommandPaletteOpen: false,
    currentSection: "dashboard",
    toggleSidebar: () =>
        set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
    openCommandPalette: () => set({ isCommandPaletteOpen: true }),
    closeCommandPalette: () => set({ isCommandPaletteOpen: false }),
    setCurrentSection: (section) => set({ currentSection: section }),
}));
