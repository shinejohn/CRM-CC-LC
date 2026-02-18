<?php

namespace App\Enums;

enum DealStage: string
{
    case HOOK = 'hook';
    case ENGAGEMENT = 'engagement';
    case SALES = 'sales';
    case RETENTION = 'retention';
    case WON = 'won';
    case LOST = 'lost';

    public function label(): string
    {
        return match ($this) {
            self::HOOK => 'Hook',
            self::ENGAGEMENT => 'Engagement',
            self::SALES => 'Sales',
            self::RETENTION => 'Retention',
            self::WON => 'Won',
            self::LOST => 'Lost',
        };
    }

    public function probability(): int
    {
        return match ($this) {
            self::HOOK => 10,
            self::ENGAGEMENT => 30,
            self::SALES => 60,
            self::RETENTION => 80,
            self::WON => 100,
            self::LOST => 0,
        };
    }

    public static function pipelineStages(): array
    {
        return [self::HOOK, self::ENGAGEMENT, self::SALES, self::RETENTION];
    }

    public function isTerminal(): bool
    {
        return $this === self::WON || $this === self::LOST;
    }
}
