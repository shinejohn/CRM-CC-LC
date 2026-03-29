import type { PitchProgressStep } from "./types";

/** Default progress steps for the pitch header (1-based step numbers). */
export const PITCH_PROGRESS_STEPS: PitchProgressStep[] = [
  { key: "identify", label: "IDENTIFY" },
  { key: "community", label: "COMMUNITY" },
  { key: "goals", label: "GOALS" },
  { key: "your_plan", label: "YOUR PLAN" },
  { key: "proposal", label: "PROPOSAL" },
  { key: "upgrades", label: "UPGRADES" },
  { key: "your_deal", label: "YOUR DEAL" },
  { key: "checkout", label: "CHECKOUT" },
  { key: "done", label: "DONE" },
];
