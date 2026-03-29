import { X } from "lucide-react";
import { PitchProgressBar } from "./PitchProgressBar";
import type { PitchProgressStep } from "../types";
import { cn } from "@/lib/utils";

export interface PitchHeaderProps {
  currentStep: number;
  steps: PitchProgressStep[];
  completedSteps: number[];
  subLabel?: string;
  onClose: () => void;
  /** Fixed for full-screen overlay; sticky when the shell is embedded in a scrolling page. */
  position?: "fixed" | "sticky";
  className?: string;
}

const PLATFORM_DOT_LABELS = [
  "Day.News",
  "Go Event City",
  "Downtown Guide",
  "Go Local Voices",
  "AlphaSite",
] as const;

const PLATFORM_DOT_COLORS = [
  "var(--p-teal)",
  "var(--p-green)",
  "var(--p-purple)",
  "var(--p-orange)",
  "var(--p-amber)",
] as const;

export function PitchHeader({
  currentStep,
  steps,
  completedSteps,
  subLabel,
  onClose,
  position = "fixed",
  className,
}: PitchHeaderProps) {
  return (
    <header
      className={cn(
        "top-0 left-0 right-0 z-50 flex w-full items-center gap-3 px-4 md:px-6",
        position === "fixed" ? "fixed" : "sticky",
        className
      )}
      style={{
        height: 64,
        backgroundColor: "var(--p-header-bg)",
        borderBottom: "1px solid var(--p-border)",
      }}
    >
      <div className="flex items-center gap-3 shrink-0" aria-label="Just1Hug">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 120 32"
          className="h-7 w-auto shrink-0"
          style={{ color: "var(--p-text)" }}
          role="img"
        >
          <text
            x="0"
            y="24"
            fill="currentColor"
            fontFamily="system-ui, sans-serif"
            fontSize="18"
            fontWeight="700"
          >
            Just1Hug
          </text>
        </svg>
        <div className="hidden sm:flex items-center gap-1.5" aria-label="Platforms">
          {PLATFORM_DOT_COLORS.map((c, i) => (
            <span
              key={PLATFORM_DOT_LABELS[i]}
              className="rounded-full shrink-0"
              style={{
                width: 10,
                height: 10,
                backgroundColor: c,
              }}
              title={PLATFORM_DOT_LABELS[i]}
              aria-label={PLATFORM_DOT_LABELS[i]}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 min-w-0 flex justify-center">
        <PitchProgressBar
          steps={steps}
          currentStep={currentStep}
          completedSteps={completedSteps}
          subLabel={subLabel}
        />
      </div>

      <div className="shrink-0 w-10 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
          style={{ color: "var(--p-muted)" }}
          aria-label="Close pitch"
        >
          <X className="w-6 h-6 hover:brightness-125" />
        </button>
      </div>
    </header>
  );
}
