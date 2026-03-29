import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { EntryMode } from "../types";
import { cn } from "@/lib/utils";

export interface GateWrapperProps {
  permissionAsk: string;
  onYes: () => void;
  onSkip: () => void;
  onDefer?: () => void;
  entryMode: EntryMode;
  children: ReactNode;
  /** When true, main content is shown without the permission block (fast path). */
  isOpen?: boolean;
  /** Optional detail copy revealed by “Tell me more”. */
  tellMeMore?: string;
  className?: string;
}

export function GateWrapper({
  permissionAsk,
  onYes,
  onSkip,
  onDefer,
  entryMode,
  children,
  isOpen,
  tellMeMore,
  className,
}: GateWrapperProps) {
  const [internalUnlocked, setInternalUnlocked] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const revealed =
    entryMode === "upsell" || isOpen === true || (isOpen !== false && internalUnlocked);

  function handleYes() {
    setInternalUnlocked(true);
    onYes();
  }

  return (
    <div className={cn("space-y-4", className)}>
      {entryMode === "pitch" && !revealed ? (
        <div className="space-y-3">
          <div
            className="rounded-[var(--p-radius-md)] border-l-[3px] px-4 py-3 pl-[13px]"
            style={{
              borderLeftColor: "var(--p-amber)",
              backgroundColor: "var(--p-message-bg)",
            }}
          >
            <p className="text-sm leading-snug" style={{ color: "var(--p-text)" }}>
              {permissionAsk}
            </p>
          </div>
          {tellMeMore ? (
            <div>
              <button
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                className="text-sm font-medium underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)] rounded"
                style={{ color: "var(--p-muted)" }}
                aria-expanded={moreOpen}
              >
                Tell me more {moreOpen ? "↑" : "↓"}
              </button>
              <AnimatePresence initial={false}>
                {moreOpen ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <p
                      className="mt-2 text-sm leading-relaxed"
                      style={{ color: "var(--p-muted)" }}
                    >
                      {tellMeMore}
                    </p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          ) : null}
          <button
            type="button"
            onClick={handleYes}
            className="flex w-full items-center justify-center rounded-[var(--p-radius-pill)] py-3 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
            style={{ backgroundColor: "var(--p-teal)", color: "var(--p-bg)" }}
            aria-label="Yes, show me"
          >
            Yes, show me
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="flex w-full items-center justify-center rounded-[var(--p-radius-pill)] border py-3 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
            style={{ borderColor: "var(--p-border-light)", color: "var(--p-text)" }}
            aria-label="Skip this"
          >
            Skip this
          </button>
          {onDefer ? (
            <button
              type="button"
              onClick={onDefer}
              className="flex w-full items-center justify-center py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)] rounded-md"
              style={{ color: "var(--p-label)" }}
              aria-label="Not right now"
            >
              Not right now
            </button>
          ) : null}
        </div>
      ) : null}

      <AnimatePresence initial={false}>
        {revealed ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
