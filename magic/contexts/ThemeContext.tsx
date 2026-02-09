import React, { useEffect, useState, createContext, useContext } from 'react';
export type ColorScheme = {
  name: string;
  gradient: string;
  border: string;
  text: string;
  iconBg: string;
  iconColor: string;
};
export const defaultColorSchemes: Record<string, ColorScheme> = {
  mint: {
    name: 'Mint',
    gradient: 'from-green-200 to-emerald-200',
    border: 'border-green-300',
    text: 'text-green-900',
    iconBg: 'bg-white/50',
    iconColor: 'text-emerald-700'
  },
  sky: {
    name: 'Sky',
    gradient: 'from-blue-200 to-cyan-200',
    border: 'border-blue-300',
    text: 'text-blue-900',
    iconBg: 'bg-white/50',
    iconColor: 'text-blue-700'
  },
  lavender: {
    name: 'Lavender',
    gradient: 'from-purple-200 to-pink-200',
    border: 'border-purple-300',
    text: 'text-purple-900',
    iconBg: 'bg-white/50',
    iconColor: 'text-purple-700'
  },
  peach: {
    name: 'Peach',
    gradient: 'from-orange-200 to-amber-200',
    border: 'border-orange-300',
    text: 'text-orange-900',
    iconBg: 'bg-white/50',
    iconColor: 'text-orange-700'
  },
  rose: {
    name: 'Rose',
    gradient: 'from-pink-200 to-rose-200',
    border: 'border-pink-300',
    text: 'text-pink-900',
    iconBg: 'bg-white/50',
    iconColor: 'text-pink-700'
  },
  sunshine: {
    name: 'Sunshine',
    gradient: 'from-yellow-200 to-amber-200',
    border: 'border-yellow-300',
    text: 'text-yellow-900',
    iconBg: 'bg-white/50',
    iconColor: 'text-yellow-800'
  },
  ocean: {
    name: 'Ocean',
    gradient: 'from-cyan-200 to-blue-200',
    border: 'border-cyan-300',
    text: 'text-cyan-900',
    iconBg: 'bg-white/50',
    iconColor: 'text-cyan-700'
  },
  coral: {
    name: 'Coral',
    gradient: 'from-red-200 to-pink-200',
    border: 'border-red-300',
    text: 'text-red-900',
    iconBg: 'bg-white/50',
    iconColor: 'text-red-700'
  }
};
// Dark mode color schemes
export const darkColorSchemes: Record<string, ColorScheme> = {
  mint: {
    name: 'Mint',
    gradient: 'from-green-900 to-emerald-900',
    border: 'border-green-700',
    text: 'text-green-100',
    iconBg: 'bg-green-800/50',
    iconColor: 'text-emerald-300'
  },
  sky: {
    name: 'Sky',
    gradient: 'from-blue-900 to-cyan-900',
    border: 'border-blue-700',
    text: 'text-blue-100',
    iconBg: 'bg-blue-800/50',
    iconColor: 'text-blue-300'
  },
  lavender: {
    name: 'Lavender',
    gradient: 'from-purple-900 to-pink-900',
    border: 'border-purple-700',
    text: 'text-purple-100',
    iconBg: 'bg-purple-800/50',
    iconColor: 'text-purple-300'
  },
  peach: {
    name: 'Peach',
    gradient: 'from-orange-900 to-amber-900',
    border: 'border-orange-700',
    text: 'text-orange-100',
    iconBg: 'bg-orange-800/50',
    iconColor: 'text-orange-300'
  },
  rose: {
    name: 'Rose',
    gradient: 'from-pink-900 to-rose-900',
    border: 'border-pink-700',
    text: 'text-pink-100',
    iconBg: 'bg-pink-800/50',
    iconColor: 'text-pink-300'
  },
  sunshine: {
    name: 'Sunshine',
    gradient: 'from-yellow-900 to-amber-900',
    border: 'border-yellow-700',
    text: 'text-yellow-100',
    iconBg: 'bg-yellow-800/50',
    iconColor: 'text-yellow-300'
  },
  ocean: {
    name: 'Ocean',
    gradient: 'from-cyan-900 to-blue-900',
    border: 'border-cyan-700',
    text: 'text-cyan-100',
    iconBg: 'bg-cyan-800/50',
    iconColor: 'text-cyan-300'
  },
  coral: {
    name: 'Coral',
    gradient: 'from-red-900 to-pink-900',
    border: 'border-red-700',
    text: 'text-red-100',
    iconBg: 'bg-red-800/50',
    iconColor: 'text-red-300'
  }
};
type CardColorPreferences = Record<string, string>; // cardId -> colorSchemeKey
interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  cardColors: CardColorPreferences;
  setCardColor: (cardId: string, colorKey: string) => void;
  getColorScheme: (cardId: string, defaultColor?: string) => ColorScheme;
}
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
export function ThemeProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [cardColors, setCardColors] = useState<CardColorPreferences>(() => {
    const saved = localStorage.getItem('cardColors');
    return saved ? JSON.parse(saved) : {};
  });
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  useEffect(() => {
    localStorage.setItem('cardColors', JSON.stringify(cardColors));
  }, [cardColors]);
  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };
  const setCardColor = (cardId: string, colorKey: string) => {
    setCardColors(prev => ({
      ...prev,
      [cardId]: colorKey
    }));
  };
  const getColorScheme = (cardId: string, defaultColor = 'sky'): ColorScheme => {
    const colorKey = cardColors[cardId] || defaultColor;
    const schemes = isDarkMode ? darkColorSchemes : defaultColorSchemes;
    return schemes[colorKey] || schemes[defaultColor];
  };
  return <ThemeContext.Provider value={{
    isDarkMode,
    toggleDarkMode,
    cardColors,
    setCardColor,
    getColorScheme
  }}>
      {children}
    </ThemeContext.Provider>;
}
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}