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
    this.baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_ENDPOINT || '/api';
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
  private getToken: () => string | null = () => {
    try {
      const stored = localStorage.getItem('cc_auth_tokens');
      if (stored) {
        const tokens = JSON.parse(stored);
        return tokens.accessToken || null;
      }
    } catch (e) {
      console.error('Failed to get token from storage', e);
    }
    return null;
  };

  setTokenGetter(getter: () => string | null): void {
    this.getToken = getter;
  }

  // Core request method
  private async request<T>(
    method: string,
    path: string,
    data?: unknown,
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

    // Add tenant header when available (required by services, orders, billing APIs)
    const tenantId = localStorage.getItem('tenant_id');
    if (tenantId) {
      requestInit.headers = {
        ...requestInit.headers,
        'X-Tenant-ID': tenantId,
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

  async post<T>(path: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('POST', path, data, config);
  }

  async put<T>(path: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', path, data, config);
  }

  async patch<T>(path: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config?.timeout ?? this.defaultTimeout);

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...config?.headers,
        },
        body: formData,
        signal: config?.signal ?? controller.signal,
      });

      clearTimeout(timeoutId);

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
    } catch (err) {
      clearTimeout(timeoutId);
      const error: ApiError = {
        code: err instanceof DOMException && err.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK_ERROR',
        message: err instanceof Error ? err.message : 'Upload failed',
      };
      return { success: false, error };
    }
  }
}

// Singleton export
export const apiService = new ApiService();

