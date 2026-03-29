import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { FollowUpCardModel, FollowUpType } from "./cc-pitch-types";
import { CompleteForThemSheet, type RemainingGate } from "./CompleteForThemSheet";
import { RePitchGateSheet } from "./RePitchGateSheet";

export type { FollowUpCardModel };

function typeLabel(t: FollowUpType): string {
  switch (t) {
    case "incomplete":
      return "Incomplete Pitch";
    case "proposal":
      return "Unconverted Proposal";
    case "deferred_gate":
      return "Deferred Gate";
    default:
      return "Follow-up";
  }
}

function typeBadgeClass(t: FollowUpType): string {
  switch (t) {
    case "incomplete":
      return "bg-sky-100 text-sky-900 dark:bg-sky-900/40 dark:text-sky-100";
    case "proposal":
      return "bg-violet-100 text-violet-900 dark:bg-violet-900/40 dark:text-violet-100";
    case "deferred_gate":
      return "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100";
    default:
      return "";
  }
}

const MOCK_ALL_GATES: RemainingGate[] = [
  { key: "alphasite", label: "AlphaSite" },
  { key: "events", label: "Events" },
  { key: "downtown_guide", label: "Downtown Guide" },
];

export function FollowUpCard({ item }: { item: FollowUpCardModel }) {
  const [completeOpen, setCompleteOpen] = useState(false);
  const [rePitchOpen, setRePitchOpen] = useState(false);

  const remainingGates = useMemo((): RemainingGate[] => {
    const done = new Set(item.gatesCompleted.map((g) => g.toLowerCase()));
    return MOCK_ALL_GATES.filter((g) => !done.has(g.label.toLowerCase()) && !done.has(g.key));
  }, [item.gatesCompleted]);

  const slotAlert =
    item.slotCounts && item.slotCounts.current !== item.slotCounts.previous ? (
      <div
        className={cn(
          "rounded-md border px-3 py-2 text-sm",
          item.slotCounts.current < item.slotCounts.previous
            ? "border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100"
            : "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
        )}
      >
        Slot change — {item.slotCounts.label}: was {item.slotCounts.previous}, now{" "}
        {item.slotCounts.current}.
      </div>
    ) : null;

  const gateKey = item.targetGateKey ?? remainingGates[0]?.key ?? "day_news";
  const gateLabel = item.targetGateLabel ?? remainingGates[0]?.label ?? "Day.News";

  return (
    <TooltipProvider>
      <Card className="border-border">
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold text-foreground">{item.businessName}</h3>
                <span className="text-sm text-muted-foreground">· {item.community}</span>
                <Badge className={cn("font-medium", typeBadgeClass(item.type))} variant="secondary">
                  {typeLabel(item.type)}
                </Badge>
              </div>

              <p className="text-sm text-foreground">
                {item.contactName} ·{" "}
                <a
                  className="text-primary underline-offset-2 hover:underline"
                  href={`mailto:${item.contactEmail}`}
                >
                  {item.contactEmail}
                </a>
              </p>

              <p className="text-sm text-muted-foreground">
                Last active {item.lastActive} · Left at: {item.lastStep}
              </p>

              <div className="flex flex-wrap gap-2">
                {item.gatesCompleted.map((g) => (
                  <Badge
                    key={g}
                    variant="outline"
                    className="border-teal-300 bg-teal-50 text-teal-900 dark:border-teal-800 dark:bg-teal-950/30 dark:text-teal-100"
                  >
                    {g} ✓
                  </Badge>
                ))}
                {item.gatesDeferred.map((g) => (
                  <Tooltip key={g.gate} content={g.reason}>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className="cursor-help border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100"
                      >
                        {g.gate} (deferred)
                      </Badge>
                    </TooltipTrigger>
                  </Tooltip>
                ))}
              </div>

              {item.productsDeferred && item.productsDeferred.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {item.productsDeferred.map((p) => (
                    <Badge key={p.product} variant="outline" className="text-muted-foreground">
                      Product deferred: {p.product}
                    </Badge>
                  ))}
                </div>
              ) : null}

              {item.proposalValue != null ? (
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  ${item.proposalValue}/mo proposal
                </p>
              ) : null}

              {item.founderDaysRemaining != null ? (
                <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
                  Founder rate: {item.founderDaysRemaining} days left
                </div>
              ) : null}

              {slotAlert}
            </div>

            <div className="flex shrink-0 flex-col justify-end gap-2 sm:flex-row lg:flex-col lg:items-end">
              {item.type === "incomplete" ? (
                <>
                  <Button type="button" variant="outline" size="sm">
                    Send Resume Email
                  </Button>
                  <Button type="button" size="sm" onClick={() => setCompleteOpen(true)}>
                    Complete for Them →
                  </Button>
                  <Button type="button" variant="destructive" size="sm">
                    Mark as Lost
                  </Button>
                </>
              ) : null}
              {item.type === "proposal" ? (
                <>
                  <Button type="button" variant="outline" size="sm">
                    Send Reminder
                  </Button>
                  <Button type="button" size="sm">
                    Adjust Proposal →
                  </Button>
                  <Button type="button" variant="destructive" size="sm">
                    Mark as Lost
                  </Button>
                </>
              ) : null}
              {item.type === "deferred_gate" ? (
                <>
                  <Button type="button" size="sm" onClick={() => setRePitchOpen(true)}>
                    Re-pitch This Gate →
                  </Button>
                  <Button type="button" variant="outline" size="sm">
                    Send Email
                  </Button>
                  <Button type="button" variant="secondary" size="sm">
                    Defer 30 Days
                  </Button>
                </>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      <CompleteForThemSheet
        open={completeOpen}
        onOpenChange={setCompleteOpen}
        businessName={item.businessName}
        communityName={item.community}
        contactName={item.contactName}
        contactEmail={item.contactEmail}
        remainingGates={remainingGates.length > 0 ? remainingGates : [{ key: "day_news", label: "Day.News" }]}
      />

      <RePitchGateSheet
        open={rePitchOpen}
        onOpenChange={setRePitchOpen}
        gateKey={gateKey}
        gateLabel={gateLabel}
        businessName={item.businessName}
        communityName={item.community}
        contactEmail={item.contactEmail}
      />
    </TooltipProvider>
  );
}
