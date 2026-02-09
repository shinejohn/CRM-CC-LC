import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ScarcityBadgeProps {
    slotsRemaining: number;
    category: string;
}

export const ScarcityBadge: React.FC<ScarcityBadgeProps> = ({ slotsRemaining, category }) => {
    if (slotsRemaining > 5) return null;

    return (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm font-medium">
            <AlertCircle size={16} />
            <span>
                Only {slotsRemaining} spots left in "{category}"!
            </span>
        </div>
    );
};
