import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';

export interface MarketingAsset {
  id: string;
  type: string;
  name: string;
  config: Record<string, unknown>;
  embed_code?: string;
  created_at: string;
  updated_at: string;
}

interface SaveAssetPayload {
  type: string;
  name: string;
  config: Record<string, unknown>;
}

interface EmbedCodeResponse {
  embed_code: string;
  preview_url: string;
}

interface EmailSignaturePayload {
  business_name: string;
  contact_name: string;
  contact_title: string;
  phone: string;
  email: string;
  website: string;
  accent_color: string;
  include_contact: boolean;
}

interface EmailSignatureResponse {
  html: string;
}

async function fetchMarketingAssets(): Promise<MarketingAsset[]> {
  const { data } = await apiClient.get<MarketingAsset[]>('/marketing-kit/assets');
  return data;
}

async function saveAsset(payload: SaveAssetPayload): Promise<MarketingAsset> {
  const { data } = await apiClient.post<MarketingAsset>('/marketing-kit/assets', payload);
  return data;
}

async function deleteAsset(id: string): Promise<void> {
  await apiClient.delete(`/marketing-kit/assets/${id}`);
}

async function fetchEmbedCode(id: string): Promise<EmbedCodeResponse> {
  const { data } = await apiClient.get<EmbedCodeResponse>(`/marketing-kit/embed/${id}`);
  return data;
}

async function generateEmailSignature(payload: EmailSignaturePayload): Promise<EmailSignatureResponse> {
  const { data } = await apiClient.post<EmailSignatureResponse>('/marketing-kit/email-signature', payload);
  return data;
}

export function useMarketingAssets() {
  return useQuery({
    queryKey: ['marketing-kit', 'assets'],
    queryFn: fetchMarketingAssets,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSaveAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-kit', 'assets'] });
    },
  });
}

export function useDeleteAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-kit', 'assets'] });
    },
  });
}

export function useGenerateEmbedCode(id: string) {
  return useQuery({
    queryKey: ['marketing-kit', 'embed', id],
    queryFn: () => fetchEmbedCode(id),
    enabled: !!id,
  });
}

export function useGenerateEmailSignature() {
  return useMutation({
    mutationFn: generateEmailSignature,
  });
}
