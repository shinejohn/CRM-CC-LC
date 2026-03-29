import "../tokens.css";
import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface UpsellShellProps {
  gateName: string;
  businessName: string;
  communityName: string;
  onClose: () => void;
  children: ReactNode;
  rightPanel: ReactNode;
  embed?: boolean;
  className?: string;
}

export function UpsellShell({
  gateName,
  businessName,
  communityName,
  onClose,
  children,
  rightPanel,
  embed = false,
  className,
}: UpsellShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div
      className={cn(
        "pitch-root flex flex-col overflow-hidden",
        embed ? "relative z-0 h-full min-h-[24rem] w-full max-w-full" : "fixed inset-0 z-40",
        className
      )}
      style={{ backgroundColor: "var(--p-bg)" }}
    >
      <header
        className={cn(
          "top-0 left-0 right-0 z-50 flex h-16 w-full items-center gap-4 border-b px-4 md:px-6",
          embed ? "sticky" : "fixed"
        )}
        style={{
          backgroundColor: "var(--p-header-bg)",
          borderColor: "var(--p-border)",
        }}
      >
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <h1
            className="truncate text-sm font-bold md:text-base"
            style={{ color: "var(--p-text)" }}
          >
            {gateName} for {businessName}
          </h1>
          <p className="truncate text-xs" style={{ color: "var(--p-muted)" }}>
            {communityName}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-md p-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
          style={{ color: "var(--p-muted)" }}
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
      </header>

      <div className={cn("flex flex-1 min-h-0", !embed && "pt-16")}>
        <section
          className="min-w-0 overflow-y-auto w-full md:w-[62%] md:flex-[0_0_62%]"
          style={{
            padding: "var(--p-space-12) var(--p-space-16)",
          }}
        >
          {children}
        </section>
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

      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen((o) => !o)}
          className="fixed bottom-4 right-4 z-[60] rounded-[var(--p-radius-pill)] px-4 py-2.5 text-sm font-semibold shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
          style={{ backgroundColor: "var(--p-teal)", color: "var(--p-bg)" }}
          aria-expanded={drawerOpen}
          aria-controls="upsell-sarah-drawer"
        >
          {drawerOpen ? "Close" : "Ask Sarah"}
        </button>
        <AnimatePresence>
          {drawerOpen ? (
            <motion.aside
              id="upsell-sarah-drawer"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-x-0 bottom-0 z-[55] max-h-[min(70vh,520px)] flex flex-col overflow-hidden rounded-t-[var(--p-radius-lg)] border-t shadow-2xl"
              style={{
                backgroundColor: "var(--p-panel)",
                borderColor: "var(--p-border)",
              }}
              aria-label="Sarah conversation"
            >
              <div className="min-h-0 flex-1 overflow-hidden flex flex-col">{rightPanel}</div>
            </motion.aside>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
