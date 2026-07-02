/**
 * apiService — thin adapter over apiClient.
 * Returns the { success, data, error, meta } shape all CC hooks expect,
 * while delegating all HTTP + auth to the canonical apiClient (Axios).
 */
import type { AxiosRequestConfig } from 'axios';
import { apiClient } from '@/services/api';
import type { ApiResponse, ApiError, RequestConfig, PaginationParams } from './api.types';

function buildConfig(config?: RequestConfig): AxiosRequestConfig {
  return {
    params: config?.params,
    headers: config?.headers,
    signal: config?.signal,
    timeout: config?.timeout,
    data: config?.data,
  };
}

function wrapSuccess<T>(responseData: unknown): ApiResponse<T> {
  if (responseData && typeof responseData === 'object' && 'data' in (responseData as object)) {
    const r = responseData as { data: T; meta?: ApiResponse<T>['meta'] };
    return { success: true, data: r.data, meta: r.meta };
  }
  return { success: true, data: responseData as T };
}

function wrapError(err: unknown): ApiResponse<never> {
  const e = err as { message?: string; status?: number };
  const error: ApiError = {
    code: `HTTP_${e.status ?? 'ERROR'}`,
    message: e.message ?? 'Request failed',
    status: e.status,
  };
  return { success: false, error };
}

export const apiService = {
  async get<T>(path: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const res = await apiClient.get<unknown>(path, buildConfig(config));
      return wrapSuccess<T>(res.data);
    } catch (err) {
      return wrapError(err);
    }
  },

  async post<T>(path: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const res = await apiClient.post<unknown>(path, data, buildConfig(config));
      return wrapSuccess<T>(res.data);
    } catch (err) {
      return wrapError(err);
    }
  },

  async put<T>(path: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const res = await apiClient.put<unknown>(path, data, buildConfig(config));
      return wrapSuccess<T>(res.data);
    } catch (err) {
      return wrapError(err);
    }
  },

  async patch<T>(path: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const res = await apiClient.patch<unknown>(path, data, buildConfig(config));
      return wrapSuccess<T>(res.data);
    } catch (err) {
      return wrapError(err);
    }
  },

  async delete<T>(path: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const res = await apiClient.delete<unknown>(path, buildConfig(config));
      return wrapSuccess<T>(res.data);
    } catch (err) {
      return wrapError(err);
    }
  },

  async paginated<T>(
    path: string,
    pagination: PaginationParams,
    config?: RequestConfig,
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
  },
};
