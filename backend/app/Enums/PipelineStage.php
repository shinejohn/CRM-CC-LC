<?php

namespace App\Enums;

enum PipelineStage: string
{
    case HOOK = 'hook';
    case ENGAGEMENT = 'engagement';
    case SALES = 'sales';
    case RETENTION = 'retention';
    case CHURNED = 'churned';
    
    public function label(): string
    {
        return match($this) {
            self::HOOK => 'Hook (Trial)',
            self::ENGAGEMENT => 'Engagement',
            self::SALES => 'Sales',
            self::RETENTION => 'Retention',
            self::CHURNED => 'Churned',
        };
    }
    
    public function color(): string
    {
        return match($this) {
            self::HOOK => 'blue',
            self::ENGAGEMENT => 'yellow',
            self::SALES => 'orange',
            self::RETENTION => 'green',
            self::CHURNED => 'gray',
        };
    }
    
    public function nextStage(): ?self
    {
        return match($this) {
            self::HOOK => self::ENGAGEMENT,
            self::ENGAGEMENT => self::SALES,
            self::SALES => self::RETENTION,
            self::RETENTION => null,
            self::CHURNED => null,
        };
    }
    
    public static function orderedStages(): array
    {
        return [
            self::HOOK,
            self::ENGAGEMENT,
            self::SALES,
            self::RETENTION,
        ];
    }
}

