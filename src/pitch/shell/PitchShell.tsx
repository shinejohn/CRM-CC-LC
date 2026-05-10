import "../tokens.css";
import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PitchHeader } from "./PitchHeader";
import type { PitchProgressStep } from "../types";
import { cn } from "@/lib/utils";

export interface PitchShellProps {
  /** Main flow content (left panel) */
  children: ReactNode;
  /** Sarah panel or other right-column content */
  rightPanel: ReactNode;
  onClose: () => void;
  showProgress?: boolean;
  currentStep?: number;
  steps?: PitchProgressStep[];
  completedSteps?: number[];
  progressSubLabel?: string;
  /** Use inside scrollable pages (e.g. DevPreview). Default is full-viewport overlay. */
  embed?: boolean;
  /** "pitch" (default) uses standard layout; "learn" uses wider left panel for slides */
  variant?: "pitch" | "learn";
  className?: string;
}

export function PitchShell({
  children,
  rightPanel,
  onClose,
  showProgress = true,
  currentStep = 1,
  steps = [],
  completedSteps = [],
  progressSubLabel,
  embed = false,
  variant = "pitch",
  className,
}: PitchShellProps) {
  const isLearn = variant === "learn";
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div
      className={cn(
        "pitch-root flex flex-col overflow-hidden",
        embed
          ? "relative z-0 h-full min-h-[28rem] w-full max-w-full"
          : "fixed inset-0 z-40",
        className
      )}
      style={{ backgroundColor: "var(--p-bg)" }}
    >
      {showProgress ? (
        <PitchHeader
          currentStep={currentStep}
          steps={steps}
          completedSteps={completedSteps}
          subLabel={progressSubLabel}
          onClose={onClose}
          position={embed ? "sticky" : "fixed"}
        />
      ) : (
        <header
          className={cn(
            "top-0 left-0 right-0 z-50 flex h-16 w-full items-center justify-end px-4 md:px-6",
            embed ? "sticky" : "fixed"
          )}
          style={{
            backgroundColor: "var(--p-header-bg)",
            borderBottom: "1px solid var(--p-border)",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-[var(--p-muted)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
            aria-label="Close"
          >
            <span className="text-2xl leading-none" aria-hidden>
              ×
            </span>
          </button>
        </header>
      )}

      <div className={cn("flex flex-1 min-h-0", !embed && "pt-16")}>
        {/* Left panel — wider in learn variant for slide content */}
        <section
          className={cn(
            "min-w-0 overflow-y-auto w-full",
            isLearn
              ? "md:flex-[1_1_0%]"
              : "md:w-[62%] md:flex-[0_0_62%]"
          )}
          style={{
            padding: isLearn ? 0 : "var(--p-space-12) var(--p-space-16)",
          }}
        >
          {children}
        </section>

        {/* Right panel — desktop */}
        <aside
          className="hidden md:flex md:w-[380px] md:flex-none md:flex-col min-h-0 border-l overflow-y-auto"
          style={{
            backgroundColor: "var(--p-panel)",
            borderColor: "var(--p-border)",
          }}
          aria-label="Sarah conversation"
        >
          {rightPanel}
        </aside>
      </div>

      {/* Mobile drawer */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen((o) => !o)}
          className="fixed bottom-4 right-4 z-[60] rounded-[var(--p-radius-pill)] px-4 py-2.5 text-sm font-semibold shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
          style={{ backgroundColor: "var(--p-teal)", color: "var(--p-bg)" }}
          aria-expanded={drawerOpen}
          aria-controls="pitch-sarah-drawer"
        >
          {drawerOpen ? "Close" : "Ask Sarah"}
        </button>

        <AnimatePresence>
          {drawerOpen ? (
            <motion.aside
              id="pitch-sarah-drawer"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-x-0 bottom-0 z-[55] max-h-[min(70vh,520px)] flex flex-col rounded-t-[var(--p-radius-lg)] border-t overflow-hidden shadow-2xl"
              style={{
                backgroundColor: "var(--p-panel)",
                borderColor: "var(--p-border)",
              }}
              aria-label="Sarah conversation"
            >
              <div className="flex-1 min-h-0 overflow-hidden flex flex-col">{rightPanel}</div>
            </motion.aside>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
