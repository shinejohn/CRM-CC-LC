import { useState, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAI } from '../../hooks/useAI';
import { aiService } from '../../services/ai.service';
import { AIPersonality } from '../../services/ai.types';

export function AIPersonalitySelector() {
  const [personalities, setPersonalities] = useState<AIPersonality[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { currentPersonality, setPersonality } = useAI();

  useEffect(() => {
    aiService.getPersonalities()
      .then(setPersonalities)
      .catch(err => console.error('Failed to load personalities:', err));
  }, []);

  const handleSelect = async (personalityId: string) => {
    await setPersonality(personalityId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <span className="text-sm">
          {currentPersonality?.name || 'Select Personality'}
        </span>
        <ChevronDown className="w-4 h-4" />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg z-20">
            <div className="p-2">
              {personalities.map((personality) => (
                <button
                  key={personality.id}
                  onClick={() => handleSelect(personality.id)}
                  className={`
                    w-full text-left px-3 py-2 rounded-md text-sm
                    hover:bg-gray-100 dark:hover:bg-slate-700
                    flex items-center justify-between
                    ${currentPersonality?.id === personality.id ? 'bg-purple-50 dark:bg-purple-900/20' : ''}
                  `}
                >
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {personality.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-slate-400">
                      {personality.description}
                    </div>
                  </div>
                  {currentPersonality?.id === personality.id && (
                    <Check className="w-4 h-4 text-purple-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

