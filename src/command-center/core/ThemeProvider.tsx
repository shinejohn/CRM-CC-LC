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

export interface ColorScheme {
  gradient: string;
  border: string;
  iconBg: string;
  iconColor: string;
  text: string;
}

// Color Palette Definitions
export const COLOR_PALETTES: Record<string, { light: ColorScheme; dark: ColorScheme }> = {
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

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('cc-theme');
    return (saved as Theme) || 'system';
  });
  
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

  // Save theme preference
  useEffect(() => {
    localStorage.setItem('cc-theme', theme);
  }, [theme]);

  // Load saved card colors from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cc-card-colors');
    if (saved) {
      try {
        setCardColors(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved card colors', e);
      }
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

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const handleSetCardColor = (cardId: string, color: string) => {
    setCardColors((prev) => ({ ...prev, [cardId]: color }));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: handleSetTheme,
        isDarkMode,
        getColorScheme,
        setCardColor: handleSetCardColor,
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

// ColorScheme is already exported above, no need to re-export

