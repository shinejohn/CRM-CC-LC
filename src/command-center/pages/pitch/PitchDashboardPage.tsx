import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MetricCard } from "@/command-center/components/shared/MetricCard";
import { Activity, LineChart as LineChartIcon, Target, Users } from "lucide-react";

const SPARKLINE = [
  { x: "W1", y: 12 },
  { x: "W2", y: 15 },
  { x: "W3", y: 14 },
  { x: "W4", y: 18 },
  { x: "W5", y: 17 },
  { x: "W6", y: 19 },
];

const FUNNEL = [
  { step: "Identify", pct: 100, count: 420 },
  { step: "Community", pct: 92, count: 386 },
  { step: "Goals", pct: 78, count: 328 },
  { step: "Your plan", pct: 64, count: 269 },
  { step: "Proposal", pct: 58, count: 244 },
  { step: "Converted", pct: 38, count: 160 },
];

const GATE_RATES = [
  { name: "GLV", granted: 53, deferred: 32, declined: 15 },
  { name: "AlphaSite", granted: 61, deferred: 29, declined: 10 },
  { name: "DTG", granted: 72, deferred: 21, declined: 7 },
  { name: "Events", granted: 78, deferred: 15, declined: 7 },
  { name: "Day.News", granted: 94, deferred: 4, declined: 2 },
].sort((a, b) => a.granted - b.granted);

const SLOT_ROWS = [
  {
    community: "Clearwater",
    category: "Restaurants",
    slotType: "Influencer",
    total: 5,
    held: 3,
  },
  {
    community: "Clearwater",
    category: "Retail",
    slotType: "Headliner",
    total: 4,
    held: 4,
  },
  {
    community: "Dunedin",
    category: "Fitness",
    slotType: "Expert column",
    total: 6,
    held: 2,
  },
  {
    community: "St. Pete",
    category: "Arts",
    slotType: "Event headliner",
    total: 3,
    held: 1,
  },
];

function funnelColor(pct: number): string {
  if (pct > 70) return "#10b981";
  if (pct >= 50) return "#f59e0b";
  return "#ef4444";
}

function slotStatusPill(available: number, total: number): { label: string; className: string } {
  if (available <= 0) {
    return {
      label: "Full",
      className: "bg-red-100 text-red-900 dark:bg-red-950/50 dark:text-red-100",
    };
  }
  if (available <= Math.ceil(total * 0.2)) {
    return {
      label: "Low",
      className: "bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-100",
    };
  }
  return {
    label: "Open",
    className: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100",
  };
}

export function PitchDashboardPage() {
  const [period, setPeriod] = useState<"today" | "week" | "month">("today");
  const [communityFilter, setCommunityFilter] = useState<string>("all");

  const communities = useMemo(() => {
    const s = new Set(SLOT_ROWS.map((r) => r.community));
    return ["all", ...Array.from(s)];
  }, []);

  const filteredSlots = useMemo(() => {
    if (communityFilter === "all") return SLOT_ROWS;
    return SLOT_ROWS.filter((r) => r.community === communityFilter);
  }, [communityFilter]);

  const sessionsByPeriod = {
    today: { value: "48", delta: "+12%" },
    week: { value: "312", delta: "+8%" },
    month: { value: "1,204", delta: "+15%" },
  } as const;
  const sessions = sessionsByPeriod[period];

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pitch intelligence</h1>
        <p className="text-sm text-muted-foreground">
          Sessions, conversion, gates, and live slot posture (mock data).
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="overflow-hidden border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sessions started
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
              <TabsList className="mb-3 grid w-full grid-cols-3">
                <TabsTrigger value="today" className="text-xs">
                  Today
                </TabsTrigger>
                <TabsTrigger value="week" className="text-xs">
                  Week
                </TabsTrigger>
                <TabsTrigger value="month" className="text-xs">
                  Month
                </TabsTrigger>
              </TabsList>
              <TabsContent value={period} className="m-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{sessions.value}</span>
                  <span className="text-sm font-semibold text-emerald-600">{sessions.delta}</span>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <MetricCard
          label="Proposals sent"
          value="86"
          subtitle="Pipeline MRR $24.6k"
          trend="up"
          trendValue="+4%"
          icon={Target}
          color="violet"
        />

        <Card className="overflow-hidden border-border">
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Conversion rate
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold">38%</span>
                  <span className="text-sm font-semibold text-emerald-600">+2.1%</span>
                </div>
              </div>
              <div className="text-muted-foreground">
                <LineChartIcon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 h-[72px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={SPARKLINE} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                  <XAxis dataKey="x" hide />
                  <RechartsTooltip contentStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="y"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <MetricCard
          label="Avg gates completed"
          value="4.2"
          subtitle="Per converted pitch"
          trend="neutral"
          trendValue="—"
          icon={Users}
          color="ocean"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" />
              Abandonment funnel
            </CardTitle>
            <p className="text-xs text-muted-foreground">% of sessions reaching each step</p>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
            layout="vertical"
            data={FUNNEL}
            margin={{ top: 8, right: 48, left: 8, bottom: 8 }}
          >
            <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <YAxis type="category" dataKey="step" width={100} tick={{ fontSize: 11 }} />
            <RechartsTooltip
              formatter={(value, _name, item) => {
                const v = typeof value === "number" ? value : 0;
                const row = item?.payload as (typeof FUNNEL)[number] | undefined;
                return [`${v}% (${row?.count ?? ""} sessions)`, "Reach"];
              }}
            />
            <Bar dataKey="pct" radius={[0, 4, 4, 0]} barSize={18}>
              {FUNNEL.map((entry) => (
                <Cell key={entry.step} fill={funnelColor(entry.pct)} />
              ))}
              <LabelList
                dataKey="count"
                position="right"
                className="fill-foreground text-[11px]"
              />
            </Bar>
          </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gate permission rates</CardTitle>
            <p className="text-xs text-muted-foreground">
              Stacked granted / deferred / declined — worst gates first
            </p>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={GATE_RATES}
                margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
              >
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="name" width={72} tick={{ fontSize: 11 }} />
                <RechartsTooltip />
                <Bar dataKey="granted" stackId="a" fill="#0d9488" name="Granted" />
                <Bar dataKey="deferred" stackId="a" fill="#f59e0b" name="Deferred" />
                <Bar dataKey="declined" stackId="a" fill="#ef4444" name="Declined" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">Slot fill status</CardTitle>
            <p className="text-xs text-muted-foreground">By community (mock inventory)</p>
          </div>
          <div className="w-full sm:w-56">
            <Select value={communityFilter} onValueChange={setCommunityFilter}>
              <SelectTrigger aria-label="Filter by community">
                <SelectValue placeholder="Community" />
              </SelectTrigger>
              <SelectContent>
                {communities.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c === "all" ? "All communities" : c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b text-xs uppercase text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Community</th>
                <th className="pb-2 pr-4 font-medium">Category</th>
                <th className="pb-2 pr-4 font-medium">Slot type</th>
                <th className="pb-2 pr-4 font-medium">Total</th>
                <th className="pb-2 pr-4 font-medium">Held</th>
                <th className="pb-2 pr-4 font-medium">Available</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSlots.map((row) => {
                const avail = row.total - row.held;
                const pill = slotStatusPill(avail, row.total);
                return (
                  <tr key={`${row.community}-${row.category}-${row.slotType}`} className="border-b border-border/60">
                    <td className="py-3 pr-4">{row.community}</td>
                    <td className="py-3 pr-4">{row.category}</td>
                    <td className="py-3 pr-4">{row.slotType}</td>
                    <td className="py-3 pr-4">{row.total}</td>
                    <td className="py-3 pr-4">{row.held}</td>
                    <td className="py-3 pr-4">{avail}</td>
                    <td className="py-3">
                      <Badge className={pill.className}>{pill.label}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

export default PitchDashboardPage;
