import { useSelectionStore } from '../selectionStore';
import { act, renderHook } from '@testing-library/react';

describe('SelectionStore', () => {
  beforeEach(() => {
    useSelectionStore.setState({ selections: {} });
  });

  it('selects and deselects items', () => {
    const { result } = renderHook(() => useSelectionStore());
    
    act(() => {
      result.current.select('customers', '1');
      result.current.select('customers', '2');
    });
    
    expect(result.current.isSelected('customers', '1')).toBe(true);
    expect(result.current.isSelected('customers', '2')).toBe(true);
    expect(result.current.getCount('customers')).toBe(2);
    
    act(() => {
      result.current.deselect('customers', '1');
    });
    
    expect(result.current.isSelected('customers', '1')).toBe(false);
    expect(result.current.isSelected('customers', '2')).toBe(true);
    expect(result.current.getCount('customers')).toBe(1);
  });

  it('toggles selection', () => {
    const { result } = renderHook(() => useSelectionStore());
    
    act(() => {
      result.current.toggle('customers', '1');
    });
    
    expect(result.current.isSelected('customers', '1')).toBe(true);
    
    act(() => {
      result.current.toggle('customers', '1');
    });
    
    expect(result.current.isSelected('customers', '1')).toBe(false);
  });

  it('selects all items', () => {
    const { result } = renderHook(() => useSelectionStore());
    
    act(() => {
      result.current.selectAll('customers', ['1', '2', '3']);
    });
    
    expect(result.current.getSelected('customers')).toEqual(['1', '2', '3']);
    expect(result.current.getCount('customers')).toBe(3);
  });

  it('deselects all items', () => {
    const { result } = renderHook(() => useSelectionStore());
    
    act(() => {
      result.current.selectAll('customers', ['1', '2', '3']);
      result.current.deselectAll('customers');
    });
    
    expect(result.current.getCount('customers')).toBe(0);
    expect(result.current.getSelected('customers')).toEqual([]);
  });

  it('handles multiple contexts independently', () => {
    const { result } = renderHook(() => useSelectionStore());
    
    act(() => {
      result.current.select('customers', '1');
      result.current.select('content', '1');
    });
    
    expect(result.current.getSelected('customers')).toEqual(['1']);
    expect(result.current.getSelected('content')).toEqual(['1']);
    expect(result.current.getCount('customers')).toBe(1);
    expect(result.current.getCount('content')).toBe(1);
  });
});

