import { useState } from "react";
import type { PitchGateBaseProps } from "../types";
import { GateWrapper } from "../components/GateWrapper";
import { ProductCard } from "../components/ProductCard";

type Qualify = "well" | "somewhat" | "not_really" | null;
type SiteAge = "current" | "stale" | null;
type Intake = "lot" | "some" | "none" | null;

/**
 * Qualifying flow renders outside GateWrapper; permission ask only when needed.
 * Copy avoids artificial-intelligence hype terms and “automated” / “algorithm” wording per AlphaSite spec.
 */
export function AlphaSiteGate({
  profile,
  entryMode,
  onProductAdd,
  onProductSkip,
  onProductDefer,
  onGateComplete,
  onGateDefer,
  onLogEvent,
}: PitchGateBaseProps) {
  const [searchVisibility, setSearchVisibility] = useState<Qualify>(null);
  const [siteAge, setSiteAge] = useState<SiteAge>(null);
  const [permissionOpen, setPermissionOpen] = useState(false);
  const [intake, setIntake] = useState<Intake>(null);

  const service = profile.serviceSearchTerm || profile.category.toLowerCase();

  const needsEducation =
    searchVisibility === "somewhat" ||
    searchVisibility === "not_really" ||
    (searchVisibility === "well" && siteAge === "stale");

  const permissionAsk =
    "That's worth fixing. Can I take 30 seconds to show you what the gap is and how we close it?";

  const mainContent = (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold md:text-3xl" style={{ color: "var(--p-text)" }}>
        How {profile.communityName} residents find local businesses has changed. Here&apos;s where{" "}
        {profile.businessName} stands.
      </h2>

      <SearchResultMock service={service} community={profile.communityName} businessName={profile.businessName} />

      <ProductCard
        name="AlphaSite Profile"
        price="—"
        description="Complete, current business profile — connected to Day.News, Downtown Guide, and GoEventCity. One update, everywhere."
        included
        onAdd={() => onProductAdd({ product: "AlphaSite Profile", price: 0 })}
        onSkip={() => onProductSkip("alphasite_profile")}
      />

      {profile.categorySuggestsPhoneIntake ? (
        <div className="space-y-3">
          <p className="text-sm font-semibold" style={{ color: "var(--p-text)" }}>
            How much of your day involves answering the same questions from customers?
          </p>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { key: "lot" as const, label: "A lot — it takes real time" },
                { key: "some" as const, label: "Some, but manageable" },
                { key: "none" as const, label: "Not really an issue" },
              ] as const
            ).map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setIntake(c.key)}
                className="rounded-[var(--p-radius-pill)] border px-3 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
                style={{
                  borderColor: intake === c.key ? "var(--p-teal)" : "var(--p-border-light)",
                  backgroundColor: intake === c.key ? "var(--p-teal-soft)" : "transparent",
                  color: "var(--p-text)",
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {intake === "lot" ? (
        <ProductCard
          name="Customer Response Service"
          price="$99/mo"
          description="Handles inbound customer questions around the clock. Customers get answers immediately — no hold, no waiting for a callback."
          onAdd={() => onProductAdd({ product: "Customer Response Service", price: 99 })}
          onSkip={() => onProductSkip("customer_response")}
          onDefer={() => onProductDefer?.("customer_response")}
        />
      ) : null}

      <div className="flex flex-wrap gap-2 border-t pt-4" style={{ borderColor: "var(--p-border)" }}>
        <button
          type="button"
          onClick={onGateComplete}
          className="rounded-[var(--p-radius-pill)] px-4 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
          style={{ backgroundColor: "var(--p-teal)", color: "var(--p-bg)" }}
        >
          Continue →
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold" style={{ color: "var(--p-text)" }}>
          Quick question — if someone searched for a {service} in {profile.communityName} right now, does{" "}
          {profile.businessName} come up prominently?
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(
            [
              { key: "well" as const, label: "Yes, we show up well" },
              { key: "somewhat" as const, label: "Somewhat — not as well as I'd like" },
              { key: "not_really" as const, label: "Not really / Not sure" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => {
                setSearchVisibility(opt.key);
                if (opt.key !== "well") setSiteAge(null);
              }}
              className="rounded-[var(--p-radius-pill)] border px-3 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
              style={{
                borderColor: searchVisibility === opt.key ? "var(--p-teal)" : "var(--p-border-light)",
                backgroundColor: searchVisibility === opt.key ? "var(--p-teal-soft)" : "transparent",
                color: "var(--p-text)",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {searchVisibility === "well" ? (
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--p-text)" }}>
            Has the site been updated in the last year?
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setSiteAge("current");
                onLogEvent("alphasite_gate_skipped_qualified", { gate: "alphasite" });
                onGateComplete();
              }}
              className="rounded-[var(--p-radius-pill)] border px-3 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
              style={{
                borderColor: "var(--p-border-light)",
                color: "var(--p-text)",
              }}
            >
              Yes, it&apos;s current
            </button>
            <button
              type="button"
              onClick={() => setSiteAge("stale")}
              className="rounded-[var(--p-radius-pill)] border px-3 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
              style={{
                borderColor: siteAge === "stale" ? "var(--p-teal)" : "var(--p-border-light)",
                backgroundColor: siteAge === "stale" ? "var(--p-teal-soft)" : "transparent",
                color: "var(--p-text)",
              }}
            >
              It&apos;s been a while
            </button>
          </div>
        </div>
      ) : null}

      {needsEducation ? (
        <GateWrapper
          entryMode={entryMode}
          permissionAsk={permissionAsk}
          onYes={() => {
            setPermissionOpen(true);
            onLogEvent("gate_permission_granted", { gate: "alphasite" });
          }}
          onSkip={() => {
            onLogEvent("gate_permission_denied", { gate: "alphasite", via: "skip" });
            onGateDefer();
          }}
          onDefer={() => {
            onLogEvent("gate_permission_denied", { gate: "alphasite", via: "defer" });
            onGateDefer();
          }}
          isOpen={entryMode === "upsell" || permissionOpen}
        >
          {mainContent}
        </GateWrapper>
      ) : null}
    </div>
  );
}

function SearchResultMock({
  service,
  community,
  businessName,
}: {
  service: string;
  community: string;
  businessName: string;
}) {
  const competitors = ["Harbor Table Co.", "North Pier Kitchen", "Courtyard Provisions"];
  return (
    <div
      className="rounded-[var(--p-radius-lg)] border p-4"
      style={{ borderColor: "var(--p-border)", backgroundColor: "var(--p-panel)" }}
    >
      <p className="text-sm" style={{ color: "var(--p-muted)" }}>
        <span aria-hidden>🔍</span> &ldquo;{service} in {community}&rdquo;
      </p>
      <ul className="mt-4 space-y-2 text-sm">
        {competitors.map((name) => (
          <li key={name} className="flex gap-2" style={{ color: "var(--p-text)" }}>
            <span style={{ color: "var(--p-teal)" }} aria-hidden>
              ✦
            </span>
            <span>
              {name} · <span style={{ color: "var(--p-muted)" }}>Complete profile</span>
            </span>
          </li>
        ))}
        <li className="flex gap-2 font-medium" style={{ color: "var(--p-muted)" }}>
          <span aria-hidden>·</span>
          {businessName} · Basic listing <span style={{ color: "var(--p-amber)" }}>←</span>
        </li>
      </ul>
    </div>
  );
}
