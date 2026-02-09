// ============================================
// AI STORE - Command Center
// CC-SVC-06: AI Assistant Service
// ============================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AIMessage, AIPersonality, ChatContext } from '../services/ai.types';

interface AIState {
  // Conversation state
  conversations: Record<string, AIMessage[]>;
  activeConversationId: string | null;
  
  // Personality state
  personalities: AIPersonality[];
  activePersonalityId: string | null;
  
  // Context state
  globalContext: ChatContext;
  
  // Preferences
  preferences: {
    streamingEnabled: boolean;
    showToolCalls: boolean;
    autoSuggest: boolean;
  };
  
  // Actions
  createConversation: () => string;
  setActiveConversation: (id: string) => void;
  addMessage: (conversationId: string, message: AIMessage) => void;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<AIMessage>) => void;
  clearConversation: (conversationId: string) => void;
  
  setPersonalities: (personalities: AIPersonality[]) => void;
  setActivePersonality: (id: string | null) => void;
  
  setGlobalContext: (context: Partial<ChatContext>) => void;
  updatePreferences: (prefs: Partial<AIState['preferences']>) => void;
}

export const useAIStore = create<AIState>()(
  persist(
    (set, get) => ({
      conversations: {},
      activeConversationId: null,
      personalities: [],
      activePersonalityId: null,
      globalContext: {},
      preferences: {
        streamingEnabled: true,
        showToolCalls: true,
        autoSuggest: true,
      },

      createConversation: () => {
        const id = crypto.randomUUID();
        set(state => ({
          conversations: { ...state.conversations, [id]: [] },
          activeConversationId: id,
        }));
        return id;
      },

      setActiveConversation: (id) => {
        set({ activeConversationId: id });
      },

      addMessage: (conversationId, message) => {
        set(state => ({
          conversations: {
            ...state.conversations,
            [conversationId]: [
              ...(state.conversations[conversationId] || []),
              message,
            ],
          },
        }));
      },

      updateMessage: (conversationId, messageId, updates) => {
        set(state => ({
          conversations: {
            ...state.conversations,
            [conversationId]: state.conversations[conversationId]?.map(m =>
              m.id === messageId ? { ...m, ...updates } : m
            ) || [],
          },
        }));
      },

      clearConversation: (conversationId) => {
        set(state => ({
          conversations: {
            ...state.conversations,
            [conversationId]: [],
          },
        }));
      },

      setPersonalities: (personalities) => {
        set({ personalities });
      },

      setActivePersonality: (id) => {
        set({ activePersonalityId: id });
      },

      setGlobalContext: (context) => {
        set(state => ({
          globalContext: { ...state.globalContext, ...context },
        }));
      },

      updatePreferences: (prefs) => {
        set(state => ({
          preferences: { ...state.preferences, ...prefs },
        }));
      },
    }),
    {
      name: 'cc-ai-store',
      partialize: (state) => ({
        conversations: state.conversations,
        activePersonalityId: state.activePersonalityId,
        preferences: state.preferences,
      }),
    }
  )
);

