import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Check } from 'lucide-react';
import { useTheme, COLOR_PALETTES } from '../../core/ThemeProvider';

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
        aria-label="Change card color"
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
                      aria-label={`Select ${color} color`}
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

