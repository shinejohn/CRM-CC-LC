import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowDownRight, ArrowUpRight, BadgePercent, Crown, Minus, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  SubscriberROIReport,
  SubscriberROISummary,
  TrendMetric,
} from "@/services/subscriberRoiService";
import {
  fetchSubscriberRoiCurrent,
  fetchSubscriberRoiSummary,
} from "@/services/subscriberRoiService";

interface CommunitySubscriptionRow {
  id: string;
  customer_id: string;
  status: string;
  tier: string;
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function TrendArrow({ trend }: { trend: TrendMetric | undefined }) {
  if (!trend || trend.direction === "flat") {
    return <Minus className="w-4 h-4 text-muted-foreground" aria-hidden />;
  }
  if (trend.direction === "up") {
    return <ArrowUpRight className="w-4 h-4 text-emerald-600" aria-hidden />;
  }
  return <ArrowDownRight className="w-4 h-4 text-rose-600" aria-hidden />;
}

function ValueRing({ percent }: { percent: number }) {
  const p = Math.min(100, Math.max(0, percent));
  const c = 2 * Math.PI * 40;
  const dash = (p / 100) * c;

  return (
    <div className="relative mx-auto h-36 w-36">
      <svg className="-rotate-90" viewBox="0 0 100 100" aria-hidden>
        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="10" className="text-slate-200 dark:text-slate-700" />
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeDasharray={`${dash} ${c}`}
          strokeLinecap="round"
          className="text-indigo-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tabular-nums">{p}%</span>
        <span className="text-xs text-muted-foreground">of dues</span>
      </div>
    </div>
  );
}

export const ROIDashboardPage: React.FC = () => {
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [report, setReport] = useState<SubscriberROIReport | null>(null);
  const [summary, setSummary] = useState<SubscriberROISummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { apiClient } = await import("@/services/api");
        const subRes = await apiClient.get<{ data: CommunitySubscriptionRow[] }>("/community-subscriptions");
        const rows = subRes.data.data || [];
        const active = rows.find((r) => r.status === "active");
        if (!active?.customer_id) {
          if (!cancelled) {
            setCustomerId(null);
            setReport(null);
            setSummary(null);
          }
          return;
        }
        if (!cancelled) setCustomerId(active.customer_id);

        const [r, s] = await Promise.all([
          fetchSubscriberRoiCurrent(active.customer_id),
          fetchSubscriberRoiSummary(active.customer_id),
        ]);
        if (!cancelled) {
          setReport(r);
          setSummary(s);
        }
      } catch (e: unknown) {
        const message =
          e && typeof e === "object" && "message" in e && typeof (e as { message: unknown }).message === "string"
            ? (e as { message: string }).message
            : "Could not load ROI data.";
        if (!cancelled) {
          setError(message);
          setReport(null);
          setSummary(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <p className="text-muted-foreground">Loading subscriber ROI…</p>
      </div>
    );
  }

  if (!customerId) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Subscriber ROI</h1>
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            You need an active community subscription to view ROI.
            <div className="mt-4">
              <Button asChild type="button" variant="outline">
                <Link to="/subscriptions">Back to subscriptions</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Subscriber ROI</h1>
        <Card className="border-destructive/50">
          <CardContent className="p-6 text-destructive">{error ?? "No report available."}</CardContent>
        </Card>
        <Button asChild type="button" variant="outline">
          <Link to="/subscriptions">Back to subscriptions</Link>
        </Button>
      </div>
    );
  }

  const monthlyRate = report.subscription.monthly_rate || 0;
  const estimated = report.estimated_value.total_estimated_value;
  const valuePercent = monthlyRate > 0 ? Math.round(Math.min(100, (estimated / monthlyRate) * 100)) : 0;

  const storyData = [
    { name: "Mentions", value: report.content_delivery.story_mentions },
    { name: "Target", value: report.content_delivery.story_mention_target },
  ];

  const listingTrend = summary?.trends?.profile_views;
  const adTrend = summary?.trends?.ad_impressions;
  const mentionTrend = summary?.trends?.story_mentions;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-indigo-500" aria-hidden />
            Subscriber ROI
          </h1>
          <p className="text-muted-foreground mt-1">
            {report.business_name ?? "Your business"} · Reporting month {report.month}
          </p>
        </div>
        <Button asChild type="button" variant="outline">
          <Link to="/subscriptions">Subscriptions</Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex flex-wrap items-center gap-2">
              {report.subscription.tier}
              <Badge variant="secondary" className="capitalize">
                Tier
              </Badge>
              {report.subscription.is_founder_pricing && (
                <Badge className="gap-1">
                  <Crown className="h-3 w-3" aria-hidden />
                  Founder pricing
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {formatCurrency(monthlyRate)} / month · {report.subscription.months_active} months active · Billing:{" "}
              {report.billing.payment_status}
              {report.billing.invoices_paid_in_month > 0
                ? ` · ${report.billing.invoices_paid_in_month} paid invoice(s) this month`
                : ""}
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Value delivered</CardTitle>
          <CardDescription>
            Your {formatCurrency(monthlyRate)} subscription delivered an estimated {formatCurrency(estimated)} in value
            this month (publisher metrics + internal engagement).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 md:flex-row md:justify-center">
          <ValueRing percent={valuePercent} />
          <div className="text-center md:text-left space-y-1">
            <p className="text-sm text-muted-foreground">Estimated value breakdown</p>
            <ul className="text-sm space-y-1">
              {Object.entries(report.estimated_value.breakdown).map(([k, v]) => (
                <li key={k} className="flex justify-between gap-8">
                  <span className="capitalize text-muted-foreground">{k.replace(/_/g, " ")}</span>
                  <span className="tabular-nums font-medium">{formatCurrency(v)}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Content delivery
              <span className="inline-flex items-center" title="Month over month">
                <TrendArrow trend={mentionTrend} />
              </span>
            </CardTitle>
            <CardDescription>Story mentions vs editorial target</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={storyData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => [value ?? 0, "Count"]} />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} name="Count" />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-sm text-muted-foreground mt-2">
              Articles featuring your business: {report.content_delivery.articles_featuring_business}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Advertising
              <span className="inline-flex items-center" title="Month over month">
                <TrendArrow trend={adTrend} />
              </span>
            </CardTitle>
            <CardDescription>Impressions, clicks, and newsletter reach</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Impressions</p>
                <p className="text-xl font-semibold tabular-nums">{report.advertising.ad_impressions.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Clicks</p>
                <p className="text-xl font-semibold tabular-nums">{report.advertising.ad_clicks.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">CTR</p>
                <p className="text-xl font-semibold tabular-nums">{report.advertising.ad_ctr}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Newsletter impressions</p>
                <p className="text-xl font-semibold tabular-nums">
                  {report.advertising.newsletter_impressions.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listing performance</CardTitle>
          <CardDescription>Discovery and actions on your business profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(
              [
                ["Profile views", report.listing_performance.profile_views, listingTrend],
                ["Search appearances", report.listing_performance.search_appearances, undefined],
                ["Website clicks", report.listing_performance.website_clicks, undefined],
                ["Phone clicks", report.listing_performance.phone_clicks, undefined],
                ["Direction requests", report.listing_performance.direction_requests, undefined],
              ] as const
            ).map(([label, value, trend]) => (
              <div key={label} className="rounded-lg border p-4 flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-xl font-semibold tabular-nums">{value.toLocaleString()}</p>
                </div>
                <span className="shrink-0 text-muted-foreground" title="Vs prior month (summary)">
                  <TrendArrow trend={trend} />
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BadgePercent className="h-5 w-5" aria-hidden />
            Commerce
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Coupons created</p>
              <p className="text-lg font-medium tabular-nums">{report.commerce.coupons_created}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Coupons claimed</p>
              <p className="text-lg font-medium tabular-nums">{report.commerce.coupons_claimed}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Redemptions</p>
              <p className="text-lg font-medium tabular-nums">{report.commerce.coupon_redemptions}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Events promoted</p>
              <p className="text-lg font-medium tabular-nums">{report.commerce.events_promoted}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tickets sold</p>
              <p className="text-lg font-medium tabular-nums">{report.commerce.tickets_sold}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Engagement</CardTitle>
          <CardDescription>Command Center engagement and email performance (this month)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6 items-center">
            <div>
              <p className="text-sm text-muted-foreground">Engagement score</p>
              <p className="text-3xl font-bold tabular-nums">{report.engagement.engagement_score ?? "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tier</p>
              <Badge variant="outline" className="mt-1">
                {report.engagement.tier_name} (#{report.engagement.engagement_tier ?? "—"})
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email open rate</p>
              <p className="text-2xl font-semibold tabular-nums">{report.engagement.email_open_rate}%</p>
              <p className="text-xs text-muted-foreground">
                {report.engagement.emails_opened} opened / {report.engagement.emails_sent} sent
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {summary && summary.months.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>12-month trend (compact)</CardTitle>
            <CardDescription>Estimated value per month from the subscriber summary endpoint</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.months} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value ?? 0))}
                  labelFormatter={(l) => String(l)}
                />
                <Bar dataKey="estimated_value_total" fill="#10b981" radius={[4, 4, 0, 0]} name="Est. value" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
