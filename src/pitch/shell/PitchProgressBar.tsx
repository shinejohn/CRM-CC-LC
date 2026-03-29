import { useMemo } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { PitchProgressStep } from "../types";
import { cn } from "@/lib/utils";

export interface PitchProgressBarProps {
  steps: PitchProgressStep[];
  /** 1-based step index (first step = 1) */
  currentStep: number;
  /** 1-based step numbers that are completed */
  completedSteps: number[];
  subLabel?: string;
  className?: string;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

export function PitchProgressBar({
  steps,
  currentStep,
  completedSteps,
  subLabel,
  className,
}: PitchProgressBarProps) {
  const completedSet = useMemo(() => new Set(completedSteps), [completedSteps]);
  const activeIndex = clamp(currentStep - 1, 0, Math.max(steps.length - 1, 0));

  return (
    <div className={cn("w-full", className)}>
      {/* Mobile summary */}
      <div
        className="flex md:hidden flex-col items-center justify-center gap-1 px-2 text-center"
        style={{ color: "var(--p-text)" }}
      >
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--p-muted)" }}>
          Step {activeIndex + 1} of {steps.length}
        </span>
        <span className="text-sm font-bold truncate max-w-[85vw]">{steps[activeIndex]?.label ?? ""}</span>
        {subLabel ? (
          <span className="text-xs truncate max-w-[85vw]" style={{ color: "var(--p-muted)" }}>
            {subLabel}
          </span>
        ) : null}
      </div>

      {/* Desktop step rail */}
      <div
        className="hidden md:flex items-start justify-center gap-0 w-full max-w-[min(100%,72rem)] mx-auto px-4"
        role="list"
        aria-label="Pitch progress"
      >
        {steps.map((step, index) => {
          const stepNum = index + 1;
          const isCompleted = completedSet.has(stepNum);
          const isActive = stepNum === currentStep;
          const isUpcoming = !isCompleted && !isActive;

          const prevCompleted = index > 0 && completedSet.has(index);
          const segmentAfterIsTeal = completedSet.has(stepNum);

          return (
            <div key={step.key} className="flex items-start flex-1 min-w-0 last:flex-none" role="listitem">
              {index > 0 ? (
                <div
                  className="mt-[10px] h-px flex-1 min-w-[8px]"
                  style={{
                    backgroundColor: prevCompleted ? "var(--p-teal)" : "var(--p-border)",
                  }}
                  aria-hidden
                />
              ) : null}

              <div className="flex flex-col items-center shrink-0 w-[72px] px-0.5">
                <motion.div
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: 20,
                    height: 20,
                    border: isActive ? "2px solid var(--p-teal)" : "none",
                    backgroundColor: isCompleted
                      ? "var(--p-teal)"
                      : isActive
                        ? "var(--p-active-fill)"
                        : "var(--p-upcoming-fill)",
                  }}
                  initial={false}
                  animate={{ scale: isActive ? 1.05 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                >
                  {isCompleted ? (
                    <Check
                      className="w-3 h-3"
                      strokeWidth={3}
                      aria-hidden
                      style={{ color: "var(--p-bg)" }}
                    />
                  ) : (
                    <span
                      className="text-[10px] font-bold leading-none"
                      style={{
                        color: isUpcoming ? "var(--p-muted)" : "var(--p-text)",
                      }}
                    >
                      {stepNum}
                    </span>
                  )}
                </motion.div>
                <span
                  className="mt-2 text-center leading-tight uppercase"
                  style={{
                    fontSize: "var(--p-font-step-label)",
                    letterSpacing: "0.05em",
                    color: isActive ? "var(--p-text)" : "var(--p-muted)",
                    fontWeight: isActive ? 700 : 500,
                  }}
                >
                  {step.label}
                </span>
                {isActive && subLabel ? (
                  <span
                    className="mt-0.5 text-center text-[10px] leading-tight px-0.5"
                    style={{ color: "var(--p-muted)" }}
                  >
                    {subLabel}
                  </span>
                ) : null}
              </div>

              {index < steps.length - 1 ? (
                <div
                  className="mt-[10px] h-px flex-1 min-w-[8px]"
                  style={{
                    backgroundColor: segmentAfterIsTeal ? "var(--p-teal)" : "var(--p-border)",
                  }}
                  aria-hidden
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
