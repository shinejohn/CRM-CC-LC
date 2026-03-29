import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { GenericGatePreview } from "@/pitch/gates";
import { cn } from "@/lib/utils";

export interface RemainingGate {
  key: string;
  label: string;
}

export interface CompleteForThemSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessName: string;
  communityName: string;
  contactName: string;
  contactEmail: string;
  remainingGates: RemainingGate[];
  categoryLabel?: string;
}

export function CompleteForThemSheet({
  open,
  onOpenChange,
  businessName,
  communityName,
  contactName,
  contactEmail,
  remainingGates,
  categoryLabel = "Restaurant",
}: CompleteForThemSheetProps) {
  const [activeKey, setActiveKey] = useState(remainingGates[0]?.key ?? "");

  const remainingKeysSig = remainingGates.map((g) => g.key).join("|");
  useEffect(() => {
    if (!open) return;
    const first = remainingGates[0]?.key;
    if (first) setActiveKey(first);
  }, [open, remainingKeysSig, remainingGates]);

  const active = remainingGates.find((g) => g.key === activeKey) ?? remainingGates[0];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-2xl">
        <SheetHeader className="text-left">
          <SheetTitle>Complete pitch for {businessName}</SheetTitle>
          <SheetDescription>
            Operator view — remaining gates with profile pre-loaded for {contactName}. Upsell mode
            shows what the business would see without the permission wall.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4 border-t border-border pt-4">
          <div className="rounded-lg border bg-muted/40 p-4 text-sm">
            <p className="font-semibold text-foreground">{businessName}</p>
            <p className="text-muted-foreground">{communityName}</p>
            <p className="mt-2 text-muted-foreground">
              <span className="font-medium text-foreground">Contact:</span> {contactName} ·{" "}
              <a className="text-primary underline-offset-2 hover:underline" href={`mailto:${contactEmail}`}>
                {contactEmail}
              </a>
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Remaining gates
            </p>
            <div className="flex flex-wrap gap-2">
              {remainingGates.map((g) => (
                <button
                  key={g.key}
                  type="button"
                  onClick={() => setActiveKey(g.key)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                    activeKey === g.key
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background hover:bg-muted"
                  )}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {active ? (
            <GenericGatePreview
              gateKey={active.key}
              gateLabel={active.label}
              entryMode="upsell"
              businessName={businessName}
              communityName={communityName}
              categoryLabel={categoryLabel}
            />
          ) : null}
        </div>

        <SheetFooter className="mt-auto flex-col gap-2 border-t pt-4 sm:flex-col">
          <Button type="button" className="w-full" size="lg">
            Send proposal to {contactEmail} →
          </Button>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
