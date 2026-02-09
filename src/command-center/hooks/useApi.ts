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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

