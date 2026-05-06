import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ExternalLink, MessageSquare } from "lucide-react";
import { apiClient } from "@/services/api";

interface Session {
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
    products?: Array<{ name: string; price: number }>;
    total?: number;
  } | null;
  campaign_id: string | null;
  last_active_at: string;
  created_at: string;
  community?: { id: string; name: string } | null;
  smb?: { id: string; business_name: string } | null;
}

interface PaginatedResponse {
  data: Session[];
  current_page: number;
  last_page: number;
  total: number;
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

const GOAL_LABELS: Record<string, string> = {
  foot_traffic: "More foot traffic",
  leads: "More leads/calls",
  online_sales: "Online sales",
  brand_awareness: "Brand awareness",
  event_promotion: "Event promotion",
  hiring: "Hiring",
};

export function SarahSessionsPage() {
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
      .get<PaginatedResponse>(`/sarah/sessions?${params.toString()}`)
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
          <h1 className="text-2xl font-bold text-foreground">Advertiser Sessions</h1>
          <p className="text-sm text-muted-foreground">
            All Sarah campaign builder sessions across platforms.
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
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {response && (
          <span className="text-sm text-muted-foreground">
            {response.total} session{response.total !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Sessions table */}
      <Card>
        <CardContent className="overflow-x-auto p-0">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-xs uppercase text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Business</th>
                  <th className="px-4 py-3 font-medium">Platform</th>
                  <th className="px-4 py-3 font-medium">Community</th>
                  <th className="px-4 py-3 font-medium">Goal</th>
                  <th className="px-4 py-3 font-medium">Proposal</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Last active</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {(response?.data ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted-foreground">
                      No sessions found.
                    </td>
                  </tr>
                ) : (
                  (response?.data ?? []).map((s) => {
                    const statusCfg = STATUS_CONFIG[s.status] ?? STATUS_CONFIG.intake;
                    const goalLabel = s.intake_answers?.goal
                      ? GOAL_LABELS[s.intake_answers.goal] ?? s.intake_answers.goal
                      : "—";
                    const proposalTotal = s.proposal?.total;

                    return (
                      <tr key={s.id} className="border-b border-border/60 hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium">
                          <Link
                            to={`/command-center/sarah/sessions/${s.id}`}
                            className="hover:text-primary hover:underline"
                          >
                            {s.business_name ?? "Unknown"}
                          </Link>
                          {s.business_category && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              {s.business_category}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {PLATFORM_LABELS[s.source_platform] ?? s.source_platform}
                        </td>
                        <td className="px-4 py-3">{s.community?.name ?? "—"}</td>
                        <td className="px-4 py-3">{goalLabel}</td>
                        <td className="px-4 py-3">
                          {proposalTotal != null ? (
                            <span className="font-medium">${proposalTotal.toLocaleString()}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={statusCfg.className}>{statusCfg.label}</Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {s.last_active_at
                            ? new Date(s.last_active_at).toLocaleString()
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Link to={`/command-center/sarah/sessions/${s.id}`}>
                            <Button variant="ghost" size="sm" type="button" aria-label="View session details">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

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

export default SarahSessionsPage;
