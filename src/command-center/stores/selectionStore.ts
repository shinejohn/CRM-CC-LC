import { create } from 'zustand';

interface SelectionState {
  // Selection by context (e.g., 'customers', 'content', 'activities')
  selections: Record<string, Set<string>>;
  
  // Actions
  select: (context: string, id: string) => void;
  deselect: (context: string, id: string) => void;
  toggle: (context: string, id: string) => void;
  selectAll: (context: string, ids: string[]) => void;
  deselectAll: (context: string) => void;
  isSelected: (context: string, id: string) => boolean;
  getSelected: (context: string) => string[];
  getCount: (context: string) => number;
}

export const useSelectionStore = create<SelectionState>((set, get) => ({
  selections: {},

  select: (context, id) =>
    set(state => {
      const current = state.selections[context] || new Set();
      return {
        selections: {
          ...state.selections,
          [context]: new Set([...current, id]),
        },
      };
    }),

  deselect: (context, id) =>
    set(state => {
      const current = state.selections[context];
      if (!current) return state;
      
      const next = new Set(current);
      next.delete(id);
      
      return {
        selections: {
          ...state.selections,
          [context]: next,
        },
      };
    }),

  toggle: (context, id) => {
    const isSelected = get().isSelected(context, id);
    if (isSelected) {
      get().deselect(context, id);
    } else {
      get().select(context, id);
    }
  },

  selectAll: (context, ids) =>
    set(state => ({
      selections: {
        ...state.selections,
        [context]: new Set(ids),
      },
    })),

  deselectAll: (context) =>
    set(state => ({
      selections: {
        ...state.selections,
        [context]: new Set(),
      },
    })),

  isSelected: (context, id) => {
    const selection = get().selections[context];
    return selection ? selection.has(id) : false;
  },

  getSelected: (context) => {
    const selection = get().selections[context];
    return selection ? Array.from(selection) : [];
  },

  getCount: (context) => {
    const selection = get().selections[context];
    return selection ? selection.size : 0;
  },
}));

