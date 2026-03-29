import "../tokens.css";
import type { EntryMode } from "../types";
import { GateWrapper } from "../components/GateWrapper";
import { PositionLadder } from "../components/PositionLadder";
import { SlotStatusBar } from "../components/SlotStatusBar";

export interface GenericGatePreviewProps {
  gateKey: string;
  gateLabel: string;
  entryMode: EntryMode;
  businessName: string;
  communityName: string;
  categoryLabel?: string;
}

const GATE_COPY: Record<
  string,
  { permissionAsk: string; tellMeMore: string; ladderTitle: string }
> = {
  day_news: {
    permissionAsk: `Want to see how Day.News would position ${"[business]"} this quarter?`,
    tellMeMore:
      "We walk through real inventory for your community — you can defer anything that is not a fit.",
    ladderTitle: "Where you show up in the digest",
  },
  downtown_guide: {
    permissionAsk: "Should we map how the Downtown Guide spot would look for your storefront?",
    tellMeMore: "Placement rotates fairly; we show the ladder you are buying into.",
    ladderTitle: "Downtown Guide ladder",
  },
  alphasite: {
    permissionAsk: "Ready to preview an AlphaSite lane that matches your category?",
    tellMeMore: "AlphaSite helps you own search-like discovery without rebuilding a full site first.",
    ladderTitle: "Site presence tiers",
  },
  events: {
    permissionAsk: "Want to see event packaging based on what you told us about your calendar?",
    tellMeMore: "Slots are live — we surface real availability for your community.",
    ladderTitle: "Event placements",
  },
  default: {
    permissionAsk: "Preview this gate with the business profile loaded?",
    tellMeMore: "This is the same education block the business sees during the live pitch.",
    ladderTitle: "Placement options",
  },
};

export function GenericGatePreview({
  gateKey,
  gateLabel,
  entryMode,
  businessName,
  communityName,
  categoryLabel = "Restaurant",
}: GenericGatePreviewProps) {
  const meta = GATE_COPY[gateKey] ?? GATE_COPY.default;
  const permissionAsk = meta.permissionAsk.replace("[business]", businessName);

  return (
    <div className="pitch-root space-y-4 rounded-lg border border-[var(--p-border)] bg-[var(--p-bg)] p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--p-muted)]">
        {gateLabel}
      </p>
      <GateWrapper
        entryMode={entryMode}
        permissionAsk={permissionAsk}
        tellMeMore={meta.tellMeMore}
        onYes={() => undefined}
        onSkip={() => undefined}
        onDefer={() => undefined}
      >
        <div className="space-y-4">
          <SlotStatusBar
            total={8}
            held={5}
            category={categoryLabel}
            community={communityName}
          />
          <PositionLadder
            title={meta.ladderTitle}
            positions={[
              {
                label: "Premier partner",
                sublabel: "Top rotation across the week",
                tier: "premium",
              },
              {
                label: "Featured merchant",
                sublabel: "Featured row + mention",
                highlight: true,
                tier: "premium",
              },
              {
                label: "Standard merchant",
                sublabel: "Directory + digest inclusion",
                tier: "basic",
              },
              {
                label: "Starter",
                sublabel: "Baseline presence",
                isCurrentPosition: true,
                tier: "basic",
              },
            ]}
          />
        </div>
      </GateWrapper>
    </div>
  );
}
