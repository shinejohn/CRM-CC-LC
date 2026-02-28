import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Check } from 'lucide-react';
import { useTheme, defaultColorSchemes, darkColorSchemes } from '../contexts/ThemeContext';
interface ColorPickerProps {
  cardId: string;
  currentColor?: string;
}
export function ColorPicker({
  cardId,
  currentColor
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    isDarkMode,
    setCardColor,
    getColorScheme
  } = useTheme();
  const schemes = isDarkMode ? darkColorSchemes : defaultColorSchemes;
  const currentScheme = getColorScheme(cardId, currentColor);
  const handleColorSelect = (colorKey: string) => {
    setCardColor(cardId, colorKey);
    setIsOpen(false);
  };
  return <div className="relative">
      <button onClick={e => {
      e.stopPropagation();
      setIsOpen(!isOpen);
    }} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-black/5 text-gray-600'}`} aria-label="Change card color">
        <Palette className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {isOpen && <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

            {/* Color picker dropdown */}
            <motion.div initial={{
          opacity: 0,
          scale: 0.95,
          y: -10
        }} animate={{
          opacity: 1,
          scale: 1,
          y: 0
        }} exit={{
          opacity: 0,
          scale: 0.95,
          y: -10
        }} transition={{
          duration: 0.15
        }} className={`absolute right-0 top-full mt-2 p-3 rounded-xl shadow-2xl border-2 z-50 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`} style={{
          minWidth: '200px'
        }}>
              <p className={`text-xs font-bold uppercase tracking-wide mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Choose Color
              </p>

              <div className="grid grid-cols-4 gap-2">
                {Object.entries(schemes).map(([key, scheme]) => {
              const isSelected = currentScheme.name === scheme.name;
              return <button key={key} onClick={e => {
                e.stopPropagation();
                handleColorSelect(key);
              }} className={`relative w-10 h-10 rounded-lg bg-gradient-to-br ${scheme.gradient} border-2 ${isSelected ? scheme.border : 'border-transparent'} hover:scale-110 transition-transform shadow-sm`} title={scheme.name}>
                      {isSelected && <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md">
                            <Check className="w-3 h-3 text-gray-800" />
                          </div>
                        </div>}
                    </button>;
            })}
              </div>
            </motion.div>
          </>}
      </AnimatePresence>
    </div>;
}