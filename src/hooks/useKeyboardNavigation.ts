import { useEffect, useState } from 'react';

/**
 * Hook to detect keyboard navigation vs mouse navigation
 * This helps improve focus management for accessibility
 * 
 * Wave 5: Accessibility Polish
 */
export const useKeyboardNavigation = () => {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);

  useEffect(() => {
    // Detect keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      // Tab, Arrow keys, Enter, Space, Escape
      if (
        e.key === 'Tab' ||
        e.key.startsWith('Arrow') ||
        e.key === 'Enter' ||
        e.key === ' ' ||
        e.key === 'Escape'
      ) {
        setIsKeyboardUser(true);
        document.body.classList.add('keyboard-user');
        document.body.classList.remove('mouse-user');
      }
    };

    // Detect mouse navigation
    const handleMouseDown = () => {
      setIsKeyboardUser(false);
      document.body.classList.add('mouse-user');
      document.body.classList.remove('keyboard-user');
    };

    // Detect touch navigation
    const handleTouchStart = () => {
      setIsKeyboardUser(false);
      document.body.classList.add('mouse-user');
      document.body.classList.remove('keyboard-user');
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('touchstart', handleTouchStart);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, []);

  return isKeyboardUser;
};






