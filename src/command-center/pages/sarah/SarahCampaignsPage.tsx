import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { apiClient } from "@/services/api";

interface LineItem {
  id: string;
  product_type: string;
  product_slug: string | null;
  price: string;
  status: string;
}

interface SarahCampaign {
  id: string;
  name: string | null;
  goal: string | null;
  timeline: string | null;
  status: string;
  total_amount: string | null;
  stripe_payment_intent_id: string | null;
  created_at: string;
  smb?: { id: string; business_name: string } | null;
  community?: { id: string; name: string } | null;
  line_items: LineItem[];
}

interface PaginatedResponse {
  data: SarahCampaign[];
  current_page: number;
  last_page: number;
  total: number;
}

const CAMPAIGN_STATUS: Record<string, { label: string; className: string }> = {
  draft: {
    label: "Draft",
    className: "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100",
  },
  pending_payment: {
    label: "Pending Payment",
    className: "bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-100",
  },
  active: {
    label: "Active",
    className: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100",
  },
  paused: {
    label: "Paused",
    className: "bg-blue-100 text-blue-900 dark:bg-blue-950/50 dark:text-blue-100",
  },
  completed: {
    label: "Completed",
    className: "bg-violet-100 text-violet-900 dark:bg-violet-950/50 dark:text-violet-100",
  },
};

const GOAL_LABELS: Record<string, string> = {
  foot_traffic: "Foot traffic",
  leads: "Leads/Calls",
  online_sales: "Online sales",
  brand_awareness: "Brand awareness",
  event_promotion: "Events",
  hiring: "Hiring",
};

export function SarahCampaignsPage() {
  const [response, setResponse] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (statusFilter !== "all") {
      params.set("status", statusFilter);
    }

    apiClient
      .get<PaginatedResponse>(`/sarah/campaigns?${params.toString()}`)
      .then((res) => setResponse(res.data))
      .catch(() => setResponse({ data: [], current_page: 1, last_page: 1, total: 0 }))
      .finally(() => setLoading(false));
  }, [statusFilter, page]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link to="/command-center/sarah">
          <Button variant="ghost" size="sm" type="button">
            <ArrowLeft className="mr-1 h-4 w-4" /> Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sarah Campaigns</h1>
          <p className="text-sm text-muted-foreground">
            All campaigns created through the Sarah Campaign Builder.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-48" aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.entries(CAMPAIGN_STATUS).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {response && (
          <span className="text-sm text-muted-foreground">
            {response.total} campaign{response.total !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Campaigns grid */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (response?.data ?? []).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No campaigns found. Campaigns appear here after advertisers complete checkout.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(response?.data ?? []).map((campaign) => {
            const statusCfg = CAMPAIGN_STATUS[campaign.status] ?? CAMPAIGN_STATUS.draft;
            const total = campaign.total_amount ? parseFloat(campaign.total_amount) : 0;
            const activeItems = campaign.line_items.filter((li) => li.status === "active").length;
            const totalItems = campaign.line_items.length;

            return (
              <Card key={campaign.id} className="hover:border-primary/30 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-foreground">
                        {campaign.smb?.business_name ?? campaign.name ?? "Campaign"}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {campaign.community?.name ?? "—"}
                        {campaign.goal && (
                          <> &middot; {GOAL_LABELS[campaign.goal] ?? campaign.goal}</>
                        )}
                      </p>
                    </div>
                    <Badge className={statusCfg.className}>{statusCfg.label}</Badge>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-lg font-bold">${total.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{totalItems}</p>
                      <p className="text-xs text-muted-foreground">Line items</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{activeItems}</p>
                      <p className="text-xs text-muted-foreground">Active</p>
                    </div>
                  </div>

                  {/* Line items preview */}
                  {campaign.line_items.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {campaign.line_items.slice(0, 3).map((li) => (
                        <div
                          key={li.id}
                          className="flex items-center justify-between rounded bg-muted/50 px-2 py-1 text-xs"
                        >
                          <span className="truncate">{li.product_slug ?? li.product_type}</span>
                          <span className="font-medium">${parseFloat(li.price).toFixed(0)}</span>
                        </div>
                      ))}
                      {campaign.line_items.length > 3 && (
                        <p className="text-xs text-muted-foreground text-center">
                          +{campaign.line_items.length - 3} more
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {new Date(campaign.created_at).toLocaleDateString()}
                    </span>
                    <Link to={`/command-center/sarah/campaigns/${campaign.id}`}>
                      <Button variant="ghost" size="sm" type="button" aria-label="View campaign details">
                        Details <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {response && response.last_page > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            type="button"
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {response.current_page} of {response.last_page}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= response.last_page}
            onClick={() => setPage(page + 1)}
            type="button"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

export default SarahCampaignsPage;
