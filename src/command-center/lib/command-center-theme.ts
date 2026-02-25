export interface ColorScheme {
    gradient: string;
    border: string;
    iconBg: string;
    iconColor: string;
    text: string;
}

export const COLOR_SCHEMES: Record<string, ColorScheme> = {
    mint: { gradient: 'from-emerald-50 to-emerald-100/50 dark:from-emerald-900/40 dark:to-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', iconBg: 'bg-emerald-100 dark:bg-emerald-900/50', iconColor: 'text-emerald-700 dark:text-emerald-400', text: 'text-emerald-900 dark:text-emerald-100' },
    lavender: { gradient: 'from-purple-50 to-purple-100/50 dark:from-purple-900/40 dark:to-purple-900/20', border: 'border-purple-200 dark:border-purple-800', iconBg: 'bg-purple-100 dark:bg-purple-900/50', iconColor: 'text-purple-700 dark:text-purple-400', text: 'text-purple-900 dark:text-purple-100' },
    sky: { gradient: 'from-sky-50 to-sky-100/50 dark:from-sky-900/40 dark:to-sky-900/20', border: 'border-sky-200 dark:border-sky-800', iconBg: 'bg-sky-100 dark:bg-sky-900/50', iconColor: 'text-sky-700 dark:text-sky-400', text: 'text-sky-900 dark:text-sky-100' },
    rose: { gradient: 'from-rose-50 to-rose-100/50 dark:from-rose-900/40 dark:to-rose-900/20', border: 'border-rose-200 dark:border-rose-800', iconBg: 'bg-rose-100 dark:bg-rose-900/50', iconColor: 'text-rose-700 dark:text-rose-400', text: 'text-rose-900 dark:text-rose-100' },
    peach: { gradient: 'from-orange-50 to-orange-100/50 dark:from-orange-900/40 dark:to-orange-900/20', border: 'border-orange-200 dark:border-orange-800', iconBg: 'bg-orange-100 dark:bg-orange-900/50', iconColor: 'text-orange-700 dark:text-orange-400', text: 'text-orange-900 dark:text-orange-100' },
    ocean: { gradient: 'from-cyan-50 to-cyan-100/50 dark:from-cyan-900/40 dark:to-cyan-900/20', border: 'border-cyan-200 dark:border-cyan-800', iconBg: 'bg-cyan-100 dark:bg-cyan-900/50', iconColor: 'text-cyan-700 dark:text-cyan-400', text: 'text-cyan-900 dark:text-cyan-100' },
    sunshine: { gradient: 'from-amber-50 to-amber-100/50 dark:from-amber-900/40 dark:to-amber-900/20', border: 'border-amber-200 dark:border-amber-800', iconBg: 'bg-amber-100 dark:bg-amber-900/50', iconColor: 'text-amber-700 dark:text-amber-400', text: 'text-amber-900 dark:text-amber-100' },
    coral: { gradient: 'from-red-50 to-red-100/50 dark:from-red-900/40 dark:to-red-900/20', border: 'border-red-200 dark:border-red-800', iconBg: 'bg-red-100 dark:bg-red-900/50', iconColor: 'text-red-700 dark:text-red-400', text: 'text-red-900 dark:text-red-100' },
    violet: { gradient: 'from-violet-50 to-violet-100/50 dark:from-violet-900/40 dark:to-violet-900/20', border: 'border-violet-200 dark:border-violet-800', iconBg: 'bg-violet-100 dark:bg-violet-900/50', iconColor: 'text-violet-700 dark:text-violet-400', text: 'text-violet-900 dark:text-violet-100' },
};

export function getCardStyle(colorName: string, isDarkMode: boolean) {
    const scheme = COLOR_SCHEMES[colorName] || COLOR_SCHEMES['sky'];
    return {
        className: `h-full bg-gradient-to-br ${scheme.gradient} border-2 ${scheme.border} overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer rounded-xl drop-shadow-sm`,
        headerClass: `p-5 flex items-center justify-between border-b ${isDarkMode ? 'border-white/10 bg-black/20' : 'border-white/50 bg-white/30'} backdrop-blur-sm`,
        iconBg: scheme.iconBg,
        iconColor: scheme.iconColor,
        textClass: scheme.text,
        contentBg: isDarkMode ? 'bg-black/20' : 'bg-white/60',
        itemHover: isDarkMode ? 'hover:bg-black/30' : 'hover:bg-white/80'
    };
}
