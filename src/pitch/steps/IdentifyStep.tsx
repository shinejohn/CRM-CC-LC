import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import type { PitchStepBaseProps, PublicBusinessSearchHit } from "../types";
import { searchBusinesses, claimBusiness, createBusiness } from "@/pitch/api/pitchApi";

const CATEGORY_OPTIONS = [
  { value: "restaurant", label: "Restaurant / Food" },
  { value: "retail", label: "Retail" },
  { value: "professional", label: "Professional services" },
  { value: "health", label: "Health & wellness" },
  { value: "entertainment", label: "Entertainment" },
  { value: "other", label: "Other" },
];

export function IdentifyStep({ session, onNext, onBack, onLogEvent, onSarahMessage }: PitchStepBaseProps) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PublicBusinessSearchHit[]>([]);
  const [manualOpen, setManualOpen] = useState(false);
  const [claiming, setClaiming] = useState<PublicBusinessSearchHit | null>(null);
  const [manual, setManual] = useState({
    business_name: "",
    category: "restaurant",
    city: "",
    address: "",
    phone: "",
    email: "",
  });
  const [busy, setBusy] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    onLogEvent("step_reached", { step: "identify" });
    onSarahMessage?.(
      "Hi! I'm Sarah, your account manager. I'm going to help you build a plan that actually works for your business — not a generic package. Start by finding your business and I'll take it from there."
    );
  }, [onLogEvent, onSarahMessage]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebounced(query.trim()), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (debounced.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const hits = await searchBusinesses(debounced, session.communityId);
        if (!cancelled) setResults(hits);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [debounced, session.communityId]);

  const confirmClaim = useCallback(
    (hit: PublicBusinessSearchHit) => {
      setClaiming(hit);
    },
    []
  );

  const submitClaimed = useCallback(async () => {
    if (!claiming) return;
    setBusy(true);
    try {
      const res = await claimBusiness(claiming.id, { community_id: Number(session.communityId) });
      onLogEvent("step_completed", { step: "identify", source: "directory", id: claiming.id });
      const smb = res.smb as { id?: number | string };
      onNext({
        businessName: claiming.business_name,
        businessCategory: claiming.category ?? undefined,
        smbId: smb.id !== undefined ? String(smb.id) : undefined,
        communityId: claiming.community_id ? String(claiming.community_id) : session.communityId,
      });
    } finally {
      setBusy(false);
    }
  }, [claiming, onLogEvent, onNext, session.communityId]);

  const submitManual = useCallback(async () => {
    if (!manual.business_name.trim()) return;
    setBusy(true);
    try {
      await createBusiness({
        community_id: session.communityId ? Number(session.communityId) : null,
        business_name: manual.business_name.trim(),
        city: manual.city.trim() || null,
        category: manual.category || null,
        state: null,
        source: "pitch_manual",
        metadata: {
          address: manual.address.trim() || undefined,
          phone: manual.phone.trim() || undefined,
          email: manual.email.trim() || undefined,
        },
      });
      onLogEvent("step_completed", { step: "identify", source: "manual" });
      onNext({
        businessName: manual.business_name.trim(),
        businessCategory: manual.category,
      });
    } finally {
      setBusy(false);
    }
  }, [manual, onLogEvent, onNext, session.communityId]);

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl" style={{ color: "var(--p-text)" }}>
          Let&apos;s get your business in front of your community.
        </h1>
        <p className="mt-3 text-base" style={{ color: "var(--p-muted)" }}>
          Sarah will build a plan that actually works for your business.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--p-label)" }}>
          Search for your business
        </p>
        <div
          className="relative flex items-center rounded-[var(--p-radius-md)] border px-3"
          style={{ borderColor: "var(--p-border)", backgroundColor: "var(--p-card)" }}
        >
          <Search className="h-4 w-4 shrink-0" style={{ color: "var(--p-muted)" }} aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Business name, city, or address..."
            className="w-full border-0 bg-transparent px-3 py-3 text-sm outline-none focus:ring-0"
            style={{ color: "var(--p-text)" }}
            aria-label="Search for your business"
          />
        </div>
        {loading ? (
          <p className="text-xs" style={{ color: "var(--p-muted)" }}>
            Searching…
          </p>
        ) : null}
        <AnimatePresence>
          {results.length > 0 ? (
            <motion.ul
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-h-64 space-y-1 overflow-y-auto rounded-[var(--p-radius-md)] border p-2"
              style={{ borderColor: "var(--p-border)", backgroundColor: "var(--p-panel)" }}
              role="listbox"
            >
              {results.map((hit) => (
                <li key={hit.id}>
                  <button
                    type="button"
                    onClick={() => confirmClaim(hit)}
                    className="flex w-full flex-col items-start gap-1 rounded-[var(--p-radius-sm)] px-3 py-2 text-left transition-colors hover:bg-[var(--p-card-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
                  >
                    <span className="font-semibold" style={{ color: "var(--p-text)" }}>
                      {hit.business_name}
                    </span>
                    <span className="text-xs" style={{ color: "var(--p-muted)" }}>
                      {[hit.city, hit.state].filter(Boolean).join(", ")}
                    </span>
                    {hit.category ? (
                      <span
                        className="mt-0.5 inline-block rounded-[var(--p-radius-pill)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                        style={{ backgroundColor: "var(--p-teal-soft)", color: "var(--p-teal)" }}
                      >
                        {hit.category}
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </motion.ul>
          ) : null}
        </AnimatePresence>
      </div>

      <div>
        <button
          type="button"
          onClick={() => setManualOpen((v) => !v)}
          className="text-sm font-semibold underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)] rounded"
          style={{ color: "var(--p-teal)" }}
        >
          Don&apos;t see your business? Add it manually
        </button>
        <AnimatePresence initial={false}>
          {manualOpen ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-3 rounded-[var(--p-radius-lg)] border p-4" style={{ borderColor: "var(--p-border)" }}>
                <label className="block space-y-1">
                  <span className="text-xs font-medium" style={{ color: "var(--p-muted)" }}>
                    Business name
                  </span>
                  <input
                    value={manual.business_name}
                    onChange={(e) => setManual((m) => ({ ...m, business_name: e.target.value }))}
                    className="w-full rounded-[var(--p-radius-sm)] border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
                    style={{ borderColor: "var(--p-border)", backgroundColor: "var(--p-card)", color: "var(--p-text)" }}
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-medium" style={{ color: "var(--p-muted)" }}>
                    Category
                  </span>
                  <select
                    value={manual.category}
                    onChange={(e) => setManual((m) => ({ ...m, category: e.target.value }))}
                    className="w-full rounded-[var(--p-radius-sm)] border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
                    style={{ borderColor: "var(--p-border)", backgroundColor: "var(--p-card)", color: "var(--p-text)" }}
                  >
                    {CATEGORY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-medium" style={{ color: "var(--p-muted)" }}>
                    Address
                  </span>
                  <input
                    value={manual.address}
                    onChange={(e) => setManual((m) => ({ ...m, address: e.target.value }))}
                    className="w-full rounded-[var(--p-radius-sm)] border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
                    style={{ borderColor: "var(--p-border)", backgroundColor: "var(--p-card)", color: "var(--p-text)" }}
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-medium" style={{ color: "var(--p-muted)" }}>
                    City
                  </span>
                  <input
                    value={manual.city}
                    onChange={(e) => setManual((m) => ({ ...m, city: e.target.value }))}
                    className="w-full rounded-[var(--p-radius-sm)] border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
                    style={{ borderColor: "var(--p-border)", backgroundColor: "var(--p-card)", color: "var(--p-text)" }}
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-medium" style={{ color: "var(--p-muted)" }}>
                    Phone
                  </span>
                  <input
                    type="tel"
                    value={manual.phone}
                    onChange={(e) => setManual((m) => ({ ...m, phone: e.target.value }))}
                    className="w-full rounded-[var(--p-radius-sm)] border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
                    style={{ borderColor: "var(--p-border)", backgroundColor: "var(--p-card)", color: "var(--p-text)" }}
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-medium" style={{ color: "var(--p-muted)" }}>
                    Email
                  </span>
                  <input
                    type="email"
                    value={manual.email}
                    onChange={(e) => setManual((m) => ({ ...m, email: e.target.value }))}
                    className="w-full rounded-[var(--p-radius-sm)] border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
                    style={{ borderColor: "var(--p-border)", backgroundColor: "var(--p-card)", color: "var(--p-text)" }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => void submitManual()}
                  disabled={busy}
                  className="mt-2 w-full rounded-[var(--p-radius-pill)] py-3 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)] disabled:opacity-60"
                  style={{ backgroundColor: "var(--p-teal)", color: "var(--p-bg)" }}
                >
                  {busy ? "Saving…" : "Add my business →"}
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {claiming ? (
        <div className="rounded-[var(--p-radius-lg)] border p-4" style={{ borderColor: "var(--p-teal)" }}>
          <p className="font-semibold" style={{ color: "var(--p-text)" }}>
            Claim {claiming.business_name}?
          </p>
          <p className="mt-1 text-sm" style={{ color: "var(--p-muted)" }}>
            We&apos;ll use this listing to personalize your plan.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void submitClaimed()}
              disabled={busy}
              className="rounded-[var(--p-radius-pill)] px-4 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)] disabled:opacity-60"
              style={{ backgroundColor: "var(--p-teal)", color: "var(--p-bg)" }}
            >
              {busy ? "Saving…" : "Yes, this is my business"}
            </button>
            <button
              type="button"
              onClick={() => setClaiming(null)}
              className="rounded-[var(--p-radius-pill)] border px-4 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
              style={{ borderColor: "var(--p-border-light)", color: "var(--p-text)" }}
            >
              Back
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 border-t pt-6" style={{ borderColor: "var(--p-border)" }}>
        <button
          type="button"
          onClick={onBack}
          className="rounded-[var(--p-radius-pill)] border px-4 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
          style={{ borderColor: "var(--p-border-light)", color: "var(--p-text)" }}
        >
          Back
        </button>
      </div>

      <p className="text-center text-xs" style={{ color: "var(--p-muted)" }}>
        You won&apos;t need an account until checkout.
      </p>
    </div>
  );
}
