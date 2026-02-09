import { useCacheStore, cacheKeys } from '../cacheStore';
import { act, renderHook } from '@testing-library/react';

describe('CacheStore', () => {
  beforeEach(() => {
    useCacheStore.getState().clear();
  });

  it('stores and retrieves data', () => {
    const { result } = renderHook(() => useCacheStore());
    
    act(() => {
      result.current.set('test-key', { foo: 'bar' });
    });
    
    const data = result.current.get('test-key');
    expect(data).toEqual({ foo: 'bar' });
  });

  it('expires data after TTL', async () => {
    const { result } = renderHook(() => useCacheStore());
    
    act(() => {
      result.current.set('test-key', { foo: 'bar' }, 100); // 100ms TTL
    });
    
    expect(result.current.get('test-key')).toEqual({ foo: 'bar' });
    
    await new Promise(resolve => setTimeout(resolve, 150));
    
    expect(result.current.get('test-key')).toBeNull();
  });

  it('invalidates specific key', () => {
    const { result } = renderHook(() => useCacheStore());
    
    act(() => {
      result.current.set('key1', 'value1');
      result.current.set('key2', 'value2');
    });
    
    act(() => {
      result.current.invalidate('key1');
    });
    
    expect(result.current.get('key1')).toBeNull();
    expect(result.current.get('key2')).toBe('value2');
  });

  it('invalidates by pattern', () => {
    const { result } = renderHook(() => useCacheStore());
    
    act(() => {
      result.current.set('customer:1', 'data1');
      result.current.set('customer:2', 'data2');
      result.current.set('content:1', 'data3');
    });
    
    act(() => {
      result.current.invalidatePattern('customer:*');
    });
    
    expect(result.current.get('customer:1')).toBeNull();
    expect(result.current.get('customer:2')).toBeNull();
    expect(result.current.get('content:1')).toBe('data3');
  });

  it('checks if cache entry is valid', () => {
    const { result } = renderHook(() => useCacheStore());
    
    act(() => {
      result.current.set('test-key', 'value');
    });
    
    expect(result.current.isValid('test-key')).toBe(true);
    expect(result.current.isValid('non-existent')).toBe(false);
  });

  it('generates cache keys correctly', () => {
    expect(cacheKeys.customer('123')).toBe('customer:123');
    expect(cacheKeys.customers('active')).toBe('customers:active');
    expect(cacheKeys.content('456')).toBe('content:456');
    expect(cacheKeys.campaigns()).toBe('campaigns:list');
    expect(cacheKeys.dashboard()).toBe('dashboard:data');
  });
});

