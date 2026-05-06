import type { Campaign, CampaignData } from "@/services/types/learning.types";

// Eagerly import all campaign JSON files from the content directory
const campaignModules = import.meta.glob<Record<string, unknown>>(
  "../../../content/*.json",
  { eager: true }
);

/**
 * Transform raw CampaignData JSON into the flat Campaign interface
 * used by LearningCenterHub and CampaignLandingPage.
 */
function toCampaign(raw: Record<string, unknown>, fallbackId: string): Campaign {
  // The JSON files have nested structure: { campaign, landing_page, template, slides }
  const campaignInfo = (raw.campaign || {}) as Record<string, unknown>;
  const landingPage = (raw.landing_page || {}) as Record<string, unknown>;

  return {
    ...raw,
    id: (campaignInfo.id as string) || fallbackId,
    slug: (landingPage.landing_page_slug as string) || (campaignInfo.landing_page as string) || fallbackId,
    title: (campaignInfo.title as string) || "Untitled Campaign",
    description: (campaignInfo.description as string) || "",
    target_audience: (raw.target_audience as string) || "",
    primary_objective: (campaignInfo.description as string) || "",
    estimated_duration_weeks: (raw.estimated_duration_weeks as number) || Math.ceil(((landingPage.duration_seconds as number) || 180) / 60),
    expected_outcomes: (raw.expected_outcomes as string[]) || [],
  };
}

export const campaigns: Campaign[] = Object.entries(campaignModules).map(
  ([path, module]) => {
    const data = ((module as Record<string, unknown>).default || module) as Record<string, unknown>;
    const fallbackId = path.split("/").pop()?.replace(".json", "").replace("_complete", "") || "unknown";
    return toCampaign(data, fallbackId);
  }
);

export const getCampaignBySlug = (slug: string): Campaign | undefined => {
  return campaigns.find((c) => c.slug === slug);
};

/**
 * Load a single campaign by ID from the public/campaigns/ directory.
 * Uses fetch for runtime loading of campaigns not in the content/ build.
 */
export async function loadCampaign(id: string): Promise<CampaignData | null> {
  try {
    const res = await fetch(`/campaigns/campaign_${id}.json`);
    if (!res.ok) return null;
    return (await res.json()) as CampaignData;
  } catch {
    return null;
  }
}

/**
 * Get campaigns filtered by type (e.g., "Educational", "Hook", "HowTo").
 */
export function getCampaignsByType(type: string): Campaign[] {
  return campaigns.filter((c) => {
    const campaign = (c as Record<string, unknown>).campaign as Record<string, unknown> | undefined;
    const campaignType = (campaign?.type as string) || "";
    return campaignType.toLowerCase().includes(type.toLowerCase());
  });
}
