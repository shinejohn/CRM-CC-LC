// Command Center Content Hook
// CC-FT-04: Content Module

import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api.service';

export interface ContentFilters {
  status: string | null;
  type: string | null;
  category: string | null;
}

export interface Content {
  id: string;
  title: string;
  type: 'article' | 'email' | 'social' | 'video' | 'image';
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
  description?: string;
  excerpt?: string;
  thumbnail?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
  author?: string;
}

export function useContent(filters: ContentFilters) {
  const [content, setContent] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params: Record<string, string> = {};
      if (filters.status) params.status = filters.status;
      if (filters.type) params.type = filters.type;
      if (filters.category) params.category = filters.category;

      const response = await apiService.get<Content[]>('/v1/content', { params });
      
      if (response.success && response.data) {
        setContent(response.data);
      } else {
        setError(response.error?.message || 'Failed to load content');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setIsLoading(false);
    }
  }, [filters.status, filters.type, filters.category]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const createContent = useCallback(async (data: Partial<Content>): Promise<Content> => {
    const response = await apiService.post<Content>('/v1/content', data);
    
    if (response.success && response.data) {
      setContent(prev => [response.data!, ...prev]);
      return response.data;
    }
    
    throw new Error(response.error?.message || 'Failed to create content');
  }, []);

  const updateContent = useCallback(async (id: string, data: Partial<Content>): Promise<Content> => {
    const response = await apiService.put<Content>(`/v1/content/${id}`, data);
    
    if (response.success && response.data) {
      setContent(prev => prev.map(c => c.id === id ? response.data! : c));
      return response.data;
    }
    
    throw new Error(response.error?.message || 'Failed to update content');
  }, []);

  const deleteContent = useCallback(async (id: string): Promise<void> => {
    const response = await apiService.delete(`/v1/content/${id}`);
    
    if (response.success) {
      setContent(prev => prev.filter(c => c.id !== id));
    } else {
      throw new Error(response.error?.message || 'Failed to delete content');
    }
  }, []);

  const updateStatus = useCallback(async (id: string, status: Content['status']): Promise<Content> => {
    const response = await apiService.put<Content>(`/v1/content/${id}/status`, { status });
    
    if (response.success && response.data) {
      setContent(prev => prev.map(c => c.id === id ? response.data! : c));
      return response.data;
    }
    
    throw new Error(response.error?.message || 'Failed to update status');
  }, []);

  return {
    content,
    isLoading,
    error,
    refreshContent: fetchContent,
    createContent,
    updateContent,
    deleteContent,
    updateStatus,
  };
}

