import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type BusinessMode = 'b2b-pipeline' | 'b2c-services' | 'b2c-retail';

interface BusinessModeState {
  mode: BusinessMode;
  setMode: (mode: BusinessMode) => void;
}

export const useBusinessModeStore = create<BusinessModeState>()(
  persist(
    (set) => ({
      mode: 'b2c-services',
      setMode: (mode) => set({ mode }),
    }),
    { name: 'fibonacco-business-mode' }
  )
);
