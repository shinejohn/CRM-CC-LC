import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/command-center/components/shared/MetricCard";
import {
  DollarSign,
  MessageSquare,
  ShoppingCart,
  TrendingUp,
  Users,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { apiClient } from "@/services/api";

interface DashboardData {
  active_sessions: number;
  converted_today: number;
  abandoned_today: number;
  active_campaigns: number;
  revenue_this_month: number;
  recent_sessions: Array<{
    id: string;
    business_name: string | null;
    status: string;
    source_platform: string;
    last_active_at: string;
    community?: { name: string } | null;
  }>;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  intake: {
    label: "Intake",
    className: "bg-blue-100 text-blue-900 dark:bg-blue-950/50 dark:text-blue-100",
  },
  proposed: {
    label: "Proposed",
    className: "bg-violet-100 text-violet-900 dark:bg-violet-950/50 dark:text-violet-100",
  },
  negotiating: {
    label: "Negotiating",
    className: "bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-100",
  },
  converted: {
    label: "Converted",
    className: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100",
  },
  abandoned: {
    label: "Abandoned",
    className: "bg-red-100 text-red-900 dark:bg-red-950/50 dark:text-red-100",
  },
};

const PLATFORM_LABELS: Record<string, string> = {
  day_news: "Day.News",
  goeventcity: "GoEventCity",
  downtownguide: "DowntownGuide",
  golocalvoices: "GoLocalVoices",
};

export function SarahDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<{ data: DashboardData }>("/sarah/dashboard")
      .then((res) => setData(res.data.data))
      .catch(() => {
        // Fall back to empty state
        setData({
          active_sessions: 0,
          converted_today: 0,
          abandoned_today: 0,
          active_campaigns: 0,
          revenue_this_month: 0,
          recent_sessions: [],
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const d = data!;
  const conversionRate =
    d.active_sessions + d.converted_today > 0
      ? Math.round((d.converted_today / (d.active_sessions + d.converted_today)) * 100)
      : 0;

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sarah Campaign Builder</h1>
        <p className="text-sm text-muted-foreground">
          AI-driven advertising sessions, campaigns, and revenue tracking.
        </p>
      </div>

      {/* Metrics row */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Active sessions"
          value={String(d.active_sessions)}
          subtitle="Currently in flow"
          trend="neutral"
          trendValue=""
          icon={Users}
          color="blue"
        />
        <MetricCard
          label="Converted today"
          value={String(d.converted_today)}
          subtitle={`${conversionRate}% rate`}
          trend={d.converted_today > 0 ? "up" : "neutral"}
          trendValue={d.converted_today > 0 ? `+${d.converted_today}` : "—"}
          icon={CheckCircle2}
          color="green"
        />
        <MetricCard
          label="Active campaigns"
          value={String(d.active_campaigns)}
          subtitle="Paid and running"
          trend="neutral"
          trendValue=""
          icon={ShoppingCart}
          color="violet"
        />
        <MetricCard
          label="Revenue this month"
          value={`$${d.revenue_this_month.toLocaleString()}`}
          subtitle="Sarah-created campaigns"
          trend={d.revenue_this_month > 0 ? "up" : "neutral"}
          trendValue=""
          icon={DollarSign}
          color="green"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              Quick actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/command-center/sarah/sessions">
              <Button variant="outline" className="w-full justify-between" type="button">
                View all sessions
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/command-center/sarah/campaigns">
              <Button variant="outline" className="w-full justify-between" type="button">
                View campaigns
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Today's activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" />
              Today&apos;s activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-lg bg-emerald-50 p-4 dark:bg-emerald-950/30">
                <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-600" />
                <p className="mt-1 text-2xl font-bold">{d.converted_today}</p>
                <p className="text-xs text-muted-foreground">Converted</p>
              </div>
              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/30">
                <MessageSquare className="mx-auto h-6 w-6 text-blue-600" />
                <p className="mt-1 text-2xl font-bold">{d.active_sessions}</p>
                <p className="text-xs text-muted-foreground">In progress</p>
              </div>
              <div className="rounded-lg bg-red-50 p-4 dark:bg-red-950/30">
                <XCircle className="mx-auto h-6 w-6 text-red-600" />
                <p className="mt-1 text-2xl font-bold">{d.abandoned_today}</p>
                <p className="text-xs text-muted-foreground">Abandoned</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent sessions table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Recent sessions</CardTitle>
            <p className="text-xs text-muted-foreground">Latest advertiser interactions</p>
          </div>
          <Link to="/command-center/sarah/sessions">
            <Button variant="ghost" size="sm" type="button">
              View all <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b text-xs uppercase text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Business</th>
                <th className="pb-2 pr-4 font-medium">Platform</th>
                <th className="pb-2 pr-4 font-medium">Community</th>
                <th className="pb-2 pr-4 font-medium">Status</th>
                <th className="pb-2 font-medium">Last active</th>
              </tr>
            </thead>
            <tbody>
              {d.recent_sessions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No sessions yet. Sessions will appear here when advertisers click &quot;Advertise&quot; on any platform.
                  </td>
                </tr>
              ) : (
                d.recent_sessions.map((session) => {
                  const statusCfg = STATUS_CONFIG[session.status] ?? STATUS_CONFIG.intake;
                  return (
                    <tr key={session.id} className="border-b border-border/60">
                      <td className="py-3 pr-4 font-medium">
                        <Link
                          to={`/command-center/sarah/sessions/${session.id}`}
                          className="hover:text-primary hover:underline"
                        >
                          {session.business_name ?? "Unknown business"}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {PLATFORM_LABELS[session.source_platform] ?? session.source_platform}
                      </td>
                      <td className="py-3 pr-4">{session.community?.name ?? "—"}</td>
                      <td className="py-3 pr-4">
                        <Badge className={statusCfg.className}>{statusCfg.label}</Badge>
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {session.last_active_at
                          ? new Date(session.last_active_at).toLocaleString()
                          : "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

export default SarahDashboardPage;
