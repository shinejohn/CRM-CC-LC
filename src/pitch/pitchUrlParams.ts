import type { GateKey } from "./types";

export function mapGateQueryParam(param: string | null | undefined): GateKey | undefined {
  if (!param) return undefined;
  const p = param.toLowerCase().replace(/-/g, "_");
  const table: Record<string, GateKey> = {
    events: "event_host",
    event: "event_host",
    event_host: "event_host",
    gec: "event_host",
    venue: "venue",
    performer: "performer",
    downtown: "downtown_guide",
    dtg: "downtown_guide",
    downtown_guide: "downtown_guide",
    golocalvoices: "golocalvoices",
    glv: "golocalvoices",
    alphasite: "alphasite",
    civic: "civic",
    day_news: "day_news",
    daynews: "day_news",
  };
  return table[p];
}
