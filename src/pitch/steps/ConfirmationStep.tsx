import { useEffect, useMemo } from "react";
import type { AcceptedProduct, PitchStepBaseProps } from "../types";

export interface ConfirmationStepProps extends Omit<PitchStepBaseProps, "onBack"> {
  /** Override: no "back" in confirmation. */
  onBack?: () => void;
}

export function ConfirmationStep({
  session,
  onNext,
  onLogEvent,
  onSarahMessage,
}: ConfirmationStepProps) {
  const communityName = session.primaryCommunityName ?? "your community";
  const items: AcceptedProduct[] = session.productsAccepted ?? [];
  const total = useMemo(
    () => items.reduce((s, i) => s + (Number.isFinite(i.price) ? i.price : 0), 0),
    [items],
  );

  useEffect(() => {
    onLogEvent("step_reached", { step: "done" });
    onSarahMessage?.(
      "Welcome aboard. I'll have your first performance report ready within the week.",
    );
  }, [onLogEvent, onSarahMessage]);

  return (
    <div className="mx-auto max-w-lg space-y-8 py-4">
      {/* Success icon */}
      <div className="flex justify-center">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: "var(--p-green-soft)" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-10 w-10"
            style={{ color: "var(--p-green)" }}
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>

      {/* Headline */}
      <div className="text-center">
        <h1
          className="text-3xl font-bold md:text-4xl"
          style={{ color: "var(--p-text)" }}
        >
          You&apos;re in. Welcome to {communityName}.
        </h1>
        <p className="mt-3 text-base" style={{ color: "var(--p-muted)" }}>
          Your account manager Sarah will be in touch with next steps.
        </p>
      </div>

      {/* Purchase summary */}
      {items.length > 0 ? (
        <div
          className="space-y-3 rounded-[var(--p-radius-lg)] border p-5"
          style={{
            borderColor: "var(--p-border)",
            backgroundColor: "var(--p-card)",
          }}
        >
          <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: "var(--p-muted)" }}>
            What you enrolled in
          </h2>
          <ul className="space-y-2">
            {items.map((i) => (
              <li
                key={`${i.product}-${i.price}`}
                className="flex justify-between text-sm"
                style={{ color: "var(--p-text)" }}
              >
                <span>{i.product}</span>
                <span className="font-semibold" style={{ color: "var(--p-teal)" }}>
                  ${i.price}/mo
                </span>
              </li>
            ))}
          </ul>
          <div
            className="flex justify-between border-t pt-3 text-sm font-bold"
            style={{ borderColor: "var(--p-border)", color: "var(--p-text)" }}
          >
            <span>Monthly total</span>
            <span style={{ color: "var(--p-teal)" }}>${total}/mo</span>
          </div>
        </div>
      ) : null}

      {/* What happens next */}
      <div
        className="space-y-3 rounded-[var(--p-radius-lg)] border p-5"
        style={{
          borderColor: "var(--p-border)",
          backgroundColor: "var(--p-card)",
        }}
      >
        <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: "var(--p-muted)" }}>
          What happens next
        </h2>
        <ul className="space-y-2 text-sm" style={{ color: "var(--p-text)" }}>
          <li className="flex gap-2">
            <span style={{ color: "var(--p-teal)" }}>1.</span>
            Your listings will be set up across the network within 48 hours.
          </li>
          <li className="flex gap-2">
            <span style={{ color: "var(--p-teal)" }}>2.</span>
            Sarah will reach out with your onboarding checklist.
          </li>
          <li className="flex gap-2">
            <span style={{ color: "var(--p-teal)" }}>3.</span>
            Your first performance report arrives within the week.
          </li>
        </ul>
      </div>

      {/* CTA */}
      <a
        href="/command-center"
        className="block w-full rounded-[var(--p-radius-pill)] py-4 text-center text-base font-bold transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
        style={{ backgroundColor: "var(--p-teal)", color: "var(--p-bg)" }}
      >
        Go to your Command Center →
      </a>
    </div>
  );
}
