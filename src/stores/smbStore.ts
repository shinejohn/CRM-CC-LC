/**
 * Zustand SMB store: current SMB, business mode
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SMBProfile, BusinessMode } from '../types/smb';

interface SMBState {
  currentSMB: SMBProfile | null;
  businessMode: BusinessMode | null;
  setCurrentSMB: (smb: SMBProfile | null) => void;
  setBusinessMode: (mode: BusinessMode | null) => void;
}

export const useSMBStore = create<SMBState>()(
  persist(
    (set) => ({
      currentSMB: null,
      businessMode: null,
      setCurrentSMB: (smb) => set({ currentSMB: smb }),
      setBusinessMode: (mode) => set({ businessMode: mode }),
    }),
    { name: 'smb-storage' }
  )
);
