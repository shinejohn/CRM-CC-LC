import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiService } from '../api.service';

// Mock the canonical apiClient
vi.mock('@/services/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from '@/services/api';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockClient = apiClient as any;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('apiService adapter', () => {
  it('GET — unwraps Laravel { data } envelope', async () => {
    mockClient.get.mockResolvedValueOnce({ data: { data: { id: 1 } } });
    const res = await apiService.get('/test');
    expect(res.success).toBe(true);
    expect(res.data).toEqual({ id: 1 });
  });

  it('GET — returns plain body when no envelope', async () => {
    mockClient.get.mockResolvedValueOnce({ data: [1, 2, 3] });
    const res = await apiService.get('/test');
    expect(res.success).toBe(true);
    expect(res.data).toEqual([1, 2, 3]);
  });

  it('GET — returns error on rejection', async () => {
    mockClient.get.mockRejectedValueOnce({ message: 'Not found', status: 404 });
    const res = await apiService.get('/test');
    expect(res.success).toBe(false);
    expect(res.error?.status).toBe(404);
    expect(res.error?.message).toBe('Not found');
  });

  it('POST — sends data and unwraps response', async () => {
    mockClient.post.mockResolvedValueOnce({ data: { data: { id: 2 } } });
    const res = await apiService.post('/items', { name: 'Test' });
    expect(res.success).toBe(true);
    expect(res.data).toEqual({ id: 2 });
    expect(mockClient.post).toHaveBeenCalledWith('/items', { name: 'Test' }, expect.any(Object));
  });

  it('PUT — success', async () => {
    mockClient.put.mockResolvedValueOnce({ data: { data: { id: 3, name: 'Updated' } } });
    const res = await apiService.put('/items/3', { name: 'Updated' });
    expect(res.success).toBe(true);
    expect(res.data).toEqual({ id: 3, name: 'Updated' });
  });

  it('DELETE — success with empty body', async () => {
    mockClient.delete.mockResolvedValueOnce({ data: null });
    const res = await apiService.delete('/items/3');
    expect(res.success).toBe(true);
  });

  it('DELETE — propagates error', async () => {
    mockClient.delete.mockRejectedValueOnce({ message: 'Forbidden', status: 403 });
    const res = await apiService.delete('/items/3');
    expect(res.success).toBe(false);
    expect(res.error?.status).toBe(403);
  });

  it('paginated — passes pagination params', async () => {
    mockClient.get.mockResolvedValueOnce({ data: { data: [] } });
    await apiService.paginated('/items', { page: 2, perPage: 25, sortBy: 'name', sortOrder: 'asc' });
    expect(mockClient.get).toHaveBeenCalledWith(
      '/items',
      expect.objectContaining({
        params: expect.objectContaining({ page: 2, per_page: 25, sort_by: 'name', sort_order: 'asc' }),
      }),
    );
  });

  it('passes meta from response envelope', async () => {
    mockClient.get.mockResolvedValueOnce({
      data: { data: [], meta: { total: 100, page: 1, perPage: 20 } },
    });
    const res = await apiService.get('/items');
    expect(res.success).toBe(true);
    expect(res.meta).toEqual({ total: 100, page: 1, perPage: 20 });
  });
});
