import React from 'react';
import { Sparkles } from 'lucide-react';

interface AISuggestionBoxProps {
    accountManager: {
        name: string;
        avatar: string;
    };
    message: string;
    actions?: Array<{
        label: string;
        action: () => void;
    }>;
}

export const AISuggestionBox: React.FC<AISuggestionBoxProps> = ({ accountManager, message, actions }) => {
    return (
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-300 rounded-xl p-6 relative">
            <div className="absolute -top-4 -left-4 bg-white rounded-full p-1 border-2 border-amber-300 shadow-sm">
                <img
                    src={accountManager.avatar || `https://ui-avatars.com/api/?name=${accountManager.name}`}
                    alt={accountManager.name}
                    className="w-12 h-12 rounded-full"
                />
            </div>

            <div className="ml-8">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={16} className="text-amber-500" />
                    <span className="text-sm font-bold text-amber-800 uppercase tracking-wide">
                        {accountManager.name}'s Suggestion
                    </span>
                </div>

                <p className="text-gray-800 italic mb-4 text-lg">
                    "{message}"
                </p>

                {actions && actions.length > 0 && (
                    <div className="flex gap-3">
                        {actions.map((action, index) => (
                            <button
                                key={index}
                                onClick={action.action}
                                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors shadow-sm"
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
