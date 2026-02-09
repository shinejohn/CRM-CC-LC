<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class AiPersonality extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'name',
        'slug',
        'description',
        'identity',
        'persona_description',
        'communication_style',
        'traits',
        'expertise_areas',
        'can_email',
        'can_call',
        'can_sms',
        'can_chat',
        'contact_email',
        'contact_phone',
        'system_prompt',
        'greeting_message',
        'custom_instructions',
        'ai_model',
        'temperature',
        'active_hours',
        'working_days',
        'timezone',
        'is_active',
        'priority',
        'metadata',
        'notes',
        // New fields for AM enhancements
        'dedicated_phone',
        'dedicated_email',
        'dedicated_sms',
        'voicemail_greeting_url',
        'industry_specializations',
        'industry_match_weight',
        'personality_traits',
        'system_prompt_override',
        'max_active_customers',
        'current_customer_count',
        'avg_response_time_hours',
        'customer_satisfaction_score',
        'total_interactions',
        'successful_conversions',
    ];

    protected function casts(): array
    {
        return [
            'traits' => 'array',
            'expertise_areas' => 'array',
            'custom_instructions' => 'array',
            'active_hours' => 'array',
            'working_days' => 'array',
            'metadata' => 'array',
            'can_email' => 'boolean',
            'can_call' => 'boolean',
            'can_sms' => 'boolean',
            'can_chat' => 'boolean',
            'is_active' => 'boolean',
            'priority' => 'integer',
            'temperature' => 'decimal:2',
            // New casts
            'industry_specializations' => 'array',
            'personality_traits' => 'array',
            'is_available' => 'boolean',
        ];
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(PersonalityAssignment::class, 'personality_id');
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(PersonalityConversation::class, 'personality_id');
    }

    public function activeAssignments(): HasMany
    {
        return $this->hasMany(PersonalityAssignment::class, 'personality_id')
            ->where('status', 'active');
    }
    
    public function dialogExecutions(): HasMany
    {
        return $this->hasMany(DialogExecution::class, 'ai_personality_id');
    }
    
    public function customers(): BelongsToMany
    {
        return $this->belongsToMany(Customer::class, 'personality_assignments', 'personality_id', 'customer_id')
            ->withPivot('assigned_at', 'status')
            ->withTimestamps();
    }
    
    /**
     * Check if AM specializes in a given industry.
     */
    public function specializesIn(string $industry): bool
    {
        $specializations = $this->industry_specializations ?? [];
        if (empty($specializations)) {
            // Fallback to expertise_areas if industry_specializations not set
            $specializations = $this->expertise_areas ?? [];
        }
        return in_array(strtolower($industry), array_map('strtolower', $specializations));
    }
    
    /**
     * Calculate match score for a customer.
     */
    public function calculateMatchScore(Customer $customer): int
    {
        $score = 0;
        
        // Industry match
        $industry = $customer->business_type ?? $customer->industry_category ?? null;
        if ($industry && $this->specializesIn($industry)) {
            $score += $this->industry_match_weight ?? 10;
        }
        
        // Availability bonus
        if ($this->is_available && $this->current_customer_count < ($this->max_active_customers ?? 100)) {
            $score += 5;
        }
        
        // Performance bonus
        if ($this->customer_satisfaction_score && $this->customer_satisfaction_score >= 4.0) {
            $score += 3;
        }
        
        return $score;
    }
    
    /**
     * Check if AM has capacity for new customers.
     */
    public function hasCapacity(): bool
    {
        return ($this->is_available ?? $this->is_active) && 
               ($this->current_customer_count ?? 0) < ($this->max_active_customers ?? 100);
    }
    
    /**
     * Increment customer count.
     */
    public function assignCustomer(): void
    {
        $this->increment('current_customer_count');
    }
    
    /**
     * Decrement customer count.
     */
    public function unassignCustomer(): void
    {
        $this->decrement('current_customer_count');
    }
    
    /**
     * Record a successful conversion.
     */
    public function recordConversion(): void
    {
        $this->increment('successful_conversions');
        $this->increment('total_interactions');
    }
    
    /**
     * Get the system prompt for AI generation.
     */
    public function getSystemPrompt(): string
    {
        if ($this->system_prompt_override) {
            return $this->system_prompt_override;
        }
        
        // Use existing system_prompt if available
        if ($this->system_prompt) {
            return $this->system_prompt;
        }
        
        $traits = $this->personality_traits ?? $this->traits ?? [];
        $traitString = !empty($traits) ? implode(', ', $traits) : 'friendly, professional, helpful';
        
        return "You are {$this->name}, an AI Account Manager. Your personality is {$traitString}. " .
               "You help small businesses grow through local marketing and community engagement. " .
               "Always be helpful, knowledgeable about local marketing, and focused on the customer's success.";
    }
    
    /**
     * Find best available AM for a customer.
     */
    public static function findBestMatch(Customer $customer): ?self
    {
        $personalities = static::where(function($q) {
                $q->where('is_available', true)
                  ->orWhere('is_active', true);
            })
            ->whereRaw('COALESCE(current_customer_count, 0) < COALESCE(max_active_customers, 100)')
            ->get();
        
        if ($personalities->isEmpty()) {
            return static::where('is_active', true)->first();
        }
        
        return $personalities->sortByDesc(fn($p) => $p->calculateMatchScore($customer))->first();
    }

    /**
     * Check if personality can handle contact type
     */
    public function canHandle(string $contactType): bool
    {
        return match($contactType) {
            'email' => $this->can_email,
            'call', 'phone' => $this->can_call,
            'sms', 'text' => $this->can_sms,
            'chat', 'message' => $this->can_chat,
            default => false,
        };
    }

    /**
     * Get full system prompt with personality context
     */
    public function getFullSystemPrompt(array $additionalContext = []): string
    {
        $prompt = $this->system_prompt;
        
        // Add personality identity
        $prompt .= "\n\nYou are {$this->identity}.";
        
        // Add persona description
        if ($this->persona_description) {
            $prompt .= "\n\n{$this->persona_description}";
        }
        
        // Add communication style
        if ($this->communication_style) {
            $prompt .= "\n\nCommunication Style: {$this->communication_style}";
        }
        
        // Add traits
        if ($this->traits && count($this->traits) > 0) {
            $prompt .= "\n\nPersonality Traits: " . implode(', ', $this->traits);
        }
        
        // Add expertise
        if ($this->expertise_areas && count($this->expertise_areas) > 0) {
            $prompt .= "\n\nAreas of Expertise: " . implode(', ', $this->expertise_areas);
        }
        
        // Add custom instructions
        if ($this->custom_instructions) {
            foreach ($this->custom_instructions as $instruction) {
                $prompt .= "\n\n{$instruction}";
            }
        }
        
        // Add additional context
        if (!empty($additionalContext)) {
            $prompt .= "\n\nAdditional Context: " . json_encode($additionalContext, JSON_PRETTY_PRINT);
        }
        
        return $prompt;
    }

    /**
     * Check if personality is currently active (based on time and day)
     */
    public function isCurrentlyActive(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        $now = now($this->timezone);
        $currentDay = strtolower($now->format('l')); // e.g., 'monday'
        $currentHour = $now->hour;

        // Check working days
        if ($this->working_days && !in_array($currentDay, $this->working_days)) {
            return false;
        }

        // Check active hours
        if ($this->active_hours) {
            $startHour = $this->active_hours['start'] ?? 0;
            $endHour = $this->active_hours['end'] ?? 23;
            
            if ($currentHour < $startHour || $currentHour >= $endHour) {
                return false;
            }
        }

        return true;
    }
}
