import React from 'react';
import { PUBLICATION_BADGES } from '../../types';

interface PublicationBadgeProps {
    publication: keyof typeof PUBLICATION_BADGES;
    size?: 'sm' | 'md' | 'lg';
}

export const PublicationBadge: React.FC<PublicationBadgeProps> = ({ publication, size = 'md' }) => {
    const badge = PUBLICATION_BADGES[publication];

    const sizeClasses = {
        sm: 'text-xs px-1.5 py-0.5',
        md: 'text-sm px-2 py-1',
        lg: 'text-base px-3 py-1.5'
    };

    if (!badge) return null;

    return (
        <span
            className={`font-bold rounded ${sizeClasses[size]} text-white`}
            style={{ backgroundColor: badge.color }}
            title={badge.fullName}
        >
            {badge.label}
        </span>
    );
};
