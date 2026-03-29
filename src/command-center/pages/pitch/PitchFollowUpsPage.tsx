import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FollowUpCard, type FollowUpCardModel } from "@/components/pitch";

const MOCK_ITEMS: FollowUpCardModel[] = [
  {
    id: "1",
    type: "incomplete",
    businessName: "Sunrise Bakery",
    community: "Clearwater",
    contactName: "Alex Martinez",
    contactEmail: "alex@sunrisebakery.com",
    lastActive: "2 hours ago",
    lastStep: "AlphaSite gate",
    gatesCompleted: ["Day.News", "Downtown Guide", "Events"],
    gatesDeferred: [{ gate: "AlphaSite", reason: "not_now — budget review next month" }],
    proposalValue: 300,
    slotCounts: { label: "Headliner — Restaurants", previous: 2, current: 0 },
  },
  {
    id: "2",
    type: "proposal",
    businessName: "Harbor Grill",
    community: "Clearwater",
    contactName: "Mike Chen",
    contactEmail: "mike@harborgrill.com",
    lastActive: "8 days ago",
    lastStep: "Proposal sent",
    gatesCompleted: ["Day.News", "Events"],
    gatesDeferred: [],
    productsDeferred: [{ product: "Ticket Sales", reason: "not_now" }],
    proposalValue: 450,
    founderDaysRemaining: 6,
  },
  {
    id: "3",
    type: "deferred_gate",
    businessName: "Dunedin Yoga",
    community: "Dunedin",
    contactName: "Sarah Kim",
    contactEmail: "sarah@dunedin-yoga.com",
    lastActive: "28 days ago",
    lastStep: "Events gate",
    gatesCompleted: ["Day.News", "Community Influencer"],
    gatesDeferred: [
      { gate: "Events", reason: "Season starts in April" },
      { gate: "AlphaSite", reason: "Revisit after site refresh" },
    ],
    targetGateKey: "events",
    targetGateLabel: "Events",
    proposalValue: 320,
  },
  {
    id: "4",
    type: "incomplete",
    businessName: "Coastal Print Co.",
    community: "St. Pete",
    contactName: "Jordan Lee",
    contactEmail: "jordan@coastalprint.co",
    lastActive: "1 day ago",
    lastStep: "Goals",
    gatesCompleted: ["Day.News"],
    gatesDeferred: [],
  },
];

type FilterKey = "all" | "incomplete" | "deferred" | "proposal" | "dueToday";

function matchesFilter(item: FollowUpCardModel, f: FilterKey): boolean {
  if (f === "all") return true;
  if (f === "incomplete") return item.type === "incomplete";
  if (f === "deferred") return item.type === "deferred_gate";
  if (f === "proposal") return item.type === "proposal";
  if (f === "dueToday") return item.type === "deferred_gate" || item.type === "proposal";
  return true;
}

export function PitchFollowUpsPage() {
  const [filter, setFilter] = useState<FilterKey>("all");

  const counts = useMemo(() => {
    const base: Record<FilterKey, number> = {
      all: 0,
      incomplete: 0,
      deferred: 0,
      proposal: 0,
      dueToday: 0,
    };
    for (const item of MOCK_ITEMS) {
      base.all += 1;
      if (item.type === "incomplete") base.incomplete += 1;
      if (item.type === "deferred_gate") base.deferred += 1;
      if (item.type === "proposal") base.proposal += 1;
      if (matchesFilter(item, "dueToday")) base.dueToday += 1;
    }
    return base;
  }, []);

  const visible = useMemo(() => MOCK_ITEMS.filter((i) => matchesFilter(i, filter)), [filter]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pitch follow-ups</h1>
        <p className="text-sm text-muted-foreground">
          Operator queue — incomplete pitches, deferred gates, and live proposals (mock list).
        </p>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterKey)}>
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            All ({counts.all})
          </TabsTrigger>
          <TabsTrigger value="incomplete" className="text-xs sm:text-sm">
            Incomplete ({counts.incomplete})
          </TabsTrigger>
          <TabsTrigger value="deferred" className="text-xs sm:text-sm">
            Deferred Gates ({counts.deferred})
          </TabsTrigger>
          <TabsTrigger value="proposal" className="text-xs sm:text-sm">
            Unconverted Proposals ({counts.proposal})
          </TabsTrigger>
          <TabsTrigger value="dueToday" className="text-xs sm:text-sm">
            Due Today ({counts.dueToday})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6 space-y-4">
          {visible.map((item) => (
            <FollowUpCard key={item.id} item={item} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PitchFollowUpsPage;
