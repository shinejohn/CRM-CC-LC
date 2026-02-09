# CC-CORE-02: Theme System

## Module Overview

| Property | Value |
|----------|-------|
| Module ID | CC-CORE-02 |
| Name | Theme System |
| Phase | 1 - Foundation |
| Dependencies | None |
| Estimated Time | 1.5 hours |
| Agent Assignment | Agent 2 |

---

## Purpose

Create a comprehensive theming system that supports light/dark modes, customizable color schemes per card/widget, and consistent styling across the Command Center.

---

## UI Pattern References

**Primary Reference:** `/magic/patterns/UnifiedCommandCenter.tsx`

Key patterns to extract:
- `getColorScheme()` function for dynamic card colors
- Color scheme definitions (sky, lavender, rose, mint, etc.)
- Dark mode gradient variations
- `isDarkMode` conditional styling

**Secondary Reference:** `/magic/patterns/ColorPicker.tsx`

Key patterns to extract:
- Color palette options
- Color selection UI

---

## Deliverables

### 1. ThemeProvider.tsx

```typescript
// src/command-center/core/ThemeProvider.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDarkMode: boolean;
  getColorScheme: (cardId: string, defaultColor: string) => ColorScheme;
  setCardColor: (cardId: string, color: string) => void;
  cardColors: Record<string, string>;
}

interface ColorScheme {
  gradient: string;
  border: string;
  iconBg: string;
  iconColor: string;
  text: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Color Palette Definitions
const COLOR_PALETTES: Record<string, { light: ColorScheme; dark: ColorScheme }> = {
  sky: {
    light: {
      gradient: 'from-sky-50 to-blue-100',
      border: 'border-sky-200',
      iconBg: 'bg-sky-100',
      iconColor: 'text-sky-600',
      text: 'text-sky-900',
    },
    dark: {
      gradient: 'from-sky-900/30 to-blue-900/30',
      border: 'border-sky-700',
      iconBg: 'bg-sky-800',
      iconColor: 'text-sky-300',
      text: 'text-sky-100',
    },
  },
  lavender: {
    light: {
      gradient: 'from-purple-50 to-violet-100',
      border: 'border-purple-200',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      text: 'text-purple-900',
    },
    dark: {
      gradient: 'from-purple-900/30 to-violet-900/30',
      border: 'border-purple-700',
      iconBg: 'bg-purple-800',
      iconColor: 'text-purple-300',
      text: 'text-purple-100',
    },
  },
  rose: {
    light: {
      gradient: 'from-rose-50 to-pink-100',
      border: 'border-rose-200',
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-600',
      text: 'text-rose-900',
    },
    dark: {
      gradient: 'from-rose-900/30 to-pink-900/30',
      border: 'border-rose-700',
      iconBg: 'bg-rose-800',
      iconColor: 'text-rose-300',
      text: 'text-rose-100',
    },
  },
  mint: {
    light: {
      gradient: 'from-emerald-50 to-teal-100',
      border: 'border-emerald-200',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      text: 'text-emerald-900',
    },
    dark: {
      gradient: 'from-emerald-900/30 to-teal-900/30',
      border: 'border-emerald-700',
      iconBg: 'bg-emerald-800',
      iconColor: 'text-emerald-300',
      text: 'text-emerald-100',
    },
  },
  peach: {
    light: {
      gradient: 'from-orange-50 to-amber-100',
      border: 'border-orange-200',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      text: 'text-orange-900',
    },
    dark: {
      gradient: 'from-orange-900/30 to-amber-900/30',
      border: 'border-orange-700',
      iconBg: 'bg-orange-800',
      iconColor: 'text-orange-300',
      text: 'text-orange-100',
    },
  },
  ocean: {
    light: {
      gradient: 'from-cyan-50 to-blue-100',
      border: 'border-cyan-200',
      iconBg: 'bg-cyan-100',
      iconColor: 'text-cyan-600',
      text: 'text-cyan-900',
    },
    dark: {
      gradient: 'from-cyan-900/30 to-blue-900/30',
      border: 'border-cyan-700',
      iconBg: 'bg-cyan-800',
      iconColor: 'text-cyan-300',
      text: 'text-cyan-100',
    },
  },
  violet: {
    light: {
      gradient: 'from-violet-50 to-indigo-100',
      border: 'border-violet-200',
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600',
      text: 'text-violet-900',
    },
    dark: {
      gradient: 'from-violet-900/30 to-indigo-900/30',
      border: 'border-violet-700',
      iconBg: 'bg-violet-800',
      iconColor: 'text-violet-300',
      text: 'text-violet-100',
    },
  },
  slate: {
    light: {
      gradient: 'from-slate-50 to-gray-100',
      border: 'border-slate-200',
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
      text: 'text-slate-900',
    },
    dark: {
      gradient: 'from-slate-800/50 to-gray-800/50',
      border: 'border-slate-600',
      iconBg: 'bg-slate-700',
      iconColor: 'text-slate-300',
      text: 'text-slate-100',
    },
  },
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [cardColors, setCardColors] = useState<Record<string, string>>({});

  // Detect system preference and apply theme
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateDarkMode = () => {
      if (theme === 'system') {
        setIsDarkMode(mediaQuery.matches);
      } else {
        setIsDarkMode(theme === 'dark');
      }
    };

    updateDarkMode();
    mediaQuery.addEventListener('change', updateDarkMode);
    return () => mediaQuery.removeEventListener('change', updateDarkMode);
  }, [theme]);

  // Apply dark class to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  // Load saved card colors from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cc-card-colors');
    if (saved) {
      setCardColors(JSON.parse(saved));
    }
  }, []);

  // Save card colors to localStorage
  useEffect(() => {
    localStorage.setItem('cc-card-colors', JSON.stringify(cardColors));
  }, [cardColors]);

  const getColorScheme = (cardId: string, defaultColor: string): ColorScheme => {
    const color = cardColors[cardId] || defaultColor;
    const palette = COLOR_PALETTES[color] || COLOR_PALETTES.slate;
    return isDarkMode ? palette.dark : palette.light;
  };

  const setCardColor = (cardId: string, color: string) => {
    setCardColors((prev) => ({ ...prev, [cardId]: color }));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        isDarkMode,
        getColorScheme,
        setCardColor,
        cardColors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export { COLOR_PALETTES };
export type { ColorScheme };
```

### 2. DarkModeToggle.tsx

```typescript
// src/command-center/components/ui/DarkModeToggle.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../core/ThemeProvider';

export function DarkModeToggle() {
  const { theme, setTheme } = useTheme();

  const options = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ] as const;

  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-slate-700 rounded-lg">
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = theme === option.value;
        
        return (
          <button
            key={option.value}
            onClick={() => setTheme(option.value)}
            className={`
              relative p-2 rounded-md transition-colors
              ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-slate-300'}
            `}
            title={option.label}
          >
            {isActive && (
              <motion.div
                layoutId="theme-toggle-active"
                className="absolute inset-0 bg-white dark:bg-slate-600 rounded-md shadow-sm"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <Icon className="w-4 h-4 relative z-10" />
          </button>
        );
      })}
    </div>
  );
}
```

### 3. ColorPicker.tsx

```typescript
// src/command-center/components/ui/ColorPicker.tsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Check } from 'lucide-react';
import { useTheme, COLOR_PALETTES } from '../core/ThemeProvider';

interface ColorPickerProps {
  cardId: string;
  currentColor: string;
  onColorChange?: (color: string) => void;
}

export function ColorPicker({ cardId, currentColor, onColorChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { setCardColor, isDarkMode } = useTheme();

  const colors = Object.keys(COLOR_PALETTES);

  const handleColorSelect = (color: string) => {
    setCardColor(cardId, color);
    onColorChange?.(color);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        title="Change color"
      >
        <Palette className="w-4 h-4 text-gray-500 dark:text-slate-400" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Color Picker Popover */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 top-full mt-2 z-50 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-3 min-w-[200px]"
            >
              <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                Card Color
              </p>
              <div className="grid grid-cols-4 gap-2">
                {colors.map((color) => {
                  const palette = COLOR_PALETTES[color];
                  const scheme = isDarkMode ? palette.dark : palette.light;
                  const isSelected = currentColor === color;
                  
                  return (
                    <button
                      key={color}
                      onClick={() => handleColorSelect(color)}
                      className={`
                        w-10 h-10 rounded-lg bg-gradient-to-br ${scheme.gradient}
                        border-2 ${isSelected ? 'border-gray-900 dark:border-white' : 'border-transparent'}
                        flex items-center justify-center
                        hover:scale-110 transition-transform
                      `}
                      title={color.charAt(0).toUpperCase() + color.slice(1)}
                    >
                      {isSelected && (
                        <Check className="w-4 h-4 text-gray-900 dark:text-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
```

### 4. Theme CSS Variables

```css
/* src/styles/command-center/variables.css */

:root {
  /* Base Colors */
  --cc-bg-primary: #ffffff;
  --cc-bg-secondary: #f9fafb;
  --cc-bg-tertiary: #f3f4f6;
  --cc-text-primary: #111827;
  --cc-text-secondary: #4b5563;
  --cc-text-muted: #9ca3af;
  --cc-border: #e5e7eb;
  
  /* Accent Colors */
  --cc-accent-blue: #3b82f6;
  --cc-accent-purple: #8b5cf6;
  --cc-accent-green: #10b981;
  --cc-accent-orange: #f97316;
  --cc-accent-red: #ef4444;
  
  /* Gradients */
  --cc-gradient-primary: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
  --cc-gradient-ai: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
  
  /* Shadows */
  --cc-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --cc-shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --cc-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  
  /* Transitions */
  --cc-transition-fast: 150ms ease;
  --cc-transition-normal: 200ms ease;
  --cc-transition-slow: 300ms ease;
  
  /* Spacing */
  --cc-sidebar-width: 256px;
  --cc-sidebar-collapsed: 64px;
  --cc-header-height: 64px;
  --cc-right-panel-width: 320px;
}

.dark {
  --cc-bg-primary: #1e293b;
  --cc-bg-secondary: #0f172a;
  --cc-bg-tertiary: #334155;
  --cc-text-primary: #f8fafc;
  --cc-text-secondary: #cbd5e1;
  --cc-text-muted: #64748b;
  --cc-border: #334155;
  
  --cc-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
  --cc-shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3);
  --cc-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.3);
}
```

### 5. useColorScheme Hook

```typescript
// src/command-center/hooks/useColorScheme.ts

import { useMemo } from 'react';
import { useTheme, ColorScheme } from '../core/ThemeProvider';

interface UseColorSchemeOptions {
  cardId: string;
  defaultColor?: string;
}

interface UseColorSchemeReturn {
  scheme: ColorScheme;
  className: string;
  headerClass: string;
  contentClass: string;
  itemHoverClass: string;
}

export function useColorScheme({ 
  cardId, 
  defaultColor = 'slate' 
}: UseColorSchemeOptions): UseColorSchemeReturn {
  const { getColorScheme, isDarkMode } = useTheme();

  return useMemo(() => {
    const scheme = getColorScheme(cardId, defaultColor);
    
    return {
      scheme,
      className: `bg-gradient-to-br ${scheme.gradient} border-2 ${scheme.border}`,
      headerClass: `border-b ${isDarkMode ? 'border-white/10 bg-black/20' : 'border-white/50 bg-white/30'} backdrop-blur-sm`,
      contentClass: isDarkMode ? 'bg-black/20' : 'bg-white/60',
      itemHoverClass: isDarkMode ? 'hover:bg-black/30' : 'hover:bg-white/80',
    };
  }, [cardId, defaultColor, getColorScheme, isDarkMode]);
}
```

---

## Testing Requirements

```typescript
// src/command-center/core/__tests__/ThemeProvider.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../ThemeProvider';

function TestComponent() {
  const { theme, setTheme, isDarkMode, getColorScheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="dark-mode">{isDarkMode ? 'dark' : 'light'}</span>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
    </div>
  );
}

describe('ThemeProvider', () => {
  it('provides theme context', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme')).toHaveTextContent('system');
  });

  it('allows theme switching', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    fireEvent.click(screen.getByText('Set Dark'));
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
  });

  it('returns correct color scheme', () => {
    // Test getColorScheme function
  });
});
```

---

## Acceptance Criteria

- [ ] ThemeProvider context available throughout app
- [ ] Light/Dark/System theme modes work correctly
- [ ] System preference detection works
- [ ] Dark class applied to document root
- [ ] Color schemes available for all defined colors
- [ ] Card colors persist in localStorage
- [ ] ColorPicker allows color selection
- [ ] DarkModeToggle switches themes
- [ ] CSS variables defined for both modes
- [ ] Smooth transitions between themes
- [ ] useColorScheme hook provides card styling

---

## Handoff

When complete, this module provides:

1. `ThemeProvider` - Context provider
2. `useTheme` - Theme hook
3. `DarkModeToggle` - Theme switcher component
4. `ColorPicker` - Card color picker
5. `useColorScheme` - Card styling hook
6. CSS Variables - Theme tokens

Other agents import:
```typescript
import { ThemeProvider, useTheme, useColorScheme } from '@/command-center/core';
import { DarkModeToggle, ColorPicker } from '@/command-center/components/ui';
```
