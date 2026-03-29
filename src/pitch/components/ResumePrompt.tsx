import { cn } from "@/lib/utils";

export interface ResumePromptProps {
  variant: "same_browser" | "email_link";
  businessName: string;
  communityName: string;
  lastStep: string;
  nextStepLabel: string;
  slotUpdate?: { category: string; wasAvailable: number; nowAvailable: number };
  onResume: () => void;
  onStartFresh: () => void;
  onDifferentBusiness: () => void;
  className?: string;
}

export function ResumePrompt({
  variant,
  businessName,
  communityName,
  lastStep,
  nextStepLabel,
  slotUpdate,
  onResume,
  onStartFresh,
  onDifferentBusiness,
  className,
}: ResumePromptProps) {
  return (
    <div
      className={cn("space-y-4 rounded-[var(--p-radius-lg)] border p-6", className)}
      style={{
        backgroundColor: "var(--p-card)",
        borderColor: "var(--p-border)",
      }}
    >
      {variant === "same_browser" ? (
        <>
          <h2 className="text-xl font-bold" style={{ color: "var(--p-text)" }}>
            Welcome back, {businessName}.
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--p-muted)" }}>
            You left off during <span style={{ color: "var(--p-text)" }}>{lastStep}</span> for{" "}
            <span style={{ color: "var(--p-text)" }}>{communityName}</span>. Next up:{" "}
            <span style={{ color: "var(--p-text)" }}>{nextStepLabel}</span>.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onResume}
              className="rounded-[var(--p-radius-pill)] px-4 py-2.5 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
              style={{ backgroundColor: "var(--p-teal)", color: "var(--p-bg)" }}
              aria-label="Resume where you left off"
            >
              Resume
            </button>
            <button
              type="button"
              onClick={onStartFresh}
              className="rounded-[var(--p-radius-pill)] border px-4 py-2.5 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
              style={{ borderColor: "var(--p-border-light)", color: "var(--p-text)" }}
              aria-label="Start fresh"
            >
              Start fresh
            </button>
            <button
              type="button"
              onClick={onDifferentBusiness}
              className="rounded-[var(--p-radius-pill)] px-4 py-2.5 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
              style={{ color: "var(--p-muted)" }}
              aria-label="Use a different business"
            >
              Different business
            </button>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-xl font-bold" style={{ color: "var(--p-text)" }}>
            Let&apos;s finish what we started.
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--p-muted)" }}>
            {businessName} · {communityName}. Next:{" "}
            <span style={{ color: "var(--p-text)" }}>{nextStepLabel}</span>.
          </p>
          {slotUpdate ? (
            <div
              className="rounded-[var(--p-radius-md)] border px-4 py-3 text-sm"
              style={{
                borderColor: "var(--p-amber)",
                backgroundColor: "var(--p-amber-soft)",
                color: "var(--p-text)",
              }}
              role="status"
            >
              When we last spoke, there were {slotUpdate.wasAvailable} spots in {slotUpdate.category}.
              There are now {slotUpdate.nowAvailable}.
            </div>
          ) : null}
          <button
            type="button"
            onClick={onResume}
            className="rounded-[var(--p-radius-pill)] px-4 py-2.5 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
            style={{ backgroundColor: "var(--p-teal)", color: "var(--p-bg)" }}
            aria-label="Resume pitch"
          >
            Resume
          </button>
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              onClick={onStartFresh}
              className="text-sm font-medium underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)] rounded"
              style={{ color: "var(--p-muted)" }}
              aria-label="Start fresh"
            >
              Start fresh
            </button>
            <button
              type="button"
              onClick={onDifferentBusiness}
              className="text-sm font-medium underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)] rounded"
              style={{ color: "var(--p-muted)" }}
              aria-label="Different business"
            >
              Different business
            </button>
          </div>
        </>
      )}
    </div>
  );
}
