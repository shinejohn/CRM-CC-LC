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

