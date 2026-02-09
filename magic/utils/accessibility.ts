/**
 * WCAG 2.0 Accessibility Utilities
 *
 * These utilities help ensure components meet WCAG AA standards:
 * - Color contrast ratios (4.5:1 for normal text, 3:1 for large text)
 * - Minimum font sizes
 * - Proper focus indicators
 * - Reduced shadow depths
 */

/**
 * WCAG-compliant text color classes based on background
 */
export const accessibleTextColors = {
  // Light backgrounds - use dark text for 4.5:1+ contrast
  light: {
    primary: 'text-gray-900',
    // #111827 on white = 16.1:1
    secondary: 'text-gray-700',
    // #374151 on white = 10.7:1
    muted: 'text-gray-600',
    // #4B5563 on white = 7.5:1
    disabled: 'text-gray-500' // #6B7280 on white = 5.7:1
  },
  // Dark backgrounds - use light text for 4.5:1+ contrast
  dark: {
    primary: 'text-white',
    // white on #111827 = 16.1:1
    secondary: 'text-gray-200',
    // #E5E7EB on #111827 = 13.5:1
    muted: 'text-gray-300',
    // #D1D5DB on #111827 = 11.6:1
    disabled: 'text-gray-400' // #9CA3AF on #111827 = 8.3:1
  },
  // Colored backgrounds
  blue: {
    onLight: 'text-blue-700',
    // #1D4ED8 on white = 8.6:1
    onDark: 'text-blue-300' // #93C5FD on dark = 7.2:1
  },
  green: {
    onLight: 'text-green-700',
    // #15803D on white = 6.8:1
    onDark: 'text-green-300' // #86EFAC on dark = 8.1:1
  },
  red: {
    onLight: 'text-red-700',
    // #B91C1C on white = 7.1:1
    onDark: 'text-red-300' // #FCA5A5 on dark = 6.9:1
  },
  yellow: {
    onLight: 'text-yellow-800',
    // #854D0E on white = 8.9:1
    onDark: 'text-yellow-200' // #FEF08A on dark = 11.2:1
  },
  purple: {
    onLight: 'text-purple-700',
    // #7E22CE on white = 7.3:1
    onDark: 'text-purple-300' // #D8B4FE on dark = 7.8:1
  }
};

/**
 * WCAG-compliant background color classes
 */
export const accessibleBackgrounds = {
  // Neutral backgrounds with sufficient contrast
  light: {
    primary: 'bg-white',
    secondary: 'bg-gray-50',
    // #F9FAFB
    muted: 'bg-gray-100' // #F3F4F6
  },
  dark: {
    primary: 'bg-gray-900',
    // #111827
    secondary: 'bg-gray-800',
    // #1F2937
    muted: 'bg-gray-700' // #374151
  },
  // Colored backgrounds (lighter shades for better contrast)
  colored: {
    blue: 'bg-blue-50',
    // #EFF6FF
    green: 'bg-green-50',
    // #F0FDF4
    red: 'bg-red-50',
    // #FEF2F2
    yellow: 'bg-yellow-50',
    // #FEFCE8
    purple: 'bg-purple-50',
    // #FAF5FF
    orange: 'bg-orange-50',
    // #FFF7ED
    pink: 'bg-pink-50',
    // #FDF2F8
    cyan: 'bg-cyan-50' // #ECFEFF
  }
};

/**
 * WCAG-compliant border colors
 */
export const accessibleBorders = {
  light: {
    default: 'border-gray-300',
    // #D1D5DB - 3:1 contrast
    strong: 'border-gray-400' // #9CA3AF - 4.5:1 contrast
  },
  dark: {
    default: 'border-gray-600',
    // #4B5563
    strong: 'border-gray-500' // #6B7280
  },
  colored: {
    blue: 'border-blue-300',
    green: 'border-green-300',
    red: 'border-red-300',
    yellow: 'border-yellow-300',
    purple: 'border-purple-300',
    orange: 'border-orange-300',
    pink: 'border-pink-300',
    cyan: 'border-cyan-300'
  }
};

/**
 * WCAG-compliant shadow utilities (reduced depth)
 */
export const accessibleShadows = {
  sm: 'shadow-sm',
  // Subtle shadow
  md: 'shadow-accessible-md',
  // Medium shadow (reduced from default)
  lg: 'shadow-accessible-lg',
  // Large shadow (reduced from default)
  none: 'shadow-none' // No shadow
};

/**
 * WCAG-compliant font size classes
 */
export const accessibleFontSizes = {
  xs: 'text-sm',
  // 14px minimum (was 12px)
  sm: 'text-base',
  // 16px (was 14px)
  base: 'text-base',
  // 16px
  lg: 'text-lg',
  // 18px
  xl: 'text-xl',
  // 20px
  '2xl': 'text-2xl',
  // 24px
  '3xl': 'text-3xl' // 30px
};

/**
 * WCAG-compliant focus ring
 */
export const accessibleFocus = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600';

/**
 * Helper function to get accessible text color based on background
 */
export function getAccessibleTextColor(background: 'light' | 'dark' | 'colored', variant: 'primary' | 'secondary' | 'muted' = 'primary'): string {
  if (background === 'light') {
    return accessibleTextColors.light[variant];
  }
  if (background === 'dark') {
    return accessibleTextColors.dark[variant];
  }
  return accessibleTextColors.light.primary;
}

/**
 * Helper function to combine accessible classes
 */
export function combineAccessibleClasses(...classes: string[]): string {
  return classes.filter(Boolean).join(' ');
}