import { useUIStore } from '../rootStore';
import { act, renderHook } from '@testing-library/react';

describe('UIStore', () => {
  beforeEach(() => {
    useUIStore.setState({
      sidebarCollapsed: false,
      rightPanelOpen: true,
      aiMode: false,
      activeNavItem: 'dashboard',
      commandPaletteOpen: false,
      modalStack: [],
    });
  });

  it('toggles sidebar', () => {
    const { result } = renderHook(() => useUIStore());
    
    expect(result.current.sidebarCollapsed).toBe(false);
    
    act(() => {
      result.current.toggleSidebar();
    });
    
    expect(result.current.sidebarCollapsed).toBe(true);
  });

  it('manages modal stack', () => {
    const { result } = renderHook(() => useUIStore());
    
    act(() => {
      result.current.pushModal('modal-1');
      result.current.pushModal('modal-2');
    });
    
    expect(result.current.modalStack).toEqual(['modal-1', 'modal-2']);
    
    act(() => {
      result.current.popModal();
    });
    
    expect(result.current.modalStack).toEqual(['modal-1']);
    
    act(() => {
      result.current.clearModals();
    });
    
    expect(result.current.modalStack).toEqual([]);
  });

  it('toggles AI mode', () => {
    const { result } = renderHook(() => useUIStore());
    
    expect(result.current.aiMode).toBe(false);
    
    act(() => {
      result.current.toggleAiMode();
    });
    
    expect(result.current.aiMode).toBe(true);
  });

  it('sets active nav item', () => {
    const { result } = renderHook(() => useUIStore());
    
    act(() => {
      result.current.setActiveNavItem('customers');
    });
    
    expect(result.current.activeNavItem).toBe('customers');
  });

  it('toggles right panel', () => {
    const { result } = renderHook(() => useUIStore());
    
    expect(result.current.rightPanelOpen).toBe(true);
    
    act(() => {
      result.current.toggleRightPanel();
    });
    
    expect(result.current.rightPanelOpen).toBe(false);
  });
});

