import {
  DoorOpen,
  Tag,
  FileText,
  PauseCircle,
  Mail,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type PitchStatusBadge = "never_pitched" | "in_progress" | "proposed" | "converted";

export interface PitchSessionEvent {
  id: string;
  kind: "gate" | "product" | "proposal" | "abandoned" | "email";
  label: string;
  at: string;
}

export interface PitchSessionBlock {
  id: string;
  title: string;
  status: string;
  startedAt: string;
  events: PitchSessionEvent[];
}

export interface DeferredRow {
  id: string;
  name: string;
  retryDate: string;
}

export interface SMBPitchTabProps {
  businessName: string;
  communityName: string;
  pitchStatus: PitchStatusBadge;
  founderDaysRemaining?: number;
  sessions: PitchSessionBlock[];
  gatesDeferred: DeferredRow[];
  productsDeferred: DeferredRow[];
}

function statusLabel(s: PitchStatusBadge): string {
  switch (s) {
    case "never_pitched":
      return "Never Pitched";
    case "in_progress":
      return "In Progress";
    case "proposed":
      return "Proposed";
    case "converted":
      return "Converted";
    default:
      return s;
  }
}

function statusBadgeClass(s: PitchStatusBadge): string {
  switch (s) {
    case "never_pitched":
      return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100";
    case "in_progress":
      return "bg-sky-100 text-sky-900 dark:bg-sky-900/40 dark:text-sky-50";
    case "proposed":
      return "bg-violet-100 text-violet-900 dark:bg-violet-900/40 dark:text-violet-50";
    case "converted":
      return "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-50";
    default:
      return "";
  }
}

function EventIcon({ kind }: { kind: PitchSessionEvent["kind"] }) {
  const cls = "h-4 w-4 shrink-0";
  switch (kind) {
    case "gate":
      return <DoorOpen className={cls} aria-hidden />;
    case "product":
      return <Tag className={cls} aria-hidden />;
    case "proposal":
      return <FileText className={cls} aria-hidden />;
    case "abandoned":
      return <PauseCircle className={cls} aria-hidden />;
    case "email":
      return <Mail className={cls} aria-hidden />;
    default:
      return null;
  }
}

export function SMBPitchTab({
  businessName,
  communityName,
  pitchStatus,
  founderDaysRemaining,
  sessions,
  gatesDeferred,
  productsDeferred,
}: SMBPitchTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Pitch status</span>
        <Badge className={cn("font-medium", statusBadgeClass(pitchStatus))}>{statusLabel(pitchStatus)}</Badge>
      </div>

      {founderDaysRemaining != null ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/35 dark:text-amber-50">
          Founder rate expires in {founderDaysRemaining} days for {communityName}.
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm">
          Resume Pitch →
        </Button>
        <Button type="button" variant="outline" size="sm">
          Send Email
        </Button>
        <Button type="button" variant="outline" size="sm">
          Complete Proposal for Them
        </Button>
        <Button type="button" variant="secondary" size="sm">
          View Proposal
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Deferred follow-ups</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h4 className="mb-2 text-sm font-semibold text-foreground">Gates deferred</h4>
            {gatesDeferred.length === 0 ? (
              <p className="text-sm text-muted-foreground">None</p>
            ) : (
              <ul className="space-y-2">
                {gatesDeferred.map((g) => (
                  <li
                    key={g.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium">{g.name}</p>
                      <p className="text-xs text-muted-foreground">Retry {g.retryDate}</p>
                    </div>
                    <Button type="button" size="sm" variant="outline">
                      Re-pitch Now
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section>
            <h4 className="mb-2 text-sm font-semibold text-foreground">Products deferred</h4>
            {productsDeferred.length === 0 ? (
              <p className="text-sm text-muted-foreground">None</p>
            ) : (
              <ul className="space-y-2">
                {productsDeferred.map((p) => (
                  <li
                    key={p.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">Retry {p.retryDate}</p>
                    </div>
                    <Button type="button" size="sm" variant="outline">
                      Pitch Now
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </CardContent>
      </Card>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Pitch timeline
        </h3>
        <div className="max-h-[480px] space-y-6 overflow-y-auto pr-2">
          {sessions.map((session) => (
            <Card key={session.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{session.title}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {session.startedAt} · {session.status}
                </p>
              </CardHeader>
              <CardContent>
                <ul className="relative space-y-3 border-l border-border pl-4">
                  {session.events.map((ev) => (
                    <li key={ev.id} className="relative">
                      <span className="absolute -left-[21px] top-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                        <EventIcon kind={ev.kind} />
                      </span>
                      <p className="text-sm text-foreground">{ev.label}</p>
                      <p className="text-xs text-muted-foreground">{ev.at}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

    </div>
  );
}
