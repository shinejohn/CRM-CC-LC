<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ObjectionHandler extends Model
{
    protected $fillable = [
        'objection_type',
        'trigger_phrase',
        'trigger_keywords',
        'response',
        'follow_up',
        'next_action',
        'next_action_params',
        'priority',
        'is_active',
        'industry_specific',
        'success_rate',
        'usage_count',
    ];
    
    protected $casts = [
        'trigger_keywords' => 'array',
        'next_action_params' => 'array',
        'is_active' => 'boolean',
        'industry_specific' => 'array',
    ];
    
    public function encounters(): HasMany
    {
        return $this->hasMany(ObjectionEncounter::class);
    }
    
    /**
     * Check if this handler matches a statement.
     */
    public function matches(string $statement): bool
    {
        $statement = strtolower($statement);
        
        // Check trigger phrase
        if (str_contains($statement, strtolower($this->trigger_phrase))) {
            return true;
        }
        
        // Check keywords
        if ($this->trigger_keywords) {
            foreach ($this->trigger_keywords as $keyword) {
                if (str_contains($statement, strtolower($keyword))) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    /**
     * Record usage and outcome.
     */
    public function recordUsage(bool $success): void
    {
        $this->increment('usage_count');
        
        // Update success rate (simple moving average)
        $currentRate = $this->success_rate ?? 50;
        $newRate = ($currentRate * 0.9) + ($success ? 10 : 0);
        $this->update(['success_rate' => (int) $newRate]);
    }
    
    /**
     * Find matching handler for a statement.
     */
    public static function findMatch(string $statement, ?string $industry = null): ?self
    {
        $handlers = static::where('is_active', true)
            ->orderBy('priority', 'desc')
            ->get();
        
        foreach ($handlers as $handler) {
            // Check industry filter
            if ($handler->industry_specific && $industry) {
                if (!in_array($industry, $handler->industry_specific)) {
                    continue;
                }
            }
            
            if ($handler->matches($statement)) {
                return $handler;
            }
        }
        
        return null;
    }
}

