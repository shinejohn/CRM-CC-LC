import type { Campaign, CampaignData } from "@/services/types/learning.types";

// Eagerly import all campaign JSON files from the content directory
const campaignModules = import.meta.glob<Record<string, any>>(
  "../../../content/*.json",
  { eager: true }
);

/**
 * Transform raw CampaignData JSON into the flat Campaign interface
 * used by LearningCenterHub and CampaignLandingPage.
 */
function toCampaign(raw: any, fallbackId: string): Campaign {
  // The JSON files have nested structure: { campaign, landing_page, template, slides }
  const campaignInfo = raw.campaign || {};
  const landingPage = raw.landing_page || {};

  return {
    ...raw,
    id: campaignInfo.id || fallbackId,
    slug: landingPage.landing_page_slug || campaignInfo.landing_page || fallbackId,
    title: campaignInfo.title || "Untitled Campaign",
    description: campaignInfo.description || "",
    target_audience: raw.target_audience || "",
    primary_objective: campaignInfo.description || "",
    estimated_duration_weeks: raw.estimated_duration_weeks || Math.ceil((landingPage.duration_seconds || 180) / 60),
    expected_outcomes: raw.expected_outcomes || [],
  };
}

export const campaigns: Campaign[] = Object.entries(campaignModules).map(
  ([path, module]) => {
    const data = (module as any).default || module;
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
    const raw = c as any;
    const campaignType = raw.campaign?.type || "";
    return campaignType.toLowerCase().includes(type.toLowerCase());
  });
}
