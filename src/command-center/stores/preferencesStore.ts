import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
    sound: boolean;
  };
  dashboard: {
    defaultView: 'cards' | 'list' | 'timeline';
    cardColors: Record<string, string>;
    hiddenCards: string[];
    cardOrder: string[];
  };
  ai: {
    autoSuggest: boolean;
    showToolCalls: boolean;
    streamResponses: boolean;
    defaultPersonality: string | null;
  };
}

interface PreferencesState extends UserPreferences {
  setTheme: (theme: UserPreferences['theme']) => void;
  setLanguage: (language: string) => void;
  setTimezone: (timezone: string) => void;
  setDateFormat: (format: string) => void;
  updateNotifications: (updates: Partial<UserPreferences['notifications']>) => void;
  updateDashboard: (updates: Partial<UserPreferences['dashboard']>) => void;
  updateAI: (updates: Partial<UserPreferences['ai']>) => void;
  setCardColor: (cardId: string, color: string) => void;
  hideCard: (cardId: string) => void;
  showCard: (cardId: string) => void;
  reorderCards: (cardOrder: string[]) => void;
  resetToDefaults: () => void;
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  dateFormat: 'MM/DD/YYYY',
  notifications: {
    email: true,
    push: true,
    desktop: true,
    sound: false,
  },
  dashboard: {
    defaultView: 'cards',
    cardColors: {},
    hiddenCards: [],
    cardOrder: [],
  },
  ai: {
    autoSuggest: true,
    showToolCalls: true,
    streamResponses: true,
    defaultPersonality: null,
  },
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      ...defaultPreferences,

      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setTimezone: (timezone) => set({ timezone }),
      setDateFormat: (dateFormat) => set({ dateFormat }),

      updateNotifications: (updates) =>
        set(state => ({
          notifications: { ...state.notifications, ...updates },
        })),

      updateDashboard: (updates) =>
        set(state => ({
          dashboard: { ...state.dashboard, ...updates },
        })),

      updateAI: (updates) =>
        set(state => ({
          ai: { ...state.ai, ...updates },
        })),

      setCardColor: (cardId, color) =>
        set(state => ({
          dashboard: {
            ...state.dashboard,
            cardColors: { ...state.dashboard.cardColors, [cardId]: color },
          },
        })),

      hideCard: (cardId) =>
        set(state => ({
          dashboard: {
            ...state.dashboard,
            hiddenCards: [...state.dashboard.hiddenCards, cardId],
          },
        })),

      showCard: (cardId) =>
        set(state => ({
          dashboard: {
            ...state.dashboard,
            hiddenCards: state.dashboard.hiddenCards.filter(id => id !== cardId),
          },
        })),

      reorderCards: (cardOrder) =>
        set(state => ({
          dashboard: { ...state.dashboard, cardOrder },
        })),

      resetToDefaults: () => set(defaultPreferences),
    }),
    {
      name: 'cc-preferences',
    }
  )
);

