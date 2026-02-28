import { Campaign } from "@/services/types/learning.types";

const campaignModules = import.meta.glob<Record<string, any>>("../../../content/*.json", { eager: true });

export const campaigns: Campaign[] = Object.entries(campaignModules).map(([path, module]) => {
    const data = module.default || module;
    return {
        ...data,
        id: data.id || path.split('/').pop()?.replace('.json', ''),
        slug: data.slug || path.split('/').pop()?.replace('.json', '')
    } as Campaign;
});

export const getCampaignBySlug = (slug: string): Campaign | undefined => {
    return campaigns.find(c => c.slug === slug);
};
