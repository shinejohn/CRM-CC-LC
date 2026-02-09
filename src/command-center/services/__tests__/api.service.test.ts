import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiService } from '../api.service';

describe('ApiService', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('makes GET requests', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: { id: 1 } }),
    });

    const response = await apiService.get('/test');
    
    expect(response.success).toBe(true);
    expect(response.data).toEqual({ id: 1 });
  });

  it('handles errors', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: () => Promise.resolve({ message: 'Resource not found' }),
    });

    const response = await apiService.get('/notfound');
    
    expect(response.success).toBe(false);
    expect(response.error?.status).toBe(404);
  });

  it('applies request interceptors', async () => {
    const interceptor = vi.fn((config) => ({
      ...config,
      headers: { ...config.headers, 'X-Custom': 'value' },
    }));

    apiService.addRequestInterceptor(interceptor);
    
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await apiService.get('/test');
    
    expect(interceptor).toHaveBeenCalled();
  });

  it('adds auth token to requests', async () => {
    localStorage.setItem('cc_auth_tokens', JSON.stringify({
      accessToken: 'test-token',
      refreshToken: 'refresh-token',
      expiresAt: Date.now() + 3600000,
    }));

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await apiService.get('/test');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      })
    );
  });

  it('handles POST requests with data', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: { id: 1 } }),
    });

    const response = await apiService.post('/test', { name: 'Test' });
    
    expect(response.success).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'Test' }),
      })
    );
  });

  it('handles query parameters', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await apiService.get('/test', {
      params: { page: 1, limit: 10 },
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('?page=1&limit=10'),
      expect.any(Object)
    );
  });

  it('handles timeout', async () => {
    (global.fetch as any).mockImplementation(() => 
      new Promise((resolve) => {
        setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({}),
        }), 100);
      })
    );

    const response = await apiService.get('/test', { timeout: 50 });
    
    expect(response.success).toBe(false);
    expect(response.error?.code).toBe('TIMEOUT');
  });

  it('handles file upload', async () => {
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: { url: 'http://example.com/file' } }),
    });

    const response = await apiService.upload('/upload', file);
    
    expect(response.success).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      })
    );
  });

  it('handles paginated requests', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });

    await apiService.paginated('/items', {
      page: 1,
      perPage: 20,
      sortBy: 'name',
      sortOrder: 'asc',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('page=1'),
      expect.any(Object)
    );
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('per_page=20'),
      expect.any(Object)
    );
  });
});

