import React from 'react';

interface PriceDisplayProps {
    amount: number;
    frequency: 'monthly' | 'quarterly' | 'annual' | 'one-time' | 'per-event';
    originalAmount?: number;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    minimal?: boolean; // Restoring minimal prop support
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
    amount,
    frequency,
    originalAmount,
    size = 'md',
    className = '',
    minimal = false
}) => {
    const formatFrequency = (freq: string) => {
        switch (freq) {
            case 'monthly': return '/mo';
            case 'quarterly': return '/qtr';
            case 'annual': return '/yr';
            case 'one-time': return '';
            case 'per-event': return '/event';
            default: return '';
        }
    };

    if (minimal) {
        return (
            <span className={className}>
                ${amount}{frequency === 'monthly' ? '/mo' : ''}
            </span>
        );
    }

    const sizeClasses = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-xl font-bold'
    };

    return (
        <div className={`flex items-baseline gap-2 ${className}`}>
            <span className={`${sizeClasses[size]} text-gray-900`}>
                ${amount}
                <span className="text-gray-500 font-normal text-sm">{formatFrequency(frequency)}</span>
            </span>
            {originalAmount && originalAmount > amount && (
                <span className="text-sm text-gray-400 line-through">
                    ${originalAmount}
                </span>
            )}
        </div>
    );
};
