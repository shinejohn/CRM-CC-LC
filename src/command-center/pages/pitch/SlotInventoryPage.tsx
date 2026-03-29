import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
interface HeldBiz {
  customerId: string;
  name: string;
}

interface SlotRow {
  id: string;
  category: string;
  slotType: string;
  total: number;
  held: number;
  heldBy: HeldBiz[];
}

const COMMUNITIES = ["Clearwater", "Dunedin", "St. Pete"];

const MOCK: Record<string, SlotRow[]> = {
  Clearwater: [
    {
      id: "r1",
      category: "Restaurants",
      slotType: "Influencer",
      total: 5,
      held: 3,
      heldBy: [
        { customerId: "c1", name: "Sunrise Bakery" },
        { customerId: "c2", name: "Harbor Grill" },
        { customerId: "c3", name: "Dockside Tacos" },
      ],
    },
    {
      id: "r2",
      category: "Retail",
      slotType: "Headliner",
      total: 1,
      held: 1,
      heldBy: [{ customerId: "c4", name: "Bayfront Books" }],
    },
  ],
  Dunedin: [
    {
      id: "d1",
      category: "Fitness",
      slotType: "Expert column",
      total: 6,
      held: 2,
      heldBy: [
        { customerId: "c5", name: "Dunedin Yoga" },
        { customerId: "c6", name: "Harbor Barre" },
      ],
    },
  ],
  "St. Pete": [
    {
      id: "s1",
      category: "Arts",
      slotType: "Event headliner",
      total: 3,
      held: 1,
      heldBy: [{ customerId: "c7", name: "Waterfront Gallery" }],
    },
  ],
};

const PLATFORMS = ["day_news", "dtg", "gec", "glv", "alphasite"] as const;
const SLOT_TYPES = [
  "influencer",
  "headliner",
  "section_sponsor",
  "expert_column",
  "event_headliner",
] as const;

export function SlotInventoryPage() {
  const [community, setCommunity] = useState(COMMUNITIES[0]);
  const [rows, setRows] = useState(MOCK);
  const [addOpen, setAddOpen] = useState(false);
  const [seedOpen, setSeedOpen] = useState(false);
  const [seedTarget, setSeedTarget] = useState(COMMUNITIES[0]);

  const [formCommunity, setFormCommunity] = useState(COMMUNITIES[0]);
  const [formPlatform, setFormPlatform] = useState<string>(PLATFORMS[0]);
  const [formSlotType, setFormSlotType] = useState<string>(SLOT_TYPES[0]);
  const [formCategory, setFormCategory] = useState("");
  const [formTotal, setFormTotal] = useState("5");

  const tableRows = rows[community] ?? [];

  const communityList = useMemo(() => Object.keys(rows).sort(), [rows]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Slot inventory</h1>
          <p className="text-sm text-muted-foreground">Community capacity and holds (mock).</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => setAddOpen(true)}>
            + Add community slot configuration
          </Button>
          <Button type="button" variant="outline" onClick={() => setSeedOpen(true)}>
            Seed community from template
          </Button>
        </div>
      </div>

      <Tabs value={community} onValueChange={setCommunity}>
        <TabsList className="flex h-auto flex-wrap justify-start gap-1">
          {COMMUNITIES.map((c) => (
            <TabsTrigger key={c} value={c} className="text-sm">
              {c}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={community} className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Slots — {community}</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b text-xs uppercase text-muted-foreground">
                    <th className="pb-2 pr-3 font-medium">Category</th>
                    <th className="pb-2 pr-3 font-medium">Slot type</th>
                    <th className="pb-2 pr-3 font-medium">Total</th>
                    <th className="pb-2 pr-3 font-medium">Held</th>
                    <th className="pb-2 pr-3 font-medium">Available</th>
                    <th className="pb-2 pr-3 font-medium">Held by</th>
                    <th className="pb-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row) => {
                    const avail = row.total - row.held;
                    return (
                      <tr key={row.id} className="border-b border-border/60">
                        <td className="py-3 pr-3">{row.category}</td>
                        <td className="py-3 pr-3">{row.slotType}</td>
                        <td className="py-3 pr-3">{row.total}</td>
                        <td className="py-3 pr-3">{row.held}</td>
                        <td className="py-3 pr-3">{avail}</td>
                        <td className="py-3 pr-3">
                          <ul className="space-y-1">
                            {row.heldBy.map((b) => (
                              <li key={b.customerId}>
                                <Link
                                  className="text-primary underline-offset-2 hover:underline"
                                  to={`/command-center/sell/customers/${b.customerId}`}
                                >
                                  {b.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td className="py-3">
                          <div className="flex flex-wrap gap-1">
                            <Button type="button" size="sm" variant="outline">
                              Edit Total
                            </Button>
                            <Button type="button" size="sm" variant="secondary">
                              Release Slot
                            </Button>
                            <Button type="button" size="sm" variant="ghost">
                              Add Category Row
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add slot configuration</DialogTitle>
            <DialogDescription>
              Creates a new inventory row for the selected community (local mock state).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-2">
              <Label htmlFor="slot-comm">Community</Label>
              <Select value={formCommunity} onValueChange={setFormCommunity}>
                <SelectTrigger aria-label="Community">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMMUNITIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slot-platform">Platform</Label>
              <Select value={formPlatform} onValueChange={setFormPlatform}>
                <SelectTrigger aria-label="Platform">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slot-type">Slot type</Label>
              <Select value={formSlotType} onValueChange={setFormSlotType}>
                <SelectTrigger aria-label="Slot type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SLOT_TYPES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slot-cat">Category</Label>
              <Input
                id="slot-cat"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                placeholder="e.g. Restaurants"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slot-total">Total slots</Label>
              <Input
                id="slot-total"
                value={formTotal}
                onChange={(e) => setFormTotal(e.target.value)}
                inputMode="numeric"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                const n = Number(formTotal);
                const total = Number.isFinite(n) && n > 0 ? Math.floor(n) : 5;
                const cat = formCategory.trim() || "General";
                const id = `new-${Date.now()}`;
                setRows((prev) => ({
                  ...prev,
                  [formCommunity]: [
                    ...(prev[formCommunity] ?? []),
                    {
                      id,
                      category: cat,
                      slotType: formSlotType,
                      total,
                      held: 0,
                      heldBy: [],
                    },
                  ],
                }));
                setAddOpen(false);
                setFormCategory("");
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={seedOpen} onOpenChange={setSeedOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Seed community from template</DialogTitle>
            <DialogDescription>
              Adds standard influencer / headliner / expert rows for a launch checklist (mock).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            <Label htmlFor="seed-target">Community</Label>
            <Select value={seedTarget} onValueChange={setSeedTarget}>
              <SelectTrigger aria-label="Community to seed">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COMMUNITIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setSeedOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                const template: SlotRow[] = [
                  {
                    id: `seed-${seedTarget}-1`,
                    category: "Restaurants",
                    slotType: "influencer",
                    total: 5,
                    held: 0,
                    heldBy: [],
                  },
                  {
                    id: `seed-${seedTarget}-2`,
                    category: "Retail",
                    slotType: "headliner",
                    total: 3,
                    held: 0,
                    heldBy: [],
                  },
                  {
                    id: `seed-${seedTarget}-3`,
                    category: "Services",
                    slotType: "expert_column",
                    total: 4,
                    held: 0,
                    heldBy: [],
                  },
                ];
                setRows((prev) => ({
                  ...prev,
                  [seedTarget]: [...(prev[seedTarget] ?? []), ...template],
                }));
                setSeedOpen(false);
              }}
            >
              Seed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <p className="text-xs text-muted-foreground">
        Configured communities in local state: {communityList.join(", ")}
      </p>
    </div>
  );
}

export default SlotInventoryPage;
