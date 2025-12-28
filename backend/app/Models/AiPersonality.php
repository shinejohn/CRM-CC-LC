<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
