# CC-SVC-02: API Client Service

## Module Overview

| Property | Value |
|----------|-------|
| Module ID | CC-SVC-02 |
| Name | API Client Service |
| Phase | 2 - Core Services |
| Dependencies | CC-CORE-03 (Auth Context) |
| Estimated Time | 2 hours |
| Agent Assignment | Agent 5 |

---

## Purpose

Create a centralized API client that handles all HTTP requests, automatic token refresh, error handling, request/response interceptors, and provides typed methods for common operations.

---

## Deliverables

### 1. API Types

```typescript
// src/command-center/services/api.types.ts

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  status?: number;
}

export interface ApiMeta {
  page?: number;
  perPage?: number;
  total?: number;
  totalPages?: number;
  cursor?: string;
  nextCursor?: string;
}

export interface RequestConfig {
  params?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  timeout?: number;
}

export interface PaginationParams {
  page?: number;
  perPage?: number;
  cursor?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export type RequestInterceptor = (config: RequestInit & { url: string }) => RequestInit & { url: string };
export type ResponseInterceptor = (response: Response) => Response | Promise<Response>;
export type ErrorInterceptor = (error: ApiError) => ApiError | Promise<never>;
```

### 2. API Service Class

```typescript
// src/command-center/services/api.service.ts

import { 
  ApiResponse, 
  ApiError, 
  RequestConfig, 
  PaginationParams,
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor
} from './api.types';

class ApiService {
  private baseUrl: string;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];
  private defaultTimeout = 30000;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || '/api';
  }

  // Interceptors
  addRequestInterceptor(interceptor: RequestInterceptor): () => void {
    this.requestInterceptors.push(interceptor);
    return () => {
      const index = this.requestInterceptors.indexOf(interceptor);
      if (index > -1) this.requestInterceptors.splice(index, 1);
    };
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): () => void {
    this.responseInterceptors.push(interceptor);
    return () => {
      const index = this.responseInterceptors.indexOf(interceptor);
      if (index > -1) this.responseInterceptors.splice(index, 1);
    };
  }

  addErrorInterceptor(interceptor: ErrorInterceptor): () => void {
    this.errorInterceptors.push(interceptor);
    return () => {
      const index = this.errorInterceptors.indexOf(interceptor);
      if (index > -1) this.errorInterceptors.splice(index, 1);
    };
  }

  // Token management (will be set by AuthContext)
  private getToken: () => string | null = () => localStorage.getItem('cc_auth_tokens') 
    ? JSON.parse(localStorage.getItem('cc_auth_tokens')!).accessToken 
    : null;

  setTokenGetter(getter: () => string | null): void {
    this.getToken = getter;
  }

  // Core request method
  private async request<T>(
    method: string,
    path: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    let url = `${this.baseUrl}${path}`;
    
    // Add query params
    if (config?.params) {
      const params = new URLSearchParams();
      Object.entries(config.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    // Build request config
    let requestInit: RequestInit & { url: string } = {
      url,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers,
      },
    };

    // Add auth header
    const token = this.getToken();
    if (token) {
      requestInit.headers = {
        ...requestInit.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    // Add body for non-GET requests
    if (data && method !== 'GET') {
      requestInit.body = JSON.stringify(data);
    }

    // Apply request interceptors
    for (const interceptor of this.requestInterceptors) {
      requestInit = interceptor(requestInit);
    }

    // Setup timeout
    const timeout = config?.timeout ?? this.defaultTimeout;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    requestInit.signal = config?.signal ?? controller.signal;

    try {
      let response = await fetch(requestInit.url, requestInit);
      clearTimeout(timeoutId);

      // Apply response interceptors
      for (const interceptor of this.responseInterceptors) {
        response = await interceptor(response);
      }

      // Handle error responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: ApiError = {
          code: errorData.code || `HTTP_${response.status}`,
          message: errorData.message || response.statusText,
          details: errorData.details,
          status: response.status,
        };

        // Apply error interceptors
        for (const interceptor of this.errorInterceptors) {
          await interceptor(error);
        }

        return { success: false, error };
      }

      // Parse successful response
      const responseData = await response.json();
      
      return {
        success: true,
        data: responseData.data ?? responseData,
        meta: responseData.meta,
      };
    } catch (err) {
      clearTimeout(timeoutId);

      const error: ApiError = {
        code: 'NETWORK_ERROR',
        message: err instanceof Error ? err.message : 'Network request failed',
      };

      if (err instanceof DOMException && err.name === 'AbortError') {
        error.code = 'TIMEOUT';
        error.message = 'Request timed out';
      }

      // Apply error interceptors
      for (const interceptor of this.errorInterceptors) {
        await interceptor(error);
      }

      return { success: false, error };
    }
  }

  // HTTP method shortcuts
  async get<T>(path: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('GET', path, undefined, config);
  }

  async post<T>(path: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('POST', path, data, config);
  }

  async put<T>(path: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', path, data, config);
  }

  async patch<T>(path: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', path, data, config);
  }

  async delete<T>(path: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', path, undefined, config);
  }

  // Paginated request helper
  async paginated<T>(
    path: string,
    pagination: PaginationParams,
    config?: RequestConfig
  ): Promise<ApiResponse<T[]>> {
    return this.get<T[]>(path, {
      ...config,
      params: {
        ...config?.params,
        page: pagination.page,
        per_page: pagination.perPage,
        cursor: pagination.cursor,
        sort_by: pagination.sortBy,
        sort_order: pagination.sortOrder,
      },
    });
  }

  // Upload file
  async upload<T>(
    path: string,
    file: File,
    fieldName = 'file',
    additionalData?: Record<string, string>,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append(fieldName, file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const token = this.getToken();
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...config?.headers,
      },
      body: formData,
      signal: config?.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: {
          code: errorData.code || `HTTP_${response.status}`,
          message: errorData.message || 'Upload failed',
          status: response.status,
        },
      };
    }

    const data = await response.json();
    return { success: true, data: data.data ?? data };
  }
}

// Singleton export
export const apiService = new ApiService();
```

### 3. useApi Hook

```typescript
// src/command-center/hooks/useApi.ts

import { useState, useCallback, useRef, useEffect } from 'react';
import { apiService } from '../services/api.service';
import { ApiResponse, ApiError, RequestConfig } from '../services/api.types';

interface UseApiState<T> {
  data: T | null;
  error: ApiError | null;
  isLoading: boolean;
}

interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<ApiResponse<T>>;
  reset: () => void;
  abort: () => void;
}

export function useApi<T>(
  apiCall: (...args: any[]) => Promise<ApiResponse<T>>,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const { immediate = false, onSuccess, onError } = options;
  
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    error: null,
    isLoading: immediate,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  const execute = useCallback(async (...args: any[]): Promise<ApiResponse<T>> => {
    // Abort previous request
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiCall(...args);

      if (!mountedRef.current) return response;

      if (response.success) {
        setState({ data: response.data!, error: null, isLoading: false });
        onSuccess?.(response.data);
      } else {
        setState({ data: null, error: response.error!, isLoading: false });
        onError?.(response.error!);
      }

      return response;
    } catch (err) {
      const error: ApiError = {
        code: 'UNKNOWN_ERROR',
        message: err instanceof Error ? err.message : 'Unknown error occurred',
      };

      if (mountedRef.current) {
        setState({ data: null, error, isLoading: false });
        onError?.(error);
      }

      return { success: false, error };
    }
  }, [apiCall, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false });
  }, []);

  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  // Immediate execution
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, []); // eslint-disable-line

  return {
    ...state,
    execute,
    reset,
    abort,
  };
}

// Convenience hooks for common patterns
export function useApiGet<T>(path: string, config?: RequestConfig, options?: UseApiOptions) {
  return useApi<T>(() => apiService.get<T>(path, config), options);
}

export function useApiMutation<T, D = any>(
  method: 'post' | 'put' | 'patch' | 'delete',
  path: string,
  options?: UseApiOptions
) {
  return useApi<T>((data: D) => apiService[method]<T>(path, data), options);
}
```

### 4. API Error Boundary

```typescript
// src/command-center/components/errors/ApiErrorBoundary.tsx

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApiError } from '../../services/api.types';

interface ApiErrorDisplayProps {
  error: ApiError;
  onRetry?: () => void;
}

export function ApiErrorDisplay({ error, onRetry }: ApiErrorDisplayProps) {
  const getErrorMessage = () => {
    switch (error.code) {
      case 'NETWORK_ERROR':
        return 'Unable to connect. Please check your internet connection.';
      case 'TIMEOUT':
        return 'The request took too long. Please try again.';
      case 'HTTP_401':
        return 'Your session has expired. Please log in again.';
      case 'HTTP_403':
        return 'You don\'t have permission to perform this action.';
      case 'HTTP_404':
        return 'The requested resource was not found.';
      case 'HTTP_500':
        return 'Something went wrong on our end. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Something went wrong
      </h3>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-4 max-w-sm">
        {getErrorMessage()}
      </p>
      {error.code && (
        <p className="text-xs text-gray-400 mb-4">
          Error code: {error.code}
        </p>
      )}
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
}
```

---

## Testing Requirements

```typescript
// src/command-center/services/__tests__/api.service.test.ts

import { apiService } from '../api.service';

describe('ApiService', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('makes GET requests', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: { id: 1 } }),
    });

    const response = await apiService.get('/test');
    
    expect(response.success).toBe(true);
    expect(response.data).toEqual({ id: 1 });
  });

  it('handles errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
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
    const interceptor = jest.fn(config => ({
      ...config,
      headers: { ...config.headers, 'X-Custom': 'value' },
    }));

    apiService.addRequestInterceptor(interceptor);
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await apiService.get('/test');
    
    expect(interceptor).toHaveBeenCalled();
  });
});
```

---

## Acceptance Criteria

- [ ] GET, POST, PUT, PATCH, DELETE methods work
- [ ] Query params are correctly encoded
- [ ] Auth token is added to requests
- [ ] Request interceptors modify outgoing requests
- [ ] Response interceptors process responses
- [ ] Error interceptors handle errors
- [ ] Timeout works correctly
- [ ] File upload works
- [ ] Pagination helper works
- [ ] useApi hook manages loading/error states
- [ ] ApiErrorDisplay shows user-friendly messages

---

## Handoff

When complete, this module provides:

1. `apiService` - Singleton API client
2. `useApi` - Generic API hook
3. `useApiGet` - GET request hook
4. `useApiMutation` - Mutation hook
5. `ApiErrorDisplay` - Error display component

Other agents import:
```typescript
import { apiService } from '@/command-center/services/api.service';
import { useApi, useApiGet, useApiMutation } from '@/command-center/hooks';
```
