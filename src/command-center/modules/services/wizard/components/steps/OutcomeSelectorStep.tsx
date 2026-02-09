import React from 'react';
import { Search, Target, Star, Calendar, MessageCircle, Bot, Check, ArrowRight } from 'lucide-react';
import { OUTCOMES, Outcome } from '../../types';
import { AISuggestionBox } from '../shared';

interface OutcomeSelectorStepProps {
    selectedOutcome: string | null;
    onSelectOutcome: (outcomeId: string) => void;
    onNext: () => void;
    accountManager: {
        name: string;
        avatar: string;
    };
    businessType: string;
}

const IconMap: Record<string, React.FC<any>> = {
    Search,
    Target,
    Star,
    Calendar,
    MessageCircle,
    Bot
};

export const OutcomeSelectorStep: React.FC<OutcomeSelectorStepProps> = ({
    selectedOutcome,
    onSelectOutcome,
    onNext,
    accountManager,
    businessType
}) => {
    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-gray-900">What do you want to achieve?</h2>
                <p className="text-lg text-gray-600">Select your goal and we'll show you the best services.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {OUTCOMES.map((outcome) => {
                    const Icon = IconMap[outcome.icon] || Star;
                    const isSelected = selectedOutcome === outcome.id;

                    return (
                        <div
                            key={outcome.id}
                            onClick={() => onSelectOutcome(outcome.id)}
                            className={`
                relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300
                hover:shadow-lg hover:-translate-y-1
                ${isSelected
                                    ? 'border-indigo-600 bg-indigo-50 shadow-md'
                                    : 'border-gray-200 bg-white hover:border-indigo-200'
                                }
              `}
                        >
                            {isSelected && (
                                <div className="absolute top-4 right-4 bg-indigo-600 text-white p-1 rounded-full">
                                    <Check size={16} />
                                </div>
                            )}

                            {outcome.badge && (
                                <div className="absolute -top-3 left-6 px-3 py-1 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-bold rounded-full shadow-sm">
                                    ★ {outcome.badge}
                                </div>
                            )}

                            <div className={`mb-4 w-12 h-12 rounded-lg flex items-center justify-center ${isSelected ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}>
                                <Icon size={28} />
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-2">{outcome.title}</h3>
                            <p className="text-gray-600 mb-4 h-12">{outcome.description}</p>

                            <div className="text-sm font-medium text-gray-500">
                                {outcome.serviceCount} services
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedOutcome && ( // Only show suggestion if user has made a selection or maybe always? The prompt implies it appears. 
                // Actually the prompt says "AI suggestion box appears based on business type". 
                // But usually suggestions are static or reactive. Let's make it always visible if logic permits, or just static for now.
                <div className="mt-8">
                    <AISuggestionBox
                        accountManager={accountManager}
                        message={`Since you run a ${businessType}, I recommend starting with 'Promote Events & Offers' to drive immediate traffic, then adding 'Get Found' services for long-term visibility.`}
                        actions={[
                            {
                                label: "Show Me Restaurant Recommendations",
                                action: () => onSelectOutcome('events') // Example action
                            }
                        ]}
                    />
                </div>
            )}

            <div className="flex justify-end pt-8">
                <button
                    onClick={onNext}
                    disabled={!selectedOutcome}
                    className={`
            flex items-center gap-2 px-8 py-4 rounded-lg text-lg font-semibold transition-all
            ${selectedOutcome
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }
          `}
                >
                    Continue
                    <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
};
