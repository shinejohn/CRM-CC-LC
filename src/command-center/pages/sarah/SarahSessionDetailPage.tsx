import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Building2,
  Globe,
  MapPin,
  MessageSquare,
  Target,
  Timer,
  Wallet,
} from "lucide-react";
import { apiClient } from "@/services/api";

interface SessionMessage {
  id: string;
  type: string;
  direction: string;
  message: string;
  context: Record<string, unknown> | null;
  actioned: boolean;
  created_at: string;
}

interface SessionLineItem {
  id: string;
  product_type: string;
  product_slug: string | null;
  price: string;
  status: string;
  sarah_rationale: string | null;
}

interface SessionDetail {
  id: string;
  business_name: string | null;
  business_category: string | null;
  source_platform: string;
  source_url: string;
  visitor_type: string;
  status: string;
  intake_answers: {
    goal?: string;
    timeline?: string;
    budget?: string;
  } | null;
  proposal: {
    products?: Array<{ name: string; price: number; product_slug: string; rationale?: string }>;
    total?: number;
    goal?: string;
    timeline?: string;
    budget?: string;
  } | null;
  campaign_id: string | null;
  last_active_at: string;
  created_at: string;
  community?: { id: string; name: string } | null;
  smb?: { id: string; business_name: string; category_group?: string } | null;
  campaign?: {
    id: string;
    name: string;
    status: string;
    total_amount: string;
    line_items: SessionLineItem[];
  } | null;
  messages: SessionMessage[];
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  intake: { label: "Intake", className: "bg-blue-100 text-blue-900 dark:bg-blue-950/50 dark:text-blue-100" },
  proposed: { label: "Proposed", className: "bg-violet-100 text-violet-900 dark:bg-violet-950/50 dark:text-violet-100" },
  negotiating: { label: "Negotiating", className: "bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-100" },
  converted: { label: "Converted", className: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100" },
  abandoned: { label: "Abandoned", className: "bg-red-100 text-red-900 dark:bg-red-950/50 dark:text-red-100" },
};

const PLATFORM_LABELS: Record<string, string> = {
  day_news: "Day.News",
  goeventcity: "GoEventCity",
  downtownguide: "DowntownGuide",
  golocalvoices: "GoLocalVoices",
};

const GOAL_LABELS: Record<string, string> = {
  foot_traffic: "More foot traffic",
  leads: "More leads/calls",
  online_sales: "Online sales",
  brand_awareness: "Brand awareness",
  event_promotion: "Event promotion",
  hiring: "Hiring",
};

const TIMELINE_LABELS: Record<string, string> = {
  immediate: "Immediate (1-2 weeks)",
  short: "Short term (1 month)",
  ongoing: "Ongoing",
};

const BUDGET_LABELS: Record<string, string> = {
  under_100: "Under $100",
  "100_300": "$100-$300",
  "300_600": "$300-$600",
  "600_plus": "$600+",
  not_sure: "Not sure yet",
};

export function SarahSessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    apiClient
      .get<{ data: SessionDetail }>(`/sarah/sessions/${id}`)
      .then((res) => setSession(res.data.data))
      .catch(() => setSession(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Session not found.{" "}
        <Link to="/command-center/sarah/sessions" className="text-primary underline">
          Back to sessions
        </Link>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[session.status] ?? STATUS_CONFIG.intake;
  const intake = session.intake_answers;
  const proposal = session.proposal;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/command-center/sarah/sessions">
          <Button variant="ghost" size="sm" type="button">
            <ArrowLeft className="mr-1 h-4 w-4" /> Sessions
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">
              {session.business_name ?? "Unknown Business"}
            </h1>
            <Badge className={statusCfg.className}>{statusCfg.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Session started {new Date(session.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: Context */}
        <div className="space-y-4 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4" /> Business
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{session.business_name ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category</span>
                <span>{session.business_category ?? session.smb?.category_group ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Visitor type</span>
                <span className="capitalize">{session.visitor_type}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4" /> Source
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform</span>
                <span>{PLATFORM_LABELS[session.source_platform] ?? session.source_platform}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Community</span>
                <span>{session.community?.name ?? "—"}</span>
              </div>
            </CardContent>
          </Card>

          {intake && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4" /> Intake
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {intake.goal && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Goal</span>
                    <span>{GOAL_LABELS[intake.goal] ?? intake.goal}</span>
                  </div>
                )}
                {intake.timeline && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Timeline</span>
                    <span>{TIMELINE_LABELS[intake.timeline] ?? intake.timeline}</span>
                  </div>
                )}
                {intake.budget && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Budget</span>
                    <span>{BUDGET_LABELS[intake.budget] ?? intake.budget}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column: Proposal + Messages */}
        <div className="space-y-4 lg:col-span-2">
          {/* Proposal */}
          {proposal && proposal.products && proposal.products.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Wallet className="h-4 w-4" /> Proposal
                  {proposal.total != null && (
                    <span className="ml-auto text-lg font-bold text-emerald-600">
                      ${proposal.total.toLocaleString()}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {proposal.products.map((p, i) => (
                    <div
                      key={`${p.product_slug}-${i}`}
                      className="flex items-start justify-between gap-4 rounded-lg border p-3"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{p.name}</p>
                        {p.rationale && (
                          <p className="mt-1 text-xs text-muted-foreground italic">
                            &ldquo;{p.rationale}&rdquo;
                          </p>
                        )}
                      </div>
                      <span className="font-semibold">${p.price}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Campaign link */}
          {session.campaign && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Campaign created</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{session.campaign.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {session.campaign.line_items.length} line items &middot;
                      ${parseFloat(session.campaign.total_amount).toLocaleString()}
                    </p>
                  </div>
                  <Link to={`/command-center/sarah/campaigns/${session.campaign.id}`}>
                    <Button variant="outline" size="sm" type="button">
                      View campaign
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conversation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-4 w-4" /> Conversation
                <Badge variant="secondary" className="ml-auto">
                  {session.messages.length} messages
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {session.messages.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-4">
                  No messages yet.
                </p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {session.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`rounded-lg p-3 ${
                        msg.direction === "outbound"
                          ? "bg-primary/5 border border-primary/10"
                          : "bg-muted/50 border border-border/60"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">
                          {msg.direction === "outbound" ? "Sarah" : "User"}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">
                            {msg.type}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(msg.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default SarahSessionDetailPage;
