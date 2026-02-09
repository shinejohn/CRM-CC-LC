<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InteractionTemplate extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'name',
        'slug',
        'description',
        'steps',
        'is_active',
        'is_default',
    ];

    protected $casts = [
        'steps' => 'array',
        'is_active' => 'boolean',
        'is_default' => 'boolean',
    ];

    /**
     * Get the first step in the template
     */
    public function getFirstStep(): ?array
    {
        if (empty($this->steps)) {
            return null;
        }

        // Find step with step_number = 1 or lowest step_number
        $firstStep = collect($this->steps)->sortBy('step_number')->first();
        
        return $firstStep ?: null;
    }

    /**
     * Get the next step after a given step number
     */
    public function getNextStep(int $currentStepNumber): ?array
    {
        if (empty($this->steps)) {
            return null;
        }

        $nextStepNumber = $currentStepNumber + 1;
        
        return collect($this->steps)->firstWhere('step_number', $nextStepNumber);
    }

    /**
     * Validate template steps structure
     */
    public function validateSteps(): bool
    {
        if (empty($this->steps) || !is_array($this->steps)) {
            return false;
        }

        foreach ($this->steps as $step) {
            if (!isset($step['step_number']) || !isset($step['type']) || !isset($step['title'])) {
                return false;
            }
        }

        return true;
    }
}

