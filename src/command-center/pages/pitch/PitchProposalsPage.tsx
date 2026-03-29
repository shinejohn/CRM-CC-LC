import { useMemo, useState, type ReactNode } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { LayoutGrid, List } from "lucide-react";

type ColumnId = "proposed" | "followed_up" | "won" | "lost" | "expired";

interface ProposalRow {
  id: string;
  business: string;
  community: string;
  category: string;
  mrr: number;
  products: string[];
  daysInStage: number;
  daysSinceProposed: number;
  founderDays?: number;
  column: ColumnId;
}

const COLS: { id: ColumnId; label: string }[] = [
  { id: "proposed", label: "Proposed" },
  { id: "followed_up", label: "Followed Up" },
  { id: "won", label: "Won" },
  { id: "lost", label: "Lost" },
  { id: "expired", label: "Expired" },
];

const MOCK: ProposalRow[] = [
  {
    id: "p1",
    business: "Shoreline Coffee",
    community: "Clearwater",
    category: "Cafe",
    mrr: 300,
    products: ["Influencer", "Events"],
    daysInStage: 3,
    daysSinceProposed: 3,
    founderDays: 12,
    column: "proposed",
  },
  {
    id: "p2",
    business: "Bay Dental",
    community: "Dunedin",
    category: "Healthcare",
    mrr: 520,
    products: ["Expert column"],
    daysInStage: 9,
    daysSinceProposed: 12,
    column: "followed_up",
  },
  {
    id: "p3",
    business: "North Shore Fitness",
    community: "St. Pete",
    category: "Fitness",
    mrr: 410,
    products: ["Headliner"],
    daysInStage: 2,
    daysSinceProposed: 2,
    column: "proposed",
  },
  {
    id: "p4",
    business: "Harbor Events LLC",
    community: "Clearwater",
    category: "Venue",
    mrr: 890,
    products: ["Event headliner", "Sponsor"],
    daysInStage: 1,
    daysSinceProposed: 45,
    column: "won",
  },
];

function KanbanCard({
  row,
  selected,
  onToggle,
}: {
  row: ProposalRow;
  selected: boolean;
  onToggle: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: row.id,
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 10 }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("mb-3 touch-none", isDragging && "z-10")}
      {...listeners}
      {...attributes}
    >
      <Card
        className={cn(
          "border-border shadow-sm cursor-grab active:cursor-grabbing",
          isDragging && "opacity-80 ring-2 ring-primary"
        )}
      >
        <CardContent className="space-y-2 p-3">
        <div className="flex items-start gap-2">
          <Checkbox
            checked={selected}
            onCheckedChange={() => onToggle()}
            aria-label={`Select ${row.business}`}
            onPointerDown={(e) => e.stopPropagation()}
            className="mt-1"
          />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground">{row.business}</p>
            <p className="text-xs text-muted-foreground">{row.community}</p>
          </div>
        </div>
        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">${row.mrr}/mo</p>
        <div className="flex flex-wrap gap-1">
          {row.products.map((pr) => (
            <Badge key={pr} variant="secondary" className="text-[10px] font-normal">
              {pr}
            </Badge>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{row.daysInStage} days in stage</p>
        {row.founderDays != null ? (
          <p className="text-xs text-amber-700 dark:text-amber-400">Founder: {row.founderDays}d left</p>
        ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function KanbanColumn({
  colId,
  label,
  children,
}: {
  colId: ColumnId;
  label: string;
  children: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: colId });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-[320px] w-full min-w-[220px] flex-1 flex-col rounded-lg border bg-muted/30 p-2 lg:min-w-[200px]",
        isOver && "ring-2 ring-primary/40"
      )}
    >
      <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}

type SortKey = "mrr" | "daysSinceProposed" | "community" | "status";

export function PitchProposalsPage() {
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [items, setItems] = useState<ProposalRow[]>(MOCK);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [community, setCommunity] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [mrrMin, setMrrMin] = useState("");
  const [mrrMax, setMrrMax] = useState("");
  const [daysMin, setDaysMin] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("mrr");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  const filtered = useMemo(() => {
    return items.filter((r) => {
      if (community !== "all" && r.community !== community) return false;
      if (category !== "all" && r.category !== category) return false;
      const minV = mrrMin ? Number(mrrMin) : null;
      const maxV = mrrMax ? Number(mrrMax) : null;
      if (minV != null && !Number.isNaN(minV) && r.mrr < minV) return false;
      if (maxV != null && !Number.isNaN(maxV) && r.mrr > maxV) return false;
      const dMin = daysMin ? Number(daysMin) : null;
      if (dMin != null && !Number.isNaN(dMin) && r.daysSinceProposed < dMin) return false;
      return true;
    });
  }, [items, community, category, mrrMin, mrrMax, daysMin]);

  const sortedTable = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "mrr") cmp = a.mrr - b.mrr;
      else if (sortKey === "daysSinceProposed") cmp = a.daysSinceProposed - b.daysSinceProposed;
      else if (sortKey === "community") cmp = a.community.localeCompare(b.community);
      else cmp = a.column.localeCompare(b.column);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const nextCol = over.id as ColumnId;
    if (!COLS.some((c) => c.id === nextCol)) return;
    setItems((prev) => prev.map((p) => (p.id === active.id ? { ...p, column: nextCol } : p)));
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "community" || key === "status" ? "asc" : "desc");
    }
  }

  const communities = useMemo(() => {
    const u = new Set(items.map((i) => i.community));
    return ["all", ...Array.from(u)];
  }, [items]);
  const categories = useMemo(() => {
    const u = new Set(items.map((i) => i.category));
    return ["all", ...Array.from(u)];
  }, [items]);

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Proposal pipeline</h1>
          <p className="text-sm text-muted-foreground">Kanban or table — mock pipeline data.</p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={view === "kanban" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("kanban")}
          >
            <LayoutGrid className="mr-1 h-4 w-4" />
            Kanban
          </Button>
          <Button
            type="button"
            variant={view === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("table")}
          >
            <List className="mr-1 h-4 w-4" />
            Table
          </Button>
        </div>
      </div>

      <Card className="border-border">
        <CardContent className="flex flex-wrap gap-3 p-4">
          <Select value={community} onValueChange={setCommunity}>
            <SelectTrigger className="w-[160px]">
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
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c === "all" ? "All categories" : c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            className="w-[100px]"
            placeholder="MRR min"
            value={mrrMin}
            onChange={(e) => setMrrMin(e.target.value)}
            inputMode="numeric"
            aria-label="MRR minimum"
          />
          <Input
            className="w-[100px]"
            placeholder="MRR max"
            value={mrrMax}
            onChange={(e) => setMrrMax(e.target.value)}
            inputMode="numeric"
            aria-label="MRR maximum"
          />
          <Input
            className="w-[140px]"
            placeholder="Days since proposed min"
            value={daysMin}
            onChange={(e) => setDaysMin(e.target.value)}
            inputMode="numeric"
            aria-label="Minimum days since proposed"
          />
        </CardContent>
      </Card>

      {selected.size > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <Button type="button" size="sm" variant="secondary">
            Send Reminder to Selected
          </Button>
          <Button type="button" size="sm" variant="outline">
            Export CSV
          </Button>
          <Button type="button" size="sm" variant="destructive">
            Mark as Lost
          </Button>
        </div>
      ) : null}

      {view === "kanban" ? (
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {COLS.map((col) => (
              <KanbanColumn key={col.id} colId={col.id} label={col.label}>
                {filtered
                  .filter((r) => r.column === col.id)
                  .map((row) => (
                    <KanbanCard
                      key={row.id}
                      row={row}
                      selected={selected.has(row.id)}
                      onToggle={() =>
                        setSelected((prev) => {
                          const n = new Set(prev);
                          if (n.has(row.id)) n.delete(row.id);
                          else n.add(row.id);
                          return n;
                        })
                      }
                    />
                  ))}
              </KanbanColumn>
            ))}
          </div>
        </DndContext>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                <th className="p-3 w-10" />
                <th className="p-3 font-medium">Business</th>
                <th className="p-3 font-medium">
                  <button
                    type="button"
                    className="hover:text-foreground"
                    onClick={() => toggleSort("community")}
                  >
                    Community {sortKey === "community" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </button>
                </th>
                <th className="p-3 font-medium">
                  <button
                    type="button"
                    className="hover:text-foreground"
                    onClick={() => toggleSort("mrr")}
                  >
                    MRR {sortKey === "mrr" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </button>
                </th>
                <th className="p-3 font-medium">
                  <button
                    type="button"
                    className="hover:text-foreground"
                    onClick={() => toggleSort("daysSinceProposed")}
                  >
                    Days since proposed{" "}
                    {sortKey === "daysSinceProposed" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </button>
                </th>
                <th className="p-3 font-medium">
                  <button
                    type="button"
                    className="hover:text-foreground"
                    onClick={() => toggleSort("status")}
                  >
                    Status {sortKey === "status" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedTable.map((row) => (
                <tr key={row.id} className="border-b border-border/60">
                  <td className="p-3">
                    <Checkbox
                      checked={selected.has(row.id)}
                      onCheckedChange={() =>
                        setSelected((prev) => {
                          const n = new Set(prev);
                          if (n.has(row.id)) n.delete(row.id);
                          else n.add(row.id);
                          return n;
                        })
                      }
                      aria-label={`Select ${row.business}`}
                    />
                  </td>
                  <td className="p-3 font-medium">{row.business}</td>
                  <td className="p-3 text-muted-foreground">{row.community}</td>
                  <td className="p-3">${row.mrr}</td>
                  <td className="p-3">{row.daysSinceProposed}</td>
                  <td className="p-3">
                    <Badge variant="outline">{row.column}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default PitchProposalsPage;
