// ============================================
// API CLIENT - Learning Center Services
// ============================================

const API_BASE_URL = import.meta.env.VITE_API_ENDPOINT || '';

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit & { retries?: number } = {}
  ): Promise<T> {
    const { retries = 0, ...fetchOptions } = options;
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    // Add tenant ID if available
    const tenantId = localStorage.getItem('tenant_id');
    if (tenantId) {
      defaultHeaders['X-Tenant-ID'] = tenantId;
    }

    const config: RequestInit = {
      ...fetchOptions,
      headers: {
        ...defaultHeaders,
        ...fetchOptions.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        // Handle unauthorized access
        window.dispatchEvent(new Event('auth:unauthorized'));
      }

      if (!response.ok) {
        // Retry on Server Errors if retries > 0
        if (response.status >= 500 && retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return this.request<T>(endpoint, { ...options, retries: retries - 1 });
        }

        const error: ApiError = await response.json().catch(() => ({
          message: response.statusText,
          status: response.status,
        }));
        throw error;
      }

      return await response.json();
    } catch (error) {
      // Retry on network errors
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.request<T>(endpoint, { ...options, retries: retries - 1 });
      }

      if (error instanceof Error) {
        throw new Error(`API request failed: ${error.message}`);
      }
      throw error;
    }
  }

  async get<T>(endpoint: string, options?: { params?: Record<string, any> }): Promise<T> {
    let url = endpoint;
    if (options?.params) {
      const searchParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (endpoint.includes('?') ? '&' : '?') + queryString;
      }
    }
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = localStorage.getItem('auth_token');
    const tenantId = localStorage.getItem('tenant_id');

    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (tenantId) headers['X-Tenant-ID'] = tenantId;

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        message: response.statusText,
        status: response.status,
      }));
      throw error;
    }

    return await response.json();
  }
}

export const apiClient = new ApiClient(API_BASE_URL);


