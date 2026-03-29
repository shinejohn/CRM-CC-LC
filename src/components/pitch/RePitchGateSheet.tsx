import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { UpsellShell } from "@/pitch/shell/UpsellShell";
import { SarahPanel } from "@/pitch/shell/SarahPanel";
import { GenericGatePreview } from "@/pitch/gates";

export interface RePitchGateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gateKey: string;
  gateLabel: string;
  businessName: string;
  communityName: string;
  contactEmail: string;
  categoryLabel?: string;
}

export function RePitchGateSheet({
  open,
  onOpenChange,
  gateKey,
  gateLabel,
  businessName,
  communityName,
  contactEmail,
  categoryLabel,
}: RePitchGateSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-4xl">
        <SheetHeader className="sr-only">
          <SheetTitle>Re-pitch {gateLabel}</SheetTitle>
          <SheetDescription>Preview re-engagement experience for {businessName}</SheetDescription>
        </SheetHeader>
        <div className="h-[min(85vh,720px)] min-h-[400px] w-full flex-1">
          <UpsellShell
            embed
            gateName={gateLabel}
            businessName={businessName}
            communityName={communityName}
            onClose={() => onOpenChange(false)}
            rightPanel={
              <SarahPanel
                messages={[
                  {
                    id: "re-1",
                    text: `Here is the ${gateLabel} experience we would send after their last session. Adjust narrative in CRM before sending if needed.`,
                    timestamp: "Now",
                  },
                ]}
              />
            }
          >
            <GenericGatePreview
              gateKey={gateKey}
              gateLabel={gateLabel}
              entryMode="upsell"
              businessName={businessName}
              communityName={communityName}
              categoryLabel={categoryLabel}
            />
          </UpsellShell>
        </div>
        <SheetFooter className="flex flex-row flex-wrap justify-end gap-2 border-t bg-background px-6 py-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              onOpenChange(false);
            }}
          >
            Send to Business
          </Button>
          <span className="w-full text-xs text-muted-foreground sm:w-auto">
            Queues re-engagement email to {contactEmail}
          </span>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
