import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';

interface MarketingProfileCommunity {
  name: string;
  slug: string;
  state: string;
  weather?: {
    temp: number;
    condition: string;
    icon: string;
  };
  news?: Array<{
    id: string;
    title: string;
    summary: string;
    published_at: string;
  }>;
  events?: Array<{
    id: string;
    title: string;
    date: string;
    location: string;
  }>;
}

export interface MarketingProfile {
  id: string;
  business_name: string;
  tagline: string;
  contact_name: string;
  contact_title: string;
  phone: string;
  email: string;
  website: string;
  accent_color: string;
  logo_url: string | null;
  alphasite_url: string;
  community: MarketingProfileCommunity;
}

async function fetchMarketingProfile(): Promise<MarketingProfile> {
  const { data } = await apiClient.get<MarketingProfile>('/marketing-kit/profile');
  return data;
}

export function useMarketingProfile() {
  return useQuery({
    queryKey: ['marketing-kit', 'profile'],
    queryFn: fetchMarketingProfile,
    staleTime: 5 * 60 * 1000,
  });
}
