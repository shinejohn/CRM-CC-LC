import { useEffect, useMemo, useRef, useState } from "react";
import { buildProposal } from "@/pitch/api/pitchApi";
import type { AcceptedProduct, PitchStepBaseProps } from "../types";
import { SlotStatusBar } from "../components/SlotStatusBar";

export interface ProposalStepProps extends PitchStepBaseProps {
  founderDaysRemaining?: number;
  influencerSlot?: import("../types").SlotStatus;
  /** Called after POST /proposal succeeds so the parent can refresh session state. */
  onProposalSynced?: () => void;
}

export function ProposalStep({
  session,
  onNext,
  onBack,
  onLogEvent,
  onSarahMessage,
  founderDaysRemaining = 14,
  influencerSlot,
  onProposalSynced,
}: ProposalStepProps) {
  const businessName = session.businessName ?? "your business";
  const items: AcceptedProduct[] = session.productsAccepted ?? [];
  const [proposalLoading, setProposalLoading] = useState(true);
  const [proposalError, setProposalError] = useState<string | null>(null);
  const builtOnce = useRef(false);

  const cartTotal = useMemo(
    () => items.reduce((sum, i) => sum + (Number.isFinite(i.price) ? i.price : 0), 0),
    [items]
  );

  const savings = Math.max(0, cartTotal - 300);
  const savingsRef = useRef(savings);
  savingsRef.current = savings;

  const slot =
    influencerSlot ??
    ({
      total: 8,
      held: 5,
      available: 3,
      status: "almost_full",
    } as const);

  useEffect(() => {
    let cancelled = false;
    async function syncProposal() {
      if (builtOnce.current) return;
      const products = (session.productsAccepted ?? []).map((p) => p.product);
      try {
        setProposalLoading(true);
        await buildProposal(session.id, {
          products: products.length ? products : ["Community Influencer"],
          business_context: {
            business_name: session.businessName,
            category: session.businessCategory,
            community_id: session.communityId,
          },
        });
        builtOnce.current = true;
        if (!cancelled) {
          setProposalError(null);
          onProposalSynced?.();
        }
      } catch (e) {
        if (!cancelled) {
          setProposalError(e instanceof Error ? e.message : "Could not build proposal");
        }
      } finally {
        if (!cancelled) {
          setProposalLoading(false);
        }
      }
    }
    void syncProposal();
    return () => {
      cancelled = true;
    };
  }, [session.id, onProposalSynced]);

  useEffect(() => {
    onLogEvent("step_reached", { step: "proposal" });
    const s = savingsRef.current;
    if (s > 0) {
      onSarahMessage?.(
        `Everything you selected during our conversation is covered in the package — and it saves you $${s} compared to buying each piece separately.`
      );
    } else {
      onSarahMessage?.(
        "Here's the package I put together — it bundles everything we talked about into one straightforward enrollment."
      );
    }
  }, [onLogEvent, onSarahMessage]);

  function continueCart() {
    onLogEvent("step_completed", { step: "proposal", choice: "ala_carte" });
    onNext({ lastStep: "proposal" });
  }

  function continuePackage() {
    onLogEvent("step_completed", { step: "proposal", choice: "package" });
    onNext({ lastStep: "proposal" });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl" style={{ color: "var(--p-text)" }}>
          Here&apos;s what I&apos;d recommend for {businessName}.
        </h1>
        <p className="mt-3 text-base" style={{ color: "var(--p-muted)" }}>
          You can build your own plan, or take the complete package I put together for you.
        </p>
      </div>

      {proposalLoading ? (
        <p className="text-sm" style={{ color: "var(--p-muted)" }}>
          Building your proposal…
        </p>
      ) : null}
      {proposalError ? (
        <div
          className="rounded-[var(--p-radius-lg)] border px-4 py-3 text-sm"
          style={{ borderColor: "var(--p-red)", color: "var(--p-red)" }}
          role="alert"
        >
          {proposalError}
        </div>
      ) : null}

      <div
        className="rounded-[var(--p-radius-lg)] border px-4 py-3 text-sm font-semibold"
        style={{
          borderColor: "var(--p-amber)",
          backgroundColor: "var(--p-amber-soft)",
          color: "var(--p-amber)",
        }}
      >
        Founding member pricing: Lock in $300/month for 3 years. Window closes in {founderDaysRemaining}{" "}
        days.
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div
          className="space-y-4 rounded-[var(--p-radius-lg)] border p-5"
          style={{ borderColor: "var(--p-border)", backgroundColor: "var(--p-card)" }}
        >
          <h2 className="text-lg font-bold" style={{ color: "var(--p-text)" }}>
            À la carte
          </h2>
          <ul className="space-y-2">
            {items.length ? (
              items.map((i) => (
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
              ))
            ) : (
              <li className="text-sm" style={{ color: "var(--p-muted)" }}>
                No add-ons yet — you can still take the package below.
              </li>
            )}
          </ul>
          <div className="border-t pt-3 text-sm font-bold" style={{ borderColor: "var(--p-border)", color: "var(--p-text)" }}>
            <div className="flex justify-between">
              <span>Running total</span>
              <span style={{ color: "var(--p-teal)" }}>${cartTotal}/mo</span>
            </div>
          </div>
          <button
            type="button"
            onClick={continueCart}
            className="w-full rounded-[var(--p-radius-pill)] border py-3 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
            style={{ borderColor: "var(--p-border-light)", color: "var(--p-text)" }}
          >
            Continue with à la carte →
          </button>
        </div>

        <div
          className="relative space-y-4 rounded-[var(--p-radius-lg)] border-2 p-5"
          style={{ borderColor: "var(--p-teal)", backgroundColor: "var(--p-card)" }}
        >
          <span
            className="absolute right-4 top-4 rounded-[var(--p-radius-pill)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{ backgroundColor: "var(--p-teal)", color: "var(--p-bg)" }}
          >
            Recommended
          </span>
          <h2 className="text-lg font-bold pr-24" style={{ color: "var(--p-text)" }}>
            Community Influencer
          </h2>
          <div className="flex flex-wrap items-end gap-2">
            <span className="text-3xl font-bold" style={{ color: "var(--p-teal)" }}>
              $300/mo
            </span>
            {savings > 0 ? (
              <span
                className="rounded-[var(--p-radius-pill)] px-2 py-0.5 text-xs font-bold"
                style={{ backgroundColor: "var(--p-green-soft)", color: "var(--p-green)" }}
              >
                Saves ${savings}/mo vs à la carte
              </span>
            ) : null}
          </div>
          <SlotStatusBar
            total={slot.total}
            held={slot.held}
            category={session.businessCategory ?? "Your category"}
            community={session.primaryCommunityName ?? "Your community"}
            size="sm"
          />
          <ul className="space-y-2 text-sm" style={{ color: "var(--p-muted)" }}>
            <li className="flex gap-2">
              <span style={{ color: "var(--p-teal)" }}>✓</span>
              Premium listings across Day.News, Downtown Guide, hub
            </li>
            <li className="flex gap-2">
              <span style={{ color: "var(--p-teal)" }}>✓</span>
              One article and five announcements monthly
            </li>
            <li className="flex gap-2">
              <span style={{ color: "var(--p-teal)" }}>✓</span>
              Priority positions where inventory applies
            </li>
            <li className="flex gap-2">
              <span style={{ color: "var(--p-teal)" }}>✓</span>
              25% off additional advertising
            </li>
          </ul>
          <button
            type="button"
            onClick={continuePackage}
            className="w-full rounded-[var(--p-radius-pill)] py-4 text-base font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
            style={{ backgroundColor: "var(--p-teal)", color: "var(--p-bg)" }}
          >
            Get this package →
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 border-t pt-6" style={{ borderColor: "var(--p-border)" }}>
        <button
          type="button"
          onClick={onBack}
          className="rounded-[var(--p-radius-pill)] border px-4 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
          style={{ borderColor: "var(--p-border-light)", color: "var(--p-text)" }}
        >
          Back
        </button>
      </div>
    </div>
  );
}
