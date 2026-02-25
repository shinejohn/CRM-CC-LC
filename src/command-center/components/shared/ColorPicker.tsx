import React, { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Palette, Check } from 'lucide-react';
import { COLOR_SCHEMES } from '../../lib/command-center-theme';

export interface ColorPickerProps {
    cardId: string;
    defaultColor?: string;
    onColorChange?: (color: string) => void;
    className?: string;
}

export function ColorPicker({
    cardId,
    defaultColor = 'sky',
    onColorChange,
    className = ''
}: ColorPickerProps) {
    const [selectedColor, setSelectedColor] = useState(defaultColor);

    useEffect(() => {
        // Load from localStorage on mount
        const saved = localStorage.getItem(`cc-theme-${cardId}`);
        if (saved && COLOR_SCHEMES[saved]) {
            setSelectedColor(saved);
            if (onColorChange) onColorChange(saved);
        }
    }, [cardId, onColorChange]);

    const handleSelect = (colorKey: string) => {
        setSelectedColor(colorKey);
        localStorage.setItem(`cc-theme-${cardId}`, colorKey);
        if (onColorChange) onColorChange(colorKey);
        // In a real app we might also emit an event or update a global context
        window.dispatchEvent(new Event('cc-theme-update'));
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className={`h-8 w-8 hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${className}`} onClick={(e) => e.stopPropagation()}>
                    <Palette className="w-4 h-4 opacity-70" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4 rounded-xl shadow-xl border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md" align="end" onClick={(e) => e.stopPropagation()}>
                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-1">Customize Card</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Select a theme color for this specific card.</p>
                    </div>
                    <div className="grid grid-cols-5 gap-3">
                        {Object.entries(COLOR_SCHEMES).map(([key, scheme]) => (
                            <button
                                key={key}
                                onClick={() => handleSelect(key)}
                                className={`relative w-8 h-8 rounded-full shadow-sm hover:scale-110 active:scale-95 transition-all ${scheme.iconBg} flex items-center justify-center border border-black/5 dark:border-white/5`}
                                title={key}
                            >
                                <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${scheme.gradient.split(' dark:')[0]}`} />
                                {selectedColor === key && (
                                    <Check className={`absolute w-4 h-4 ${scheme.iconColor} drop-shadow-md z-10`} strokeWidth={3} />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
