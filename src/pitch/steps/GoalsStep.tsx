import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PencilLine } from "lucide-react";
import type { DiscoveryAnswers, PitchStepBaseProps, SlotStatus } from "../types";
import { cn } from "@/lib/utils";

const Q1 = [
  { key: "foot_traffic", label: "More foot traffic" },
  { key: "retention", label: "Get customers back more often" },
  { key: "event_launch", label: "Promote an event or launch" },
  { key: "awareness", label: "Build community awareness" },
  { key: "other", label: "Something else" },
];

const Q2 = [
  { key: "word_of_mouth", label: "Word of mouth" },
  { key: "online", label: "Online / search" },
  { key: "foot_traffic", label: "Foot traffic" },
  { key: "referrals", label: "Referrals" },
  { key: "mixed", label: "A mix of everything" },
];

const Q3 = [
  { key: "none", label: "Not spending on marketing" },
  { key: "spending_working", label: "Yes, and it's working" },
  { key: "spending_not_working", label: "Yes, but not getting results" },
  { key: "spending_unsure", label: "Yes, but not sure if it's working" },
];

function labelFor<T extends { key: string; label: string }>(opts: T[], key: string) {
  return opts.find((o) => o.key === key)?.label ?? key;
}

export interface GoalsStepProps extends PitchStepBaseProps {
  /** Optional slot summary for Sarah line after budget (e.g. from community inventory). */
  influencerSlotHint?: SlotStatus;
}

export function GoalsStep({
  session,
  onNext,
  onBack,
  onLogEvent,
  onSarahMessage,
  influencerSlotHint,
}: GoalsStepProps) {
  const [q1, setQ1] = useState<string | null>(null);
  const [q2, setQ2] = useState<string | null>(null);
  const [q3, setQ3] = useState<string | null>(null);
  const [phase, setPhase] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    onLogEvent("step_reached", { step: "goals" });
  }, [onLogEvent]);

  function commitQ1(key: string) {
    setQ1(key);
    setPhase(2);
    const label = labelFor(Q1, key);
    onSarahMessage?.(
      `Got it — ${label}. That tells me a lot. A couple more questions and I'll have everything I need.`
    );
  }

  function commitQ2(key: string) {
    setQ2(key);
    setPhase(3);
    const label = labelFor(Q2, key);
    onSarahMessage?.(`Good — ${label}. That helps me understand your customer acquisition. One more question.`);
  }

  function commitQ3(key: string) {
    setQ3(key);
    const slot = influencerSlotHint ?? { available: 2, total: 5, held: 3, status: "open" as const };
    const isSpending = key !== "none";
    const notWorking = key === "spending_not_working" || key === "spending_unsure";
    const tail =
      slot.status === "full"
        ? "inventory is tight in your category — we'll talk about the best fit."
        : `there are still positions open in your area — we'll make the plan match what you said.`;
    if (notWorking) {
      onSarahMessage?.(`That's exactly the situation where what we do makes the biggest difference — ${tail}`);
    } else if (isSpending) {
      onSarahMessage?.(`Good to know it's working. Let me show you how to amplify that — ${tail}`);
    } else {
      onSarahMessage?.(`That's the cleanest starting point — ${tail}`);
    }
  }

  function editFrom(target: 1 | 2 | 3) {
    setPhase(target);
    if (target <= 1) {
      setQ1(null);
      setQ2(null);
      setQ3(null);
    }
    if (target === 2) {
      setQ2(null);
      setQ3(null);
    }
    if (target === 3) {
      setQ3(null);
    }
  }

  const done = q1 && q2 && q3;

  async function submit() {
    if (!q1 || !q2 || !q3) return;
    const disc: DiscoveryAnswers = {
      goal: labelFor(Q1, q1),
      goalKey: q1,
      customerSource: labelFor(Q2, q2),
      marketingSpend: labelFor(Q3, q3),
    };
    onLogEvent("step_completed", { step: "goals", discovery: disc });
    await onNext({ discoveryAnswers: disc });
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl" style={{ color: "var(--p-text)" }}>
          Tell me about your goals.
        </h1>
        <p className="mt-3 text-base" style={{ color: "var(--p-muted)" }}>
          I&apos;ll use this to build a plan that actually works for you.
        </p>
      </div>

      <div className="space-y-4">
        {q1 ? (
          <SummaryCard
            step={1}
            title="Goal"
            value={labelFor(Q1, q1)}
            onEdit={() => editFrom(1)}
          />
        ) : null}
        {phase >= 1 && !q1 ? (
          <QuestionBlock label="Goal" chips={Q1} onPick={(k) => commitQ1(k)} />
        ) : null}

        {q2 ? (
          <SummaryCard
            step={2}
            title="Customer Source"
            value={labelFor(Q2, q2)}
            onEdit={() => editFrom(2)}
          />
        ) : null}
        {phase >= 2 && q1 && !q2 ? (
          <QuestionBlock label="Where do most of your customers come from?" chips={Q2} onPick={(k) => commitQ2(k)} />
        ) : null}

        {q3 ? (
          <SummaryCard
            step={3}
            title="Marketing Spend"
            value={labelFor(Q3, q3)}
            onEdit={() => editFrom(3)}
          />
        ) : null}
        {phase >= 3 && q1 && q2 && !q3 ? (
          <div>
            <QuestionBlock label="Are you spending on marketing now?" chips={Q3} onPick={(k) => commitQ3(k)} />
            <p className="mt-2 text-xs italic" style={{ color: "var(--p-label)" }}>
              No judgment either way — I need this to size the plan correctly.
            </p>
          </div>
        ) : null}
      </div>

      <AnimatePresence>
        {done ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-2"
          >
            <button
              type="button"
              onClick={() => void submit()}
              className="flex w-full items-center justify-center rounded-[var(--p-radius-pill)] py-4 text-base font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
              style={{ backgroundColor: "var(--p-teal)", color: "var(--p-bg)" }}
            >
              Build My Plan →
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

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

function SummaryCard({
  step,
  title,
  value,
  onEdit,
}: {
  step: number;
  title: string;
  value: string;
  onEdit: () => void;
}) {
  return (
    <motion.div
      layout
      className="flex items-start justify-between gap-3 rounded-[var(--p-radius-lg)] border p-4"
      style={{ borderColor: "var(--p-border)", backgroundColor: "var(--p-card)" }}
    >
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--p-label)" }}>
          {step} {title}
        </p>
        <p className="mt-1 text-sm font-medium" style={{ color: "var(--p-text)" }}>
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="rounded-md p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
        style={{ color: "var(--p-muted)" }}
        aria-label={`Edit ${title}`}
      >
        <PencilLine className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

function QuestionBlock({
  label,
  chips,
  onPick,
}: {
  label: string;
  chips: { key: string; label: string }[];
  onPick: (key: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--p-label)" }}>
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {chips.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => onPick(c.key)}
            className={cn(
              "rounded-[var(--p-radius-pill)] border px-4 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
            )}
            style={{
              borderColor: "var(--p-border-light)",
              color: "var(--p-text)",
              backgroundColor: "var(--p-card)",
            }}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
