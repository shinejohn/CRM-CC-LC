import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
  DollarSign,
  ListChecks,
  MapPin,
  MessageSquare,
  XCircle,
} from "lucide-react";
import { apiClient } from "@/services/api";

interface LineItem {
  id: string;
  product_type: string;
  product_slug: string | null;
  price: string;
  status: string;
  sarah_rationale: string | null;
  configuration: Record<string, unknown>;
  started_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
}

interface CampaignMessage {
  id: string;
  type: string;
  direction: string;
  message: string;
  actioned: boolean;
  created_at: string;
}

interface CampaignDetail {
  id: string;
  name: string | null;
  goal: string | null;
  timeline: string | null;
  status: string;
  total_amount: string | null;
  stripe_payment_intent_id: string | null;
  sarah_context: Record<string, unknown> | null;
  created_at: string;
  smb?: { id: string; business_name: string; category_group?: string } | null;
  community?: { id: string; name: string } | null;
  line_items: LineItem[];
  sarah_messages: CampaignMessage[];
  advertiser_session?: { id: string; status: string } | null;
}

const CAMPAIGN_STATUS: Record<string, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  draft: { label: "Draft", className: "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100", icon: Clock },
  pending_payment: { label: "Pending Payment", className: "bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-100", icon: Clock },
  active: { label: "Active", className: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100", icon: CheckCircle2 },
  paused: { label: "Paused", className: "bg-blue-100 text-blue-900 dark:bg-blue-950/50 dark:text-blue-100", icon: Clock },
  completed: { label: "Completed", className: "bg-violet-100 text-violet-900 dark:bg-violet-950/50 dark:text-violet-100", icon: CheckCircle2 },
};

const ITEM_STATUS: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-gray-100 text-gray-800" },
  active: { label: "Active", className: "bg-emerald-100 text-emerald-800" },
  completed: { label: "Completed", className: "bg-violet-100 text-violet-800" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800" },
  failed: { label: "Failed", className: "bg-red-100 text-red-800" },
};

const GOAL_LABELS: Record<string, string> = {
  foot_traffic: "Foot traffic",
  leads: "Leads/Calls",
  online_sales: "Online sales",
  brand_awareness: "Brand awareness",
  event_promotion: "Events",
  hiring: "Hiring",
};

export function SarahCampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    apiClient
      .get<{ data: CampaignDetail }>(`/sarah/campaigns/${id}`)
      .then((res) => setCampaign(res.data.data))
      .catch(() => setCampaign(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Campaign not found.{" "}
        <Link to="/command-center/sarah/campaigns" className="text-primary underline">
          Back to campaigns
        </Link>
      </div>
    );
  }

  const statusCfg = CAMPAIGN_STATUS[campaign.status] ?? CAMPAIGN_STATUS.draft;
  const total = campaign.total_amount ? parseFloat(campaign.total_amount) : 0;
  const activeItems = campaign.line_items.filter((li) => li.status === "active").length;
  const completedItems = campaign.line_items.filter((li) => li.status === "completed").length;
  const failedItems = campaign.line_items.filter((li) => li.status === "failed").length;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/command-center/sarah/campaigns">
          <Button variant="ghost" size="sm" type="button">
            <ArrowLeft className="mr-1 h-4 w-4" /> Campaigns
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">
              {campaign.smb?.business_name ?? campaign.name ?? "Campaign"}
            </h1>
            <Badge className={statusCfg.className}>{statusCfg.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {campaign.community?.name}
            {campaign.goal && <> &middot; {GOAL_LABELS[campaign.goal] ?? campaign.goal}</>}
            {" &middot; Created "}{new Date(campaign.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-950/50">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-bold">${total.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Campaign total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-950/50">
              <ListChecks className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold">{campaign.line_items.length}</p>
              <p className="text-xs text-muted-foreground">Line items</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-950/50">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-bold">{activeItems + completedItems}</p>
              <p className="text-xs text-muted-foreground">Active / Done</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className={`rounded-lg p-2 ${failedItems > 0 ? "bg-red-100 dark:bg-red-950/50" : "bg-gray-100 dark:bg-gray-800"}`}>
              <XCircle className={`h-5 w-5 ${failedItems > 0 ? "text-red-600" : "text-gray-400"}`} />
            </div>
            <div>
              <p className="text-xl font-bold">{failedItems}</p>
              <p className="text-xs text-muted-foreground">Failed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Line items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {campaign.line_items.map((item) => {
                  const itemStatus = ITEM_STATUS[item.status] ?? ITEM_STATUS.pending;
                  return (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-4 rounded-lg border p-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{item.product_slug ?? item.product_type}</p>
                          <Badge className={itemStatus.className} variant="secondary">
                            {itemStatus.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Type: {item.product_type}
                        </p>
                        {item.sarah_rationale && (
                          <p className="mt-2 text-xs text-muted-foreground italic">
                            &ldquo;{item.sarah_rationale}&rdquo;
                          </p>
                        )}
                        {item.started_at && (
                          <p className="mt-1 text-[10px] text-muted-foreground">
                            Started: {new Date(item.started_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <span className="text-lg font-semibold">
                        ${parseFloat(item.price).toFixed(0)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Business info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4" /> Business
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{campaign.smb?.business_name ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category</span>
                <span>{campaign.smb?.category_group ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Community</span>
                <span>{campaign.community?.name ?? "—"}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment info */}
          {campaign.stripe_payment_intent_id && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4" /> Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="font-mono text-xs text-muted-foreground break-all">
                  {campaign.stripe_payment_intent_id}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Session link */}
          {campaign.advertiser_session && (
            <Card>
              <CardContent className="p-4">
                <Link to={`/command-center/sarah/sessions/${campaign.advertiser_session.id}`}>
                  <Button variant="outline" size="sm" className="w-full" type="button">
                    View original session
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Messages */}
      {campaign.sarah_messages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-4 w-4" /> Sarah Messages
              <Badge variant="secondary" className="ml-auto">
                {campaign.sarah_messages.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {campaign.sarah_messages.map((msg) => (
                <div
                  key={msg.id}
                  className="flex items-start justify-between gap-4 rounded-lg border p-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        {msg.type}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {msg.direction === "outbound" ? "Sarah" : "User"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm">{msg.message}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {new Date(msg.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default SarahCampaignDetailPage;
