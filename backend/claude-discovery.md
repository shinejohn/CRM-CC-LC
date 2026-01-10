# Laravel Discovery: backend
Generated: Sun Dec 28 16:46:41 EST 2025
Path: /Users/johnshine/Dropbox/Fibonacco/Learning-Center/backend

---
## Models

### AdTemplate
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdTemplate extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'name',
        'slug',
        'platform',
        'ad_type',
        'description',
        'structure',
        'prompt_template',
        'variables',
        'specs',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'structure' => 'array',
            'variables' => 'array',
            'specs' => 'array',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Render template with variables
     */
    public function renderPrompt(array $variables): string
    {
        if (!$this->prompt_template) {
            return '';
        }

        $prompt = $this->prompt_template;

        foreach ($variables as $key => $value) {
            $placeholder = "{{{$key}}}";
            $prompt = str_replace($placeholder, $value, $prompt);
        }

        return $prompt;
    }
}
```

### AiPersonality
```php
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
```

### Article
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'title',
        'slug',
        'excerpt',
        'content',
        'featured_image',
        'category',
        'status',
        'published_at',
        'is_ai_generated',
        'view_count',
        'created_by',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'is_ai_generated' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}






```

### CampaignRecipient
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CampaignRecipient extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'campaign_id',
        'customer_id',
        'tenant_id',
        'email',
        'phone',
        'name',
        'status',
        'sent_at',
        'delivered_at',
        'opened_at',
        'clicked_at',
        'replied_at',
        'answered_at',
        'duration_seconds',
        'external_id',
        'error_message',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'sent_at' => 'datetime',
            'delivered_at' => 'datetime',
            'opened_at' => 'datetime',
            'clicked_at' => 'datetime',
            'replied_at' => 'datetime',
            'answered_at' => 'datetime',
            'duration_seconds' => 'integer',
        ];
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(OutboundCampaign::class, 'campaign_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isSent(): bool
    {
        return in_array($this->status, ['sent', 'delivered', 'opened', 'clicked', 'replied', 'answered', 'voicemail']);
    }

    public function isFailed(): bool
    {
        return in_array($this->status, ['failed', 'bounced']);
    }
}
```

### ContentTemplate
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContentTemplate extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'name',
        'slug',
        'type',
        'description',
        'prompt_template',
        'variables',
        'structure',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'variables' => 'array',
            'structure' => 'array',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Render template with variables
     */
    public function renderPrompt(array $variables): string
    {
        $prompt = $this->prompt_template;

        foreach ($variables as $key => $value) {
            $placeholder = "{{{$key}}}";
            $prompt = str_replace($placeholder, $value, $prompt);
        }

        return $prompt;
    }
}
```

### ContentVersion
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContentVersion extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'content_id',
        'tenant_id',
        'version_number',
        'title',
        'content',
        'excerpt',
        'metadata',
        'created_by',
        'change_notes',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'version_number' => 'integer',
        ];
    }

    public function content(): BelongsTo
    {
        return $this->belongsTo(GeneratedContent::class, 'content_id');
    }
}
```

### ContentWorkflowHistory
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContentWorkflowHistory extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'content_id',
        'tenant_id',
        'action',
        'from_status',
        'to_status',
        'performed_by',
        'notes',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }

    public function content(): BelongsTo
    {
        return $this->belongsTo(GeneratedContent::class, 'content_id');
    }
}
```

### Conversation
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Conversation extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'tenant_id',
        'customer_id',
        'session_id',
        'entry_point',
        'template_id',
        'slide_at_start',
        'presenter_id',
        'human_rep_id',
        'messages',
        'topics_discussed',
        'questions_asked',
        'objections_raised',
        'sentiment_trajectory',
        'new_data_collected',
        'faqs_generated',
        'outcome',
        'outcome_details',
        'followup_needed',
        'followup_scheduled_at',
        'followup_notes',
        'started_at',
        'ended_at',
        'duration_seconds',
        'user_agent',
        'ip_address',
    ];

    protected $casts = [
        'messages' => 'array',
        'topics_discussed' => 'array',
        'questions_asked' => 'array',
        'objections_raised' => 'array',
        'sentiment_trajectory' => 'array',
        'new_data_collected' => 'array',
        'faqs_generated' => 'array',
        'followup_needed' => 'boolean',
        'followup_scheduled_at' => 'datetime',
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
        'duration_seconds' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($conversation) {
            if (empty($conversation->id)) {
                $conversation->id = (string) Str::uuid();
            }
            if (empty($conversation->session_id)) {
                $conversation->session_id = 'session_' . Str::random(32);
            }
        });
    }

    /**
     * Get the customer this conversation belongs to
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get all messages in this conversation
     */
    public function conversationMessages(): HasMany
    {
        return $this->hasMany(ConversationMessage::class);
    }

    /**
     * Calculate and set duration when conversation ends
     */
    public function end(): void
    {
        $this->ended_at = now();
        if ($this->started_at) {
            $this->duration_seconds = $this->started_at->diffInSeconds($this->ended_at);
        }
        $this->save();
    }
    
    /**
     * Get formatted duration
     */
    public function getFormattedDurationAttribute(): string
    {
        if (!$this->duration_seconds) {
            return 'N/A';
        }
        
        $minutes = floor($this->duration_seconds / 60);
        $seconds = $this->duration_seconds % 60;
        
        if ($minutes > 0) {
            return "{$minutes}m {$seconds}s";
        }
        return "{$seconds}s";
    }
}
```

### ConversationMessage
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class ConversationMessage extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'conversation_id',
        'role',
        'content',
        'tokens_used',
        'model_used',
        'response_time_ms',
        'actions_triggered',
        'timestamp',
    ];

    protected $casts = [
        'actions_triggered' => 'array',
        'tokens_used' => 'integer',
        'response_time_ms' => 'integer',
        'timestamp' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($message) {
            if (empty($message->id)) {
                $message->id = (string) Str::uuid();
            }
            if (empty($message->timestamp)) {
                $message->timestamp = now();
            }
        });
    }

    /**
     * Get the conversation this message belongs to
     */
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }
}
```

### Customer
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

/**
 * @method static \Illuminate\Database\Eloquent\Builder|Customer newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Customer newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Customer query()
 */

class Customer extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'tenant_id',
        'slug',
        'external_id',
        'business_name',
        'owner_name',
        'industry_id',
        'sub_category',
        'phone',
        'email',
        'website',
        'address_line1',
        'address_line2',
        'city',
        'state',
        'zip',
        'country',
        'timezone',
        'hours',
        'services',
        'social_media',
        'pos_system',
        'current_integrations',
        'google_rating',
        'google_review_count',
        'yelp_rating',
        'yelp_review_count',
        'established_year',
        'employee_count',
        'annual_revenue_range',
        'challenges',
        'goals',
        'competitors',
        'unique_selling_points',
        'unknown_fields',
        'lead_source',
        'lead_score',
        'subscription_tier',
        'first_contact_at',
        'onboarded_at',
        'assigned_rep',
        'notes',
        'tags',
        // AI-First CRM fields
        'industry_category',
        'industry_subcategory',
        'business_description',
        'products_services',
        'target_audience',
        'business_hours',
        'service_area',
        'brand_voice',
        'content_preferences',
        'contact_preferences',
    ];

    protected $casts = [
        'hours' => 'array',
        'services' => 'array',
        'social_media' => 'array',
        'current_integrations' => 'array',
        'challenges' => 'array',
        'goals' => 'array',
        'competitors' => 'array',
        'unique_selling_points' => 'array',
        'tags' => 'array',
        'unknown_fields' => 'array',
        'products_services' => 'array',
        'target_audience' => 'array',
        'business_hours' => 'array',
        'brand_voice' => 'array',
        'content_preferences' => 'array',
        'contact_preferences' => 'array',
        'google_rating' => 'decimal:1',
        'yelp_rating' => 'decimal:1',
        'lead_score' => 'integer',
        'established_year' => 'integer',
        'employee_count' => 'integer',
        'first_contact_at' => 'datetime',
        'onboarded_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($customer) {
            if (empty($customer->id)) {
                $customer->id = (string) Str::uuid();
            }
            if (empty($customer->slug) && !empty($customer->business_name)) {
                $customer->slug = Str::slug($customer->business_name) . '-' . Str::random(6);
            }
        });
    }

    /**
     * Get all conversations for this customer
     */
    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class);
    }

    /**
     * Get all pending questions for this customer
     */
    public function pendingQuestions(): HasMany
    {
        return $this->hasMany(PendingQuestion::class);
    }

    /**
     * Get all customer FAQs
     */
    public function faqs(): HasMany
    {
        return $this->hasMany(CustomerFaq::class);
    }
}
```

### CustomerFaq
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class CustomerFaq extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'tenant_id',
        'customer_id',
        'question',
        'answer',
        'short_answer',
        'category',
        'keywords',
        'source',
        'confidence',
        'source_conversation_id',
        'verified_by_owner',
        'verified_at',
        'should_ask_clarification',
        'clarification_question',
        'is_active',
    ];

    protected $casts = [
        'keywords' => 'array',
        'verified_by_owner' => 'boolean',
        'verified_at' => 'datetime',
        'should_ask_clarification' => 'boolean',
        'is_active' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($faq) {
            if (empty($faq->id)) {
                $faq->id = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the customer this FAQ belongs to
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Mark FAQ as verified by owner
     */
    public function markAsVerified(): void
    {
        $this->verified_by_owner = true;
        $this->verified_at = now();
        $this->confidence = 'confirmed';
        $this->save();
    }
}
```

### EmailTemplate
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailTemplate extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'name',
        'slug',
        'subject',
        'html_content',
        'text_content',
        'variables',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'variables' => 'array',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Replace template variables with actual values
     */
    public function render(array $variables): array
    {
        $subject = $this->subject;
        $htmlContent = $this->html_content;
        $textContent = $this->text_content;

        foreach ($variables as $key => $value) {
            $placeholder = "{{{$key}}}";
            $subject = str_replace($placeholder, $value, $subject);
            $htmlContent = str_replace($placeholder, $value, $htmlContent);
            if ($textContent) {
                $textContent = str_replace($placeholder, $value, $textContent);
            }
        }

        return [
            'subject' => $subject,
            'html' => $htmlContent,
            'text' => $textContent,
        ];
    }
}
```

### FaqCategory
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FaqCategory extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'parent_id',
        'icon',
        'color',
        'display_order',
        'faq_count',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    /**
     * Get parent category
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(FaqCategory::class, 'parent_id');
    }

    /**
     * Get child categories
     */
    public function children(): HasMany
    {
        return $this->hasMany(FaqCategory::class, 'parent_id');
    }

    /**
     * Get knowledge items in this category
     */
    public function knowledgeItems(): HasMany
    {
        return $this->hasMany(Knowledge::class, 'category', 'slug');
    }
}






```

### GeneratedAd
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GeneratedAd extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'name',
        'platform',
        'ad_type',
        'status',
        'headline',
        'description',
        'call_to_action',
        'destination_url',
        'media_urls',
        'content',
        'metadata',
        'campaign_id',
        'content_id',
        'template_id',
        'generation_params',
        'targeting',
        'budget',
        'schedule',
        'scheduled_start_at',
        'scheduled_end_at',
        'started_at',
        'ended_at',
        'external_ad_id',
        'external_campaign_id',
        'impressions',
        'clicks',
        'spend',
        'conversions',
        'analytics_data',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'media_urls' => 'array',
            'content' => 'array',
            'metadata' => 'array',
            'generation_params' => 'array',
            'targeting' => 'array',
            'budget' => 'array',
            'schedule' => 'array',
            'analytics_data' => 'array',
            'scheduled_start_at' => 'datetime',
            'scheduled_end_at' => 'datetime',
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
            'impressions' => 'integer',
            'clicks' => 'integer',
            'spend' => 'decimal:2',
            'conversions' => 'decimal:2',
        ];
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(AdTemplate::class, 'template_id');
    }

    public function content(): BelongsTo
    {
        return $this->belongsTo(GeneratedContent::class, 'content_id');
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isScheduled(): bool
    {
        return $this->status === 'scheduled';
    }

    public function getCtrAttribute(): float
    {
        if ($this->impressions === 0) {
            return 0;
        }
        return ($this->clicks / $this->impressions) * 100;
    }

    public function getCpcAttribute(): float
    {
        if ($this->clicks === 0) {
            return 0;
        }
        return $this->spend / $this->clicks;
    }

    public function getCpaAttribute(): float
    {
        if ($this->conversions === 0) {
            return 0;
        }
        return $this->spend / $this->conversions;
    }
}
```

### GeneratedContent
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GeneratedContent extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'title',
        'slug',
        'type',
        'status',
        'content',
        'excerpt',
        'metadata',
        'campaign_id',
        'template_id',
        'generation_params',
        'assigned_to',
        'scheduled_publish_at',
        'published_at',
        'published_by',
        'published_channels',
        'publishing_metadata',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'generation_params' => 'array',
            'published_channels' => 'array',
            'publishing_metadata' => 'array',
            'scheduled_publish_at' => 'datetime',
            'published_at' => 'datetime',
        ];
    }

    public function versions(): HasMany
    {
        return $this->hasMany(ContentVersion::class, 'content_id');
    }

    public function workflowHistory(): HasMany
    {
        return $this->hasMany(ContentWorkflowHistory::class, 'content_id');
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(ContentTemplate::class, 'template_id');
    }

    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    public function isPublished(): bool
    {
        return $this->status === 'published';
    }

    public function isScheduled(): bool
    {
        return $this->scheduled_publish_at !== null && $this->status === 'draft';
    }

    /**
     * Create a new version
     */
    public function createVersion(string $changeNotes = null, ?string $userId = null): ContentVersion
    {
        $latestVersion = $this->versions()->orderBy('version_number', 'desc')->first();
        $versionNumber = $latestVersion ? $latestVersion->version_number + 1 : 1;

        return $this->versions()->create([
            'tenant_id' => $this->tenant_id,
            'version_number' => $versionNumber,
            'title' => $this->title,
            'content' => $this->content,
            'excerpt' => $this->excerpt,
            'metadata' => $this->metadata,
            'created_by' => $userId,
            'change_notes' => $changeNotes,
        ]);
    }

    /**
     * Record workflow action
     */
    public function recordWorkflowAction(
        string $action,
        ?string $fromStatus = null,
        ?string $toStatus = null,
        ?string $userId = null,
        ?string $notes = null,
        array $metadata = []
    ): ContentWorkflowHistory {
        return $this->workflowHistory()->create([
            'tenant_id' => $this->tenant_id,
            'action' => $action,
            'from_status' => $fromStatus ?? $this->status,
            'to_status' => $toStatus ?? $this->status,
            'performed_by' => $userId,
            'notes' => $notes,
            'metadata' => $metadata,
        ]);
    }
}
```

### GeneratedPresentation
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GeneratedPresentation extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'customer_id',
        'template_id',
        'presentation_json',
        'audio_base_url',
        'audio_generated',
        'audio_generated_at',
        'input_hash',
        'expires_at',
        'view_count',
        'avg_completion_rate',
        'last_viewed_at',
    ];

    protected $casts = [
        'presentation_json' => 'array',
        'audio_generated' => 'boolean',
        'audio_generated_at' => 'datetime',
        'expires_at' => 'datetime',
        'last_viewed_at' => 'datetime',
        'created_at' => 'datetime',
        'avg_completion_rate' => 'decimal:2',
    ];

    /**
     * Get template
     */
    public function template(): BelongsTo
    {
        return $this->belongsTo(PresentationTemplate::class, 'template_id');
    }
}






```

### IndustryCategory
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class IndustryCategory extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'code',
        'parent_industry',
        'display_order',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    /**
     * Get subcategories
     */
    public function subcategories(): HasMany
    {
        return $this->hasMany(IndustrySubcategory::class, 'industry_id');
    }
}






```

### IndustrySubcategory
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IndustrySubcategory extends Model
{
    use HasUuids;

    protected $fillable = [
        'industry_id',
        'name',
        'code',
        'faq_count',
        'profile_questions_count',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    /**
     * Get parent industry
     */
    public function industry(): BelongsTo
    {
        return $this->belongsTo(IndustryCategory::class, 'industry_id');
    }
}






```

### Knowledge
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Knowledge extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'knowledge_base';

    protected $fillable = [
        'tenant_id',
        'title',
        'content',
        'category',
        'subcategory',
        'industry_codes',
        'embedding_status',
        'embedding',
        'is_public',
        'allowed_agents',
        'source',
        'source_url',
        'validation_status',
        'validated_at',
        'validated_by',
        'usage_count',
        'helpful_count',
        'not_helpful_count',
        'tags',
        'metadata',
        'created_by',
    ];

    protected $casts = [
        'industry_codes' => 'array',
        'allowed_agents' => 'array',
        'tags' => 'array',
        'metadata' => 'array',
        'is_public' => 'boolean',
        'validated_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the category relationship
     */
    public function faqCategory()
    {
        return $this->belongsTo(FaqCategory::class, 'category', 'slug');
    }
}






```

### Order
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'order_number',
        'tenant_id',
        'user_id',
        'customer_id',
        'customer_email',
        'customer_name',
        'subtotal',
        'tax',
        'shipping',
        'total',
        'status',
        'payment_status',
        'stripe_payment_intent_id',
        'stripe_charge_id',
        'stripe_session_id',
        'shipping_address',
        'billing_address',
        'notes',
        'paid_at',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function isPaid(): bool
    {
        return $this->payment_status === 'paid';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isProcessing(): bool
    {
        return $this->status === 'processing';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    public function isRefunded(): bool
    {
        return $this->payment_status === 'refunded';
    }

    protected static function booted(): void
    {
        static::creating(function (Order $order) {
            if (! $order->order_number) {
                $order->order_number = 'ORD-'.mb_strtoupper(uniqid());
            }
        });
    }

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'tax' => 'decimal:2',
            'shipping' => 'decimal:2',
            'total' => 'decimal:2',
            'shipping_address' => 'array',
            'billing_address' => 'array',
            'paid_at' => 'datetime',
        ];
    }
}
```

### OrderItem
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'order_id',
        'service_id',
        'service_name',
        'service_description',
        'price',
        'quantity',
        'total',
        'metadata',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }


    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'total' => 'decimal:2',
            'metadata' => 'array',
        ];
    }
}
```

### OutboundCampaign
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OutboundCampaign extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'name',
        'type',
        'status',
        'subject',
        'message',
        'template_id',
        'template_variables',
        'scheduled_at',
        'started_at',
        'completed_at',
        'recipient_segments',
        'total_recipients',
        'sent_count',
        'delivered_count',
        'failed_count',
        'opened_count',
        'clicked_count',
        'replied_count',
        'answered_count',
        'voicemail_count',
        'metadata',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'template_variables' => 'array',
            'recipient_segments' => 'array',
            'metadata' => 'array',
            'scheduled_at' => 'datetime',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'total_recipients' => 'integer',
            'sent_count' => 'integer',
            'delivered_count' => 'integer',
            'failed_count' => 'integer',
            'opened_count' => 'integer',
            'clicked_count' => 'integer',
            'replied_count' => 'integer',
            'answered_count' => 'integer',
            'voicemail_count' => 'integer',
        ];
    }

    public function recipients(): HasMany
    {
        return $this->hasMany(CampaignRecipient::class, 'campaign_id');
    }

    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    public function isScheduled(): bool
    {
        return $this->status === 'scheduled';
    }

    public function isRunning(): bool
    {
        return $this->status === 'running';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function getDeliveryRateAttribute(): float
    {
        if ($this->sent_count === 0) {
            return 0;
        }
        return ($this->delivered_count / $this->sent_count) * 100;
    }

    public function getOpenRateAttribute(): float
    {
        if ($this->delivered_count === 0) {
            return 0;
        }
        return ($this->opened_count / $this->delivered_count) * 100;
    }

    public function getClickRateAttribute(): float
    {
        if ($this->delivered_count === 0) {
            return 0;
        }
        return ($this->clicked_count / $this->delivered_count) * 100;
    }
}
```

### PendingQuestion
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class PendingQuestion extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'tenant_id',
        'customer_id',
        'field_to_populate',
        'table_to_update',
        'question',
        'context',
        'alternative_phrasings',
        'priority',
        'ask_during',
        'asked',
        'asked_at',
        'asked_in_conversation_id',
        'answered',
        'answer',
        'answered_at',
        'needs_verification',
        'verified',
    ];

    protected $casts = [
        'alternative_phrasings' => 'array',
        'ask_during' => 'array',
        'priority' => 'integer',
        'asked' => 'boolean',
        'asked_at' => 'datetime',
        'answered' => 'boolean',
        'answered_at' => 'datetime',
        'needs_verification' => 'boolean',
        'verified' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($question) {
            if (empty($question->id)) {
                $question->id = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the customer this question is for
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Mark question as asked
     */
    public function markAsAsked(string $conversationId): void
    {
        $this->asked = true;
        $this->asked_at = now();
        $this->asked_in_conversation_id = $conversationId;
        $this->save();
    }

    /**
     * Mark question as answered
     */
    public function markAsAnswered(string $answer): void
    {
        $this->answered = true;
        $this->answer = $answer;
        $this->answered_at = now();
        $this->save();
    }
}
```

### PersonalityAssignment
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PersonalityAssignment extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'personality_id',
        'customer_id',
        'tenant_id',
        'status',
        'assigned_at',
        'last_interaction_at',
        'assignment_rules',
        'context',
        'interaction_count',
        'conversation_count',
        'average_rating',
        'performance_metrics',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'assignment_rules' => 'array',
            'context' => 'array',
            'performance_metrics' => 'array',
            'assigned_at' => 'datetime',
            'last_interaction_at' => 'datetime',
            'interaction_count' => 'integer',
            'conversation_count' => 'integer',
            'average_rating' => 'decimal:2',
        ];
    }

    public function personality(): BelongsTo
    {
        return $this->belongsTo(AiPersonality::class, 'personality_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Record an interaction
     */
    public function recordInteraction(): void
    {
        $this->increment('interaction_count');
        $this->update(['last_interaction_at' => now()]);
    }

    /**
     * Record a conversation
     */
    public function recordConversation(): void
    {
        $this->increment('conversation_count');
        $this->recordInteraction();
    }
}
```

### PersonalityConversation
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PersonalityConversation extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'personality_id',
        'conversation_id',
        'tenant_id',
        'personality_context',
        'personality_metadata',
        'messages_handled',
    ];

    protected function casts(): array
    {
        return [
            'personality_context' => 'array',
            'personality_metadata' => 'array',
            'messages_handled' => 'integer',
        ];
    }

    public function personality(): BelongsTo
    {
        return $this->belongsTo(AiPersonality::class, 'personality_id');
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class, 'conversation_id');
    }
}
```

### PhoneScript
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PhoneScript extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'name',
        'slug',
        'script',
        'variables',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'variables' => 'array',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Replace template variables with actual values
     */
    public function render(array $variables): string
    {
        $script = $this->script;

        foreach ($variables as $key => $value) {
            $placeholder = "{{{$key}}}";
            $script = str_replace($placeholder, $value, $script);
        }

        return $script;
    }
}
```

### PresentationTemplate
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PresentationTemplate extends Model
{
    use HasFactory;

    protected $primaryKey = 'id';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'name',
        'description',
        'purpose',
        'target_audience',
        'slides',
        'audio_base_url',
        'audio_files',
        'injection_points',
        'default_theme',
        'default_presenter_id',
        'estimated_duration',
        'slide_count',
        'is_active',
    ];

    protected $casts = [
        'slides' => 'array',
        'audio_files' => 'array',
        'injection_points' => 'array',
        'default_theme' => 'array',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get generated presentations
     */
    public function generatedPresentations(): HasMany
    {
        return $this->hasMany(GeneratedPresentation::class, 'template_id');
    }
}






```

### Presenter
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Presenter extends Model
{
    protected $primaryKey = 'id';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'name',
        'role',
        'avatar_url',
        'voice_provider',
        'voice_id',
        'voice_settings',
        'personality',
        'communication_style',
        'is_active',
    ];

    protected $casts = [
        'voice_settings' => 'array',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
    ];
}






```

### Service
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Service extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'service_category_id',
        'name',
        'slug',
        'description',
        'long_description',
        'images',
        'price',
        'compare_at_price',
        'service_type', // 'day.news', 'goeventcity', 'downtownsguide', 'golocalvoices', 'alphasite', 'fibonacco'
        'service_tier', // 'basic', 'standard', 'premium', 'enterprise'
        'is_subscription',
        'billing_period', // 'monthly', 'annual', 'one-time'
        'features',
        'capabilities',
        'integrations',
        'quantity',
        'track_inventory',
        'sku',
        'is_active',
        'is_featured',
        'stripe_price_id',
        'stripe_product_id',
        'metadata',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(ServiceCategory::class, 'service_category_id');
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(ServiceSubscription::class);
    }

    public function isInStock(): bool
    {
        if (! $this->track_inventory) {
            return true;
        }

        return $this->quantity > 0;
    }

    public function hasDiscount(): bool
    {
        return $this->compare_at_price && $this->compare_at_price > $this->price;
    }

    public function getDiscountPercentageAttribute(): ?float
    {
        if (! $this->hasDiscount()) {
            return null;
        }

        return round((($this->compare_at_price - $this->price) / $this->compare_at_price) * 100, 2);
    }

    protected function casts(): array
    {
        return [
            'images' => 'array',
            'price' => 'decimal:2',
            'compare_at_price' => 'decimal:2',
            'is_subscription' => 'boolean',
            'features' => 'array',
            'capabilities' => 'array',
            'integrations' => 'array',
            'track_inventory' => 'boolean',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'metadata' => 'array',
        ];
    }
}
```

### ServiceCategory
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ServiceCategory extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'name',
        'slug',
        'description',
        'display_order',
        'is_active',
    ];

    protected $casts = [
        'display_order' => 'integer',
        'is_active' => 'boolean',
    ];

    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }
}
```

### ServiceSubscription
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ServiceSubscription extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'customer_id',
        'user_id',
        'service_id',
        'order_id',
        'tier', // 'trial', 'basic', 'standard', 'premium', 'enterprise'
        'status', // 'active', 'cancelled', 'expired', 'suspended'
        'trial_started_at',
        'trial_expires_at',
        'trial_converted_at',
        'subscription_started_at',
        'subscription_expires_at',
        'auto_renew',
        'stripe_subscription_id',
        'stripe_customer_id',
        'monthly_amount',
        'billing_cycle', // 'monthly', 'annual'
        'ai_services_enabled',
        'cancelled_at',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function isTrial(): bool
    {
        return $this->tier === 'trial' && 
               $this->status === 'active' && 
               $this->trial_expires_at && 
               $this->trial_expires_at->isFuture();
    }

    public function isPremium(): bool
    {
        return in_array($this->tier, ['standard', 'premium', 'enterprise']) &&
               $this->status === 'active';
    }

    public function isExpired(): bool
    {
        if ($this->tier === 'trial') {
            return $this->trial_expires_at && $this->trial_expires_at->isPast();
        }
        
        return $this->subscription_expires_at && $this->subscription_expires_at->isPast();
    }


    protected function casts(): array
    {
        return [
            'trial_started_at' => 'datetime',
            'trial_expires_at' => 'datetime',
            'trial_converted_at' => 'datetime',
            'subscription_started_at' => 'datetime',
            'subscription_expires_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'auto_renew' => 'boolean',
            'monthly_amount' => 'decimal:2',
            'ai_services_enabled' => 'array',
        ];
    }
}
```

### SmsTemplate
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SmsTemplate extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'name',
        'slug',
        'message',
        'variables',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'variables' => 'array',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Replace template variables with actual values
     */
    public function render(array $variables): string
    {
        $message = $this->message;

        foreach ($variables as $key => $value) {
            $placeholder = "{{{$key}}}";
            $message = str_replace($placeholder, $value, $message);
        }

        return $message;
    }
}
```

### SurveyQuestion
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SurveyQuestion extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'section_id',
        'question_text',
        'help_text',
        'question_type',
        'is_required',
        'display_order',
        'validation_rules',
        'options',
        'scale_config',
        'is_conditional',
        'show_when',
        'auto_populate_source',
        'requires_owner_verification',
        'industry_specific',
        'applies_to_industries',
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'validation_rules' => 'array',
        'options' => 'array',
        'scale_config' => 'array',
        'is_conditional' => 'boolean',
        'show_when' => 'array',
        'requires_owner_verification' => 'boolean',
        'industry_specific' => 'boolean',
        'applies_to_industries' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get section
     */
    public function section(): BelongsTo
    {
        return $this->belongsTo(SurveySection::class, 'section_id');
    }
}






```

### SurveySection
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SurveySection extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'name',
        'description',
        'display_order',
        'is_required',
        'is_conditional',
        'condition_config',
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'is_conditional' => 'boolean',
        'condition_config' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get questions for this section
     */
    public function questions(): HasMany
    {
        return $this->hasMany(SurveyQuestion::class, 'section_id')->orderBy('display_order');
    }
}






```

### User
```php
<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
```

---
## Routes

### Web Routes
```php
<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

// Health check endpoint for ALB
Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'timestamp' => now()->toIso8601String(),
    ]);
});

// Root endpoint
Route::get('/', function () {
    return response()->json([
        'message' => 'Fibonacco Learning Center API',
        'version' => '1.0.0',
        'status' => 'operational',
    ]);
});
```

### API Routes
```php
<?php

use App\Http\Controllers\Api\KnowledgeController;
use App\Http\Controllers\Api\SurveyController;
use App\Http\Controllers\Api\ArticleController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\PresentationController;
use App\Http\Controllers\Api\CampaignController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\TrainingController;
use App\Http\Controllers\Api\TTSController;
use App\Http\Controllers\Api\AIController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\ServiceCategoryController;
use App\Http\Controllers\Api\OrderController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::prefix('v1')->group(function () {
    
    // Knowledge/FAQ API
    Route::prefix('knowledge')->group(function () {
        Route::get('/', [KnowledgeController::class, 'index']);
        Route::post('/', [KnowledgeController::class, 'store']);
        Route::get('/{id}', [KnowledgeController::class, 'show']);
        Route::put('/{id}', [KnowledgeController::class, 'update']);
        Route::delete('/{id}', [KnowledgeController::class, 'destroy']);
        Route::post('/{id}/generate-embedding', [KnowledgeController::class, 'generateEmbedding']);
        Route::post('/{id}/vote', [KnowledgeController::class, 'vote']);
    });
    
    Route::prefix('faq-categories')->group(function () {
        Route::get('/', [KnowledgeController::class, 'categories']);
        Route::post('/', [KnowledgeController::class, 'storeCategory']);
        Route::get('/{id}', [KnowledgeController::class, 'showCategory']);
        Route::put('/{id}', [KnowledgeController::class, 'updateCategory']);
        Route::delete('/{id}', [KnowledgeController::class, 'destroyCategory']);
    });
    
    // Survey API
    Route::prefix('survey')->group(function () {
        Route::get('/sections', [SurveyController::class, 'sections']);
        Route::post('/sections', [SurveyController::class, 'storeSection']);
        Route::get('/sections/{id}', [SurveyController::class, 'showSection']);
        Route::put('/sections/{id}', [SurveyController::class, 'updateSection']);
        Route::delete('/sections/{id}', [SurveyController::class, 'destroySection']);
        Route::get('/sections/{id}/questions', [SurveyController::class, 'questions']);
        Route::post('/questions', [SurveyController::class, 'storeQuestion']);
        Route::put('/questions/{id}', [SurveyController::class, 'updateQuestion']);
        Route::delete('/questions/{id}', [SurveyController::class, 'destroyQuestion']);
    });
    
    // Articles API
    Route::prefix('articles')->group(function () {
        Route::get('/', [ArticleController::class, 'index']);
        Route::post('/', [ArticleController::class, 'store']);
        Route::get('/{id}', [ArticleController::class, 'show']);
        Route::put('/{id}', [ArticleController::class, 'update']);
        Route::delete('/{id}', [ArticleController::class, 'destroy']);
    });
    
    // Search API
    Route::prefix('search')->group(function () {
        Route::post('/', [SearchController::class, 'search']); // Semantic/vector search
        Route::post('/fulltext', [SearchController::class, 'fullTextSearch']); // Full-text search
        Route::post('/hybrid', [SearchController::class, 'hybridSearch']); // Hybrid search
        Route::get('/status', [SearchController::class, 'embeddingStatus']);
    });
    
    // Presentation API
    Route::prefix('presentations')->group(function () {
        Route::get('/templates', [PresentationController::class, 'templates']);
        Route::get('/templates/{id}', [PresentationController::class, 'showTemplate']);
        Route::get('/{id}', [PresentationController::class, 'show']);
        Route::post('/generate', [PresentationController::class, 'generate']);
        Route::post('/{id}/audio', [PresentationController::class, 'generateAudio']);
    });
    
    // Campaign API
    Route::prefix('campaigns')->group(function () {
        Route::get('/', [CampaignController::class, 'index']);
        Route::get('/{slug}', [CampaignController::class, 'show']);
    });
    
    // Campaign Generation API
    Route::prefix('campaigns')->group(function () {
        Route::post('/generate', [\App\Http\Controllers\Api\CampaignGenerationController::class, 'generate']);
        Route::get('/templates', [\App\Http\Controllers\Api\CampaignGenerationController::class, 'templates']);
        Route::post('/suggestions', [\App\Http\Controllers\Api\CampaignGenerationController::class, 'suggestions']);
    });
    
    // CRM API - Dashboard
    Route::prefix('crm')->group(function () {
        Route::get('/dashboard/analytics', [\App\Http\Controllers\Api\CrmDashboardController::class, 'analytics']);
        Route::get('/analytics/interest', [\App\Http\Controllers\Api\CrmAnalyticsController::class, 'interest']);
        Route::get('/analytics/purchases', [\App\Http\Controllers\Api\CrmAnalyticsController::class, 'purchases']);
        Route::get('/analytics/learning', [\App\Http\Controllers\Api\CrmAnalyticsController::class, 'learning']);
        Route::get('/analytics/campaign-performance', [\App\Http\Controllers\Api\CrmAnalyticsController::class, 'campaignPerformance']);
        
        // Advanced Analytics
        Route::get('/customers/{customerId}/engagement-score', [\App\Http\Controllers\Api\CrmAdvancedAnalyticsController::class, 'engagementScore']);
        Route::get('/campaigns/{campaignId}/roi', [\App\Http\Controllers\Api\CrmAdvancedAnalyticsController::class, 'campaignROI']);
        Route::get('/customers/{customerId}/predictive-score', [\App\Http\Controllers\Api\CrmAdvancedAnalyticsController::class, 'predictiveScore']);
    });
    
    // CRM API - Customers
    Route::prefix('customers')->group(function () {
        Route::get('/', [CustomerController::class, 'index']);
        Route::post('/', [CustomerController::class, 'store']);
        Route::get('/slug/{slug}', [CustomerController::class, 'showBySlug']);
        Route::get('/{id}', [CustomerController::class, 'show']);
        Route::put('/{id}', [CustomerController::class, 'update']);
        Route::delete('/{id}', [CustomerController::class, 'destroy']);
        Route::put('/{id}/business-context', [CustomerController::class, 'updateBusinessContext']);
        Route::get('/{id}/ai-context', [CustomerController::class, 'getAiContext']);
    });
    
    // CRM API - Conversations
    Route::prefix('conversations')->group(function () {
        Route::get('/', [ConversationController::class, 'index']);
        Route::post('/', [ConversationController::class, 'store']);
        Route::get('/{id}', [ConversationController::class, 'show']);
        Route::put('/{id}', [ConversationController::class, 'update']);
        Route::post('/{id}/end', [ConversationController::class, 'end']);
        Route::post('/{id}/messages', [ConversationController::class, 'addMessage']);
        Route::get('/{id}/messages', [ConversationController::class, 'messages']);
    });
    
    // Training API
    Route::prefix('training')->group(function () {
        Route::get('/', [TrainingController::class, 'index']);
        Route::get('/{id}', [TrainingController::class, 'show']);
        Route::post('/{id}/helpful', [TrainingController::class, 'markHelpful']);
        Route::post('/{id}/not-helpful', [TrainingController::class, 'markNotHelpful']);
    });
    
    // TTS API
    Route::prefix('tts')->group(function () {
        Route::post('/generate', [TTSController::class, 'generate']);
        Route::post('/batch', [TTSController::class, 'batchGenerate']);
        Route::get('/voices', [TTSController::class, 'voices']);
    });
    
    // AI/OpenRouter API
    Route::prefix('ai')->group(function () {
        Route::post('/chat', [AIController::class, 'chat']);
        Route::post('/context', [AIController::class, 'getContext']);
        Route::get('/models', [AIController::class, 'models']);
    });
    
    // Services API
    Route::prefix('services')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\ServiceController::class, 'index']);
        Route::get('/type/{type}', [\App\Http\Controllers\Api\ServiceController::class, 'byType']);
        Route::get('/{id}', [\App\Http\Controllers\Api\ServiceController::class, 'show']);
    });
    
    Route::prefix('service-categories')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\ServiceCategoryController::class, 'index']);
        Route::get('/{id}', [\App\Http\Controllers\Api\ServiceCategoryController::class, 'show']);
    });
    
    // Orders API
    Route::prefix('orders')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\OrderController::class, 'index']);
        Route::post('/checkout', [\App\Http\Controllers\Api\OrderController::class, 'checkout']);
        Route::get('/{id}', [\App\Http\Controllers\Api\OrderController::class, 'show']);
    });
    
    // AI Personalities API
    Route::prefix('personalities')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\PersonalityController::class, 'index']);
        Route::post('/', [\App\Http\Controllers\Api\PersonalityController::class, 'store']);
        Route::get('/assignments', [\App\Http\Controllers\Api\PersonalityController::class, 'assignments']);
        Route::post('/assign', [\App\Http\Controllers\Api\PersonalityController::class, 'assignToCustomer']);
        Route::get('/{id}', [\App\Http\Controllers\Api\PersonalityController::class, 'show']);
        Route::put('/{id}', [\App\Http\Controllers\Api\PersonalityController::class, 'update']);
        Route::delete('/{id}', [\App\Http\Controllers\Api\PersonalityController::class, 'destroy']);
        Route::post('/{id}/generate-response', [\App\Http\Controllers\Api\PersonalityController::class, 'generateResponse']);
        Route::get('/customers/{customerId}/personality', [\App\Http\Controllers\Api\PersonalityController::class, 'getCustomerPersonality']);
    });
    
    // Personality Contact API
    Route::prefix('personality-contacts')->group(function () {
        Route::post('/contact', [\App\Http\Controllers\Api\ContactController::class, 'contactCustomer']);
        Route::post('/schedule', [\App\Http\Controllers\Api\ContactController::class, 'scheduleContact']);
        Route::get('/customers/{customerId}/preferences', [\App\Http\Controllers\Api\ContactController::class, 'getPreferences']);
        Route::put('/customers/{customerId}/preferences', [\App\Http\Controllers\Api\ContactController::class, 'updatePreferences']);
    });
    
    // Command Center - Content Generation API
    Route::prefix('content')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\ContentGenerationController::class, 'index']);
        Route::post('/generate', [\App\Http\Controllers\Api\ContentGenerationController::class, 'generate']);
        Route::post('/generate-from-campaign', [\App\Http\Controllers\Api\ContentGenerationController::class, 'generateFromCampaign']);
        Route::get('/templates', [\App\Http\Controllers\Api\ContentGenerationController::class, 'templates']);
        Route::post('/templates', [\App\Http\Controllers\Api\ContentGenerationController::class, 'createTemplate']);
        Route::get('/{id}', [\App\Http\Controllers\Api\ContentGenerationController::class, 'show']);
        Route::put('/{id}', [\App\Http\Controllers\Api\ContentGenerationController::class, 'update']);
        Route::post('/{id}/status', [\App\Http\Controllers\Api\ContentGenerationController::class, 'updateStatus']);
    });
    
    // Command Center - Ad Generation API
    Route::prefix('ads')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\AdController::class, 'index']);
        Route::post('/generate-from-campaign', [\App\Http\Controllers\Api\AdController::class, 'generateFromCampaign']);
        Route::post('/generate-from-content', [\App\Http\Controllers\Api\AdController::class, 'generateFromContent']);
        Route::get('/templates', [\App\Http\Controllers\Api\AdController::class, 'templates']);
        Route::post('/templates', [\App\Http\Controllers\Api\AdController::class, 'createTemplate']);
        Route::get('/{id}', [\App\Http\Controllers\Api\AdController::class, 'show']);
        Route::put('/{id}', [\App\Http\Controllers\Api\AdController::class, 'update']);
    });
    
    // Command Center - Publishing API
    Route::prefix('publishing')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\Api\PublishingController::class, 'dashboard']);
        Route::get('/calendar', [\App\Http\Controllers\Api\PublishingController::class, 'calendar']);
        Route::get('/analytics', [\App\Http\Controllers\Api\PublishingController::class, 'analytics']);
        Route::post('/content/{id}/publish', [\App\Http\Controllers\Api\PublishingController::class, 'publishContent']);
    });
    
    // Outbound Campaigns API
    Route::prefix('outbound')->group(function () {
        Route::prefix('campaigns')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\OutboundCampaignController::class, 'index']);
            Route::post('/', [\App\Http\Controllers\Api\OutboundCampaignController::class, 'store']);
            Route::get('/{id}', [\App\Http\Controllers\Api\OutboundCampaignController::class, 'show']);
            Route::put('/{id}', [\App\Http\Controllers\Api\OutboundCampaignController::class, 'update']);
            Route::delete('/{id}', [\App\Http\Controllers\Api\OutboundCampaignController::class, 'destroy']);
            Route::get('/{id}/recipients', [\App\Http\Controllers\Api\OutboundCampaignController::class, 'getRecipients']);
            Route::post('/{id}/start', [\App\Http\Controllers\Api\OutboundCampaignController::class, 'start']);
            Route::get('/{id}/analytics', [\App\Http\Controllers\Api\OutboundCampaignController::class, 'analytics']);
        });
        
        // Email Campaigns
        Route::prefix('email')->group(function () {
            Route::get('/campaigns', [\App\Http\Controllers\Api\EmailCampaignController::class, 'index']);
            Route::post('/campaigns', [\App\Http\Controllers\Api\EmailCampaignController::class, 'store']);
            Route::get('/templates', [\App\Http\Controllers\Api\EmailCampaignController::class, 'templates']);
            Route::post('/templates', [\App\Http\Controllers\Api\EmailCampaignController::class, 'createTemplate']);
        });
        
        // Phone Campaigns
        Route::prefix('phone')->group(function () {
            Route::get('/campaigns', [\App\Http\Controllers\Api\PhoneCampaignController::class, 'index']);
            Route::post('/campaigns', [\App\Http\Controllers\Api\PhoneCampaignController::class, 'store']);
            Route::get('/scripts', [\App\Http\Controllers\Api\PhoneCampaignController::class, 'scripts']);
            Route::post('/scripts', [\App\Http\Controllers\Api\PhoneCampaignController::class, 'createScript']);
            Route::post('/campaigns/{id}/call-status', [\App\Http\Controllers\Api\PhoneCampaignController::class, 'callStatus']);
        });
        
        // SMS Campaigns
        Route::prefix('sms')->group(function () {
            Route::get('/campaigns', [\App\Http\Controllers\Api\SMSCampaignController::class, 'index']);
            Route::post('/campaigns', [\App\Http\Controllers\Api\SMSCampaignController::class, 'store']);
            Route::get('/templates', [\App\Http\Controllers\Api\SMSCampaignController::class, 'templates']);
            Route::post('/templates', [\App\Http\Controllers\Api\SMSCampaignController::class, 'createTemplate']);
            Route::post('/campaigns/{id}/sms-status', [\App\Http\Controllers\Api\SMSCampaignController::class, 'smsStatus']);
        });
    });
});

// Stripe Webhook (outside v1 prefix, no auth required)
Route::post('/stripe/webhook', [\App\Http\Controllers\Api\StripeWebhookController::class, 'handle']);

// Outbound webhooks (outside v1 prefix, no auth required for Twilio)
Route::post('/outbound/phone/campaigns/{id}/call-status', [\App\Http\Controllers\Api\PhoneCampaignController::class, 'callStatus']);
Route::post('/outbound/sms/campaigns/{id}/sms-status', [\App\Http\Controllers\Api\SMSCampaignController::class, 'smsStatus']);






```

### Compiled Route List
```

  GET|HEAD   / ............................................................... 
  GET|HEAD   health .......................................................... 
  GET|HEAD   horizon/api/batches horizon.jobs-batches.index › Laravel\Horizon…
  POST       horizon/api/batches/retry/{id} horizon.jobs-batches.retry › Lara…
  GET|HEAD   horizon/api/batches/{id} horizon.jobs-batches.show › Laravel\Hor…
  GET|HEAD   horizon/api/jobs/completed horizon.completed-jobs.index › Larave…
  GET|HEAD   horizon/api/jobs/failed horizon.failed-jobs.index › Laravel\Hori…
  GET|HEAD   horizon/api/jobs/failed/{id} horizon.failed-jobs.show › Laravel\…
  GET|HEAD   horizon/api/jobs/pending horizon.pending-jobs.index › Laravel\Ho…
  POST       horizon/api/jobs/retry/{id} horizon.retry-jobs.show › Laravel\Ho…
  GET|HEAD   horizon/api/jobs/silenced horizon.silenced-jobs.index › Laravel\…
  GET|HEAD   horizon/api/jobs/{id} horizon.jobs.show › Laravel\Horizon › Jobs…
  GET|HEAD   horizon/api/masters horizon.masters.index › Laravel\Horizon › Ma…
  GET|HEAD   horizon/api/metrics/jobs horizon.jobs-metrics.index › Laravel\Ho…
  GET|HEAD   horizon/api/metrics/jobs/{id} horizon.jobs-metrics.show › Larave…
  GET|HEAD   horizon/api/metrics/queues horizon.queues-metrics.index › Larave…
  GET|HEAD   horizon/api/metrics/queues/{id} horizon.queues-metrics.show › La…
  GET|HEAD   horizon/api/monitoring horizon.monitoring.index › Laravel\Horizo…
  POST       horizon/api/monitoring horizon.monitoring.store › Laravel\Horizo…
  GET|HEAD   horizon/api/monitoring/{tag} horizon.monitoring-tag.paginate › L…
  DELETE     horizon/api/monitoring/{tag} horizon.monitoring-tag.destroy › La…
  GET|HEAD   horizon/api/stats horizon.stats.index › Laravel\Horizon › Dashbo…
  GET|HEAD   horizon/api/workload horizon.workload.index › Laravel\Horizon › …
  GET|HEAD   horizon/{view?} horizon.index › Laravel\Horizon › HomeController…
  GET|HEAD   sanctum/csrf-cookie sanctum.csrf-cookie › Laravel\Sanctum › Csrf…
  GET|HEAD   storage/{path} .................................... storage.local
  GET|HEAD   up .............................................................. 

                                                           Showing [27] routes

```

---
## Database Migrations

### 0001_01_01_000000_create_users_table.php
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
```

### 0001_01_01_000001_create_cache_table.php
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cache', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->mediumText('value');
            $table->integer('expiration');
        });

        Schema::create('cache_locks', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->string('owner');
            $table->integer('expiration');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cache');
        Schema::dropIfExists('cache_locks');
    }
};
```

### 0001_01_01_000002_create_jobs_table.php
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('jobs', function (Blueprint $table) {
            $table->id();
            $table->string('queue')->index();
            $table->longText('payload');
            $table->unsignedTinyInteger('attempts');
            $table->unsignedInteger('reserved_at')->nullable();
            $table->unsignedInteger('available_at');
            $table->unsignedInteger('created_at');
        });

        Schema::create('job_batches', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->integer('total_jobs');
            $table->integer('pending_jobs');
            $table->integer('failed_jobs');
            $table->longText('failed_job_ids');
            $table->mediumText('options')->nullable();
            $table->integer('cancelled_at')->nullable();
            $table->integer('created_at');
            $table->integer('finished_at')->nullable();
        });

        Schema::create('failed_jobs', function (Blueprint $table) {
            $table->id();
            $table->string('uuid')->unique();
            $table->text('connection');
            $table->text('queue');
            $table->longText('payload');
            $table->longText('exception');
            $table->timestamp('failed_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jobs');
        Schema::dropIfExists('job_batches');
        Schema::dropIfExists('failed_jobs');
    }
};
```

### 2024_12_01_000001_enable_extensions.php
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Only enable PostgreSQL extensions if using PostgreSQL
        // Skip in testing environment (SQLite) or other databases
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        // Enable PostgreSQL extensions
        DB::statement('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
        DB::statement('CREATE EXTENSION IF NOT EXISTS "pg_trgm"');
        
        // Try to enable vector extension (may not be available on all PostgreSQL instances)
        try {
            DB::statement('CREATE EXTENSION IF NOT EXISTS "vector"');
        } catch (\Exception $e) {
            // Vector extension not available - this is okay for now
            // Can be enabled later when pgvector is installed on the server
            \Log::warning('Vector extension not available: ' . $e->getMessage());
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Note: Extensions are typically not dropped
        // DB::statement('DROP EXTENSION IF EXISTS "vector"');
        // DB::statement('DROP EXTENSION IF EXISTS "pg_trgm"');
        // DB::statement('DROP EXTENSION IF EXISTS "uuid-ossp"');
    }
};

```

### 2024_12_01_000002_create_knowledge_base_table.php
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('knowledge_base', function (Blueprint $table) {
            // UUID will be generated by Laravel/application code
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->text('title');
            $table->text('content');
            $table->text('category')->nullable();
            $table->text('subcategory')->nullable();
            $table->json('industry_codes')->nullable();
            
            // Vector status
            $table->string('embedding_status', 20)->default('pending');
            $table->text('embedding')->nullable(); // pgvector type - stored as text in Laravel
            
            // Access control
            $table->boolean('is_public')->default(true);
            $table->json('allowed_agents')->nullable();
            
            // Source & validation
            $table->string('source', 20)->nullable();
            $table->text('source_url')->nullable();
            $table->string('validation_status', 20)->default('unverified');
            $table->timestampTz('validated_at')->nullable();
            $table->uuid('validated_by')->nullable();
            
            // Usage metrics
            $table->integer('usage_count')->default(0);
            $table->integer('helpful_count')->default(0);
            $table->integer('not_helpful_count')->default(0);
            
            // Metadata
            $table->json('tags')->nullable();
            $table->jsonb('metadata')->nullable();
            
            $table->uuid('created_by')->nullable();
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            $table->timestampTz('updated_at')->default(DB::raw('NOW()'));
            
            // Indexes
            $table->index('tenant_id');
            $table->index('category');
            $table->index('embedding_status');
            $table->index('validation_status');
            $table->index('source');
        });
        
        // Create indexes in separate transactions to avoid transaction abort
        try {
            // Add vector index separately (pgvector) - only if extension is available
            DB::statement('CREATE INDEX IF NOT EXISTS idx_knowledge_base_embedding ON knowledge_base USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)');
        } catch (\Exception $e) {
            // Vector extension not available - skip vector index
            Log::warning('Vector index creation skipped: ' . $e->getMessage());
        }
        
        // Full-text search indexes
        try {
            DB::statement("CREATE INDEX IF NOT EXISTS idx_knowledge_base_title_search ON knowledge_base USING GIN(to_tsvector('english', title))");
        } catch (\Exception $e) {
            Log::warning('Title search index creation failed: ' . $e->getMessage());
        }
        
        try {
            DB::statement("CREATE INDEX IF NOT EXISTS idx_knowledge_base_content_search ON knowledge_base USING GIN(to_tsvector('english', content))");
        } catch (\Exception $e) {
            Log::warning('Content search index creation failed: ' . $e->getMessage());
        }
        
        // GIN indexes for JSONB/arrays
        try {
            DB::statement('CREATE INDEX IF NOT EXISTS idx_knowledge_base_tags ON knowledge_base USING GIN(tags)');
        } catch (\Exception $e) {
            Log::warning('Tags index creation failed: ' . $e->getMessage());
        }
        
        try {
            DB::statement('CREATE INDEX IF NOT EXISTS idx_knowledge_base_metadata ON knowledge_base USING GIN(metadata)');
        } catch (\Exception $e) {
            Log::warning('Metadata index creation failed: ' . $e->getMessage());
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('knowledge_base');
    }
};
```

### 2024_12_01_000003_create_faq_categories_table.php
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('faq_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 255);
            $table->string('slug', 255)->unique();
            $table->text('description')->nullable();
            $table->uuid('parent_id')->nullable();
            $table->string('icon', 50)->nullable();
            $table->string('color', 7)->nullable();
            $table->integer('display_order')->default(0);
            $table->integer('faq_count')->default(0);
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
        });
        
        // Add foreign key and indexes after table creation
        Schema::table('faq_categories', function (Blueprint $table) {
            $table->foreign('parent_id')->references('id')->on('faq_categories')->onDelete('set null');
            $table->index('parent_id');
            $table->index('slug');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('faq_categories');
    }
};

```

### 2024_12_01_000004_create_industry_tables.php
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('industry_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 255);
            $table->string('code', 100)->unique();
            $table->string('parent_industry', 100)->nullable();
            $table->integer('display_order')->default(0);
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
        });
        
        Schema::create('industry_subcategories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('industry_id');
            $table->string('name', 255);
            $table->string('code', 100);
            $table->integer('faq_count')->default(0);
            $table->integer('profile_questions_count')->default(0);
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            
            $table->foreign('industry_id')->references('id')->on('industry_categories')->onDelete('cascade');
            $table->unique(['industry_id', 'code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('industry_subcategories');
        Schema::dropIfExists('industry_categories');
    }
};






```

### 2024_12_01_000005_create_survey_tables.php
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('survey_sections', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('name', 255);
            $table->text('description')->nullable();
            $table->integer('display_order')->default(0);
            $table->boolean('is_required')->default(true);
            $table->boolean('is_conditional')->default(false);
            $table->jsonb('condition_config')->nullable();
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            $table->timestampTz('updated_at')->default(DB::raw('NOW()'));
            
            $table->index('tenant_id');
        });
        
        Schema::create('survey_questions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('section_id');
            $table->text('question_text');
            $table->text('help_text')->nullable();
            $table->string('question_type', 50);
            $table->boolean('is_required')->default(false);
            $table->integer('display_order')->default(0);
            
            // Validation
            $table->jsonb('validation_rules')->nullable();
            
            // Options for select/multi-select
            $table->jsonb('options')->nullable();
            
            // Scale config
            $table->jsonb('scale_config')->nullable();
            
            // Conditional display
            $table->boolean('is_conditional')->default(false);
            $table->jsonb('show_when')->nullable();
            
            // AI/Data enrichment
            $table->string('auto_populate_source', 20)->nullable();
            $table->boolean('requires_owner_verification')->default(false);
            
            // Industry targeting
            $table->boolean('industry_specific')->default(false);
            $table->json('applies_to_industries')->nullable();
            
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            $table->timestampTz('updated_at')->default(DB::raw('NOW()'));
            
            $table->foreign('section_id')->references('id')->on('survey_sections')->onDelete('cascade');
            $table->index('section_id');
            $table->index('question_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('survey_questions');
        Schema::dropIfExists('survey_sections');
    }
};






```

### 2024_12_01_000006_create_presentation_tables.php
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('presentation_templates', function (Blueprint $table) {
            $table->string('id', 50)->primary();
            $table->string('name', 255);
            $table->text('description')->nullable();
            $table->string('purpose', 100)->nullable();
            $table->string('target_audience', 255)->nullable();
            
            // Structure
            $table->jsonb('slides');
            
            // Pre-recorded audio location
            $table->string('audio_base_url', 500)->nullable();
            $table->jsonb('audio_files')->nullable();
            
            // Dynamic injection points
            $table->jsonb('injection_points')->nullable();
            
            // Visual
            $table->jsonb('default_theme')->nullable();
            $table->string('default_presenter_id', 50)->nullable();
            
            // Metadata
            $table->integer('estimated_duration')->nullable();
            $table->integer('slide_count')->nullable();
            
            $table->boolean('is_active')->default(true);
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            $table->timestampTz('updated_at')->default(DB::raw('NOW()'));
        });
        
        Schema::create('presenters', function (Blueprint $table) {
            $table->string('id', 50)->primary();
            $table->string('name', 100);
            $table->string('role', 100)->nullable();
            $table->string('avatar_url', 500)->nullable();
            
            // Voice settings
            $table->string('voice_provider', 50)->nullable();
            $table->string('voice_id', 100)->nullable();
            $table->jsonb('voice_settings')->nullable();
            
            // AI personality
            $table->text('personality')->nullable();
            $table->text('communication_style')->nullable();
            
            $table->boolean('is_active')->default(true);
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
        });
        
        Schema::create('generated_presentations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->uuid('customer_id')->nullable();
            $table->string('template_id', 50)->nullable();
            
            // The assembled presentation
            $table->jsonb('presentation_json');
            
            // Audio status
            $table->string('audio_base_url', 500)->nullable();
            $table->boolean('audio_generated')->default(false);
            $table->timestampTz('audio_generated_at')->nullable();
            
            // Cache management
            $table->string('input_hash', 64)->nullable();
            $table->timestampTz('expires_at')->nullable();
            
            // Analytics
            $table->integer('view_count')->default(0);
            $table->decimal('avg_completion_rate', 5, 2)->nullable();
            $table->timestampTz('last_viewed_at')->nullable();
            
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            
            $table->foreign('template_id')->references('id')->on('presentation_templates')->onDelete('set null');
            $table->index('tenant_id');
            $table->index('customer_id');
            $table->index('template_id');
            $table->index('input_hash');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('generated_presentations');
        Schema::dropIfExists('presenters');
        Schema::dropIfExists('presentation_templates');
    }
};






```

### 2024_12_01_000007_create_database_functions.php
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create update timestamp trigger function
        DB::unprepared('
            CREATE OR REPLACE FUNCTION update_updated_at()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        ');
        
        // Create triggers for updated_at - check if tables exist first
        $this->createTriggerIfTableExists('knowledge_base', 'update_knowledge_base_updated_at');
        $this->createTriggerIfTableExists('survey_sections', 'update_survey_sections_updated_at');
        $this->createTriggerIfTableExists('survey_questions', 'update_survey_questions_updated_at');
        
        // Create vector search function - only if vector extension is available
        try {
            DB::unprepared('
                CREATE OR REPLACE FUNCTION search_knowledge_base(
                    p_tenant_id UUID,
                    p_query_text TEXT,
                    p_query_embedding vector(1536),
                    p_limit INT DEFAULT 10,
                    p_threshold FLOAT DEFAULT 0.7
                )
                RETURNS TABLE (
                    id UUID,
                    title TEXT,
                    content TEXT,
                    category TEXT,
                    similarity_score FLOAT,
                    source VARCHAR(20),
                    validation_status VARCHAR(20)
                ) AS $$
                BEGIN
                    RETURN QUERY
                    SELECT 
                        kb.id,
                        kb.title,
                        kb.content,
                        kb.category,
                        1 - (kb.embedding <=> p_query_embedding) as similarity_score,
                        kb.source,
                        kb.validation_status
                    FROM knowledge_base kb
                    WHERE kb.tenant_id = p_tenant_id
                        AND kb.embedding IS NOT NULL
                        AND kb.is_public = true
                        AND (kb.allowed_agents IS NULL OR array_length(kb.allowed_agents, 1) = 0)
                        AND (1 - (kb.embedding <=> p_query_embedding)) >= p_threshold
                    ORDER BY kb.embedding <=> p_query_embedding
                    LIMIT p_limit;
                END;
                $$ LANGUAGE plpgsql;
            ');
        } catch (\Exception $e) {
            // Vector extension not available - skip function creation
            Log::warning('Vector search function creation skipped: ' . $e->getMessage());
        }
    }
    
    /**
     * Create trigger if table exists
     */
    private function createTriggerIfTableExists(string $table, string $triggerName): void
    {
        try {
            // Check if table exists
            $exists = DB::selectOne("
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = ?
                ) as exists
            ", [$table]);
            
            if ($exists && $exists->exists) {
                DB::unprepared("DROP TRIGGER IF EXISTS {$triggerName} ON {$table};");
                DB::unprepared("
                    CREATE TRIGGER {$triggerName} 
                        BEFORE UPDATE ON {$table}
                        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
                ");
            }
        } catch (\Exception $e) {
            Log::warning("Trigger {$triggerName} creation skipped: " . $e->getMessage());
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::unprepared('DROP FUNCTION IF EXISTS search_knowledge_base(UUID, TEXT, vector, INT, FLOAT)');
        DB::unprepared('DROP FUNCTION IF EXISTS update_updated_at()');
    }
};
```

### 2024_12_01_000008_create_crm_customers_table.php
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id'); // Multi-tenant support
            
            // Identifiers
            $table->string('slug', 100)->unique();
            $table->string('external_id', 100)->nullable(); // ID from external CRM
            
            // Basic info
            $table->string('business_name');
            $table->string('owner_name')->nullable();
            $table->string('industry_id', 50)->nullable(); // References industries table
            $table->string('sub_category', 100)->nullable(); // "pizza", "fine-dining", etc.
            
            // Contact
            $table->string('phone', 20)->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            
            // Location
            $table->string('address_line1')->nullable();
            $table->string('address_line2')->nullable();
            $table->string('city', 100)->nullable();
            $table->string('state', 50)->nullable();
            $table->string('zip', 20)->nullable();
            $table->string('country', 50)->default('US');
            $table->string('timezone', 50)->nullable();
            
            // Known data (confirmed information)
            $table->jsonb('hours')->nullable(); // Operating hours
            $table->jsonb('services')->nullable(); // Services offered
            $table->jsonb('social_media')->nullable(); // Social media links
            $table->string('pos_system', 100)->nullable();
            $table->json('current_integrations')->nullable(); // Array of integration names
            
            // Ratings
            $table->decimal('google_rating', 2, 1)->nullable();
            $table->integer('google_review_count')->nullable();
            $table->decimal('yelp_rating', 2, 1)->nullable();
            $table->integer('yelp_review_count')->nullable();
            
            // Business intelligence
            $table->integer('established_year')->nullable();
            $table->integer('employee_count')->nullable();
            $table->string('annual_revenue_range', 50)->nullable(); // "<100K", "100K-500K", etc.
            $table->json('challenges')->nullable(); // Array
            $table->json('goals')->nullable(); // Array
            $table->json('competitors')->nullable(); // Array
            $table->json('unique_selling_points')->nullable(); // Array
            
            // Unknown data (to be discovered by AI)
            $table->jsonb('unknown_fields')->default('{}');
            
            // Fibonacco relationship
            $table->string('lead_source', 100)->nullable();
            $table->integer('lead_score')->default(0);
            $table->string('subscription_tier', 50)->nullable();
            $table->timestampTz('first_contact_at')->nullable();
            $table->timestampTz('onboarded_at')->nullable();
            $table->string('assigned_rep', 100)->nullable();
            $table->text('notes')->nullable();
            $table->json('tags')->nullable(); // Array
            
            // AI-First CRM fields (from AI_FIRST_SCHEMA_MIGRATION.sql)
            $table->string('industry_category')->nullable();
            $table->string('industry_subcategory')->nullable();
            $table->text('business_description')->nullable();
            $table->jsonb('products_services')->nullable();
            $table->jsonb('target_audience')->nullable();
            $table->jsonb('business_hours')->nullable();
            $table->string('service_area')->nullable();
            $table->jsonb('brand_voice')->nullable();
            $table->jsonb('content_preferences')->nullable();
            $table->jsonb('contact_preferences')->nullable();
            
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            $table->timestampTz('updated_at')->default(DB::raw('NOW()'));
            
            // Indexes
            $table->index('tenant_id');
            $table->index('slug');
            $table->index('email');
            $table->index(['tenant_id', 'industry_category', 'industry_subcategory']);
            $table->index('lead_score');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
```

### 2024_12_01_000009_create_crm_conversations_table.php
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('conversations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->uuid('customer_id')->nullable();
            
            $table->string('session_id', 100);
            
            // Context
            $table->string('entry_point', 100)->nullable(); // 'presentation', 'chat_widget', 'phone', 'sms'
            $table->string('template_id', 50)->nullable();
            $table->integer('slide_at_start')->nullable();
            
            // Participants
            $table->string('presenter_id', 50)->nullable(); // References presenters table
            $table->string('human_rep_id', 100)->nullable();
            
            // Full conversation log
            $table->jsonb('messages')->default('[]');
            
            // AI analysis
            $table->json('topics_discussed')->nullable(); // Array
            $table->jsonb('questions_asked')->nullable();
            $table->jsonb('objections_raised')->nullable();
            $table->jsonb('sentiment_trajectory')->nullable();
            
            // Data collected
            $table->jsonb('new_data_collected')->nullable();
            $table->json('faqs_generated')->nullable(); // Array of UUIDs
            
            // Outcome
            $table->string('outcome', 50)->nullable(); // 'signup', 'demo_scheduled', 'pricing_sent', etc.
            $table->text('outcome_details')->nullable();
            
            // Follow-up
            $table->boolean('followup_needed')->default(false);
            $table->timestampTz('followup_scheduled_at')->nullable();
            $table->text('followup_notes')->nullable();
            
            // Duration
            $table->timestampTz('started_at')->default(DB::raw('NOW()'));
            $table->timestampTz('ended_at')->nullable();
            $table->integer('duration_seconds')->nullable();
            
            // Metadata
            $table->text('user_agent')->nullable();
            $table->string('ip_address')->nullable();
            
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            $table->timestampTz('updated_at')->default(DB::raw('NOW()'));
            
            // Foreign key
            $table->foreign('customer_id')
                  ->references('id')
                  ->on('customers')
                  ->onDelete('set null');
            
            // Indexes
            $table->index('tenant_id');
            $table->index('customer_id');
            $table->index('session_id');
            $table->index('started_at');
            $table->index('outcome');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};
```

### 2024_12_01_000010_create_crm_conversation_messages_table.php
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('conversation_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('conversation_id');
            
            $table->string('role', 20); // 'user', 'assistant', 'system'
            $table->text('content');
            
            // AI metadata
            $table->integer('tokens_used')->nullable();
            $table->string('model_used', 50)->nullable();
            $table->integer('response_time_ms')->nullable();
            
            // Actions taken
            $table->jsonb('actions_triggered')->nullable();
            
            $table->timestampTz('timestamp')->default(DB::raw('NOW()'));
            
            // Indexes
            $table->index('conversation_id');
            $table->index('timestamp');
            $table->index(['conversation_id', 'timestamp']);
            
            // Foreign key
            $table->foreign('conversation_id')
                  ->references('id')
                  ->on('conversations')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conversation_messages');
    }
};
```

### 2024_12_01_000011_create_crm_pending_questions_table.php
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pending_questions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->uuid('customer_id');
            
            // What this question answers
            $table->string('field_to_populate', 100);
            $table->string('table_to_update', 50)->default('customers');
            
            // The question
            $table->text('question');
            $table->text('context')->nullable(); // Why we're asking / when to ask
            $table->json('alternative_phrasings')->nullable(); // Array
            
            // Priority (when to ask)
            $table->integer('priority')->default(5); // 1-10, higher = more important
            $table->json('ask_during')->nullable(); // Array: ['onboarding', 'pricing_discussion', 'any']
            
            // Status
            $table->boolean('asked')->default(false);
            $table->timestampTz('asked_at')->nullable();
            $table->uuid('asked_in_conversation_id')->nullable();
            
            $table->boolean('answered')->default(false);
            $table->text('answer')->nullable();
            $table->timestampTz('answered_at')->nullable();
            
            // If answer needs verification
            $table->boolean('needs_verification')->default(false);
            $table->boolean('verified')->default(false);
            
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            $table->timestampTz('updated_at')->default(DB::raw('NOW()'));
            
            // Indexes
            $table->index('tenant_id');
            $table->index('customer_id');
            $table->index(['customer_id', 'asked', 'answered']);
            $table->index('priority');
            
            // Foreign key
            $table->foreign('customer_id')
                  ->references('id')
                  ->on('customers')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pending_questions');
    }
};
```

### 2024_12_01_000012_create_crm_customer_faqs_table.php
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('customer_faqs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->uuid('customer_id');
            
            $table->text('question');
            $table->text('answer');
            $table->string('short_answer', 255)->nullable();
            
            $table->string('category', 50)->nullable();
            $table->json('keywords')->nullable(); // Array
            
            // Source tracking (how we learned this)
            $table->string('source', 50); // 'owner_conversation', 'website_scrape', 'manual', 'inferred'
            $table->string('confidence', 20); // 'confirmed', 'likely', 'needs_verification'
            $table->uuid('source_conversation_id')->nullable();
            
            // Verification
            $table->boolean('verified_by_owner')->default(false);
            $table->timestampTz('verified_at')->nullable();
            
            // For AI handling
            $table->boolean('should_ask_clarification')->default(false);
            $table->text('clarification_question')->nullable();
            
            // Status
            $table->boolean('is_active')->default(true);
            
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            $table->timestampTz('updated_at')->default(DB::raw('NOW()'));
            
            // Indexes
            $table->index('tenant_id');
            $table->index('customer_id');
            $table->index(['customer_id', 'is_active']);
            $table->index('source');
            
            // Foreign key
            $table->foreign('customer_id')
                  ->references('id')
                  ->on('customers')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customer_faqs');
    }
};
```

### 2025_12_25_000001_create_services_catalog_tables.php
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Service Categories
        Schema::create('service_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->nullable();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->integer('display_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'is_active']);
        });

        // Services (adapted from products table)
        Schema::create('services', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->nullable();
            $table->foreignUuid('service_category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->text('long_description')->nullable();
            $table->json('images')->nullable();
            $table->decimal('price', 10, 2);
            $table->decimal('compare_at_price', 10, 2)->nullable();
            $table->string('service_type')->nullable(); // 'day.news', 'goeventcity', 'downtownsguide', 'golocalvoices', 'alphasite', 'fibonacco'
            $table->string('service_tier')->nullable(); // 'basic', 'standard', 'premium', 'enterprise'
            $table->boolean('is_subscription')->default(false); // Recurring vs one-time
            $table->string('billing_period')->nullable(); // 'monthly', 'annual', 'one-time'
            $table->json('features')->nullable(); // Array of features
            $table->json('capabilities')->nullable(); // What it does
            $table->json('integrations')->nullable(); // What it connects to
            $table->integer('quantity')->default(0); // For inventory tracking (if needed)
            $table->boolean('track_inventory')->default(false);
            $table->string('sku')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->string('stripe_price_id')->nullable();
            $table->string('stripe_product_id')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['tenant_id', 'slug']);
            $table->index(['tenant_id', 'service_type', 'is_active']);
            $table->index(['tenant_id', 'service_category_id', 'is_active']);
        });

        // Orders (adapted - removed store_id, added tenant_id)
        Schema::create('orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('order_number')->unique();
            $table->uuid('tenant_id')->nullable();
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUuid('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->string('customer_email');
            $table->string('customer_name')->nullable();
            $table->decimal('subtotal', 10, 2);
            $table->decimal('tax', 10, 2)->default(0);
            $table->decimal('shipping', 10, 2)->default(0);
            $table->decimal('total', 10, 2);
            $table->string('status')->default('pending'); // pending, processing, completed, cancelled, refunded
            $table->string('payment_status')->default('pending'); // pending, paid, failed, refunded
            $table->string('stripe_payment_intent_id')->nullable();
            $table->string('stripe_charge_id')->nullable();
            $table->string('stripe_session_id')->nullable();
            $table->json('shipping_address')->nullable();
            $table->json('billing_address')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'status']);
            $table->index(['tenant_id', 'payment_status']);
            $table->index(['customer_id']);
            $table->index(['user_id']);
        });

        // Order Items (keep as-is from Multisite)
        Schema::create('order_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('order_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('service_id')->nullable()->constrained()->nullOnDelete();
            $table->string('service_name');
            $table->text('service_description')->nullable();
            $table->decimal('price', 10, 2);
            $table->integer('quantity');
            $table->decimal('total', 10, 2);
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index('order_id');
            $table->index('service_id');
        });

        // Service Subscriptions (for recurring services)
        Schema::create('service_subscriptions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->nullable();
            $table->foreignUuid('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUuid('service_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('order_id')->nullable()->constrained()->nullOnDelete();
            $table->string('tier'); // 'trial', 'basic', 'standard', 'premium', 'enterprise'
            $table->string('status')->default('active'); // 'active', 'cancelled', 'expired', 'suspended'
            $table->timestamp('trial_started_at')->nullable();
            $table->timestamp('trial_expires_at')->nullable();
            $table->timestamp('trial_converted_at')->nullable();
            $table->timestamp('subscription_started_at')->nullable();
            $table->timestamp('subscription_expires_at')->nullable();
            $table->boolean('auto_renew')->default(true);
            $table->string('stripe_subscription_id')->nullable();
            $table->string('stripe_customer_id')->nullable();
            $table->decimal('monthly_amount', 10, 2)->nullable();
            $table->string('billing_cycle')->nullable(); // 'monthly', 'annual'
            $table->json('ai_services_enabled')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'status']);
            $table->index(['customer_id', 'status']);
            $table->index(['service_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_subscriptions');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('services');
        Schema::dropIfExists('service_categories');
    }
};
```

### 2025_12_25_000002_create_outbound_campaigns_tables.php
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Outbound campaigns table
        Schema::create('outbound_campaigns', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            
            $table->string('name');
            $table->string('type'); // 'email', 'phone', 'sms'
            $table->enum('status', ['draft', 'scheduled', 'running', 'paused', 'completed', 'cancelled'])->default('draft');
            
            // Campaign configuration
            $table->string('subject')->nullable(); // For email
            $table->text('message'); // Message content
            $table->string('template_id')->nullable(); // Template reference
            $table->json('template_variables')->nullable(); // Template variables
            
            // Scheduling
            $table->timestampTz('scheduled_at')->nullable();
            $table->timestampTz('started_at')->nullable();
            $table->timestampTz('completed_at')->nullable();
            
            // Recipients
            $table->json('recipient_segments')->nullable(); // Segmentation criteria
            $table->integer('total_recipients')->default(0);
            $table->integer('sent_count')->default(0);
            $table->integer('delivered_count')->default(0);
            $table->integer('failed_count')->default(0);
            $table->integer('opened_count')->default(0); // Email only
            $table->integer('clicked_count')->default(0); // Email only
            $table->integer('replied_count')->default(0); // Email/SMS
            $table->integer('answered_count')->default(0); // Phone only
            $table->integer('voicemail_count')->default(0); // Phone only
            
            // Campaign metadata
            $table->json('metadata')->nullable();
            $table->text('notes')->nullable();
            
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            $table->timestampTz('updated_at')->default(DB::raw('NOW()'));
            
            // Indexes
            $table->index('tenant_id');
            $table->index('type');
            $table->index('status');
            $table->index('scheduled_at');
        });

        // Campaign recipients (individual sends)
        Schema::create('campaign_recipients', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('campaign_id');
            $table->uuid('customer_id')->nullable();
            $table->uuid('tenant_id');
            
            // Recipient contact info
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('name')->nullable();
            
            // Status
            $table->enum('status', ['pending', 'queued', 'sent', 'delivered', 'opened', 'clicked', 'replied', 'answered', 'voicemail', 'failed', 'bounced', 'unsubscribed'])->default('pending');
            $table->timestampTz('sent_at')->nullable();
            $table->timestampTz('delivered_at')->nullable();
            $table->timestampTz('opened_at')->nullable(); // Email
            $table->timestampTz('clicked_at')->nullable(); // Email
            $table->timestampTz('replied_at')->nullable(); // Email/SMS
            $table->timestampTz('answered_at')->nullable(); // Phone
            $table->integer('duration_seconds')->nullable(); // Phone
            
            // Tracking
            $table->string('external_id')->nullable(); // Provider message ID
            $table->text('error_message')->nullable();
            $table->json('metadata')->nullable();
            
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            $table->timestampTz('updated_at')->default(DB::raw('NOW()'));
            
            // Foreign keys
            $table->foreign('campaign_id')
                  ->references('id')
                  ->on('outbound_campaigns')
                  ->onDelete('cascade');
            
            $table->foreign('customer_id')
                  ->references('id')
                  ->on('customers')
                  ->onDelete('set null');
            
            // Indexes
            $table->index('campaign_id');
            $table->index('customer_id');
            $table->index('tenant_id');
            $table->index('status');
            $table->index('email');
            $table->index('phone');
        });

        // Email templates
        Schema::create('email_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('subject');
            $table->text('html_content');
            $table->text('text_content')->nullable();
            
            $table->json('variables')->nullable(); // Available template variables
            $table->boolean('is_active')->default(true);
            
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            $table->timestampTz('updated_at')->default(DB::raw('NOW()'));
            
            // Indexes
            $table->index('tenant_id');
            $table->index('slug');
        });

        // SMS templates
        Schema::create('sms_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('message');
            
            $table->json('variables')->nullable(); // Available template variables
            $table->boolean('is_active')->default(true);
            
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            $table->timestampTz('updated_at')->default(DB::raw('NOW()'));
            
            // Indexes
            $table->index('tenant_id');
            $table->index('slug');
        });

        // Phone call scripts
        Schema::create('phone_scripts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('script');
            
            $table->json('variables')->nullable(); // Available template variables
            $table->boolean('is_active')->default(true);
            
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            $table->timestampTz('updated_at')->default(DB::raw('NOW()'));
            
            // Indexes
            $table->index('tenant_id');
            $table->index('slug');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('campaign_recipients');
        Schema::dropIfExists('phone_scripts');
        Schema::dropIfExists('sms_templates');
        Schema::dropIfExists('email_templates');
        Schema::dropIfExists('outbound_campaigns');
    }
};
```

### 2025_12_25_000003_create_content_workflow_tables.php
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Content templates
        Schema::create('content_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('type'); // 'article', 'blog', 'social', 'email', 'landing_page'
            $table->text('description')->nullable();
            $table->text('prompt_template'); // AI prompt template with variables
            $table->json('variables')->nullable(); // Available template variables
            $table->json('structure')->nullable(); // Content structure/outline
            $table->boolean('is_active')->default(true);
            
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            $table->timestampTz('updated_at')->default(DB::raw('NOW()'));
            
            $table->index('tenant_id');
            $table->index('type');
            $table->index('slug');
        });

        // Generated content
        Schema::create('generated_content', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            
            $table->string('title');
            $table->string('slug')->nullable();
            $table->string('type'); // 'article', 'blog', 'social', 'email', 'landing_page'
            $table->enum('status', ['draft', 'review', 'approved', 'published', 'archived'])->default('draft');
            
            // Content
            $table->text('content'); // HTML/markdown content
            $table->text('excerpt')->nullable();
            $table->json('metadata')->nullable(); // SEO, tags, categories, etc.
            
            // Generation source
            $table->uuid('campaign_id')->nullable(); // Source campaign
            $table->uuid('template_id')->nullable(); // Used template
            $table->json('generation_params')->nullable(); // Parameters used for generation
            
            // Workflow
            $table->uuid('assigned_to')->nullable(); // Reviewer/approver
            $table->timestampTz('scheduled_publish_at')->nullable();
            $table->timestampTz('published_at')->nullable();
            $table->uuid('published_by')->nullable();
            
            // Publishing
            $table->json('published_channels')->nullable(); // Channels where published
            $table->json('publishing_metadata')->nullable(); // Channel-specific metadata
            
            $table->text('notes')->nullable();
            
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            $table->timestampTz('updated_at')->default(DB::raw('NOW()'));
            
            $table->index('tenant_id');
            $table->index('type');
            $table->index('status');
            $table->index('campaign_id');
            $table->index('template_id');
            $table->index('scheduled_publish_at');
            $table->index('slug');
        });

        // Content versions (versioning system)
        Schema::create('content_versions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('content_id');
            $table->uuid('tenant_id');
            
            $table->integer('version_number');
            $table->string('title');
            $table->text('content');
            $table->text('excerpt')->nullable();
            $table->json('metadata')->nullable();
            
            $table->uuid('created_by')->nullable();
            $table->text('change_notes')->nullable();
            
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            
            $table->foreign('content_id')
                  ->references('id')
                  ->on('generated_content')
                  ->onDelete('cascade');
            
            $table->index('content_id');
            $table->index('tenant_id');
            $table->index(['content_id', 'version_number']);
        });

        // Content workflow history
        Schema::create('content_workflow_history', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('content_id');
            $table->uuid('tenant_id');
            
            $table->enum('action', ['created', 'updated', 'status_changed', 'assigned', 'reviewed', 'approved', 'rejected', 'published', 'archived']);
            $table->string('from_status')->nullable();
            $table->string('to_status')->nullable();
            $table->uuid('performed_by')->nullable();
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();
            
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            
            $table->foreign('content_id')
                  ->references('id')
                  ->on('generated_content')
                  ->onDelete('cascade');
            
            $table->index('content_id');
            $table->index('tenant_id');
            $table->index('action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('content_workflow_history');
        Schema::dropIfExists('content_versions');
        Schema::dropIfExists('generated_content');
        Schema::dropIfExists('content_templates');
    }
};
```

### 2025_12_25_000004_create_ads_table.php
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Ad templates
        Schema::create('ad_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('platform'); // 'facebook', 'google', 'instagram', 'linkedin', 'twitter', 'display'
            $table->string('ad_type'); // 'image', 'video', 'carousel', 'text', 'story'
            $table->text('description')->nullable();
            $table->json('structure')->nullable(); // Ad structure (headline, description, CTA, etc.)
            $table->text('prompt_template')->nullable(); // AI prompt template
            $table->json('variables')->nullable(); // Available template variables
            $table->json('specs')->nullable(); // Platform-specific specs (dimensions, file sizes, etc.)
            $table->boolean('is_active')->default(true);
            
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            $table->timestampTz('updated_at')->default(DB::raw('NOW()'));
            
            $table->index('tenant_id');
            $table->index('platform');
            $table->index('ad_type');
            $table->index('slug');
        });

        // Generated ads
        Schema::create('generated_ads', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            
            $table->string('name');
            $table->string('platform'); // 'facebook', 'google', 'instagram', 'linkedin', 'twitter', 'display'
            $table->string('ad_type'); // 'image', 'video', 'carousel', 'text', 'story'
            $table->enum('status', ['draft', 'review', 'approved', 'scheduled', 'active', 'paused', 'archived'])->default('draft');
            
            // Ad content
            $table->string('headline')->nullable();
            $table->text('description')->nullable();
            $table->string('call_to_action')->nullable();
            $table->string('destination_url')->nullable();
            $table->json('media_urls')->nullable(); // Image/video URLs
            $table->json('content')->nullable(); // Structured content (JSON)
            $table->json('metadata')->nullable(); // Additional metadata
            
            // Generation source
            $table->uuid('campaign_id')->nullable(); // Source campaign
            $table->uuid('content_id')->nullable(); // Related content
            $table->uuid('template_id')->nullable(); // Used template
            $table->json('generation_params')->nullable(); // Parameters used for generation
            
            // Targeting
            $table->json('targeting')->nullable(); // Audience targeting
            $table->json('budget')->nullable(); // Budget settings
            $table->json('schedule')->nullable(); // Scheduling info
            
            // Scheduling
            $table->timestampTz('scheduled_start_at')->nullable();
            $table->timestampTz('scheduled_end_at')->nullable();
            $table->timestampTz('started_at')->nullable();
            $table->timestampTz('ended_at')->nullable();
            
            // External IDs
            $table->string('external_ad_id')->nullable(); // Platform-specific ad ID
            $table->string('external_campaign_id')->nullable(); // Platform-specific campaign ID
            
            // Analytics
            $table->integer('impressions')->default(0);
            $table->integer('clicks')->default(0);
            $table->decimal('spend', 10, 2)->default(0);
            $table->decimal('conversions', 10, 2)->default(0);
            $table->json('analytics_data')->nullable(); // Additional analytics
            
            $table->text('notes')->nullable();
            
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            $table->timestampTz('updated_at')->default(DB::raw('NOW()'));
            
            $table->index('tenant_id');
            $table->index('platform');
            $table->index('status');
            $table->index('campaign_id');
            $table->index('content_id');
            $table->index('template_id');
            $table->index('scheduled_start_at');
            $table->index('external_ad_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('generated_ads');
        Schema::dropIfExists('ad_templates');
    }
};
```

### 2025_12_25_000005_create_ai_personalities_tables.php
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // AI Personalities
        Schema::create('ai_personalities', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            
            // Personality Configuration
            $table->string('identity'); // Name/identity (e.g., "Sarah", "Marketing Expert")
            $table->text('persona_description'); // Detailed persona description
            $table->text('communication_style'); // How they communicate
            $table->json('traits')->nullable(); // Personality traits (array)
            $table->json('expertise_areas')->nullable(); // Areas of expertise
            
            // Contact Capabilities
            $table->boolean('can_email')->default(true);
            $table->boolean('can_call')->default(false);
            $table->boolean('can_sms')->default(false);
            $table->boolean('can_chat')->default(true);
            $table->string('contact_email')->nullable(); // Personality-specific email
            $table->string('contact_phone')->nullable(); // Personality-specific phone
            
            // AI Configuration
            $table->text('system_prompt'); // System prompt for AI
            $table->text('greeting_message')->nullable(); // Default greeting
            $table->json('custom_instructions')->nullable(); // Custom AI instructions
            $table->string('ai_model')->default('anthropic/claude-3.5-sonnet'); // AI model to use
            $table->decimal('temperature', 3, 2)->default(0.7); // AI temperature
            
            // Activity Settings
            $table->json('active_hours')->nullable(); // When personality is active
            $table->json('working_days')->nullable(); // Days of week active
            $table->string('timezone')->default('UTC');
            
            // Status
            $table->boolean('is_active')->default(true);
            $table->integer('priority')->default(0); // Higher priority personalities used first
            
            // Metadata
            $table->json('metadata')->nullable();
            $table->text('notes')->nullable();
            
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            $table->timestampTz('updated_at')->default(DB::raw('NOW()'));
            
            $table->index('tenant_id');
            $table->index('slug');
            $table->index('is_active');
            $table->index('priority');
        });

        // Personality Assignments (which personality handles which customer)
        Schema::create('personality_assignments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('personality_id');
            $table->uuid('customer_id');
            $table->uuid('tenant_id');
            
            // Assignment Configuration
            $table->enum('status', ['active', 'inactive', 'archived'])->default('active');
            $table->timestampTz('assigned_at')->default(DB::raw('NOW()'));
            $table->timestampTz('last_interaction_at')->nullable();
            
            // Assignment Rules
            $table->json('assignment_rules')->nullable(); // Why this personality was assigned
            $table->json('context')->nullable(); // Additional context for this assignment
            
            // Performance Metrics
            $table->integer('interaction_count')->default(0);
            $table->integer('conversation_count')->default(0);
            $table->decimal('average_rating', 3, 2)->nullable(); // Customer satisfaction
            $table->json('performance_metrics')->nullable(); // Additional metrics
            
            $table->text('notes')->nullable();
            
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            $table->timestampTz('updated_at')->default(DB::raw('NOW()'));
            
            $table->foreign('personality_id')
                  ->references('id')
                  ->on('ai_personalities')
                  ->onDelete('cascade');
            
            $table->foreign('customer_id')
                  ->references('id')
                  ->on('customers')
                  ->onDelete('cascade');
            
            $table->index('personality_id');
            $table->index('customer_id');
            $table->index('tenant_id');
            $table->index('status');
            $table->unique(['personality_id', 'customer_id']); // One personality per customer
        });

        // Personality Conversation History
        Schema::create('personality_conversations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('personality_id');
            $table->uuid('conversation_id'); // Links to existing conversations table
            $table->uuid('tenant_id');
            
            // Personality-specific data
            $table->json('personality_context')->nullable(); // Context used in this conversation
            $table->json('personality_metadata')->nullable(); // Additional metadata
            $table->integer('messages_handled')->default(0);
            
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            $table->timestampTz('updated_at')->default(DB::raw('NOW()'));
            
            $table->foreign('personality_id')
                  ->references('id')
                  ->on('ai_personalities')
                  ->onDelete('cascade');
            
            $table->foreign('conversation_id')
                  ->references('id')
                  ->on('conversations')
                  ->onDelete('cascade');
            
            $table->index('personality_id');
            $table->index('conversation_id');
            $table->index('tenant_id');
        });

        // Add personality_id to conversations table (if it doesn't exist)
        if (!Schema::hasColumn('conversations', 'personality_id')) {
            Schema::table('conversations', function (Blueprint $table) {
                $table->uuid('personality_id')->nullable()->after('customer_id');
                $table->foreign('personality_id')
                      ->references('id')
                      ->on('ai_personalities')
                      ->onDelete('set null');
                $table->index('personality_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('personality_conversations');
        Schema::dropIfExists('personality_assignments');
        Schema::dropIfExists('ai_personalities');
        
        if (Schema::hasColumn('conversations', 'personality_id')) {
            Schema::table('conversations', function (Blueprint $table) {
                $table->dropForeign(['personality_id']);
                $table->dropIndex(['personality_id']);
                $table->dropColumn('personality_id');
            });
        }
    }
};
```

### fix-uuid-defaults.php
```php
<?php
// Temporary script to fix UUID defaults in migrations for SQLite compatibility
// This removes PostgreSQL-specific uuid_generate_v4() defaults

$migrationFiles = glob(__DIR__ . '/*.php');

foreach ($migrationFiles as $file) {
    $content = file_get_contents($file);
    
    // Replace uuid_generate_v4() defaults with conditional logic
    $pattern = '/\$table->uuid\([\'"]id[\'"]\)->primary\(\)->default\(DB::raw\([\'"]uuid_generate_v4\(\)[\'"]\)\);/';
    $replacement = "\$table->uuid('id')->primary();";
    
    $newContent = preg_replace($pattern, $replacement, $content);
    
    if ($newContent !== $content) {
        file_put_contents($file, $newContent);
        echo "Fixed: " . basename($file) . "\n";
    }
}

echo "Done!\n";
```

---
## Controllers

### app/Http/Controllers/Controller.php
```php
<?php

namespace App\Http\Controllers;

abstract class Controller
{
    //
}
```

### app/Http/Controllers/Api/ServiceCategoryController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceCategoryController extends Controller
{
    /**
     * List all service categories
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $categories = ServiceCategory::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderBy('display_order', 'asc')
            ->orderBy('name', 'asc')
            ->get();
        
        return response()->json([
            'data' => $categories->map(fn($category) => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
                'display_order' => $category->display_order,
            ]),
        ]);
    }
    
    /**
     * Get category details with services
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $category = ServiceCategory::where('tenant_id', $tenantId)
            ->with(['services' => function($query) {
                $query->where('is_active', true)
                    ->orderBy('is_featured', 'desc')
                    ->orderBy('price', 'asc');
            }])
            ->findOrFail($id);
        
        return response()->json([
            'data' => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
                'services' => $category->services->map(fn($service) => [
                    'id' => $service->id,
                    'name' => $service->name,
                    'slug' => $service->slug,
                    'description' => $service->description,
                    'price' => $service->price,
                    'service_type' => $service->service_type,
                    'service_tier' => $service->service_tier,
                ]),
            ],
        ]);
    }
}
```

### app/Http/Controllers/Api/CrmAnalyticsController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Knowledge;
use App\Models\GeneratedPresentation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CrmAnalyticsController extends Controller
{
    /**
     * Get interest monitoring analytics
     */
    public function interest(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $days = (int) ($request->input('days', 30));
        $startDate = Carbon::now()->subDays($days);

        // Interest indicators from conversations
        $interestByTopic = Conversation::where('tenant_id', $tenantId)
            ->where('started_at', '>=', $startDate)
            ->whereNotNull('topics_discussed')
            ->select('topics_discussed')
            ->get()
            ->flatMap(function ($conv) {
                return is_array($conv->topics_discussed) ? $conv->topics_discussed : [];
            })
            ->countBy()
            ->map(function ($count, $topic) {
                return [
                    'topic' => $topic,
                    'count' => $count,
                ];
            })
            ->sortByDesc('count')
            ->values()
            ->take(10);

        // Questions asked (indicates interest)
        $questionsByType = Conversation::where('tenant_id', $tenantId)
            ->where('started_at', '>=', $startDate)
            ->whereNotNull('questions_asked')
            ->select('questions_asked')
            ->get()
            ->flatMap(function ($conv) {
                return is_array($conv->questions_asked) ? $conv->questions_asked : [];
            })
            ->countBy()
            ->map(function ($count, $question) {
                return [
                    'question' => substr($question, 0, 100),
                    'count' => $count,
                ];
            })
            ->sortByDesc('count')
            ->values()
            ->take(10);

        // Engagement level by customer
        $customerEngagement = Conversation::where('tenant_id', $tenantId)
            ->where('started_at', '>=', $startDate)
            ->whereNotNull('customer_id')
            ->select('customer_id', DB::raw('COUNT(*) as conversation_count'), DB::raw('AVG(duration_seconds) as avg_duration'))
            ->groupBy('customer_id')
            ->with('customer:id,business_name,email,lead_score')
            ->get()
            ->map(function ($item) {
                return [
                    'customer_id' => $item->customer_id,
                    'customer_name' => $item->customer->business_name ?? 'Unknown',
                    'customer_email' => $item->customer->email ?? null,
                    'lead_score' => $item->customer->lead_score ?? 0,
                    'conversation_count' => (int) $item->conversation_count,
                    'avg_duration' => $item->avg_duration ? (int) $item->avg_duration : null,
                ];
            })
            ->sortByDesc('conversation_count')
            ->values()
            ->take(20);

        // Interest over time
        $interestOverTime = Conversation::where('tenant_id', $tenantId)
            ->where('started_at', '>=', $startDate)
            ->selectRaw("CAST(started_at AS DATE) as date, COUNT(*) as count")
            ->groupBy(DB::raw("CAST(started_at AS DATE)"))
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date instanceof \Carbon\Carbon 
                        ? $item->date->toDateString() 
                        : (string) $item->date,
                    'count' => (int) $item->count,
                ];
            });

        return response()->json([
            'data' => [
                'interest_by_topic' => $interestByTopic,
                'questions_by_type' => $questionsByType,
                'customer_engagement' => $customerEngagement,
                'interest_over_time' => $interestOverTime,
                'date_range' => [
                    'start' => $startDate->toDateString(),
                    'end' => Carbon::now()->toDateString(),
                    'days' => $days,
                ],
            ],
        ]);
    }

    /**
     * Get purchase tracking analytics
     */
    public function purchases(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $days = (int) ($request->input('days', 30));
        $startDate = Carbon::now()->subDays($days);

        // Purchase metrics
        $totalPurchases = Order::where('tenant_id', $tenantId)
            ->where('payment_status', 'paid')
            ->count();
        
        $recentPurchases = Order::where('tenant_id', $tenantId)
            ->where('payment_status', 'paid')
            ->where('paid_at', '>=', $startDate)
            ->count();
        
        $totalRevenue = Order::where('tenant_id', $tenantId)
            ->where('payment_status', 'paid')
            ->sum('total');
        
        $recentRevenue = Order::where('tenant_id', $tenantId)
            ->where('payment_status', 'paid')
            ->where('paid_at', '>=', $startDate)
            ->sum('total');

        // Purchases by service type
        $purchasesByService = Order::where('tenant_id', $tenantId)
            ->where('payment_status', 'paid')
            ->where('paid_at', '>=', $startDate)
            ->with('items.service')
            ->get()
            ->flatMap(function ($order) {
                return $order->items->filter(function ($item) {
                    return $item->service !== null;
                })->map(function ($item) {
                    return $item->service->service_type ?? 'unknown';
                });
            })
            ->countBy()
            ->map(function ($count, $type) {
                return [
                    'service_type' => $type,
                    'count' => $count,
                ];
            })
            ->sortByDesc('count')
            ->values();

        // Customer purchase history
        $customerPurchases = Order::where('tenant_id', $tenantId)
            ->where('payment_status', 'paid')
            ->whereNotNull('customer_id')
            ->select('customer_id', DB::raw('COUNT(*) as purchase_count'), DB::raw('SUM(total) as total_spent'))
            ->groupBy('customer_id')
            ->with('customer:id,business_name,email,lead_score')
            ->get()
            ->map(function ($item) {
                return [
                    'customer_id' => $item->customer_id,
                    'customer_name' => $item->customer->business_name ?? 'Unknown',
                    'customer_email' => $item->customer->email ?? null,
                    'lead_score' => $item->customer->lead_score ?? 0,
                    'purchase_count' => (int) $item->purchase_count,
                    'total_spent' => (float) $item->total_spent,
                ];
            })
            ->sortByDesc('total_spent')
            ->values()
            ->take(20);

        // Purchase timeline
        $purchaseTimeline = Order::where('tenant_id', $tenantId)
            ->where('payment_status', 'paid')
            ->where('paid_at', '>=', $startDate)
            ->selectRaw("CAST(paid_at AS DATE) as date, COUNT(*) as count, SUM(total) as revenue")
            ->groupBy(DB::raw("CAST(paid_at AS DATE)"))
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date instanceof \Carbon\Carbon 
                        ? $item->date->toDateString() 
                        : (string) $item->date,
                    'count' => (int) $item->count,
                    'revenue' => (float) $item->revenue,
                ];
            });

        // Conversion funnel (conversations -> purchases)
        $totalConversations = Conversation::where('tenant_id', $tenantId)
            ->where('started_at', '>=', $startDate)
            ->count();
        
        $conversationsWithPurchase = Conversation::where('tenant_id', $tenantId)
            ->where('started_at', '>=', $startDate)
            ->where('outcome', 'service_purchase')
            ->count();
        
        $conversionRate = $totalConversations > 0 
            ? ($conversationsWithPurchase / $totalConversations) * 100 
            : 0;

        return response()->json([
            'data' => [
                'summary' => [
                    'total_purchases' => $totalPurchases,
                    'recent_purchases' => $recentPurchases,
                    'total_revenue' => (float) $totalRevenue,
                    'recent_revenue' => (float) $recentRevenue,
                    'conversion_rate' => round($conversionRate, 2),
                ],
                'purchases_by_service' => $purchasesByService,
                'customer_purchases' => $customerPurchases,
                'purchase_timeline' => $purchaseTimeline,
                'conversion_funnel' => [
                    'conversations' => $totalConversations,
                    'conversions' => $conversationsWithPurchase,
                    'rate' => round($conversionRate, 2),
                ],
                'date_range' => [
                    'start' => $startDate->toDateString(),
                    'end' => Carbon::now()->toDateString(),
                    'days' => $days,
                ],
            ],
        ]);
    }

    /**
     * Get learning analytics
     */
    public function learning(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $days = (int) ($request->input('days', 30));
        $startDate = Carbon::now()->subDays($days);

        // Knowledge base metrics
        $totalKnowledge = Knowledge::where('tenant_id', $tenantId)->count();
        $recentKnowledge = Knowledge::where('tenant_id', $tenantId)
            ->where('created_at', '>=', $startDate)
            ->count();

        // Presentation metrics
        $totalPresentations = GeneratedPresentation::where('tenant_id', $tenantId)->count();
        $recentPresentations = GeneratedPresentation::where('tenant_id', $tenantId)
            ->where('created_at', '>=', $startDate)
            ->count();

        // Conversation learning metrics
        $conversationsWithQuestions = Conversation::where('tenant_id', $tenantId)
            ->where('started_at', '>=', $startDate)
            ->whereNotNull('questions_asked')
            ->count();
        
        $totalQuestions = Conversation::where('tenant_id', $tenantId)
            ->where('started_at', '>=', $startDate)
            ->whereNotNull('questions_asked')
            ->get()
            ->sum(function ($conv) {
                return is_array($conv->questions_asked) ? count($conv->questions_asked) : 0;
            });

        // Learning engagement by customer
        $customerLearning = Conversation::where('tenant_id', $tenantId)
            ->where('started_at', '>=', $startDate)
            ->whereNotNull('customer_id')
            ->select('customer_id', 
                DB::raw('COUNT(*) as session_count'),
                DB::raw('SUM(CASE WHEN questions_asked IS NOT NULL THEN 1 ELSE 0 END) as sessions_with_questions'),
                DB::raw('AVG(duration_seconds) as avg_duration')
            )
            ->groupBy('customer_id')
            ->with('customer:id,business_name,email')
            ->get()
            ->map(function ($item) {
                return [
                    'customer_id' => $item->customer_id,
                    'customer_name' => $item->customer->business_name ?? 'Unknown',
                    'customer_email' => $item->customer->email ?? null,
                    'session_count' => (int) $item->session_count,
                    'sessions_with_questions' => (int) $item->sessions_with_questions,
                    'avg_duration' => $item->avg_duration ? (int) $item->avg_duration : null,
                ];
            })
            ->sortByDesc('session_count')
            ->values()
            ->take(20);

        // Learning activity over time
        $learningOverTime = Conversation::where('tenant_id', $tenantId)
            ->where('started_at', '>=', $startDate)
            ->selectRaw("CAST(started_at AS DATE) as date, COUNT(*) as sessions, SUM(CASE WHEN questions_asked IS NOT NULL THEN 1 ELSE 0 END) as sessions_with_questions")
            ->groupBy(DB::raw("CAST(started_at AS DATE)"))
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date instanceof \Carbon\Carbon 
                        ? $item->date->toDateString() 
                        : (string) $item->date,
                    'sessions' => (int) $item->sessions,
                    'sessions_with_questions' => (int) $item->sessions_with_questions,
                ];
            });

        return response()->json([
            'data' => [
                'knowledge_base' => [
                    'total' => $totalKnowledge,
                    'recent' => $recentKnowledge,
                ],
                'presentations' => [
                    'total' => $totalPresentations,
                    'recent' => $recentPresentations,
                ],
                'engagement' => [
                    'conversations_with_questions' => $conversationsWithQuestions,
                    'total_questions' => $totalQuestions,
                    'avg_questions_per_session' => $conversationsWithQuestions > 0 
                        ? round($totalQuestions / $conversationsWithQuestions, 2) 
                        : 0,
                ],
                'customer_learning' => $customerLearning,
                'learning_over_time' => $learningOverTime,
                'date_range' => [
                    'start' => $startDate->toDateString(),
                    'end' => Carbon::now()->toDateString(),
                    'days' => $days,
                ],
            ],
        ]);
    }

    /**
     * Get campaign performance metrics
     */
    public function campaignPerformance(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $days = (int) ($request->input('days', 30));
        $startDate = Carbon::now()->subDays($days);

        // Campaign performance from conversations (using utm_campaign from landing pages)
        $campaignPerformance = Conversation::where('tenant_id', $tenantId)
            ->where('started_at', '>=', $startDate)
            ->whereNotNull('entry_point')
            ->select('entry_point', 
                DB::raw('COUNT(*) as total_sessions'),
                DB::raw('SUM(CASE WHEN outcome = \'service_purchase\' THEN 1 ELSE 0 END) as conversions'),
                DB::raw('AVG(duration_seconds) as avg_duration'),
                DB::raw('SUM(CASE WHEN questions_asked IS NOT NULL THEN 1 ELSE 0 END) as sessions_with_questions')
            )
            ->groupBy('entry_point')
            ->get()
            ->map(function ($item) {
                $conversionRate = $item->total_sessions > 0 
                    ? ($item->conversions / $item->total_sessions) * 100 
                    : 0;
                
                return [
                    'campaign_type' => $item->entry_point,
                    'total_sessions' => (int) $item->total_sessions,
                    'conversions' => (int) $item->conversions,
                    'conversion_rate' => round($conversionRate, 2),
                    'avg_duration' => $item->avg_duration ? (int) $item->avg_duration : null,
                    'engagement_rate' => $item->total_sessions > 0 
                        ? round(($item->sessions_with_questions / $item->total_sessions) * 100, 2) 
                        : 0,
                ];
            })
            ->sortByDesc('conversion_rate')
            ->values();

        return response()->json([
            'data' => [
                'campaign_performance' => $campaignPerformance,
                'date_range' => [
                    'start' => $startDate->toDateString(),
                    'end' => Carbon::now()->toDateString(),
                    'days' => $days,
                ],
            ],
        ]);
    }
}
```

### app/Http/Controllers/Api/PresentationController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PresentationTemplate;
use App\Models\GeneratedPresentation;
use App\Models\Customer;
use App\Services\OpenRouterService;
use App\Services\ElevenLabsService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class PresentationController extends Controller
{
    protected OpenRouterService $openRouterService;
    protected ElevenLabsService $elevenLabsService;

    public function __construct(
        OpenRouterService $openRouterService,
        ElevenLabsService $elevenLabsService
    ) {
        $this->openRouterService = $openRouterService;
        $this->elevenLabsService = $elevenLabsService;
    }

    /**
     * List presentation templates
     */
    public function templates(Request $request): JsonResponse
    {
        $query = PresentationTemplate::where('is_active', true);
        
        if ($request->has('purpose')) {
            $query->where('purpose', $request->purpose);
        }
        
        $templates = $query->orderBy('name')->get();
        
        return response()->json([
            'data' => $templates,
            'count' => $templates->count(),
        ]);
    }
    
    /**
     * Get presentation template
     */
    public function showTemplate(string $id): JsonResponse
    {
        $template = PresentationTemplate::findOrFail($id);
        
        return response()->json([
            'data' => $template,
        ]);
    }
    
    /**
     * Get generated presentation
     */
    public function show(string $id): JsonResponse
    {
        $presentation = GeneratedPresentation::with('template')->findOrFail($id);
        
        // Increment view count
        $presentation->increment('view_count');
        $presentation->last_viewed_at = now();
        $presentation->save();
        
        return response()->json([
            'data' => $presentation,
        ]);
    }
    
    /**
     * Generate presentation
     */
    public function generate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'tenant_id' => 'required|uuid',
            'template_id' => 'required|string|exists:presentation_templates,id',
            'customer_id' => 'nullable|uuid|exists:customers,id',
            'custom_data' => 'nullable|array',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }
        
        $tenantId = $request->input('tenant_id');
        $templateId = $request->input('template_id');
        $customerId = $request->input('customer_id');
        $customData = $request->input('custom_data', []);
        
        // Get template
        $template = PresentationTemplate::findOrFail($templateId);
        
        // Get customer data if provided
        $customerData = null;
        if ($customerId) {
            $customer = Customer::where('tenant_id', $tenantId)->findOrFail($customerId);
            $customerData = [
                'business_name' => $customer->business_name,
                'owner_name' => $customer->owner_name,
                'industry' => $customer->industry_category,
                'description' => $customer->business_description,
            ];
        }
        
        // Generate presentation content
        $presentationJson = $this->generatePresentationContent($template, $customerData, $customData);
        
        // Create input hash for caching
        $inputHash = hash('sha256', json_encode([
            'template_id' => $templateId,
            'customer_id' => $customerId,
            'custom_data' => $customData,
        ]));
        
        // Check for existing cached presentation
        $existing = GeneratedPresentation::where('input_hash', $inputHash)
            ->where('expires_at', '>', now())
            ->first();
        
        if ($existing) {
            return response()->json([
                'data' => $existing,
                'message' => 'Cached presentation retrieved',
                'cached' => true,
            ]);
        }
        
        // Create new presentation
        $presentation = GeneratedPresentation::create([
            'tenant_id' => $tenantId,
            'customer_id' => $customerId,
            'template_id' => $templateId,
            'presentation_json' => $presentationJson,
            'input_hash' => $inputHash,
            'expires_at' => now()->addDays(30), // Cache for 30 days
        ]);
        
        return response()->json([
            'data' => $presentation,
            'message' => 'Presentation generated successfully',
            'cached' => false,
        ], 201);
    }
    
    /**
     * Generate presentation content from template
     */
    protected function generatePresentationContent(
        PresentationTemplate $template,
        ?array $customerData,
        array $customData
    ): array {
        $slides = $template->slides ?? [];
        $injectionPoints = $template->injection_points ?? [];
        
        // Process each slide
        $generatedSlides = [];
        foreach ($slides as $slide) {
            $slideData = $slide;
            
            // Inject customer data if available
            if ($customerData) {
                foreach ($injectionPoints as $field => $targetSlides) {
                    if (in_array($slide['id'] ?? null, $targetSlides)) {
                        $slideData['content'] = str_replace(
                            "{{{$field}}}",
                            $customerData[$field] ?? '',
                            $slideData['content'] ?? ''
                        );
                    }
                }
            }
            
            // Inject custom data
            foreach ($customData as $key => $value) {
                $slideData['content'] = str_replace(
                    "{{{$key}}}",
                    $value,
                    $slideData['content'] ?? ''
                );
            }
            
            $generatedSlides[] = $slideData;
        }
        
        return [
            'id' => (string) Str::uuid(),
            'template_id' => $template->id,
            'template_name' => $template->name,
            'slides' => $generatedSlides,
            'theme' => $template->default_theme ?? [],
            'presenter_id' => $template->default_presenter_id,
            'generated_at' => now()->toIso8601String(),
        ];
    }
    
    /**
     * Generate audio for presentation
     */
    public function generateAudio(Request $request, string $id): JsonResponse
    {
        $presentation = GeneratedPresentation::findOrFail($id);
        
        if ($presentation->audio_generated) {
            return response()->json([
                'data' => $presentation,
                'message' => 'Audio already generated',
            ]);
        }
        
        $slides = $presentation->presentation_json['slides'] ?? [];
        $audioFiles = [];
        
        // Generate audio for each slide
        foreach ($slides as $slide) {
            $text = $this->extractTextFromSlide($slide);
            if (empty($text)) {
                continue;
            }
            
            $audioData = $this->elevenLabsService->generateAudio($text);
            if ($audioData) {
                // Save audio file
                $filename = "presentations/{$presentation->id}/slide-{$slide['id']}.mp3";
                Storage::disk('public')->put($filename, $audioData);
                
                $audioFiles[$slide['id']] = $filename;
            }
        }
        
        // Update presentation
        $presentation->audio_generated = true;
        $presentation->audio_generated_at = now();
        $presentation->audio_base_url = Storage::disk('public')->url('presentations/' . $presentation->id);
        
        // Update presentation JSON with audio file references
        $presentationJson = $presentation->presentation_json;
        $presentationJson['audio_files'] = $audioFiles;
        $presentation->presentation_json = $presentationJson;
        $presentation->save();
        
        return response()->json([
            'data' => $presentation->fresh(),
            'message' => 'Audio generated successfully',
        ]);
    }
    
    /**
     * Extract text content from slide
     */
    protected function extractTextFromSlide(array $slide): string
    {
        $text = '';
        
        // Extract from content field
        if (isset($slide['content'])) {
            $text .= strip_tags($slide['content']) . ' ';
        }
        
        // Extract from title
        if (isset($slide['title'])) {
            $text .= $slide['title'] . ' ';
        }
        
        // Extract from body
        if (isset($slide['body'])) {
            $text .= strip_tags($slide['body']) . ' ';
        }
        
        return trim($text);
    }
}
```

### app/Http/Controllers/Api/SearchController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Knowledge;
use App\Services\OpenAIService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class SearchController extends Controller
{
    protected OpenAIService $openaiService;

    public function __construct(OpenAIService $openaiService)
    {
        $this->openaiService = $openaiService;
    }

    /**
     * Semantic/vector search
     */
    public function search(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'query' => 'required|string',
            'tenant_id' => 'required|uuid',
            'limit' => 'nullable|integer|min:1|max:50',
            'threshold' => 'nullable|numeric|min:0|max:1',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }
        
        $queryText = $request->input('query');
        $tenantId = $request->input('tenant_id');
        $limit = $request->input('limit', 10);
        $threshold = $request->input('threshold', 0.7);
        
        // Generate embedding for query
        $queryEmbedding = $this->openaiService->generateEmbedding($queryText);
        
        if (!$queryEmbedding) {
            return response()->json([
                'error' => 'Failed to generate embedding for query'
            ], 500);
        }
        
        // Convert array to PostgreSQL vector format
        $embeddingString = '[' . implode(',', $queryEmbedding) . ']';
        
        // Use the database function for vector search
        try {
            $results = DB::select(
                "SELECT * FROM search_knowledge_base(?, ?, ?::vector, ?, ?)",
                [$tenantId, $queryText, $embeddingString, $limit, $threshold]
            );
        } catch (\Exception $e) {
            // If database function doesn't exist or vector extension not available, use direct query
            Log::warning('Vector search function not available, using direct query', ['error' => $e->getMessage()]);
            
            $results = DB::select("
                SELECT 
                    id,
                    title,
                    content,
                    category,
                    source,
                    validation_status,
                    1 - (embedding <=> ?::vector) as similarity_score
                FROM knowledge_base
                WHERE tenant_id = ?
                    AND embedding IS NOT NULL
                    AND is_public = true
                    AND (allowed_agents IS NULL OR array_length(allowed_agents, 1) = 0)
                    AND (1 - (embedding <=> ?::vector)) >= ?
                ORDER BY embedding <=> ?::vector
                LIMIT ?
            ", [$embeddingString, $tenantId, $embeddingString, $threshold, $embeddingString, $limit]);
        }
        
        return response()->json([
            'data' => $results,
            'query' => $queryText,
            'count' => count($results),
        ]);
    }
    
    /**
     * Full-text search
     */
    public function fullTextSearch(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'query' => 'required|string',
            'tenant_id' => 'required|uuid',
            'limit' => 'nullable|integer|min:1|max:50',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }
        
        $queryText = $request->input('query');
        $tenantId = $request->input('tenant_id');
        $limit = $request->input('limit', 10);
        
        // Full-text search using PostgreSQL tsvector
        $results = Knowledge::where('tenant_id', $tenantId)
            ->where('is_public', true)
            ->where(function($q) use ($queryText) {
                $q->whereRaw("to_tsvector('english', title || ' ' || content) @@ plainto_tsquery('english', ?)", [$queryText])
                  ->orWhere('title', 'ILIKE', "%{$queryText}%")
                  ->orWhere('content', 'ILIKE', "%{$queryText}%");
            })
            ->select([
                'id',
                'title',
                'content',
                'category',
                DB::raw("ts_rank(to_tsvector('english', title || ' ' || content), plainto_tsquery('english', ?)) as rank", [$queryText])
            ])
            ->orderBy('rank', 'desc')
            ->limit($limit)
            ->get();
        
        return response()->json([
            'data' => $results,
            'query' => $queryText,
            'count' => $results->count(),
            'type' => 'fulltext',
        ]);
    }
    
    /**
     * Hybrid search (combines semantic + full-text)
     */
    public function hybridSearch(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'query' => 'required|string',
            'tenant_id' => 'required|uuid',
            'limit' => 'nullable|integer|min:1|max:50',
            'threshold' => 'nullable|numeric|min:0|max:1',
            'semantic_weight' => 'nullable|numeric|min:0|max:1',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }
        
        $queryText = $request->input('query');
        $tenantId = $request->input('tenant_id');
        $limit = $request->input('limit', 10);
        $threshold = $request->input('threshold', 0.7);
        $semanticWeight = $request->input('semantic_weight', 0.7);
        $textWeight = 1 - $semanticWeight;
        
        // Generate embedding for semantic search
        $queryEmbedding = $this->openaiService->generateEmbedding($queryText);
        
        if (!$queryEmbedding) {
            // Fallback to full-text only if embedding fails
            return $this->fullTextSearch($request);
        }
        
        $embeddingString = '[' . implode(',', $queryEmbedding) . ']';
        
        // Hybrid search: combine vector similarity with full-text rank
        try {
            $results = DB::select("
                SELECT 
                    kb.id,
                    kb.title,
                    kb.content,
                    kb.category,
                    kb.source,
                    kb.validation_status,
                    -- Normalized semantic similarity (0-1)
                    (1 - (kb.embedding <=> ?::vector)) as semantic_score,
                    -- Normalized full-text rank (0-1)
                    LEAST(ts_rank(to_tsvector('english', kb.title || ' ' || kb.content), plainto_tsquery('english', ?)) * 10, 1.0) as text_score,
                    -- Combined score
                    (
                        (1 - (kb.embedding <=> ?::vector)) * ? +
                        LEAST(ts_rank(to_tsvector('english', kb.title || ' ' || kb.content), plainto_tsquery('english', ?)) * 10, 1.0) * ?
                    ) as combined_score
                FROM knowledge_base kb
                WHERE kb.tenant_id = ?
                    AND kb.embedding IS NOT NULL
                    AND kb.is_public = true
                    AND (kb.allowed_agents IS NULL OR array_length(kb.allowed_agents, 1) = 0)
                    AND (
                        (1 - (kb.embedding <=> ?::vector)) >= ? OR
                        to_tsvector('english', kb.title || ' ' || kb.content) @@ plainto_tsquery('english', ?)
                    )
                ORDER BY combined_score DESC
                LIMIT ?
            ", [
                $embeddingString, $queryText, // semantic_score
                $embeddingString, $semanticWeight, $queryText, $textWeight, // combined_score
                $tenantId, // WHERE
                $embeddingString, $threshold, $queryText, // AND conditions
                $limit, // LIMIT
            ]);
            
            return response()->json([
                'data' => $results,
                'query' => $queryText,
                'count' => count($results),
                'type' => 'hybrid',
                'weights' => [
                    'semantic' => $semanticWeight,
                    'text' => $textWeight,
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('Hybrid search failed', ['error' => $e->getMessage()]);
            // Fallback to full-text search
            return $this->fullTextSearch($request);
        }
    }
    
    /**
     * Get embedding status for all knowledge items
     */
    public function embeddingStatus(): JsonResponse
    {
        $status = Knowledge::select('embedding_status', DB::raw('COUNT(*) as count'))
            ->groupBy('embedding_status')
            ->get()
            ->keyBy('embedding_status');
        
        $total = Knowledge::count();
        $pending = Knowledge::where('embedding_status', 'pending')->count();
        $completed = Knowledge::where('embedding_status', 'completed')->count();
        $processing = Knowledge::where('embedding_status', 'processing')->count();
        $failed = Knowledge::where('embedding_status', 'failed')->count();
        
        return response()->json([
            'data' => [
                'total' => $total,
                'pending' => $pending,
                'processing' => $processing,
                'completed' => $completed,
                'failed' => $failed,
                'percentage_complete' => $total > 0 ? round(($completed / $total) * 100, 2) : 0,
            ],
        ]);
    }
}
```

### app/Http/Controllers/Api/StripeWebhookController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Customer;
use App\Services\StripeService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;

class StripeWebhookController extends Controller
{
    public function __construct(
        private StripeService $stripeService
    ) {}

    /**
     * Handle Stripe webhook events
     */
    public function handle(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $webhookSecret = config('services.stripe.webhook_secret');

        if (!$webhookSecret) {
            Log::error('Stripe webhook secret not configured');
            return response()->json(['error' => 'Webhook secret not configured'], 500);
        }

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $webhookSecret);
        } catch (SignatureVerificationException $e) {
            Log::error('Stripe webhook signature verification failed: ' . $e->getMessage());
            return response()->json(['error' => 'Invalid signature'], 400);
        } catch (Exception $e) {
            Log::error('Stripe webhook error: ' . $e->getMessage());
            return response()->json(['error' => 'Webhook error'], 400);
        }

        // Handle the event
        try {
            match ($event->type) {
                'checkout.session.completed' => $this->handleCheckoutSessionCompleted($event->data->object),
                'payment_intent.succeeded' => $this->handlePaymentIntentSucceeded($event->data->object),
                'payment_intent.payment_failed' => $this->handlePaymentIntentFailed($event->data->object),
                'charge.refunded' => $this->handleChargeRefunded($event->data->object),
                default => Log::info('Unhandled Stripe webhook event: ' . $event->type),
            };

            return response()->json(['status' => 'success']);
        } catch (Exception $e) {
            Log::error('Error handling Stripe webhook: ' . $e->getMessage(), [
                'event_type' => $event->type,
                'event_id' => $event->id,
            ]);

            return response()->json(['error' => 'Processing error'], 500);
        }
    }

    /**
     * Handle checkout.session.completed event
     */
    private function handleCheckoutSessionCompleted(object $session): void
    {
        Log::info('Stripe checkout session completed', [
            'session_id' => $session->id,
            'payment_intent' => $session->payment_intent,
        ]);

        // Find order by session ID
        $order = Order::where('stripe_session_id', $session->id)->first();

        if (!$order) {
            Log::warning('Order not found for Stripe session', ['session_id' => $session->id]);
            return;
        }

        // Only process if not already paid
        if ($order->payment_status === 'paid') {
            Log::info('Order already processed', ['order_id' => $order->id]);
            return;
        }

        DB::transaction(function () use ($order, $session) {
            // Update order payment status
            $order->update([
                'payment_status' => 'paid',
                'status' => 'processing',
                'stripe_payment_intent_id' => $session->payment_intent ?? $order->stripe_payment_intent_id,
                'paid_at' => now(),
            ]);

            // Reduce service inventory
            $order->load('items.service');
            foreach ($order->items as $item) {
                if ($item->service && $item->service->track_inventory) {
                    $service = $item->service;
                    $service->decrement('quantity', $item->quantity);

                    if ($service->quantity <= 0) {
                        $service->update(['is_active' => false]);
                    }
                }
            }

            // Find or create customer
            $customer = $this->findOrCreateCustomer($order);

            if ($customer) {
                $order->update(['customer_id' => $customer->id]);
            }

            // Track purchase in CRM
            $this->trackPurchaseInCRM($order, $customer);

            // Fulfill order (create subscriptions if needed, etc.)
            $this->fulfillOrder($order);

            Log::info('Order payment completed', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'customer_id' => $customer?->id,
            ]);
        });
    }

    /**
     * Handle payment_intent.succeeded event
     */
    private function handlePaymentIntentSucceeded(object $paymentIntent): void
    {
        Log::info('Stripe payment intent succeeded', [
            'payment_intent_id' => $paymentIntent->id,
        ]);

        // Find order by payment intent ID
        $order = Order::where('stripe_payment_intent_id', $paymentIntent->id)->first();

        if (!$order) {
            Log::warning('Order not found for payment intent', ['payment_intent_id' => $paymentIntent->id]);
            return;
        }

        // Only update if not already paid (checkout.session.completed may have already processed it)
        if ($order->payment_status !== 'paid') {
            DB::transaction(function () use ($order, $paymentIntent) {
                $order->update([
                    'payment_status' => 'paid',
                    'status' => 'processing',
                    'stripe_charge_id' => $paymentIntent->charges->data[0]->id ?? null,
                    'paid_at' => now(),
                ]);

                // Reduce service inventory
                $order->load('items.service');
                foreach ($order->items as $item) {
                    if ($item->service && $item->service->track_inventory) {
                        $service = $item->service;
                        $service->decrement('quantity', $item->quantity);

                        if ($service->quantity <= 0) {
                            $service->update(['is_active' => false]);
                        }
                    }
                }

                $customer = $this->findOrCreateCustomer($order);
                if ($customer) {
                    $order->update(['customer_id' => $customer->id]);
                }

                $this->trackPurchaseInCRM($order, $customer);
                $this->fulfillOrder($order);
            });
        }
    }

    /**
     * Handle payment_intent.payment_failed event
     */
    private function handlePaymentIntentFailed(object $paymentIntent): void
    {
        Log::info('Stripe payment intent failed', [
            'payment_intent_id' => $paymentIntent->id,
        ]);

        $order = Order::where('stripe_payment_intent_id', $paymentIntent->id)->first();

        if ($order) {
            $order->update([
                'payment_status' => 'failed',
                'status' => 'cancelled',
            ]);
        }
    }

    /**
     * Handle charge.refunded event
     */
    private function handleChargeRefunded(object $charge): void
    {
        Log::info('Stripe charge refunded', [
            'charge_id' => $charge->id,
        ]);

        $order = Order::where('stripe_charge_id', $charge->id)->first();

        if ($order) {
            DB::transaction(function () use ($order) {
                $order->update([
                    'payment_status' => 'refunded',
                    'status' => 'cancelled',
                ]);

                // Restore service inventory
                $order->load('items.service');
                foreach ($order->items as $item) {
                    if ($item->service && $item->service->track_inventory) {
                        $service = $item->service;
                        $service->increment('quantity', $item->quantity);
                        $service->update(['is_active' => true]);
                    }
                }
            });
        }
    }

    /**
     * Find or create customer from order
     */
    private function findOrCreateCustomer(Order $order): ?Customer
    {
        if (!$order->customer_email) {
            return null;
        }

        // Try to find existing customer by email
        $customer = Customer::where('tenant_id', $order->tenant_id)
            ->where('email', $order->customer_email)
            ->first();

        if (!$customer) {
            // Create new customer
            $customer = Customer::create([
                'tenant_id' => $order->tenant_id,
                'email' => $order->customer_email,
                'business_name' => $order->customer_name ?? 'New Customer',
                'owner_name' => $order->customer_name,
                'lead_source' => 'service_purchase',
                'lead_score' => 50, // Starting score for paying customers
            ]);
        }

        return $customer;
    }

    /**
     * Track purchase in CRM
     */
    private function trackPurchaseInCRM(Order $order, ?Customer $customer): void
    {
        if (!$customer) {
            return;
        }

        // Update customer lead score based on purchase
        $purchaseAmount = $order->total;
        $scoreIncrease = min((int)($purchaseAmount / 10), 50); // Max 50 point increase
        
        $customer->increment('lead_score', $scoreIncrease);
        if ($customer->lead_score > 100) {
            $customer->update(['lead_score' => 100]);
        }

        // Create conversation record for the purchase
        try {
            $conversation = \App\Models\Conversation::create([
                'tenant_id' => $order->tenant_id,
                'customer_id' => $customer->id,
                'entry_point' => 'service_purchase',
                'outcome' => 'service_purchase',
                'outcome_details' => "Purchased services: Order #{$order->order_number}",
                'started_at' => now(),
            ]);

            // Add order details to conversation new_data_collected
            $order->load('items.service');
            $services = $order->items->map(fn($item) => $item->service_name)->join(', ');
            
            $conversation->update([
                'new_data_collected' => array_merge($conversation->new_data_collected ?? [], [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'total_amount' => $order->total,
                    'services' => $services,
                ]),
            ]);

            Log::info('Purchase tracked in CRM', [
                'order_id' => $order->id,
                'customer_id' => $customer->id,
                'conversation_id' => $conversation->id,
            ]);
        } catch (Exception $e) {
            Log::error('Failed to track purchase in CRM: ' . $e->getMessage());
        }
    }

    /**
     * Fulfill order (create subscriptions, activate services, etc.)
     */
    private function fulfillOrder(Order $order): void
    {
        $order->load('items.service');

        foreach ($order->items as $item) {
            $service = $item->service;

            if (!$service) {
                continue;
            }

            // If service is a subscription, create subscription record
            if ($service->is_subscription && $order->customer_id) {
                try {
                    \App\Models\ServiceSubscription::create([
                        'tenant_id' => $order->tenant_id,
                        'customer_id' => $order->customer_id,
                        'user_id' => $order->user_id,
                        'service_id' => $service->id,
                        'order_id' => $order->id,
                        'tier' => $service->service_tier ?? 'basic',
                        'status' => 'active',
                        'subscription_started_at' => now(),
                        'subscription_expires_at' => $service->billing_period === 'annual' 
                            ? now()->addYear() 
                            : now()->addMonth(),
                        'auto_renew' => true,
                        'monthly_amount' => $service->price,
                        'billing_cycle' => $service->billing_period === 'annual' ? 'annual' : 'monthly',
                    ]);

                    Log::info('Service subscription created', [
                        'order_id' => $order->id,
                        'service_id' => $service->id,
                    ]);
                } catch (Exception $e) {
                    Log::error('Failed to create subscription: ' . $e->getMessage());
                }
            }
        }

        // Mark order as completed after fulfillment
        $order->update(['status' => 'completed']);
    }
}
```

### app/Http/Controllers/Api/CrmDashboardController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Conversation;
use App\Models\Order;
use App\Models\ServiceSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CrmDashboardController extends Controller
{
    /**
     * Get CRM dashboard analytics
     */
    public function analytics(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        // Date range (default to last 30 days)
        $days = (int) ($request->input('days', 30));
        $startDate = Carbon::now()->subDays($days);
        $endDate = Carbon::now();

        // Customer Metrics
        $totalCustomers = Customer::where('tenant_id', $tenantId)->count();
        $newCustomers = Customer::where('tenant_id', $tenantId)
            ->where('created_at', '>=', $startDate)
            ->count();
        
        $customersByLeadScore = Customer::where('tenant_id', $tenantId)
            ->selectRaw('
                CASE 
                    WHEN lead_score >= 80 THEN "high"
                    WHEN lead_score >= 50 THEN "medium"
                    WHEN lead_score >= 25 THEN "low"
                    ELSE "cold"
                END as score_category,
                COUNT(*) as count
            ')
            ->groupBy('score_category')
            ->get()
            ->pluck('count', 'score_category')
            ->toArray();

        $customersByIndustry = Customer::where('tenant_id', $tenantId)
            ->whereNotNull('industry_category')
            ->select('industry_category', DB::raw('COUNT(*) as count'))
            ->groupBy('industry_category')
            ->orderByDesc('count')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'industry' => $item->industry_category,
                    'count' => (int) $item->count,
                ];
            });

        // Conversation Metrics
        $totalConversations = Conversation::where('tenant_id', $tenantId)->count();
        $recentConversations = Conversation::where('tenant_id', $tenantId)
            ->where('started_at', '>=', $startDate)
            ->count();

        $conversationsByOutcome = Conversation::where('tenant_id', $tenantId)
            ->whereNotNull('outcome')
            ->select('outcome', DB::raw('COUNT(*) as count'))
            ->groupBy('outcome')
            ->get()
            ->map(function ($item) {
                return [
                    'outcome' => $item->outcome,
                    'count' => (int) $item->count,
                ];
            });

        $avgConversationDuration = Conversation::where('tenant_id', $tenantId)
            ->whereNotNull('duration_seconds')
            ->where('duration_seconds', '>', 0)
            ->avg('duration_seconds');

        // Order & Revenue Metrics
        $totalOrders = Order::where('tenant_id', $tenantId)->count();
        $paidOrders = Order::where('tenant_id', $tenantId)
            ->where('payment_status', 'paid')
            ->count();
        
        $totalRevenue = Order::where('tenant_id', $tenantId)
            ->where('payment_status', 'paid')
            ->sum('total');
        
        $recentRevenue = Order::where('tenant_id', $tenantId)
            ->where('payment_status', 'paid')
            ->where('paid_at', '>=', $startDate)
            ->sum('total');
        
        $recentOrders = Order::where('tenant_id', $tenantId)
            ->where('created_at', '>=', $startDate)
            ->count();

        // Revenue over time (last 30 days, grouped by day)
        // PostgreSQL: CAST(paid_at AS DATE) or DATE_TRUNC('day', paid_at)::DATE
        $revenueOverTime = Order::where('tenant_id', $tenantId)
            ->where('payment_status', 'paid')
            ->where('paid_at', '>=', $startDate)
            ->selectRaw("CAST(paid_at AS DATE) as date, SUM(total) as revenue")
            ->groupBy(DB::raw("CAST(paid_at AS DATE)"))
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date instanceof \Carbon\Carbon 
                        ? $item->date->toDateString() 
                        : (string) $item->date,
                    'revenue' => (float) $item->revenue,
                ];
            });

        // Subscription Metrics
        $activeSubscriptions = ServiceSubscription::where('tenant_id', $tenantId)
            ->where('status', 'active')
            ->count();
        
        $subscriptionsByTier = ServiceSubscription::where('tenant_id', $tenantId)
            ->where('status', 'active')
            ->select('tier', DB::raw('COUNT(*) as count'))
            ->groupBy('tier')
            ->get()
            ->map(function ($item) {
                return [
                    'tier' => $item->tier,
                    'count' => (int) $item->count,
                ];
            });

        // Conversion Metrics
        $conversationsWithPurchase = Conversation::where('tenant_id', $tenantId)
            ->where('outcome', 'service_purchase')
            ->count();
        
        $conversionRate = $totalConversations > 0 
            ? ($conversationsWithPurchase / $totalConversations) * 100 
            : 0;

        // Recent Activity (last 10 items)
        $recentCustomers = Customer::where('tenant_id', $tenantId)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get(['id', 'business_name', 'email', 'lead_score', 'created_at']);

        $recentOrders = Order::where('tenant_id', $tenantId)
            ->with('customer:id,business_name')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get(['id', 'order_number', 'customer_id', 'total', 'status', 'payment_status', 'created_at']);

        $recentConversations = Conversation::where('tenant_id', $tenantId)
            ->with('customer:id,business_name')
            ->orderBy('started_at', 'desc')
            ->limit(5)
            ->get(['id', 'customer_id', 'outcome', 'duration_seconds', 'started_at']);

        return response()->json([
            'data' => [
                'customers' => [
                    'total' => $totalCustomers,
                    'new' => $newCustomers,
                    'by_lead_score' => [
                        'high' => (int) ($customersByLeadScore['high'] ?? 0),
                        'medium' => (int) ($customersByLeadScore['medium'] ?? 0),
                        'low' => (int) ($customersByLeadScore['low'] ?? 0),
                        'cold' => (int) ($customersByLeadScore['cold'] ?? 0),
                    ],
                    'by_industry' => $customersByIndustry,
                ],
                'conversations' => [
                    'total' => $totalConversations,
                    'recent' => $recentConversations,
                    'by_outcome' => $conversationsByOutcome,
                    'avg_duration_seconds' => $avgConversationDuration ? (int) $avgConversationDuration : null,
                ],
                'orders' => [
                    'total' => $totalOrders,
                    'paid' => $paidOrders,
                    'recent' => $recentOrders,
                    'total_revenue' => (float) $totalRevenue,
                    'recent_revenue' => (float) $recentRevenue,
                    'revenue_over_time' => $revenueOverTime,
                ],
                'subscriptions' => [
                    'active' => $activeSubscriptions,
                    'by_tier' => $subscriptionsByTier,
                ],
                'conversion' => [
                    'rate' => round($conversionRate, 2),
                    'conversations_with_purchase' => $conversationsWithPurchase,
                ],
                'recent_activity' => [
                    'customers' => $recentCustomers,
                    'orders' => $recentOrders,
                    'conversations' => $recentConversations,
                ],
                'date_range' => [
                    'start' => $startDate->toDateString(),
                    'end' => $endDate->toDateString(),
                    'days' => $days,
                ],
            ],
        ]);
    }
}
```

### app/Http/Controllers/Api/ServiceController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\ServiceCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ServiceController extends Controller
{
    /**
     * List all services
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }
        
        $query = Service::where('tenant_id', $tenantId)->where('is_active', true);
        
        // Filter by category
        if ($request->has('category_id')) {
            $query->where('service_category_id', $request->input('category_id'));
        }
        
        // Filter by service type
        if ($request->has('service_type')) {
            $query->where('service_type', $request->input('service_type'));
        }
        
        // Filter by tier
        if ($request->has('service_tier')) {
            $query->where('service_tier', $request->input('service_tier'));
        }
        
        // Filter by subscription type
        if ($request->has('is_subscription')) {
            $query->where('is_subscription', filter_var($request->input('is_subscription'), FILTER_VALIDATE_BOOLEAN));
        }
        
        // Search
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'ILIKE', "%{$search}%")
                  ->orWhere('description', 'ILIKE', "%{$search}%");
            });
        }
        
        // Featured first
        $query->orderBy('is_featured', 'desc');
        $query->orderBy('name', 'asc');
        
        $perPage = $request->input('per_page', 20);
        $services = $query->with('category')->paginate($perPage);
        
        return response()->json([
            'data' => $services->items(),
            'meta' => [
                'current_page' => $services->currentPage(),
                'last_page' => $services->lastPage(),
                'per_page' => $services->perPage(),
                'total' => $services->total(),
            ],
        ]);
    }
    
    /**
     * Get service details
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $service = Service::where('tenant_id', $tenantId)
            ->with('category')
            ->findOrFail($id);
        
        return response()->json([
            'data' => [
                'id' => $service->id,
                'name' => $service->name,
                'slug' => $service->slug,
                'description' => $service->description,
                'long_description' => $service->long_description,
                'images' => $service->images,
                'price' => $service->price,
                'compare_at_price' => $service->compare_at_price,
                'discount_percentage' => $service->discount_percentage,
                'service_type' => $service->service_type,
                'service_tier' => $service->service_tier,
                'is_subscription' => $service->is_subscription,
                'billing_period' => $service->billing_period,
                'features' => $service->features,
                'capabilities' => $service->capabilities,
                'integrations' => $service->integrations,
                'is_in_stock' => $service->isInStock(),
                'sku' => $service->sku,
                'is_featured' => $service->is_featured,
                'category' => $service->category ? [
                    'id' => $service->category->id,
                    'name' => $service->category->name,
                    'slug' => $service->category->slug,
                ] : null,
            ],
        ]);
    }
    
    /**
     * Get services by type
     */
    public function byType(Request $request, string $type): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $services = Service::where('tenant_id', $tenantId)
            ->where('service_type', $type)
            ->where('is_active', true)
            ->with('category')
            ->orderBy('is_featured', 'desc')
            ->orderBy('price', 'asc')
            ->get();
        
        return response()->json([
            'data' => $services->map(fn($service) => [
                'id' => $service->id,
                'name' => $service->name,
                'slug' => $service->slug,
                'description' => $service->description,
                'price' => $service->price,
                'service_tier' => $service->service_tier,
                'is_subscription' => $service->is_subscription,
                'billing_period' => $service->billing_period,
            ]),
        ]);
    }
}
```

### app/Http/Controllers/Api/ContactController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ContactService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class ContactController extends Controller
{
    protected ContactService $contactService;

    public function __construct(ContactService $contactService)
    {
        $this->contactService = $contactService;
    }

    /**
     * Contact customer using their assigned personality
     */
    public function contactCustomer(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'customer_id' => 'required|uuid|exists:customers,id',
            'contact_type' => 'required|in:email,sms,call,phone',
            'message' => 'nullable|string',
            'subject' => 'nullable|string',
            'purpose' => 'nullable|string',
            'options' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $success = $this->contactService->contactCustomer(
                $request->input('customer_id'),
                $request->input('contact_type'),
                array_merge(
                    $request->only(['message', 'subject', 'purpose', 'campaign_id']),
                    $request->input('options', [])
                )
            );

            return response()->json([
                'success' => $success,
                'message' => $success ? 'Contact sent successfully' : 'Contact failed',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to contact customer',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Schedule contact for customer
     */
    public function scheduleContact(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'customer_id' => 'required|uuid|exists:customers,id',
            'contact_type' => 'required|in:email,sms,call,phone',
            'scheduled_at' => 'required|date',
            'options' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $this->contactService->scheduleContact(
                $request->input('customer_id'),
                $request->input('contact_type'),
                new \DateTime($request->input('scheduled_at')),
                $request->input('options', [])
            );

            return response()->json([
                'success' => true,
                'message' => 'Contact scheduled successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to schedule contact',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get customer contact preferences
     */
    public function getPreferences(Request $request, string $customerId): JsonResponse
    {
        try {
            $preferences = $this->contactService->getContactPreferences($customerId);

            return response()->json(['data' => $preferences]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to get contact preferences',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update customer contact preferences
     */
    public function updatePreferences(Request $request, string $customerId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'preferred_channel' => 'nullable|in:email,sms,call,chat',
            'allowed_channels' => 'nullable|array',
            'allowed_channels.*' => 'in:email,sms,call,chat',
            'time_of_day' => 'nullable|string',
            'frequency' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $this->contactService->updateContactPreferences(
                $customerId,
                $request->only(['preferred_channel', 'allowed_channels', 'time_of_day', 'frequency'])
            );

            return response()->json([
                'success' => true,
                'message' => 'Contact preferences updated successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to update contact preferences',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
```

### app/Http/Controllers/Api/EmailCampaignController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmailTemplate;
use App\Models\OutboundCampaign;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class EmailCampaignController extends Controller
{
    /**
     * List email campaigns
     */
    public function index(Request $request): JsonResponse
    {
        return app(OutboundCampaignController::class)->index($request->merge(['type' => 'email']));
    }

    /**
     * Create email campaign
     */
    public function store(Request $request): JsonResponse
    {
        $request->merge(['type' => 'email']);
        return app(OutboundCampaignController::class)->store($request);
    }

    /**
     * Get email templates
     */
    public function templates(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $templates = EmailTemplate::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $templates]);
    }

    /**
     * Create email template
     */
    public function createTemplate(Request $request): JsonResponse
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'html_content' => 'required|string',
            'text_content' => 'nullable|string',
            'variables' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $template = EmailTemplate::create([
            'tenant_id' => $tenantId,
            'name' => $request->input('name'),
            'slug' => \Illuminate\Support\Str::slug($request->input('name')) . '-' . \Illuminate\Support\Str::random(6),
            'subject' => $request->input('subject'),
            'html_content' => $request->input('html_content'),
            'text_content' => $request->input('text_content'),
            'variables' => $request->input('variables', []),
        ]);

        return response()->json([
            'data' => $template,
            'message' => 'Template created successfully',
        ], 201);
    }
}
```

### app/Http/Controllers/Api/OutboundCampaignController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\OutboundCampaign;
use App\Models\CampaignRecipient;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OutboundCampaignController extends Controller
{
    /**
     * List all outbound campaigns
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $query = OutboundCampaign::where('tenant_id', $tenantId);

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        $perPage = $request->input('per_page', 20);
        $campaigns = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'data' => $campaigns->items(),
            'meta' => [
                'current_page' => $campaigns->currentPage(),
                'last_page' => $campaigns->lastPage(),
                'per_page' => $campaigns->perPage(),
                'total' => $campaigns->total(),
            ],
        ]);
    }

    /**
     * Get campaign details
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $campaign = OutboundCampaign::where('tenant_id', $tenantId)
            ->with('recipients.customer')
            ->findOrFail($id);

        return response()->json(['data' => $campaign]);
    }

    /**
     * Create new campaign
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'type' => 'required|in:email,phone,sms',
            'message' => 'required|string',
            'subject' => 'required_if:type,email|string|max:255',
            'template_id' => 'nullable|uuid',
            'template_variables' => 'nullable|array',
            'scheduled_at' => 'nullable|date',
            'recipient_segments' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $campaign = OutboundCampaign::create([
            'tenant_id' => $tenantId,
            'name' => $request->input('name'),
            'type' => $request->input('type'),
            'status' => $request->input('scheduled_at') ? 'scheduled' : 'draft',
            'subject' => $request->input('subject'),
            'message' => $request->input('message'),
            'template_id' => $request->input('template_id'),
            'template_variables' => $request->input('template_variables', []),
            'scheduled_at' => $request->input('scheduled_at'),
            'recipient_segments' => $request->input('recipient_segments', []),
        ]);

        return response()->json([
            'data' => $campaign,
            'message' => 'Campaign created successfully',
        ], 201);
    }

    /**
     * Update campaign
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $campaign = OutboundCampaign::where('tenant_id', $tenantId)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'message' => 'sometimes|string',
            'subject' => 'sometimes|string|max:255',
            'template_id' => 'nullable|uuid',
            'template_variables' => 'nullable|array',
            'scheduled_at' => 'nullable|date',
            'status' => 'sometimes|in:draft,scheduled,running,paused,completed,cancelled',
            'recipient_segments' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $campaign->update($request->only([
            'name', 'message', 'subject', 'template_id', 'template_variables',
            'scheduled_at', 'status', 'recipient_segments',
        ]));

        return response()->json([
            'data' => $campaign,
            'message' => 'Campaign updated successfully',
        ]);
    }

    /**
     * Delete campaign
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $campaign = OutboundCampaign::where('tenant_id', $tenantId)->findOrFail($id);

        $campaign->delete();

        return response()->json(['message' => 'Campaign deleted successfully']);
    }

    /**
     * Get campaign recipients based on segments
     */
    public function getRecipients(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $campaign = OutboundCampaign::where('tenant_id', $tenantId)->findOrFail($id);

        $recipients = $this->buildRecipientList($tenantId, $campaign->type, $campaign->recipient_segments ?? []);

        return response()->json([
            'data' => [
                'total' => count($recipients),
                'recipients' => $recipients,
            ],
        ]);
    }

    /**
     * Build recipient list based on segmentation criteria
     */
    private function buildRecipientList(string $tenantId, string $type, array $segments): array
    {
        $query = Customer::where('tenant_id', $tenantId);

        // Apply segmentation filters
        if (isset($segments['industry_category'])) {
            $query->where('industry_category', $segments['industry_category']);
        }

        if (isset($segments['industry_subcategory'])) {
            $query->where('industry_subcategory', $segments['industry_subcategory']);
        }

        if (isset($segments['lead_score_min'])) {
            $query->where('lead_score', '>=', $segments['lead_score_min']);
        }

        if (isset($segments['lead_score_max'])) {
            $query->where('lead_score', '<=', $segments['lead_score_max']);
        }

        if (isset($segments['tags']) && is_array($segments['tags'])) {
            foreach ($segments['tags'] as $tag) {
                $query->whereJsonContains('tags', $tag);
            }
        }

        if (isset($segments['has_email']) && $segments['has_email']) {
            $query->whereNotNull('email')->where('email', '!=', '');
        }

        if (isset($segments['has_phone']) && $segments['has_phone']) {
            $query->whereNotNull('phone')->where('phone', '!=', '');
        }

        $customers = $query->get();

        $recipients = [];
        foreach ($customers as $customer) {
            $recipient = [
                'customer_id' => $customer->id,
                'name' => $customer->owner_name ?? $customer->business_name,
            ];

            if ($type === 'email' && $customer->email) {
                $recipient['email'] = $customer->email;
                $recipients[] = $recipient;
            } elseif (in_array($type, ['phone', 'sms']) && $customer->phone) {
                $recipient['phone'] = $customer->phone;
                $recipients[] = $recipient;
            }
        }

        return $recipients;
    }

    /**
     * Start campaign (queue all recipients)
     */
    public function start(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $campaign = OutboundCampaign::where('tenant_id', $tenantId)->findOrFail($id);

        if ($campaign->status !== 'draft' && $campaign->status !== 'scheduled') {
            return response()->json([
                'error' => 'Campaign can only be started from draft or scheduled status',
            ], 400);
        }

        DB::transaction(function () use ($campaign, $tenantId) {
            // Get recipients
            $recipients = $this->buildRecipientList($tenantId, $campaign->type, $campaign->recipient_segments ?? []);

            // Create recipient records
            foreach ($recipients as $recipientData) {
                CampaignRecipient::create([
                    'campaign_id' => $campaign->id,
                    'customer_id' => $recipientData['customer_id'] ?? null,
                    'tenant_id' => $tenantId,
                    'email' => $recipientData['email'] ?? null,
                    'phone' => $recipientData['phone'] ?? null,
                    'name' => $recipientData['name'] ?? null,
                    'status' => 'pending',
                ]);
            }

            // Update campaign
            $campaign->update([
                'status' => 'running',
                'total_recipients' => count($recipients),
                'started_at' => now(),
            ]);

            // Queue jobs for sending
            $recipients = CampaignRecipient::where('campaign_id', $campaign->id)
                ->where('status', 'pending')
                ->get();

            foreach ($recipients as $recipient) {
                match ($campaign->type) {
                    'email' => \App\Jobs\SendEmailCampaign::dispatch($recipient, $campaign),
                    'phone' => \App\Jobs\MakePhoneCall::dispatch($recipient, $campaign),
                    'sms' => \App\Jobs\SendSMS::dispatch($recipient, $campaign),
                };
            }
        });

        return response()->json([
            'data' => $campaign->fresh(),
            'message' => 'Campaign started successfully',
        ]);
    }

    /**
     * Get campaign analytics
     */
    public function analytics(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $campaign = OutboundCampaign::where('tenant_id', $tenantId)->findOrFail($id);

        $campaign->load('recipients');

        $recipients = $campaign->recipients;

        $statusCounts = $recipients->countBy('status')->toArray();

        return response()->json([
            'data' => [
                'campaign_id' => $campaign->id,
                'total_recipients' => $campaign->total_recipients,
                'sent_count' => $campaign->sent_count,
                'delivered_count' => $campaign->delivered_count,
                'failed_count' => $campaign->failed_count,
                'opened_count' => $campaign->opened_count,
                'clicked_count' => $campaign->clicked_count,
                'replied_count' => $campaign->replied_count,
                'answered_count' => $campaign->answered_count,
                'voicemail_count' => $campaign->voicemail_count,
                'delivery_rate' => $campaign->delivery_rate,
                'open_rate' => $campaign->open_rate,
                'click_rate' => $campaign->click_rate,
                'status_breakdown' => $statusCounts,
            ],
        ]);
    }
}
```

### app/Http/Controllers/Api/CampaignGenerationController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CampaignGenerationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class CampaignGenerationController extends Controller
{
    public function __construct(
        private CampaignGenerationService $campaignService
    ) {}

    /**
     * Generate a new campaign using AI
     */
    public function generate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:Educational,Hook,HowTo',
            'objective' => 'nullable|string|max:500',
            'topic' => 'nullable|string|max:200',
            'customer_id' => 'nullable|uuid|exists:customers,id',
            'target_audience' => 'nullable|string|max:200',
            'week' => 'nullable|integer|min:1',
            'day' => 'nullable|integer|min:1',
            'utm_campaign' => 'nullable|string|max:200',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $campaignData = $this->campaignService->generateCampaign($request->all());

            // Save campaign to JSON file
            $campaignId = $campaignData['campaign']['id'];
            $filename = "campaign_{$campaignId}.json";
            $campaignsPath = public_path('campaigns');

            if (!is_dir($campaignsPath)) {
                mkdir($campaignsPath, 0755, true);
            }

            file_put_contents(
                $campaignsPath . '/' . $filename,
                json_encode($campaignData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
            );

            Log::info('Campaign generated', [
                'campaign_id' => $campaignId,
                'type' => $request->input('type'),
            ]);

            return response()->json([
                'data' => $campaignData,
                'message' => 'Campaign generated successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Campaign generation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'Failed to generate campaign',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get available campaign templates
     */
    public function templates(): JsonResponse
    {
        try {
            $templates = $this->campaignService->getTemplates();

            return response()->json([
                'data' => $templates,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to load templates',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get campaign suggestions based on customer data
     */
    public function suggestions(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'customer_id' => 'required|uuid|exists:customers,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $customerId = $request->input('customer_id');
            $customer = \App\Models\Customer::find($customerId);

            if (!$customer) {
                return response()->json([
                    'error' => 'Customer not found',
                ], 404);
            }

            $suggestions = $this->generateSuggestions($customer);

            return response()->json([
                'data' => $suggestions,
            ]);
        } catch (\Exception $e) {
            Log::error('Campaign suggestions failed', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Failed to generate suggestions',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate campaign suggestions for a customer
     */
    private function generateSuggestions($customer): array
    {
        $suggestions = [];

        // Analyze customer data to suggest campaigns
        if (!empty($customer->challenges)) {
            $suggestions[] = [
                'type' => 'Educational',
                'title' => 'Address ' . (is_array($customer->challenges) ? $customer->challenges[0] : 'Your Challenges'),
                'reason' => 'Educate on solving key challenges',
                'priority' => 'high',
            ];
        }

        if (!empty($customer->goals)) {
            $suggestions[] = [
                'type' => 'HowTo',
                'title' => 'How to Achieve ' . (is_array($customer->goals) ? $customer->goals[0] : 'Your Goals'),
                'reason' => 'Guide toward achieving goals',
                'priority' => 'medium',
            ];
        }

        // Check if customer has low engagement
        if ($customer->lead_score < 50) {
            $suggestions[] = [
                'type' => 'Hook',
                'title' => 'Special Offer for ' . $customer->business_name,
                'reason' => 'Re-engage with compelling offer',
                'priority' => 'high',
            ];
        }

        // Default suggestions if none generated
        if (empty($suggestions)) {
            $suggestions[] = [
                'type' => 'Educational',
                'title' => 'Industry Best Practices',
                'reason' => 'General educational content',
                'priority' => 'medium',
            ];
        }

        return $suggestions;
    }
}
```

### app/Http/Controllers/Api/SMSCampaignController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SmsTemplate;
use App\Models\OutboundCampaign;
use App\Models\CampaignRecipient;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SMSCampaignController extends Controller
{
    /**
     * List SMS campaigns
     */
    public function index(Request $request): JsonResponse
    {
        return app(OutboundCampaignController::class)->index($request->merge(['type' => 'sms']));
    }

    /**
     * Create SMS campaign
     */
    public function store(Request $request): JsonResponse
    {
        $request->merge(['type' => 'sms']);
        return app(OutboundCampaignController::class)->store($request);
    }

    /**
     * Get SMS templates
     */
    public function templates(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $templates = SmsTemplate::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $templates]);
    }

    /**
     * Create SMS template
     */
    public function createTemplate(Request $request): JsonResponse
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'message' => 'required|string|max:1600', // SMS limit
            'variables' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $template = SmsTemplate::create([
            'tenant_id' => $tenantId,
            'name' => $request->input('name'),
            'slug' => \Illuminate\Support\Str::slug($request->input('name')) . '-' . \Illuminate\Support\Str::random(6),
            'message' => $request->input('message'),
            'variables' => $request->input('variables', []),
        ]);

        return response()->json([
            'data' => $template,
            'message' => 'Template created successfully',
        ], 201);
    }

    /**
     * Handle Twilio SMS status webhook
     */
    public function smsStatus(Request $request, string $campaignId): JsonResponse
    {
        $messageSid = $request->input('MessageSid');
        $messageStatus = $request->input('MessageStatus');

        $recipient = CampaignRecipient::where('campaign_id', $campaignId)
            ->where('external_id', $messageSid)
            ->first();

        if ($recipient) {
            $statusMap = [
                'queued' => 'queued',
                'sent' => 'sent',
                'delivered' => 'delivered',
                'failed' => 'failed',
                'undelivered' => 'failed',
            ];

            $newStatus = $statusMap[$messageStatus] ?? $recipient->status;

            $recipient->update([
                'status' => $newStatus,
                'delivered_at' => $messageStatus === 'delivered' ? now() : null,
            ]);

            // Update campaign counts
            $campaign = $recipient->campaign;
            if ($messageStatus === 'delivered') {
                $campaign->increment('delivered_count');
            }
        }

        return response()->json(['status' => 'ok']);
    }
}
```

### app/Http/Controllers/Api/ContentGenerationController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GeneratedContent;
use App\Models\ContentTemplate;
use App\Services\ContentGenerationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ContentGenerationController extends Controller
{
    protected ContentGenerationService $contentService;

    public function __construct(ContentGenerationService $contentService)
    {
        $this->contentService = $contentService;
    }

    /**
     * List all generated content
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $query = GeneratedContent::where('tenant_id', $tenantId);

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        // Filter by campaign
        if ($request->has('campaign_id')) {
            $query->where('campaign_id', $request->input('campaign_id'));
        }

        $perPage = $request->input('per_page', 20);
        $content = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'data' => $content->items(),
            'meta' => [
                'current_page' => $content->currentPage(),
                'last_page' => $content->lastPage(),
                'per_page' => $content->perPage(),
                'total' => $content->total(),
            ],
        ]);
    }

    /**
     * Get content details
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $content = GeneratedContent::where('tenant_id', $tenantId)
            ->with(['versions', 'workflowHistory', 'template'])
            ->findOrFail($id);

        return response()->json(['data' => $content]);
    }

    /**
     * Generate content from campaign
     */
    public function generateFromCampaign(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'campaign_id' => 'required|uuid|exists:outbound_campaigns,id',
            'type' => 'required|in:article,blog,social,email,landing_page',
            'template_id' => 'nullable|uuid|exists:content_templates,id',
            'parameters' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $content = $this->contentService->generateFromCampaign(
                $request->input('campaign_id'),
                $request->input('type'),
                $request->input('template_id'),
                $request->input('parameters', [])
            );

            return response()->json([
                'data' => $content,
                'message' => 'Content generated successfully',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate content',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate content from scratch
     */
    public function generate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:article,blog,social,email,landing_page',
            'template_id' => 'nullable|uuid|exists:content_templates,id',
            'parameters' => 'required|array',
            'parameters.title' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        try {
            $content = $this->contentService->generate(
                $tenantId,
                $request->input('type'),
                $request->input('parameters'),
                $request->input('template_id')
            );

            return response()->json([
                'data' => $content,
                'message' => 'Content generated successfully',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate content',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update content
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $content = GeneratedContent::where('tenant_id', $tenantId)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|string',
            'excerpt' => 'nullable|string',
            'metadata' => 'nullable|array',
            'status' => 'sometimes|in:draft,review,approved,published,archived',
            'scheduled_publish_at' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $oldStatus = $content->status;
        
        // Create version if content changed
        if ($request->has('content') || $request->has('title')) {
            $content->createVersion($request->input('change_notes'));
        }

        $content->update($request->only([
            'title', 'content', 'excerpt', 'metadata', 'status',
            'scheduled_publish_at', 'notes',
        ]));

        // Record workflow action if status changed
        if ($request->has('status') && $request->input('status') !== $oldStatus) {
            $content->recordWorkflowAction(
                'status_changed',
                $oldStatus,
                $request->input('status'),
                null, // userId
                $request->input('workflow_notes')
            );
        }

        return response()->json([
            'data' => $content->fresh(),
            'message' => 'Content updated successfully',
        ]);
    }

    /**
     * Update content status (workflow action)
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $content = GeneratedContent::where('tenant_id', $tenantId)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:draft,review,approved,published,archived',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $oldStatus = $content->status;
        $newStatus = $request->input('status');

        $content->update(['status' => $newStatus]);

        // Record workflow action
        $actionMap = [
            'review' => 'reviewed',
            'approved' => 'approved',
            'published' => 'published',
            'archived' => 'archived',
        ];

        $action = $actionMap[$newStatus] ?? 'status_changed';
        
        if ($newStatus === 'published') {
            $content->update(['published_at' => now()]);
        }

        $content->recordWorkflowAction(
            $action,
            $oldStatus,
            $newStatus,
            null, // userId
            $request->input('notes')
        );

        return response()->json([
            'data' => $content->fresh(),
            'message' => 'Content status updated successfully',
        ]);
    }

    /**
     * Get content templates
     */
    public function templates(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $query = ContentTemplate::where('tenant_id', $tenantId)
            ->where('is_active', true);

        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }

        $templates = $query->orderBy('name')->get();

        return response()->json(['data' => $templates]);
    }

    /**
     * Create content template
     */
    public function createTemplate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'type' => 'required|in:article,blog,social,email,landing_page',
            'prompt_template' => 'required|string',
            'description' => 'nullable|string',
            'variables' => 'nullable|array',
            'structure' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $template = ContentTemplate::create([
            'tenant_id' => $tenantId,
            'name' => $request->input('name'),
            'slug' => Str::slug($request->input('name')) . '-' . Str::random(6),
            'type' => $request->input('type'),
            'description' => $request->input('description'),
            'prompt_template' => $request->input('prompt_template'),
            'variables' => $request->input('variables', []),
            'structure' => $request->input('structure', []),
        ]);

        return response()->json([
            'data' => $template,
            'message' => 'Template created successfully',
        ], 201);
    }
}
```

### app/Http/Controllers/Api/OrderController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Service;
use App\Services\StripeService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    public function __construct(
        private StripeService $stripeService
    ) {}

    /**
     * List orders for the tenant/user
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }
        
        $query = Order::where('tenant_id', $tenantId)
            ->with(['items.service', 'customer']);
        
        // Filter by user if authenticated
        if ($request->user()) {
            $query->where('user_id', $request->user()->id);
        }
        
        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }
        
        // Filter by payment_status
        if ($request->has('payment_status')) {
            $query->where('payment_status', $request->input('payment_status'));
        }
        
        $perPage = $request->input('per_page', 20);
        $orders = $query->latest()->paginate($perPage);
        
        return response()->json([
            'data' => $orders->items(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
        ]);
    }
    
    /**
     * Get order details
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $order = Order::where('tenant_id', $tenantId)
            ->with(['items.service', 'customer', 'user'])
            ->findOrFail($id);
        
        // Check authorization - user can only see their own orders
        if ($request->user() && $order->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        return response()->json([
            'data' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'customer_email' => $order->customer_email,
                'customer_name' => $order->customer_name,
                'subtotal' => $order->subtotal,
                'tax' => $order->tax,
                'shipping' => $order->shipping,
                'total' => $order->total,
                'status' => $order->status,
                'payment_status' => $order->payment_status,
                'shipping_address' => $order->shipping_address,
                'billing_address' => $order->billing_address,
                'notes' => $order->notes,
                'paid_at' => $order->paid_at?->toIso8601String(),
                'created_at' => $order->created_at->toIso8601String(),
                'items' => $order->items->map(fn($item) => [
                    'id' => $item->id,
                    'service_name' => $item->service_name,
                    'service_description' => $item->service_description,
                    'price' => $item->price,
                    'quantity' => $item->quantity,
                    'total' => $item->total,
                    'service' => $item->service ? [
                        'id' => $item->service->id,
                        'name' => $item->service->name,
                        'slug' => $item->service->slug,
                        'images' => $item->service->images,
                    ] : null,
                ]),
            ],
        ]);
    }
    
    /**
     * Create checkout session from service IDs
     */
    public function checkout(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'services' => 'required|array|min:1',
            'services.*.service_id' => 'required|uuid|exists:services,id',
            'services.*.quantity' => 'required|integer|min:1',
            'customer_email' => 'required|email',
            'customer_name' => 'nullable|string|max:255',
            'customer_id' => 'nullable|uuid|exists:customers,id',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }
        
        try {
            DB::beginTransaction();
            
            // Prepare line items and validate stock
            $lineItems = [];
            $subtotal = 0;
            $services = [];
            
            foreach ($request->input('services') as $item) {
                $service = Service::where('tenant_id', $tenantId)
                    ->where('id', $item['service_id'])
                    ->where('is_active', true)
                    ->firstOrFail();
                
                if (!$service->isInStock()) {
                    return response()->json([
                        'error' => "Service {$service->name} is out of stock",
                    ], 400);
                }
                
                $quantity = $item['quantity'];
                if ($service->track_inventory && $service->quantity < $quantity) {
                    return response()->json([
                        'error' => "Not enough stock for {$service->name}",
                    ], 400);
                }
                
                $serviceData = [
                    'name' => $service->name,
                ];
                
                if (!empty($service->description)) {
                    $serviceData['description'] = $service->description;
                }
                
                if ($service->images && count($service->images) > 0) {
                    $serviceData['images'] = array_map(function($image) {
                        return asset('storage/' . $image);
                    }, $service->images);
                }
                
                $lineItems[] = [
                    'price_data' => [
                        'currency' => 'usd',
                        'product_data' => $serviceData,
                        'unit_amount' => (int) ($service->price * 100),
                    ],
                    'quantity' => $quantity,
                ];
                
                $subtotal += $service->price * $quantity;
                $services[] = ['service' => $service, 'quantity' => $quantity];
            }
            
            // Create order
            $order = Order::create([
                'tenant_id' => $tenantId,
                'user_id' => $request->user()?->id,
                'customer_id' => $request->input('customer_id'),
                'customer_email' => $request->input('customer_email'),
                'customer_name' => $request->input('customer_name'),
                'subtotal' => $subtotal,
                'tax' => 0,
                'shipping' => 0,
                'total' => $subtotal,
                'status' => 'pending',
                'payment_status' => 'pending',
            ]);
            
            // Create order items
            foreach ($services as $item) {
                $service = $item['service'];
                $quantity = $item['quantity'];
                
                OrderItem::create([
                    'order_id' => $order->id,
                    'service_id' => $service->id,
                    'service_name' => $service->name,
                    'service_description' => $service->description,
                    'price' => $service->price,
                    'quantity' => $quantity,
                    'total' => $service->price * $quantity,
                ]);
            }
            
            // Create Stripe checkout session
            $successUrl = $request->input('success_url', url('/learning/services/orders/' . $order->id . '/success'));
            $cancelUrl = $request->input('cancel_url', url('/learning/services/checkout?cancelled=true'));
            
            $session = $this->stripeService->createCheckoutSession(
                $lineItems,
                $successUrl,
                $cancelUrl,
                ['order_id' => $order->id]
            );
            
            $order->update([
                'stripe_session_id' => $session->id,
                'stripe_payment_intent_id' => $session->payment_intent,
            ]);
            
            // Mark order as processing (will be updated to paid when webhook received)
            $order->update(['status' => 'processing']);
            
            DB::commit();
            
            return response()->json([
                'session_id' => $session->id,
                'url' => $session->url,
                'order_id' => $order->id,
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Checkout failed: ' . $e->getMessage());
            
            return response()->json([
                'error' => 'Failed to create checkout session: ' . $e->getMessage(),
            ], 500);
        }
    }
}
```

### app/Http/Controllers/Api/TrainingController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Knowledge;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class TrainingController extends Controller
{
    /**
     * Get training content by category
     */
    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'tenant_id' => 'required|uuid',
            'category' => 'nullable|string',
            'limit' => 'nullable|integer|min:1|max:100',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }
        
        $tenantId = $request->input('tenant_id');
        $category = $request->input('category');
        $limit = $request->input('limit', 20);
        
        $query = Knowledge::where('tenant_id', $tenantId)
            ->where('is_public', true)
            ->where('category', 'training');
        
        if ($category) {
            $query->where('subcategory', $category);
        }
        
        $content = $query->orderBy('usage_count', 'desc')
            ->orderBy('helpful_count', 'desc')
            ->limit($limit)
            ->get();
        
        return response()->json([
            'data' => $content,
            'count' => $content->count(),
        ]);
    }
    
    /**
     * Get training content by ID
     */
    public function show(string $id): JsonResponse
    {
        $content = Knowledge::where('is_public', true)
            ->where('category', 'training')
            ->findOrFail($id);
        
        // Increment usage count
        $content->increment('usage_count');
        
        return response()->json([
            'data' => $content,
        ]);
    }
    
    /**
     * Mark training content as helpful
     */
    public function markHelpful(string $id): JsonResponse
    {
        $content = Knowledge::where('category', 'training')->findOrFail($id);
        $content->increment('helpful_count');
        
        return response()->json([
            'data' => $content->fresh(),
            'message' => 'Marked as helpful',
        ]);
    }
    
    /**
     * Mark training content as not helpful
     */
    public function markNotHelpful(string $id): JsonResponse
    {
        $content = Knowledge::where('category', 'training')->findOrFail($id);
        $content->increment('not_helpful_count');
        
        return response()->json([
            'data' => $content->fresh(),
            'message' => 'Marked as not helpful',
        ]);
    }
}
```

### app/Http/Controllers/Api/CampaignController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class CampaignController extends Controller
{
    /**
     * List all campaigns
     */
    public function index(): JsonResponse
    {
        // Load from public/campaigns directory or database
        $campaignsPath = public_path('campaigns');
        
        if (!is_dir($campaignsPath)) {
            return response()->json([
                'data' => [],
                'message' => 'No campaigns found'
            ]);
        }
        
        $campaigns = [];
        $files = glob($campaignsPath . '/campaign_*.json');
        
        foreach ($files as $file) {
            $content = json_decode(file_get_contents($file), true);
            if ($content) {
                $campaigns[] = [
                    'slug' => $content['slug'] ?? basename($file, '.json'),
                    'title' => $content['title'] ?? null,
                    'type' => $content['type'] ?? null,
                ];
            }
        }
        
        return response()->json([
            'data' => $campaigns,
            'count' => count($campaigns),
        ]);
    }
    
    /**
     * Get campaign by slug
     */
    public function show(string $slug): JsonResponse
    {
        // Try to find campaign file
        $campaignFile = public_path("campaigns/campaign_{$slug}.json");
        
        if (!file_exists($campaignFile)) {
            // Try alternative naming
            $campaignFile = public_path("campaigns/{$slug}.json");
        }
        
        if (!file_exists($campaignFile)) {
            // Try loading from master JSON
            $masterFile = public_path('campaigns/landing_pages_master.json');
            if (file_exists($masterFile)) {
                $masterData = json_decode(file_get_contents($masterFile), true);
                if ($masterData && isset($masterData['landing_pages'])) {
                    foreach ($masterData['landing_pages'] as $page) {
                        if (($page['landing_page_slug'] ?? null) === $slug) {
                            return response()->json([
                                'data' => $this->formatCampaignData($page),
                            ]);
                        }
                    }
                }
            }
            
            return response()->json([
                'error' => 'Campaign not found'
            ], 404);
        }
        
        $campaign = json_decode(file_get_contents($campaignFile), true);
        
        if (!$campaign) {
            return response()->json([
                'error' => 'Invalid campaign file'
            ], 500);
        }
        
        return response()->json([
            'data' => $this->formatCampaignData($campaign),
        ]);
    }
    
    /**
     * Format campaign data for API response
     */
    protected function formatCampaignData(array $data): array
    {
        return [
            'slug' => $data['landing_page_slug'] ?? $data['slug'] ?? null,
            'campaign_id' => $data['campaign_id'] ?? null,
            'title' => $data['title'] ?? $data['template_name'] ?? null,
            'type' => $data['type'] ?? $data['campaign_type'] ?? null,
            'landing_page' => $data['landing_page'] ?? $data,
            'presentation' => $data['presentation'] ?? null,
            'ai_persona' => $data['ai_persona'] ?? null,
            'slide_count' => $data['slide_count'] ?? null,
            'duration_seconds' => $data['duration_seconds'] ?? null,
        ];
    }
}
```

### app/Http/Controllers/Api/KnowledgeController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Knowledge;
use App\Models\FaqCategory;
use App\Jobs\GenerateEmbedding;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class KnowledgeController extends Controller
{
    /**
     * List knowledge items
     */
    public function index(Request $request): JsonResponse
    {
        $query = Knowledge::query();
        
        // Filters
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }
        
        if ($request->has('embedding_status')) {
            $query->where('embedding_status', $request->embedding_status);
        }
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'ILIKE', "%{$search}%")
                  ->orWhere('content', 'ILIKE', "%{$search}%");
            });
        }
        
        // Pagination
        $perPage = $request->get('per_page', 20);
        $knowledge = $query->orderBy('created_at', 'desc')->paginate($perPage);
        
        return response()->json([
            'data' => $knowledge->items(),
            'meta' => [
                'current_page' => $knowledge->currentPage(),
                'last_page' => $knowledge->lastPage(),
                'per_page' => $knowledge->perPage(),
                'total' => $knowledge->total(),
            ],
        ]);
    }
    
    /**
     * Create knowledge item
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string',
            'content' => 'required|string',
            'category' => 'nullable|string',
            'subcategory' => 'nullable|string',
            'industry_codes' => 'nullable|array',
            'source' => 'nullable|in:google,serpapi,website,owner',
            'source_url' => 'nullable|url',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }
        
        $knowledge = Knowledge::create([
            'tenant_id' => $request->input('tenant_id', '00000000-0000-0000-0000-000000000000'), // TODO: Get from auth
            'title' => $request->title,
            'content' => $request->content,
            'category' => $request->category,
            'subcategory' => $request->subcategory,
            'industry_codes' => $request->industry_codes,
            'source' => $request->source,
            'source_url' => $request->source_url,
            'embedding_status' => 'pending',
        ]);
        
        // Queue embedding generation
        GenerateEmbedding::dispatch($knowledge->id);
        
        return response()->json([
            'data' => $knowledge,
            'message' => 'Knowledge item created successfully'
        ], 201);
    }
    
    /**
     * Get knowledge item
     */
    public function show(string $id): JsonResponse
    {
        $knowledge = Knowledge::findOrFail($id);
        
        return response()->json([
            'data' => $knowledge,
        ]);
    }
    
    /**
     * Update knowledge item
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $knowledge = Knowledge::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string',
            'content' => 'sometimes|string',
            'category' => 'nullable|string',
            'subcategory' => 'nullable|string',
            'industry_codes' => 'nullable|array',
            'source' => 'nullable|in:google,serpapi,website,owner',
            'source_url' => 'nullable|url',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }
        
        $knowledge->update($request->only([
            'title', 'content', 'category', 'subcategory',
            'industry_codes', 'source', 'source_url'
        ]));
        
        // If content changed, reset embedding status
        if ($request->has('content')) {
            $knowledge->update([
                'embedding_status' => 'pending'
            ]);
            GenerateEmbedding::dispatch($knowledge->id);
        }
        
        return response()->json([
            'data' => $knowledge,
            'message' => 'Knowledge item updated successfully'
        ]);
    }
    
    /**
     * Delete knowledge item
     */
    public function destroy(string $id): JsonResponse
    {
        $knowledge = Knowledge::findOrFail($id);
        $knowledge->delete();
        
        return response()->json([
            'message' => 'Knowledge item deleted successfully'
        ]);
    }
    
    /**
     * Generate embedding for knowledge item
     */
    public function generateEmbedding(string $id): JsonResponse
    {
        $knowledge = Knowledge::findOrFail($id);
        
        $knowledge->update(['embedding_status' => 'processing']);
        GenerateEmbedding::dispatch($knowledge->id);
        
        return response()->json([
            'message' => 'Embedding generation started'
        ]);
    }
    
    /**
     * Vote on knowledge item (helpful/not helpful)
     */
    public function vote(Request $request, string $id): JsonResponse
    {
        $knowledge = Knowledge::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'vote' => 'required|in:helpful,not_helpful'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }
        
        if ($request->vote === 'helpful') {
            $knowledge->increment('helpful_count');
        } else {
            $knowledge->increment('not_helpful_count');
        }
        
        return response()->json([
            'data' => $knowledge->fresh(),
            'message' => 'Vote recorded successfully'
        ]);
    }
    
    /**
     * List FAQ categories
     */
    public function categories(): JsonResponse
    {
        $categories = FaqCategory::with('children')
            ->whereNull('parent_id')
            ->orderBy('display_order')
            ->get();
        
        return response()->json([
            'data' => $categories,
        ]);
    }
    
    /**
     * Create FAQ category
     */
    public function storeCategory(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:faq_categories,slug',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|uuid|exists:faq_categories,id',
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:7',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }
        
        $category = FaqCategory::create($request->all());
        
        return response()->json([
            'data' => $category,
            'message' => 'Category created successfully'
        ], 201);
    }
    
    /**
     * Get FAQ category
     */
    public function showCategory(string $id): JsonResponse
    {
        $category = FaqCategory::with('children', 'parent')->findOrFail($id);
        
        return response()->json([
            'data' => $category,
        ]);
    }
    
    /**
     * Update FAQ category
     */
    public function updateCategory(Request $request, string $id): JsonResponse
    {
        $category = FaqCategory::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:faq_categories,slug,' . $id,
            'description' => 'nullable|string',
            'parent_id' => 'nullable|uuid|exists:faq_categories,id',
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:7',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }
        
        $category->update($request->all());
        
        return response()->json([
            'data' => $category,
            'message' => 'Category updated successfully'
        ]);
    }
    
    /**
     * Delete FAQ category
     */
    public function destroyCategory(string $id): JsonResponse
    {
        $category = FaqCategory::findOrFail($id);
        $category->delete();
        
        return response()->json([
            'message' => 'Category deleted successfully'
        ]);
    }
}
```

### app/Http/Controllers/Api/ConversationController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\ConversationMessage;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class ConversationController extends Controller
{
    /**
     * List all conversations
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }
        
        $query = Conversation::where('tenant_id', $tenantId)
            ->with(['customer', 'conversationMessages']);
        
        // Filter by customer
        if ($request->has('customer_id')) {
            $query->where('customer_id', $request->input('customer_id'));
        }
        
        // Filter by outcome
        if ($request->has('outcome')) {
            $query->where('outcome', $request->input('outcome'));
        }
        
        // Filter by date range
        if ($request->has('start_date')) {
            $query->where('started_at', '>=', $request->input('start_date'));
        }
        if ($request->has('end_date')) {
            $query->where('started_at', '<=', $request->input('end_date'));
        }
        
        $perPage = $request->input('per_page', 20);
        $conversations = $query->orderBy('started_at', 'desc')->paginate($perPage);
        
        return response()->json([
            'data' => $conversations->items(),
            'meta' => [
                'current_page' => $conversations->currentPage(),
                'last_page' => $conversations->lastPage(),
                'per_page' => $conversations->perPage(),
                'total' => $conversations->total(),
            ],
        ]);
    }
    
    /**
     * Get a specific conversation
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $conversation = Conversation::where('tenant_id', $tenantId)
            ->with(['customer', 'conversationMessages'])
            ->findOrFail($id);
        
        return response()->json(['data' => $conversation]);
    }
    
    /**
     * Create a new conversation
     */
    public function store(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }
        
        $validated = $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'session_id' => 'nullable|string|max:100',
            'entry_point' => 'nullable|string|max:100',
            'template_id' => 'nullable|string|max:50',
            'slide_at_start' => 'nullable|integer',
            'presenter_id' => 'nullable|string|max:50',
            'user_agent' => 'nullable|string',
            'ip_address' => 'nullable|ip',
        ]);
        
        $validated['tenant_id'] = $tenantId;
        
        // Verify customer belongs to tenant if provided
        if (!empty($validated['customer_id'])) {
            $customer = Customer::where('tenant_id', $tenantId)
                ->findOrFail($validated['customer_id']);
        }
        
        $conversation = Conversation::create($validated);
        
        return response()->json([
            'data' => $conversation,
            'message' => 'Conversation created successfully'
        ], 201);
    }
    
    /**
     * Update a conversation
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $conversation = Conversation::where('tenant_id', $tenantId)->findOrFail($id);
        
        $validated = $request->validate([
            'outcome' => 'nullable|string|max:50',
            'outcome_details' => 'nullable|string',
            'topics_discussed' => 'nullable|array',
            'questions_asked' => 'nullable|array',
            'objections_raised' => 'nullable|array',
            'sentiment_trajectory' => 'nullable|array',
            'new_data_collected' => 'nullable|array',
            'faqs_generated' => 'nullable|array',
            'followup_needed' => 'nullable|boolean',
            'followup_scheduled_at' => 'nullable|date',
            'followup_notes' => 'nullable|string',
            'messages' => 'nullable|array',
        ]);
        
        $conversation->update($validated);
        
        return response()->json([
            'data' => $conversation->fresh(),
            'message' => 'Conversation updated successfully'
        ]);
    }
    
    /**
     * End a conversation
     */
    public function end(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $conversation = Conversation::where('tenant_id', $tenantId)->findOrFail($id);
        
        $conversation->end();
        
        return response()->json([
            'data' => $conversation->fresh(),
            'message' => 'Conversation ended successfully'
        ]);
    }
    
    /**
     * Add a message to a conversation
     */
    public function addMessage(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $conversation = Conversation::where('tenant_id', $tenantId)->findOrFail($id);
        
        $validated = $request->validate([
            'role' => 'required|string|in:user,assistant,system',
            'content' => 'required|string',
            'tokens_used' => 'nullable|integer',
            'model_used' => 'nullable|string|max:50',
            'response_time_ms' => 'nullable|integer',
            'actions_triggered' => 'nullable|array',
        ]);
        
        $validated['conversation_id'] = $conversation->id;
        
        $message = ConversationMessage::create($validated);
        
        // Update conversation messages array
        $messages = $conversation->messages ?? [];
        $messages[] = [
            'role' => $message->role,
            'content' => $message->content,
            'timestamp' => $message->timestamp->toIso8601String(),
        ];
        $conversation->messages = $messages;
        $conversation->save();
        
        return response()->json([
            'data' => $message,
            'message' => 'Message added successfully'
        ], 201);
    }
    
    /**
     * Get conversation messages
     */
    public function messages(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $conversation = Conversation::where('tenant_id', $tenantId)->findOrFail($id);
        
        $messages = ConversationMessage::where('conversation_id', $conversation->id)
            ->orderBy('timestamp', 'asc')
            ->get();
        
        return response()->json(['data' => $messages]);
    }
}
```

### app/Http/Controllers/Api/PublishingController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GeneratedContent;
use App\Models\GeneratedAd;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PublishingController extends Controller
{
    /**
     * Get publishing dashboard data
     */
    public function dashboard(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $startDate = $request->input('start_date', Carbon::now()->subDays(30)->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->toDateString());

        // Content statistics
        $contentStats = GeneratedContent::where('tenant_id', $tenantId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('
                COUNT(*) as total,
                COUNT(CASE WHEN status = "published" THEN 1 END) as published,
                COUNT(CASE WHEN status = "draft" THEN 1 END) as draft,
                COUNT(CASE WHEN status = "review" THEN 1 END) as review,
                COUNT(CASE WHEN type = "article" THEN 1 END) as articles,
                COUNT(CASE WHEN type = "blog" THEN 1 END) as blogs,
                COUNT(CASE WHEN type = "social" THEN 1 END) as social
            ')
            ->first();

        // Ad statistics
        $adStats = GeneratedAd::where('tenant_id', $tenantId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('
                COUNT(*) as total,
                COUNT(CASE WHEN status = "active" THEN 1 END) as active,
                COUNT(CASE WHEN status = "scheduled" THEN 1 END) as scheduled,
                SUM(impressions) as total_impressions,
                SUM(clicks) as total_clicks,
                SUM(spend) as total_spend
            ')
            ->first();

        // Recent content
        $recentContent = GeneratedContent::where('tenant_id', $tenantId)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get(['id', 'title', 'type', 'status', 'created_at']);

        // Recent ads
        $recentAds = GeneratedAd::where('tenant_id', $tenantId)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get(['id', 'name', 'platform', 'status', 'created_at']);

        return response()->json([
            'data' => [
                'content_stats' => $contentStats,
                'ad_stats' => $adStats,
                'recent_content' => $recentContent,
                'recent_ads' => $recentAds,
            ],
        ]);
    }

    /**
     * Get content calendar (scheduled items)
     */
    public function calendar(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->toDateString());

        // Scheduled content
        $scheduledContent = GeneratedContent::where('tenant_id', $tenantId)
            ->whereNotNull('scheduled_publish_at')
            ->whereBetween('scheduled_publish_at', [$startDate, $endDate])
            ->get(['id', 'title', 'type', 'status', 'scheduled_publish_at']);

        // Scheduled ads
        $scheduledAds = GeneratedAd::where('tenant_id', $tenantId)
            ->whereNotNull('scheduled_start_at')
            ->where(function ($query) use ($startDate, $endDate) {
                $query->whereBetween('scheduled_start_at', [$startDate, $endDate])
                      ->orWhereBetween('scheduled_end_at', [$startDate, $endDate]);
            })
            ->get(['id', 'name', 'platform', 'status', 'scheduled_start_at', 'scheduled_end_at']);

        return response()->json([
            'data' => [
                'content' => $scheduledContent,
                'ads' => $scheduledAds,
            ],
        ]);
    }

    /**
     * Publish content
     */
    public function publishContent(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $content = GeneratedContent::where('tenant_id', $tenantId)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'channels' => 'nullable|array',
            'channels.*' => 'string',
            'publishing_metadata' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $oldStatus = $content->status;

        $content->update([
            'status' => 'published',
            'published_at' => now(),
            'published_channels' => $request->input('channels', []),
            'publishing_metadata' => $request->input('publishing_metadata', []),
        ]);

        // Record workflow action
        $content->recordWorkflowAction(
            'published',
            $oldStatus,
            'published',
            null,
            $request->input('notes')
        );

        return response()->json([
            'data' => $content->fresh(),
            'message' => 'Content published successfully',
        ]);
    }

    /**
     * Get publishing analytics
     */
    public function analytics(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $startDate = $request->input('start_date', Carbon::now()->subDays(30)->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->toDateString());

        // Content publishing over time
        $contentOverTime = GeneratedContent::where('tenant_id', $tenantId)
            ->where('status', 'published')
            ->whereBetween('published_at', [$startDate, $endDate])
            ->selectRaw('CAST(published_at AS DATE) as date, COUNT(*) as count')
            ->groupBy(DB::raw('CAST(published_at AS DATE)'))
            ->orderBy('date')
            ->get();

        // Ad performance
        $adPerformance = GeneratedAd::where('tenant_id', $tenantId)
            ->where('status', 'active')
            ->whereBetween('started_at', [$startDate, $endDate])
            ->selectRaw('
                platform,
                COUNT(*) as ad_count,
                SUM(impressions) as impressions,
                SUM(clicks) as clicks,
                SUM(spend) as spend,
                AVG(clicks * 100.0 / NULLIF(impressions, 0)) as avg_ctr,
                AVG(spend / NULLIF(clicks, 0)) as avg_cpc
            ')
            ->groupBy('platform')
            ->get();

        return response()->json([
            'data' => [
                'content_over_time' => $contentOverTime,
                'ad_performance' => $adPerformance,
            ],
        ]);
    }
}
```

### app/Http/Controllers/Api/ArticleController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ArticleController extends Controller
{
    /**
     * List articles
     */
    public function index(Request $request): JsonResponse
    {
        $query = Article::query();
        
        // Filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'ILIKE', "%{$search}%")
                  ->orWhere('content', 'ILIKE', "%{$search}%");
            });
        }
        
        // Pagination
        $perPage = $request->get('per_page', 20);
        $articles = $query->orderBy('created_at', 'desc')->paginate($perPage);
        
        return response()->json([
            'data' => $articles->items(),
            'meta' => [
                'current_page' => $articles->currentPage(),
                'last_page' => $articles->lastPage(),
                'per_page' => $articles->perPage(),
                'total' => $articles->total(),
            ],
        ]);
    }
    
    /**
     * Create article
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string',
            'excerpt' => 'nullable|string',
            'content' => 'nullable|string',
            'category' => 'nullable|string',
            'status' => 'nullable|in:draft,pending,published,archived',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }
        
        $article = Article::create([
            'tenant_id' => $request->input('tenant_id', '00000000-0000-0000-0000-000000000000'),
            'title' => $request->title,
            'slug' => Str::slug($request->title),
            'excerpt' => $request->excerpt,
            'content' => $request->content,
            'category' => $request->category,
            'status' => $request->status ?? 'draft',
            'published_at' => $request->status === 'published' ? now() : null,
        ]);
        
        return response()->json([
            'data' => $article,
            'message' => 'Article created successfully'
        ], 201);
    }
    
    /**
     * Get article
     */
    public function show(string $id): JsonResponse
    {
        $article = Article::findOrFail($id);
        
        return response()->json([
            'data' => $article,
        ]);
    }
    
    /**
     * Update article
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $article = Article::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string',
            'excerpt' => 'nullable|string',
            'content' => 'nullable|string',
            'category' => 'nullable|string',
            'status' => 'nullable|in:draft,pending,published,archived',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }
        
        $updateData = $request->only(['title', 'excerpt', 'content', 'category', 'status']);
        
        if ($request->has('title')) {
            $updateData['slug'] = Str::slug($request->title);
        }
        
        if ($request->has('status') && $request->status === 'published' && !$article->published_at) {
            $updateData['published_at'] = now();
        }
        
        $article->update($updateData);
        
        return response()->json([
            'data' => $article,
            'message' => 'Article updated successfully'
        ]);
    }
    
    /**
     * Delete article
     */
    public function destroy(string $id): JsonResponse
    {
        $article = Article::findOrFail($id);
        $article->delete();
        
        return response()->json([
            'message' => 'Article deleted successfully'
        ]);
    }
}
```

### app/Http/Controllers/Api/AIController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\OpenRouterService;
use App\Models\Customer;
use App\Models\Knowledge;
use App\Models\Conversation;
use App\Models\ConversationMessage;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AIController extends Controller
{
    protected OpenRouterService $openRouterService;

    public function __construct(OpenRouterService $openRouterService)
    {
        $this->openRouterService = $openRouterService;
    }

    /**
     * Send chat message to AI
     */
    public function chat(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'message' => 'required|string',
            'tenant_id' => 'required|uuid',
            'conversation_id' => 'nullable|uuid|exists:conversations,id',
            'customer_id' => 'nullable|uuid|exists:customers,id',
            'context' => 'nullable|array',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }
        
        $message = $request->input('message');
        $tenantId = $request->input('tenant_id');
        $conversationId = $request->input('conversation_id');
        $customerId = $request->input('customer_id');
        $context = $request->input('context', []);
        
        // Build AI context
        $aiContext = $this->buildAIContext($tenantId, $customerId, $context);
        
        // Get conversation history
        $messages = [];
        if ($conversationId) {
            $conversation = Conversation::where('tenant_id', $tenantId)
                ->findOrFail($conversationId);
            
            $conversationMessages = ConversationMessage::where('conversation_id', $conversationId)
                ->orderBy('timestamp', 'asc')
                ->get();
            
            foreach ($conversationMessages as $msg) {
                $messages[] = [
                    'role' => $msg->role,
                    'content' => $msg->content,
                ];
            }
        }
        
        // Add user message
        $messages[] = [
            'role' => 'user',
            'content' => $message,
        ];
        
        // Call OpenRouter
        $response = $this->openRouterService->chatCompletion($messages, [
            'system' => $this->buildSystemPrompt($aiContext),
            'temperature' => 0.7,
            'max_tokens' => 2000,
        ]);
        
        if (!$response) {
            return response()->json([
                'error' => 'Failed to get AI response'
            ], 500);
        }
        
        $aiResponse = $response['choices'][0]['message']['content'] ?? '';
        
        // Parse actions from response
        $actions = $this->parseActions($aiResponse);
        $cleanResponse = $this->cleanResponse($aiResponse);
        
        // Create or update conversation
        if (!$conversationId) {
            $conversation = Conversation::create([
                'tenant_id' => $tenantId,
                'customer_id' => $customerId,
                'session_id' => 'session_' . Str::random(32),
                'entry_point' => 'chat',
                'messages' => [],
            ]);
            $conversationId = $conversation->id;
        } else {
            $conversation = Conversation::findOrFail($conversationId);
        }
        
        // Save messages
        ConversationMessage::create([
            'conversation_id' => $conversationId,
            'role' => 'user',
            'content' => $message,
        ]);
        
        ConversationMessage::create([
            'conversation_id' => $conversationId,
            'role' => 'assistant',
            'content' => $cleanResponse,
            'model_used' => $response['model'] ?? 'unknown',
            'tokens_used' => $response['usage']['total_tokens'] ?? null,
        ]);
        
        // Update conversation messages array
        $conversationMessages = $conversation->messages ?? [];
        $conversationMessages[] = ['role' => 'user', 'content' => $message, 'timestamp' => now()->toIso8601String()];
        $conversationMessages[] = ['role' => 'assistant', 'content' => $cleanResponse, 'timestamp' => now()->toIso8601String()];
        $conversation->messages = $conversationMessages;
        $conversation->save();
        
        return response()->json([
            'data' => [
                'response' => $cleanResponse,
                'conversation_id' => $conversationId,
                'suggested_actions' => $actions,
                'model' => $response['model'] ?? 'unknown',
                'tokens_used' => $response['usage']['total_tokens'] ?? null,
            ],
            'message' => 'AI response generated successfully',
        ]);
    }
    
    /**
     * Get AI context for customer
     */
    public function getContext(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'tenant_id' => 'required|uuid',
            'customer_id' => 'nullable|uuid|exists:customers,id',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }
        
        $tenantId = $request->input('tenant_id');
        $customerId = $request->input('customer_id');
        
        $context = $this->buildAIContext($tenantId, $customerId);
        
        return response()->json([
            'data' => $context,
        ]);
    }
    
    /**
     * Build AI context from database
     */
    protected function buildAIContext(string $tenantId, ?string $customerId, array $additionalContext = []): array
    {
        $context = [
            'product_knowledge' => [],
            'industry_knowledge' => [],
            'customer_data' => null,
            'faqs' => [],
        ];
        
        // Get knowledge base content
        $knowledge = Knowledge::where('tenant_id', $tenantId)
            ->where('is_public', true)
            ->orderBy('usage_count', 'desc')
            ->orderBy('helpful_count', 'desc')
            ->limit(50)
            ->get(['title', 'content', 'category', 'source', 'validation_status']);
        
        foreach ($knowledge as $item) {
            if ($item->category === 'faq') {
                $context['faqs'][] = [
                    'question' => $item->title,
                    'answer' => $item->content,
                ];
            } else {
                $context['product_knowledge'][] = [
                    'title' => $item->title,
                    'content' => $item->content,
                    'category' => $item->category,
                ];
            }
        }
        
        // Get customer data if provided
        if ($customerId) {
            $customer = Customer::where('tenant_id', $tenantId)->find($customerId);
            if ($customer) {
                $context['customer_data'] = [
                    'business_name' => $customer->business_name,
                    'owner_name' => $customer->owner_name,
                    'industry' => $customer->industry_category,
                    'description' => $customer->business_description,
                    'lead_score' => $customer->lead_score,
                ];
            }
        }
        
        // Merge additional context
        return array_merge_recursive($context, $additionalContext);
    }
    
    /**
     * Build system prompt for AI
     */
    protected function buildSystemPrompt(array $context): string
    {
        return "You are an AI assistant for Fibonacco, helping local businesses understand how AI employees can transform their operations.

CONTEXT:
" . json_encode($context, JSON_PRETTY_PRINT) . "

INSTRUCTIONS:
- Answer questions based on the provided context
- If information is missing, ask intelligent questions to fill gaps
- Suggest creating FAQs when you provide new information
- Be conversational, helpful, and professional
- Focus on how AI can solve specific business problems

When you suggest actions, use this format:
ACTION: {\"type\": \"update_customer_data\", \"data\": {...}}
ACTION: {\"type\": \"create_faq\", \"data\": {\"question\": \"...\", \"answer\": \"...\"}}";
    }
    
    /**
     * Parse actions from AI response
     */
    protected function parseActions(string $response): array
    {
        $actions = [];
        $pattern = '/ACTION:\s*(\{.*?\})/s';
        
        if (preg_match_all($pattern, $response, $matches)) {
            foreach ($matches[1] as $match) {
                try {
                    $action = json_decode($match, true);
                    if ($action) {
                        $actions[] = $action;
                    }
                } catch (\Exception $e) {
                    Log::warning('Failed to parse AI action', ['action' => $match, 'error' => $e->getMessage()]);
                }
            }
        }
        
        return $actions;
    }
    
    /**
     * Clean response by removing action markers
     */
    protected function cleanResponse(string $response): string
    {
        return trim(preg_replace('/ACTION:\s*\{.*?\}/s', '', $response));
    }
    
    /**
     * Get available AI models
     */
    public function models(): JsonResponse
    {
        $models = $this->openRouterService->getModels();
        
        return response()->json([
            'data' => $models,
            'count' => count($models),
        ]);
    }
}
```

### app/Http/Controllers/Api/PersonalityController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AiPersonality;
use App\Models\PersonalityAssignment;
use App\Models\Customer;
use App\Services\PersonalityService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PersonalityController extends Controller
{
    protected PersonalityService $personalityService;

    public function __construct(PersonalityService $personalityService)
    {
        $this->personalityService = $personalityService;
    }

    /**
     * List all personalities
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $query = AiPersonality::where('tenant_id', $tenantId);

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $perPage = $request->input('per_page', 20);
        $personalities = $query->orderBy('priority', 'desc')
            ->orderBy('name')
            ->paginate($perPage);

        return response()->json([
            'data' => $personalities->items(),
            'meta' => [
                'current_page' => $personalities->currentPage(),
                'last_page' => $personalities->lastPage(),
                'per_page' => $personalities->perPage(),
                'total' => $personalities->total(),
            ],
        ]);
    }

    /**
     * Get personality details
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $personality = AiPersonality::where('tenant_id', $tenantId)
            ->withCount(['assignments', 'activeAssignments', 'conversations'])
            ->findOrFail($id);

        return response()->json(['data' => $personality]);
    }

    /**
     * Create personality
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'identity' => 'required|string|max:255',
            'persona_description' => 'required|string',
            'communication_style' => 'required|string',
            'system_prompt' => 'required|string',
            'description' => 'nullable|string',
            'traits' => 'nullable|array',
            'expertise_areas' => 'nullable|array',
            'can_email' => 'nullable|boolean',
            'can_call' => 'nullable|boolean',
            'can_sms' => 'nullable|boolean',
            'can_chat' => 'nullable|boolean',
            'contact_email' => 'nullable|email',
            'contact_phone' => 'nullable|string',
            'greeting_message' => 'nullable|string',
            'custom_instructions' => 'nullable|array',
            'ai_model' => 'nullable|string',
            'temperature' => 'nullable|numeric|min:0|max:2',
            'active_hours' => 'nullable|array',
            'working_days' => 'nullable|array',
            'timezone' => 'nullable|string',
            'priority' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $personality = AiPersonality::create([
            'tenant_id' => $tenantId,
            'name' => $request->input('name'),
            'slug' => Str::slug($request->input('name')) . '-' . Str::random(6),
            'identity' => $request->input('identity'),
            'persona_description' => $request->input('persona_description'),
            'communication_style' => $request->input('communication_style'),
            'system_prompt' => $request->input('system_prompt'),
            'description' => $request->input('description'),
            'traits' => $request->input('traits', []),
            'expertise_areas' => $request->input('expertise_areas', []),
            'can_email' => $request->input('can_email', true),
            'can_call' => $request->input('can_call', false),
            'can_sms' => $request->input('can_sms', false),
            'can_chat' => $request->input('can_chat', true),
            'contact_email' => $request->input('contact_email'),
            'contact_phone' => $request->input('contact_phone'),
            'greeting_message' => $request->input('greeting_message'),
            'custom_instructions' => $request->input('custom_instructions', []),
            'ai_model' => $request->input('ai_model', 'anthropic/claude-3.5-sonnet'),
            'temperature' => $request->input('temperature', 0.7),
            'active_hours' => $request->input('active_hours'),
            'working_days' => $request->input('working_days'),
            'timezone' => $request->input('timezone', 'UTC'),
            'priority' => $request->input('priority', 0),
        ]);

        return response()->json([
            'data' => $personality,
            'message' => 'Personality created successfully',
        ], 201);
    }

    /**
     * Update personality
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $personality = AiPersonality::where('tenant_id', $tenantId)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'identity' => 'sometimes|string|max:255',
            'persona_description' => 'sometimes|string',
            'communication_style' => 'sometimes|string',
            'system_prompt' => 'sometimes|string',
            'is_active' => 'sometimes|boolean',
            'priority' => 'sometimes|integer',
            // ... other fields
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $personality->update($request->only([
            'name', 'identity', 'persona_description', 'communication_style',
            'system_prompt', 'description', 'traits', 'expertise_areas',
            'can_email', 'can_call', 'can_sms', 'can_chat',
            'contact_email', 'contact_phone', 'greeting_message',
            'custom_instructions', 'ai_model', 'temperature',
            'active_hours', 'working_days', 'timezone',
            'is_active', 'priority', 'notes',
        ]));

        return response()->json([
            'data' => $personality->fresh(),
            'message' => 'Personality updated successfully',
        ]);
    }

    /**
     * Delete personality
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $personality = AiPersonality::where('tenant_id', $tenantId)->findOrFail($id);

        $personality->delete();

        return response()->json(['message' => 'Personality deleted successfully']);
    }

    /**
     * Assign personality to customer
     */
    public function assignToCustomer(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'customer_id' => 'required|uuid|exists:customers,id',
            'personality_id' => 'nullable|uuid|exists:ai_personalities,id',
            'rules' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $assignment = $this->personalityService->assignPersonality(
                $request->input('customer_id'),
                $request->input('personality_id'),
                $request->input('rules', [])
            );

            return response()->json([
                'data' => $assignment->load(['personality', 'customer']),
                'message' => 'Personality assigned successfully',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to assign personality',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get customer's assigned personality
     */
    public function getCustomerPersonality(Request $request, string $customerId): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $assignment = PersonalityAssignment::where('customer_id', $customerId)
            ->where('tenant_id', $tenantId)
            ->where('status', 'active')
            ->with('personality')
            ->first();

        if (!$assignment) {
            return response()->json([
                'data' => null,
                'message' => 'No active personality assignment found',
            ]);
        }

        return response()->json(['data' => $assignment]);
    }

    /**
     * List personality assignments
     */
    public function assignments(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $query = PersonalityAssignment::where('tenant_id', $tenantId)
            ->with(['personality', 'customer']);

        // Filter by personality
        if ($request->has('personality_id')) {
            $query->where('personality_id', $request->input('personality_id'));
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        $perPage = $request->input('per_page', 20);
        $assignments = $query->orderBy('assigned_at', 'desc')->paginate($perPage);

        return response()->json([
            'data' => $assignments->items(),
            'meta' => [
                'current_page' => $assignments->currentPage(),
                'last_page' => $assignments->lastPage(),
                'per_page' => $assignments->perPage(),
                'total' => $assignments->total(),
            ],
        ]);
    }

    /**
     * Generate response using personality
     */
    public function generateResponse(Request $request, string $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'message' => 'required|string',
            'conversation_context' => 'nullable|array',
            'customer_id' => 'nullable|uuid|exists:customers,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $personality = AiPersonality::where('tenant_id', $tenantId)->findOrFail($id);
        
        $customer = null;
        if ($request->has('customer_id')) {
            $customer = Customer::find($request->input('customer_id'));
        }

        try {
            $response = $this->personalityService->generateResponse(
                $personality,
                $request->input('message'),
                $request->input('conversation_context', []),
                $customer
            );

            return response()->json([
                'data' => [
                    'response' => $response,
                    'personality_id' => $personality->id,
                    'personality_name' => $personality->identity,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate response',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
```

### app/Http/Controllers/Api/SurveyController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SurveySection;
use App\Models\SurveyQuestion;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class SurveyController extends Controller
{
    /**
     * List survey sections
     */
    public function sections(): JsonResponse
    {
        $sections = SurveySection::with('questions')
            ->orderBy('display_order')
            ->get();
        
        return response()->json([
            'data' => $sections,
        ]);
    }
    
    /**
     * Get survey section
     */
    public function showSection(string $id): JsonResponse
    {
        $section = SurveySection::with('questions')->findOrFail($id);
        
        return response()->json([
            'data' => $section,
        ]);
    }
    
    /**
     * List questions for a section
     */
    public function questions(string $id): JsonResponse
    {
        $section = SurveySection::findOrFail($id);
        $questions = $section->questions()->orderBy('display_order')->get();
        
        return response()->json([
            'data' => $questions,
        ]);
    }
    
    /**
     * Create survey question
     */
    public function storeQuestion(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'section_id' => 'required|uuid|exists:survey_sections,id',
            'question_text' => 'required|string',
            'help_text' => 'nullable|string',
            'question_type' => 'required|string',
            'is_required' => 'nullable|boolean',
            'display_order' => 'nullable|integer',
            'options' => 'nullable|array',
            'validation_rules' => 'nullable|array',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }
        
        $question = SurveyQuestion::create($request->all());
        
        return response()->json([
            'data' => $question,
            'message' => 'Survey question created successfully'
        ], 201);
    }
    
    /**
     * Update survey question
     */
    public function updateQuestion(Request $request, string $id): JsonResponse
    {
        $question = SurveyQuestion::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'question_text' => 'sometimes|string',
            'help_text' => 'nullable|string',
            'question_type' => 'sometimes|string',
            'is_required' => 'nullable|boolean',
            'display_order' => 'nullable|integer',
            'options' => 'nullable|array',
            'validation_rules' => 'nullable|array',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }
        
        $question->update($request->all());
        
        return response()->json([
            'data' => $question,
            'message' => 'Survey question updated successfully'
        ]);
    }
    
    /**
     * Delete survey question
     */
    public function destroyQuestion(string $id): JsonResponse
    {
        $question = SurveyQuestion::findOrFail($id);
        $question->delete();
        
        return response()->json([
            'message' => 'Survey question deleted successfully'
        ]);
    }
    
    /**
     * Create survey section
     */
    public function storeSection(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'display_order' => 'nullable|integer',
            'is_required' => 'nullable|boolean',
            'is_conditional' => 'nullable|boolean',
            'condition_config' => 'nullable|array',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }
        
        $section = SurveySection::create([
            'tenant_id' => $request->input('tenant_id', '00000000-0000-0000-0000-000000000000'),
            'name' => $request->name,
            'description' => $request->description,
            'display_order' => $request->display_order ?? 0,
            'is_required' => $request->is_required ?? false,
            'is_conditional' => $request->is_conditional ?? false,
            'condition_config' => $request->condition_config,
        ]);
        
        return response()->json([
            'data' => $section,
            'message' => 'Survey section created successfully'
        ], 201);
    }
    
    /**
     * Update survey section
     */
    public function updateSection(Request $request, string $id): JsonResponse
    {
        $section = SurveySection::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'display_order' => 'nullable|integer',
            'is_required' => 'nullable|boolean',
            'is_conditional' => 'nullable|boolean',
            'condition_config' => 'nullable|array',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }
        
        $section->update($request->all());
        
        return response()->json([
            'data' => $section->fresh(),
            'message' => 'Survey section updated successfully'
        ]);
    }
    
    /**
     * Delete survey section
     */
    public function destroySection(string $id): JsonResponse
    {
        $section = SurveySection::findOrFail($id);
        $section->delete();
        
        return response()->json([
            'message' => 'Survey section deleted successfully'
        ]);
    }
}
```

### app/Http/Controllers/Api/CustomerController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CustomerController extends Controller
{
    /**
     * List all customers for the tenant
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }
        
        $query = Customer::where('tenant_id', $tenantId);
        
        // Apply filters
        if ($request->has('industry_category')) {
            $query->where('industry_category', $request->input('industry_category'));
        }
        
        if ($request->has('lead_score_min')) {
            $query->where('lead_score', '>=', $request->input('lead_score_min'));
        }
        
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('business_name', 'ilike', "%{$search}%")
                  ->orWhere('email', 'ilike', "%{$search}%")
                  ->orWhere('owner_name', 'ilike', "%{$search}%");
            });
        }
        
        // Pagination
        $perPage = $request->input('per_page', 20);
        $customers = $query->orderBy('created_at', 'desc')->paginate($perPage);
        
        return response()->json([
            'data' => $customers->items(),
            'meta' => [
                'current_page' => $customers->currentPage(),
                'last_page' => $customers->lastPage(),
                'per_page' => $customers->perPage(),
                'total' => $customers->total(),
            ],
        ]);
    }
    
    /**
     * Get a specific customer
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $customer = Customer::where('tenant_id', $tenantId)
            ->with(['conversations', 'pendingQuestions', 'faqs'])
            ->findOrFail($id);
        
        return response()->json(['data' => $customer]);
    }
    
    /**
     * Get customer by slug
     */
    public function showBySlug(Request $request, string $slug): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $customer = Customer::where('tenant_id', $tenantId)
            ->where('slug', $slug)
            ->with(['conversations', 'pendingQuestions', 'faqs'])
            ->firstOrFail();
        
        return response()->json(['data' => $customer]);
    }
    
    /**
     * Create a new customer
     */
    public function store(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }
        
        $validated = $request->validate([
            'business_name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:100|unique:customers,slug',
            'external_id' => 'nullable|string|max:100',
            'owner_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'website' => 'nullable|url|max:255',
            'industry_id' => 'nullable|string|max:50',
            'industry_category' => 'nullable|string',
            'industry_subcategory' => 'nullable|string',
            'sub_category' => 'nullable|string|max:100',
            'business_description' => 'nullable|string',
            'lead_source' => 'nullable|string|max:100',
            'subscription_tier' => 'nullable|string|max:50',
            // Allow all other fields as optional
        ]);
        
        $validated['tenant_id'] = $tenantId;
        
        // Generate slug if not provided
        if (empty($validated['slug'])) {
            $baseSlug = Str::slug($validated['business_name']);
            $slug = $baseSlug;
            $counter = 1;
            while (Customer::where('slug', $slug)->exists()) {
                $slug = $baseSlug . '-' . $counter;
                $counter++;
            }
            $validated['slug'] = $slug;
        }
        
        $customer = Customer::create($validated);
        
        return response()->json([
            'data' => $customer,
            'message' => 'Customer created successfully'
        ], 201);
    }
    
    /**
     * Update a customer
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $customer = Customer::where('tenant_id', $tenantId)->findOrFail($id);
        
        $validated = $request->validate([
            'business_name' => 'sometimes|string|max:255',
            'slug' => ['sometimes', 'string', 'max:100', Rule::unique('customers')->ignore($customer->id)],
            'external_id' => 'nullable|string|max:100',
            'owner_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'website' => 'nullable|url|max:255',
            'industry_id' => 'nullable|string|max:50',
            'industry_category' => 'nullable|string',
            'industry_subcategory' => 'nullable|string',
            'sub_category' => 'nullable|string|max:100',
            'business_description' => 'nullable|string',
            'lead_score' => 'nullable|integer|min:0|max:100',
            'lead_source' => 'nullable|string|max:100',
            'subscription_tier' => 'nullable|string|max:50',
            // Allow all other fields
        ]);
        
        $customer->update($validated);
        
        return response()->json([
            'data' => $customer->fresh(),
            'message' => 'Customer updated successfully'
        ]);
    }
    
    /**
     * Delete a customer
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $customer = Customer::where('tenant_id', $tenantId)->findOrFail($id);
        $customer->delete();
        
        return response()->json([
            'message' => 'Customer deleted successfully'
        ]);
    }
    
    /**
     * Update customer business context (AI-first CRM)
     */
    public function updateBusinessContext(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $customer = Customer::where('tenant_id', $tenantId)->findOrFail($id);
        
        $validated = $request->validate([
            'industry_category' => 'nullable|string',
            'industry_subcategory' => 'nullable|string',
            'business_description' => 'nullable|string',
            'unique_selling_points' => 'nullable|array',
            'products_services' => 'nullable|array',
            'target_audience' => 'nullable|array',
            'business_hours' => 'nullable|array',
            'service_area' => 'nullable|string',
            'brand_voice' => 'nullable|array',
            'content_preferences' => 'nullable|array',
            'contact_preferences' => 'nullable|array',
        ]);
        
        $customer->update($validated);
        
        return response()->json([
            'data' => $customer->fresh(),
            'message' => 'Business context updated successfully'
        ]);
    }
    
    /**
     * Get customer context for AI (helper endpoint)
     */
    public function getAiContext(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $customer = Customer::where('tenant_id', $tenantId)->findOrFail($id);
        
        // Return structured context for AI
        $context = [
            'customer_id' => $customer->id,
            'business_name' => $customer->business_name,
            'owner_name' => $customer->owner_name,
            'industry' => [
                'category' => $customer->industry_category,
                'subcategory' => $customer->industry_subcategory,
                'id' => $customer->industry_id,
            ],
            'business_description' => $customer->business_description,
            'unique_selling_points' => $customer->unique_selling_points,
            'products_services' => $customer->products_services,
            'target_audience' => $customer->target_audience,
            'brand_voice' => $customer->brand_voice,
            'content_preferences' => $customer->content_preferences,
            'contact_preferences' => $customer->contact_preferences,
            'location' => [
                'city' => $customer->city,
                'state' => $customer->state,
                'service_area' => $customer->service_area,
            ],
            'contact' => [
                'email' => $customer->email,
                'phone' => $customer->phone,
                'website' => $customer->website,
            ],
            'relationship' => [
                'lead_score' => $customer->lead_score,
                'subscription_tier' => $customer->subscription_tier,
                'onboarded_at' => $customer->onboarded_at,
            ],
        ];
        
        return response()->json(['data' => $context]);
    }
}
```

### app/Http/Controllers/Api/PhoneCampaignController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PhoneScript;
use App\Models\OutboundCampaign;
use App\Models\CampaignRecipient;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PhoneCampaignController extends Controller
{
    /**
     * List phone campaigns
     */
    public function index(Request $request): JsonResponse
    {
        return app(OutboundCampaignController::class)->index($request->merge(['type' => 'phone']));
    }

    /**
     * Create phone campaign
     */
    public function store(Request $request): JsonResponse
    {
        $request->merge(['type' => 'phone']);
        return app(OutboundCampaignController::class)->store($request);
    }

    /**
     * Get phone scripts
     */
    public function scripts(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $scripts = PhoneScript::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $scripts]);
    }

    /**
     * Create phone script
     */
    public function createScript(Request $request): JsonResponse
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'script' => 'required|string',
            'variables' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $script = PhoneScript::create([
            'tenant_id' => $tenantId,
            'name' => $request->input('name'),
            'slug' => \Illuminate\Support\Str::slug($request->input('name')) . '-' . \Illuminate\Support\Str::random(6),
            'script' => $request->input('script'),
            'variables' => $request->input('variables', []),
        ]);

        return response()->json([
            'data' => $script,
            'message' => 'Script created successfully',
        ], 201);
    }

    /**
     * Handle Twilio call status webhook
     */
    public function callStatus(Request $request, string $campaignId): JsonResponse
    {
        $callSid = $request->input('CallSid');
        $callStatus = $request->input('CallStatus');
        $duration = $request->input('CallDuration');

        $recipient = CampaignRecipient::where('campaign_id', $campaignId)
            ->where('external_id', $callSid)
            ->first();

        if ($recipient) {
            $statusMap = [
                'queued' => 'queued',
                'ringing' => 'sent',
                'in-progress' => 'answered',
                'completed' => 'answered',
                'busy' => 'failed',
                'no-answer' => 'voicemail',
                'failed' => 'failed',
            ];

            $newStatus = $statusMap[$callStatus] ?? $recipient->status;

            $recipient->update([
                'status' => $newStatus,
                'answered_at' => in_array($callStatus, ['in-progress', 'completed']) ? now() : null,
                'duration_seconds' => $duration ? (int) $duration : null,
            ]);

            // Update campaign counts
            $campaign = $recipient->campaign;
            if ($newStatus === 'answered') {
                $campaign->increment('answered_count');
            } elseif ($newStatus === 'voicemail') {
                $campaign->increment('voicemail_count');
            }
        }

        return response()->json(['status' => 'ok']);
    }
}
```

### app/Http/Controllers/Api/CrmAdvancedAnalyticsController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CrmAdvancedAnalyticsService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CrmAdvancedAnalyticsController extends Controller
{
    public function __construct(
        private CrmAdvancedAnalyticsService $analyticsService
    ) {}

    /**
     * Get customer engagement score
     */
    public function engagementScore(Request $request, string $customerId): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        try {
            $score = $this->analyticsService->calculateEngagementScore($customerId, $tenantId);

            return response()->json([
                'data' => [
                    'customer_id' => $customerId,
                    'engagement_score' => $score,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to calculate engagement score',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get campaign ROI
     */
    public function campaignROI(Request $request, string $campaignId): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $days = (int) ($request->input('days', 30));

        try {
            $roi = $this->analyticsService->calculateCampaignROI($campaignId, $tenantId, $days);

            return response()->json([
                'data' => $roi,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to calculate campaign ROI',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get predictive lead score
     */
    public function predictiveScore(Request $request, string $customerId): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        try {
            $prediction = $this->analyticsService->calculatePredictiveLeadScore($customerId, $tenantId);

            return response()->json([
                'data' => $prediction,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to calculate predictive score',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
```

### app/Http/Controllers/Api/AdController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GeneratedAd;
use App\Models\AdTemplate;
use App\Services\AdGenerationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AdController extends Controller
{
    protected AdGenerationService $adService;

    public function __construct(AdGenerationService $adService)
    {
        $this->adService = $adService;
    }

    /**
     * List all generated ads
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $query = GeneratedAd::where('tenant_id', $tenantId);

        // Filter by platform
        if ($request->has('platform')) {
            $query->where('platform', $request->input('platform'));
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        // Filter by campaign
        if ($request->has('campaign_id')) {
            $query->where('campaign_id', $request->input('campaign_id'));
        }

        $perPage = $request->input('per_page', 20);
        $ads = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'data' => $ads->items(),
            'meta' => [
                'current_page' => $ads->currentPage(),
                'last_page' => $ads->lastPage(),
                'per_page' => $ads->perPage(),
                'total' => $ads->total(),
            ],
        ]);
    }

    /**
     * Get ad details
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $ad = GeneratedAd::where('tenant_id', $tenantId)
            ->with(['template', 'content'])
            ->findOrFail($id);

        return response()->json(['data' => $ad]);
    }

    /**
     * Generate ad from campaign
     */
    public function generateFromCampaign(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'campaign_id' => 'required|uuid|exists:outbound_campaigns,id',
            'platform' => 'required|in:facebook,google,instagram,linkedin,twitter,display',
            'ad_type' => 'required|in:image,video,carousel,text,story',
            'template_id' => 'nullable|uuid|exists:ad_templates,id',
            'parameters' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $ad = $this->adService->generateFromCampaign(
                $request->input('campaign_id'),
                $request->input('platform'),
                $request->input('ad_type'),
                $request->input('template_id'),
                $request->input('parameters', [])
            );

            return response()->json([
                'data' => $ad,
                'message' => 'Ad generated successfully',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate ad',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate ad from content
     */
    public function generateFromContent(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'content_id' => 'required|uuid|exists:generated_content,id',
            'platform' => 'required|in:facebook,google,instagram,linkedin,twitter,display',
            'ad_type' => 'required|in:image,video,carousel,text,story',
            'template_id' => 'nullable|uuid|exists:ad_templates,id',
            'parameters' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $ad = $this->adService->generateFromContent(
                $request->input('content_id'),
                $request->input('platform'),
                $request->input('ad_type'),
                $request->input('template_id'),
                $request->input('parameters', [])
            );

            return response()->json([
                'data' => $ad,
                'message' => 'Ad generated successfully',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate ad',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update ad
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $ad = GeneratedAd::where('tenant_id', $tenantId)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'headline' => 'nullable|string',
            'description' => 'nullable|string',
            'call_to_action' => 'nullable|string',
            'destination_url' => 'nullable|url',
            'status' => 'sometimes|in:draft,review,approved,scheduled,active,paused,archived',
            'scheduled_start_at' => 'nullable|date',
            'scheduled_end_at' => 'nullable|date',
            'targeting' => 'nullable|array',
            'budget' => 'nullable|array',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $ad->update($request->only([
            'name', 'headline', 'description', 'call_to_action', 'destination_url',
            'status', 'scheduled_start_at', 'scheduled_end_at',
            'targeting', 'budget', 'notes',
        ]));

        return response()->json([
            'data' => $ad->fresh(),
            'message' => 'Ad updated successfully',
        ]);
    }

    /**
     * Get ad templates
     */
    public function templates(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $query = AdTemplate::where('tenant_id', $tenantId)
            ->where('is_active', true);

        if ($request->has('platform')) {
            $query->where('platform', $request->input('platform'));
        }

        if ($request->has('ad_type')) {
            $query->where('ad_type', $request->input('ad_type'));
        }

        $templates = $query->orderBy('name')->get();

        return response()->json(['data' => $templates]);
    }

    /**
     * Create ad template
     */
    public function createTemplate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'platform' => 'required|in:facebook,google,instagram,linkedin,twitter,display',
            'ad_type' => 'required|in:image,video,carousel,text,story',
            'structure' => 'nullable|array',
            'prompt_template' => 'nullable|string',
            'description' => 'nullable|string',
            'variables' => 'nullable|array',
            'specs' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $template = AdTemplate::create([
            'tenant_id' => $tenantId,
            'name' => $request->input('name'),
            'slug' => Str::slug($request->input('name')) . '-' . Str::random(6),
            'platform' => $request->input('platform'),
            'ad_type' => $request->input('ad_type'),
            'description' => $request->input('description'),
            'structure' => $request->input('structure', []),
            'prompt_template' => $request->input('prompt_template'),
            'variables' => $request->input('variables', []),
            'specs' => $request->input('specs', []),
        ]);

        return response()->json([
            'data' => $template,
            'message' => 'Template created successfully',
        ], 201);
    }
}
```

### app/Http/Controllers/Api/TTSController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ElevenLabsService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class TTSController extends Controller
{
    protected ElevenLabsService $elevenLabsService;

    public function __construct(ElevenLabsService $elevenLabsService)
    {
        $this->elevenLabsService = $elevenLabsService;
    }

    /**
     * Generate TTS audio
     */
    public function generate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'text' => 'required|string|max:5000',
            'voice_id' => 'nullable|string',
            'save' => 'nullable|boolean',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }
        
        $text = $request->input('text');
        $voiceId = $request->input('voice_id');
        $save = $request->input('save', false);
        
        $audioData = $this->elevenLabsService->generateAudio($text, $voiceId);
        
        if (!$audioData) {
            return response()->json([
                'error' => 'Failed to generate audio'
            ], 500);
        }
        
        $response = [
            'audio_base64' => base64_encode($audioData),
            'text' => $text,
            'voice_id' => $voiceId ?? config('services.elevenlabs.default_voice_id'),
            'length' => strlen($audioData),
        ];
        
        // Save to storage if requested
        if ($save) {
            $filename = 'tts/' . Str::uuid() . '.mp3';
            Storage::disk('public')->put($filename, $audioData);
            $response['url'] = Storage::disk('public')->url($filename);
            $response['filename'] = $filename;
        }
        
        return response()->json([
            'data' => $response,
            'message' => 'Audio generated successfully',
        ], 201);
    }
    
    /**
     * Get available voices
     */
    public function voices(): JsonResponse
    {
        $voices = $this->elevenLabsService->getVoices();
        
        return response()->json([
            'data' => $voices,
            'count' => count($voices),
        ]);
    }
    
    /**
     * Batch generate TTS for multiple texts
     */
    public function batchGenerate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'texts' => 'required|array|min:1|max:50',
            'texts.*' => 'required|string|max:5000',
            'voice_id' => 'nullable|string',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }
        
        $texts = $request->input('texts');
        $voiceId = $request->input('voice_id');
        $results = [];
        
        foreach ($texts as $index => $text) {
            $audioData = $this->elevenLabsService->generateAudio($text, $voiceId);
            
            if ($audioData) {
                $filename = 'tts/batch/' . Str::uuid() . '.mp3';
                Storage::disk('public')->put($filename, $audioData);
                
                $results[] = [
                    'index' => $index,
                    'text' => $text,
                    'url' => Storage::disk('public')->url($filename),
                    'filename' => $filename,
                    'success' => true,
                ];
            } else {
                $results[] = [
                    'index' => $index,
                    'text' => $text,
                    'success' => false,
                    'error' => 'Failed to generate audio',
                ];
            }
        }
        
        return response()->json([
            'data' => $results,
            'message' => 'Batch generation completed',
            'success_count' => count(array_filter($results, fn($r) => $r['success'])),
            'failed_count' => count(array_filter($results, fn($r) => !$r['success'])),
        ]);
    }
}
```

---
## Services

### AdGenerationService.php
```php
<?php

namespace App\Services;

use App\Models\AdTemplate;
use App\Models\GeneratedAd;
use App\Models\OutboundCampaign;
use App\Models\GeneratedContent;
use Illuminate\Support\Facades\Log;

class AdGenerationService
{
    protected OpenRouterService $openRouterService;

    public function __construct(OpenRouterService $openRouterService)
    {
        $this->openRouterService = $openRouterService;
    }

    /**
     * Generate ad from campaign
     */
    public function generateFromCampaign(
        string $campaignId,
        string $platform,
        string $adType,
        ?string $templateId = null,
        array $parameters = []
    ): GeneratedAd {
        // Load campaign data
        $campaign = OutboundCampaign::findOrFail($campaignId);
        
        // Get template
        $template = $templateId 
            ? AdTemplate::find($templateId)
            : AdTemplate::where('platform', $platform)
                ->where('ad_type', $adType)
                ->where('tenant_id', $campaign->tenant_id)
                ->where('is_active', true)
                ->first();

        // Build generation context
        $context = $this->buildContext($campaign, $parameters);
        
        // Build prompt
        $prompt = $template 
            ? $template->renderPrompt($context)
            : $this->buildDefaultPrompt($platform, $adType, $context);

        // Generate ad content via AI
        $messages = [
            ['role' => 'system', 'content' => $this->getSystemPrompt($platform, $adType)],
            ['role' => 'user', 'content' => $prompt],
        ];

        $response = $this->openRouterService->chatCompletion($messages, [
            'temperature' => 0.9,
            'max_tokens' => 2000,
        ]);

        if (!$response) {
            throw new \Exception('Failed to generate ad from AI');
        }

        $aiContent = $response['choices'][0]['message']['content'] ?? '';
        
        // Parse and structure ad content
        $adData = $this->parseAdResponse($aiContent, $platform, $adType, $parameters);

        // Create ad record
        $ad = GeneratedAd::create([
            'tenant_id' => $campaign->tenant_id,
            'name' => $adData['name'] ?? "Ad from {$campaign->name}",
            'platform' => $platform,
            'ad_type' => $adType,
            'status' => 'draft',
            'headline' => $adData['headline'] ?? null,
            'description' => $adData['description'] ?? null,
            'call_to_action' => $adData['call_to_action'] ?? null,
            'destination_url' => $adData['destination_url'] ?? $parameters['destination_url'] ?? null,
            'content' => $adData['content'] ?? [],
            'metadata' => $adData['metadata'] ?? [],
            'campaign_id' => $campaignId,
            'template_id' => $template?->id,
            'generation_params' => $parameters,
        ]);

        return $ad;
    }

    /**
     * Generate ad from content
     */
    public function generateFromContent(
        string $contentId,
        string $platform,
        string $adType,
        ?string $templateId = null,
        array $parameters = []
    ): GeneratedAd {
        // Load content data
        $content = GeneratedContent::findOrFail($contentId);
        
        // Get template
        $template = $templateId 
            ? AdTemplate::find($templateId)
            : AdTemplate::where('platform', $platform)
                ->where('ad_type', $adType)
                ->where('tenant_id', $content->tenant_id)
                ->where('is_active', true)
                ->first();

        // Build generation context
        $context = $this->buildContextFromContent($content, $parameters);
        
        // Build prompt
        $prompt = $template 
            ? $template->renderPrompt($context)
            : $this->buildDefaultPrompt($platform, $adType, $context);

        // Generate ad content via AI
        $messages = [
            ['role' => 'system', 'content' => $this->getSystemPrompt($platform, $adType)],
            ['role' => 'user', 'content' => $prompt],
        ];

        $response = $this->openRouterService->chatCompletion($messages, [
            'temperature' => 0.9,
            'max_tokens' => 2000,
        ]);

        if (!$response) {
            throw new \Exception('Failed to generate ad from AI');
        }

        $aiContent = $response['choices'][0]['message']['content'] ?? '';
        
        // Parse and structure ad content
        $adData = $this->parseAdResponse($aiContent, $platform, $adType, $parameters);

        // Create ad record
        $ad = GeneratedAd::create([
            'tenant_id' => $content->tenant_id,
            'name' => $adData['name'] ?? "Ad from {$content->title}",
            'platform' => $platform,
            'ad_type' => $adType,
            'status' => 'draft',
            'headline' => $adData['headline'] ?? null,
            'description' => $adData['description'] ?? null,
            'call_to_action' => $adData['call_to_action'] ?? null,
            'destination_url' => $adData['destination_url'] ?? $parameters['destination_url'] ?? null,
            'content' => $adData['content'] ?? [],
            'metadata' => $adData['metadata'] ?? [],
            'content_id' => $contentId,
            'template_id' => $template?->id,
            'generation_params' => $parameters,
        ]);

        return $ad;
    }

    /**
     * Build context from campaign
     */
    private function buildContext(OutboundCampaign $campaign, array $parameters): array
    {
        $context = [
            'campaign_name' => $campaign->name,
            'campaign_message' => $campaign->message,
            'campaign_subject' => $campaign->subject ?? '',
        ];

        return array_merge($context, $parameters);
    }

    /**
     * Build context from content
     */
    private function buildContextFromContent(GeneratedContent $content, array $parameters): array
    {
        $context = [
            'content_title' => $content->title,
            'content_excerpt' => $content->excerpt ?? '',
            'content_summary' => mb_substr(strip_tags($content->content), 0, 500),
        ];

        return array_merge($context, $parameters);
    }

    /**
     * Build default prompt
     */
    private function buildDefaultPrompt(string $platform, string $adType, array $context): string
    {
        $prompts = [
            'facebook' => "Create a Facebook ad with headline, description, and call-to-action about {{topic}}. Make it engaging and conversion-focused.",
            'google' => "Create a Google Search ad with headline (30 chars max), description (90 chars max), and call-to-action about {{topic}}. Make it compelling and keyword-rich.",
            'instagram' => "Create an Instagram ad caption (125 chars recommended) with hashtags about {{topic}}. Make it visual and engaging.",
            'linkedin' => "Create a LinkedIn ad with headline, description, and call-to-action about {{topic}}. Make it professional and B2B focused.",
            'twitter' => "Create a Twitter ad (280 chars max) about {{topic}}. Make it concise and impactful.",
        ];

        $template = $prompts[$platform] ?? $prompts['facebook'];

        foreach ($context as $key => $value) {
            $placeholder = "{{{$key}}}";
            $template = str_replace($placeholder, (string) $value, $template);
        }

        return $template;
    }

    /**
     * Get system prompt for platform and ad type
     */
    private function getSystemPrompt(string $platform, string $adType): string
    {
        $prompts = [
            'facebook' => 'You are a Facebook ad copywriter. Create compelling, conversion-focused Facebook ads.',
            'google' => 'You are a Google Ads copywriter. Create keyword-rich, compelling Google Search ads.',
            'instagram' => 'You are an Instagram ad copywriter. Create visual, engaging Instagram ad captions.',
            'linkedin' => 'You are a LinkedIn ad copywriter. Create professional, B2B-focused LinkedIn ads.',
            'twitter' => 'You are a Twitter ad copywriter. Create concise, impactful Twitter ads.',
        ];

        return $prompts[$platform] ?? 'You are a professional ad copywriter. Create compelling ad content.';
    }

    /**
     * Parse AI response into structured ad content
     */
    private function parseAdResponse(string $aiContent, string $platform, string $adType, array $parameters): array
    {
        // Extract headline, description, CTA from structured response
        // For now, use simple parsing - in production, use more sophisticated parsing or structured output
        
        $lines = explode("\n", trim($aiContent));
        
        $headline = null;
        $description = null;
        $callToAction = null;

        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;

            // Try to extract headline
            if (preg_match('/headline[:\-]\s*(.+)/i', $line, $matches)) {
                $headline = trim($matches[1]);
            }
            // Try to extract description
            elseif (preg_match('/description[:\-]\s*(.+)/i', $line, $matches)) {
                $description = trim($matches[1]);
            }
            // Try to extract CTA
            elseif (preg_match('/call[-\s]*to[-\s]*action|cta[:\-]\s*(.+)/i', $line, $matches)) {
                $callToAction = trim($matches[1]);
            }
            // If no label, use first line as headline
            elseif (!$headline && mb_strlen($line) <= 100) {
                $headline = $line;
            }
            // Otherwise use as description
            elseif (!$description) {
                $description = $line;
            }
        }

        // Fallback values
        $headline = $headline ?? $parameters['headline'] ?? 'Discover More';
        $description = $description ?? $parameters['description'] ?? mb_substr(strip_tags($aiContent), 0, 200);
        $callToAction = $callToAction ?? $parameters['call_to_action'] ?? 'Learn More';

        return [
            'name' => $parameters['name'] ?? "{$platform} {$adType} Ad",
            'headline' => $headline,
            'description' => $description,
            'call_to_action' => $callToAction,
            'destination_url' => $parameters['destination_url'] ?? null,
            'content' => [
                'headline' => $headline,
                'description' => $description,
                'cta' => $callToAction,
            ],
            'metadata' => [
                'platform' => $platform,
                'ad_type' => $adType,
                'generated_at' => now()->toIso8601String(),
            ],
        ];
    }
}
```

### CampaignGenerationService.php
```php
<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Conversation;
use App\Models\Knowledge;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class CampaignGenerationService
{
    public function __construct(
        private OpenRouterService $openRouterService
    ) {}

    /**
     * Generate campaign based on customer data and objectives
     */
    public function generateCampaign(array $parameters): array
    {
        $customerId = $parameters['customer_id'] ?? null;
        $campaignType = $parameters['type'] ?? 'Educational';
        $objective = $parameters['objective'] ?? 'educate';
        $targetAudience = $parameters['target_audience'] ?? null;
        $topic = $parameters['topic'] ?? null;

        // Build context from customer data if provided
        $context = $this->buildContext($customerId, $targetAudience);

        // Build prompt for campaign generation
        $prompt = $this->buildCampaignPrompt($campaignType, $objective, $topic, $context);

        // Call AI to generate campaign
        $messages = [
            [
                'role' => 'user',
                'content' => $prompt,
            ],
        ];

        $response = $this->openRouterService->chatCompletion($messages, [
            'system' => $this->getSystemPrompt(),
            'temperature' => 0.8,
            'max_tokens' => 4000,
        ]);

        if (!$response) {
            throw new \Exception('Failed to generate campaign from AI');
        }

        $aiContent = $response['choices'][0]['message']['content'] ?? '';

        // Parse AI response to structured campaign data
        $campaignData = $this->parseCampaignResponse($aiContent, $campaignType, $parameters);

        return $campaignData;
    }

    /**
     * Build context from customer data
     */
    private function buildContext(?string $customerId, ?string $targetAudience): array
    {
        $context = [
            'target_audience' => $targetAudience ?? 'small businesses',
        ];

        if ($customerId) {
            $customer = Customer::find($customerId);
            if ($customer) {
                $context['customer'] = [
                    'business_name' => $customer->business_name,
                    'industry' => $customer->industry_category ?? $customer->industry_id,
                    'subcategory' => $customer->industry_subcategory ?? $customer->sub_category,
                    'challenges' => $customer->challenges ?? [],
                    'goals' => $customer->goals ?? [],
                    'products_services' => $customer->products_services ?? [],
                ];

                // Get recent conversations for context
                $recentConversations = Conversation::where('customer_id', $customerId)
                    ->orderBy('started_at', 'desc')
                    ->limit(5)
                    ->get(['outcome', 'topics_discussed', 'questions_asked']);

                if ($recentConversations->isNotEmpty()) {
                    $context['recent_conversations'] = $recentConversations->map(function ($conv) {
                        return [
                            'outcome' => $conv->outcome,
                            'topics' => $conv->topics_discussed ?? [],
                            'questions' => $conv->questions_asked ?? [],
                        ];
                    })->toArray();
                }
            }
        }

        return $context;
    }

    /**
     * Build campaign generation prompt
     */
    private function buildCampaignPrompt(string $type, string $objective, ?string $topic, array $context): string
    {
        $prompt = "Generate a marketing campaign of type '{$type}' with the objective to '{$objective}'.\n\n";

        if ($topic) {
            $prompt .= "Topic: {$topic}\n\n";
        }

        if (isset($context['customer'])) {
            $customer = $context['customer'];
            $prompt .= "Target Customer:\n";
            $prompt .= "- Business: {$customer['business_name']}\n";
            if ($customer['industry']) {
                $prompt .= "- Industry: {$customer['industry']}\n";
            }
            if (!empty($customer['challenges'])) {
                $prompt .= "- Challenges: " . implode(', ', $customer['challenges']) . "\n";
            }
            if (!empty($customer['goals'])) {
                $prompt .= "- Goals: " . implode(', ', $customer['goals']) . "\n";
            }
            $prompt .= "\n";
        } else {
            $prompt .= "Target Audience: {$context['target_audience']}\n\n";
        }

        $prompt .= "Please provide a complete campaign structure in JSON format with the following fields:\n";
        $prompt .= "1. campaign: { id, type, title, subject, description }\n";
        $prompt .= "2. landing_page: { landing_page_slug, template_id, ai_persona, ai_tone, ai_goal, primary_cta, secondary_cta, conversion_goal }\n";
        $prompt .= "3. A brief outline for slides (key points for each slide)\n";
        $prompt .= "4. Suggested email subject line\n";
        $prompt .= "5. Key messaging points\n";

        return $prompt;
    }

    /**
     * System prompt for campaign generation
     */
    private function getSystemPrompt(): string
    {
        return "You are an expert marketing campaign strategist specializing in creating educational and engaging marketing campaigns for small businesses. 

Your campaigns should:
- Be clear, actionable, and valuable to the target audience
- Use conversational, friendly tone
- Focus on education, problem-solving, or value delivery
- Include strong calls-to-action
- Be optimized for email marketing and landing pages

Always respond with valid JSON that can be parsed. Structure your response as a JSON object with campaign, landing_page, and outline fields.";
    }

    /**
     * Parse AI response into structured campaign data
     */
    private function parseCampaignResponse(string $aiContent, string $type, array $parameters): array
    {
        // Try to extract JSON from response
        $jsonMatch = [];
        if (preg_match('/\{[\s\S]*\}/', $aiContent, $jsonMatch)) {
            $parsed = json_decode($jsonMatch[0], true);
            if ($parsed && isset($parsed['campaign'])) {
                return $this->structureCampaignData($parsed, $type, $parameters);
            }
        }

        // Fallback: build structure from text content
        return $this->buildCampaignFromText($aiContent, $type, $parameters);
    }

    /**
     * Structure campaign data with all required fields
     */
    private function structureCampaignData(array $parsed, string $type, array $parameters): array
    {
        $campaignId = $parsed['campaign']['id'] ?? $this->generateCampaignId($type);
        $slug = Str::slug($parsed['campaign']['title'] ?? $parsed['landing_page']['landing_page_slug'] ?? $campaignId);

        // Get template based on type
        $template = $this->getTemplateForType($type);

        return [
            'campaign' => [
                'id' => $campaignId,
                'week' => $parameters['week'] ?? 1,
                'day' => $parameters['day'] ?? 1,
                'type' => $type,
                'title' => $parsed['campaign']['title'] ?? 'New Campaign',
                'subject' => $parsed['campaign']['subject'] ?? $parsed['campaign']['title'] ?? 'New Campaign',
                'landing_page' => $slug,
                'template' => $template['template_id'],
                'description' => $parsed['campaign']['description'] ?? '',
            ],
            'landing_page' => [
                'campaign_id' => $campaignId,
                'landing_page_slug' => $slug,
                'url' => "/learn/{$slug}",
                'template_id' => $template['template_id'],
                'template_name' => $template['name'],
                'slide_count' => $template['slides'],
                'duration_seconds' => $template['duration'],
                'primary_cta' => $parsed['landing_page']['primary_cta'] ?? 'download_guide',
                'secondary_cta' => $parsed['landing_page']['secondary_cta'] ?? 'start_trial',
                'ai_persona' => $parsed['landing_page']['ai_persona'] ?? 'Sarah',
                'ai_tone' => $parsed['landing_page']['ai_tone'] ?? 'Knowledgeable, friendly',
                'ai_goal' => $parsed['landing_page']['ai_goal'] ?? 'Educate and engage',
                'data_capture_fields' => 'name, email, business_name, industry',
                'audio_base_url' => "https://cdn.fibonacco.com/presentations/{$slug}/audio/",
                'crm_tracking' => true,
                'conversion_goal' => $parsed['landing_page']['conversion_goal'] ?? 'education',
                'utm_source' => 'email',
                'utm_medium' => 'outbound',
                'utm_campaign' => $parameters['utm_campaign'] ?? "campaign-{$slug}",
                'utm_content' => $campaignId,
            ],
            'template' => $template,
            'slides' => $this->generateSlideStructure($template),
            'outline' => $parsed['outline'] ?? [],
            'suggestions' => $parsed['suggestions'] ?? [],
        ];
    }

    /**
     * Build campaign from text if JSON parsing fails
     */
    private function buildCampaignFromText(string $text, string $type, array $parameters): array
    {
        $campaignId = $this->generateCampaignId($type);
        $title = $this->extractTitle($text) ?? 'New Campaign';
        $slug = Str::slug($title);
        $template = $this->getTemplateForType($type);

        return [
            'campaign' => [
                'id' => $campaignId,
                'week' => $parameters['week'] ?? 1,
                'day' => $parameters['day'] ?? 1,
                'type' => $type,
                'title' => $title,
                'subject' => $title,
                'landing_page' => $slug,
                'template' => $template['template_id'],
                'description' => $text,
            ],
            'landing_page' => [
                'campaign_id' => $campaignId,
                'landing_page_slug' => $slug,
                'url' => "/learn/{$slug}",
                'template_id' => $template['template_id'],
                'template_name' => $template['name'],
                'slide_count' => $template['slides'],
                'duration_seconds' => $template['duration'],
                'primary_cta' => 'download_guide',
                'secondary_cta' => 'start_trial',
                'ai_persona' => 'Sarah',
                'ai_tone' => 'Knowledgeable, friendly',
                'ai_goal' => 'Educate and engage',
                'data_capture_fields' => 'name, email, business_name, industry',
                'audio_base_url' => "https://cdn.fibonacco.com/presentations/{$slug}/audio/",
                'crm_tracking' => true,
                'conversion_goal' => 'education',
                'utm_source' => 'email',
                'utm_medium' => 'outbound',
                'utm_campaign' => $parameters['utm_campaign'] ?? "campaign-{$slug}",
                'utm_content' => $campaignId,
            ],
            'template' => $template,
            'slides' => $this->generateSlideStructure($template),
            'outline' => [],
            'suggestions' => [],
        ];
    }

    /**
     * Get template structure based on campaign type
     */
    private function getTemplateForType(string $type): array
    {
        $templates = [
            'Educational' => [
                'template_id' => 'educational',
                'name' => 'Educational Content',
                'slides' => 7,
                'duration' => 75,
                'purpose' => 'education',
            ],
            'Hook' => [
                'template_id' => 'hook',
                'name' => 'Hook Campaign',
                'slides' => 6,
                'duration' => 45,
                'purpose' => 'hook',
            ],
            'HowTo' => [
                'template_id' => 'howto',
                'name' => 'How-To Guide',
                'slides' => 8,
                'duration' => 90,
                'purpose' => 'education',
            ],
        ];

        return $templates[$type] ?? $templates['Educational'];
    }

    /**
     * Generate slide structure based on template
     */
    private function generateSlideStructure(array $template): array
    {
        $slideComponents = [
            'educational' => ['HeroSlide', 'ConceptSlide', 'DataSlide', 'ComparisonSlide', 'ActionSlide', 'ResourceSlide', 'CTASlide'],
            'hook' => ['HeroSlide', 'ValuePropSlide', 'SocialProofSlide', 'UrgencySlide', 'CTASlide', 'FollowUpSlide'],
            'howto' => ['HeroSlide', 'OverviewSlide', 'StepSlide', 'StepSlide', 'StepSlide', 'StepSlide', 'TipSlide', 'CTASlide'],
        ];

        $components = $slideComponents[$template['template_id']] ?? $slideComponents['educational'];
        $slides = [];

        foreach ($components as $index => $component) {
            $slides[] = [
                'template_id' => $template['template_id'],
                'slide_num' => $index + 1,
                'component' => $component,
                'content_type' => strtolower(str_replace('Slide', '', $component)),
                'requires_personalization' => in_array($component, ['HeroSlide', 'CTASlide', 'ActionSlide']),
                'audio_file' => sprintf('slide-%02d-%s.mp3', $index + 1, strtolower(str_replace('Slide', '', $component))),
            ];
        }

        return $slides;
    }

    /**
     * Generate unique campaign ID
     */
    private function generateCampaignId(string $type): string
    {
        $prefix = match ($type) {
            'Educational' => 'EDU',
            'Hook' => 'HOOK',
            'HowTo' => 'HOWTO',
            default => 'CAMP',
        };

        return $prefix . '-' . str_pad((string) rand(1, 999), 3, '0', STR_PAD_LEFT);
    }

    /**
     * Extract title from text
     */
    private function extractTitle(string $text): ?string
    {
        // Try to find title in quotes or first line
        if (preg_match('/"([^"]+)"/', $text, $matches)) {
            return $matches[1];
        }

        $lines = explode("\n", $text);
        $firstLine = trim($lines[0] ?? '');
        
        if (strlen($firstLine) < 100 && strlen($firstLine) > 5) {
            return $firstLine;
        }

        return null;
    }

    /**
     * Get campaign templates/suggestions
     */
    public function getTemplates(): array
    {
        return [
            [
                'type' => 'Educational',
                'name' => 'Educational Content',
                'description' => 'Teach your audience something valuable',
                'best_for' => 'Building trust and authority',
                'slides' => 7,
                'duration' => 75,
            ],
            [
                'type' => 'Hook',
                'name' => 'Hook Campaign',
                'description' => 'Grab attention with compelling offer',
                'best_for' => 'Acquiring new leads quickly',
                'slides' => 6,
                'duration' => 45,
            ],
            [
                'type' => 'HowTo',
                'name' => 'How-To Guide',
                'description' => 'Step-by-step instructions',
                'best_for' => 'Guiding users through processes',
                'slides' => 8,
                'duration' => 90,
            ],
        ];
    }
}
```

### ContactService.php
```php
<?php

namespace App\Services;

use App\Models\AiPersonality;
use App\Models\PersonalityAssignment;
use App\Models\Customer;
use App\Models\OutboundCampaign;
use App\Services\EmailService;
use App\Services\SMSService;
use App\Services\PhoneService;
use Illuminate\Support\Facades\Log;

class ContactService
{
    protected PersonalityService $personalityService;
    protected EmailService $emailService;
    protected SMSService $smsService;
    protected PhoneService $phoneService;

    public function __construct(
        PersonalityService $personalityService,
        EmailService $emailService,
        SMSService $smsService,
        PhoneService $phoneService
    ) {
        $this->personalityService = $personalityService;
        $this->emailService = $emailService;
        $this->smsService = $smsService;
        $this->phoneService = $phoneService;
    }

    /**
     * Contact customer using their assigned personality
     */
    public function contactCustomer(
        string $customerId,
        string $contactType,
        array $options = []
    ): bool {
        $customer = Customer::findOrFail($customerId);

        // Get customer's assigned personality
        $assignment = PersonalityAssignment::where('customer_id', $customerId)
            ->where('status', 'active')
            ->with('personality')
            ->first();

        if (!$assignment || !$assignment->personality) {
            throw new \Exception('Customer has no active personality assignment');
        }

        $personality = $assignment->personality;

        // Check if personality can handle this contact type
        if (!$personality->canHandle($contactType)) {
            throw new \Exception("Personality {$personality->identity} cannot handle {$contactType} contacts");
        }

        // Check if personality is currently active (time-based)
        $force = isset($options['force']) ? $options['force'] : false;
        if (!$personality->isCurrentlyActive() && !$force) {
            Log::warning("Personality {$personality->identity} is not currently active", [
                'customer_id' => $customerId,
                'contact_type' => $contactType,
            ]);
            return false;
        }

        // Generate message based on personality
        $message = $this->generatePersonalityMessage($personality, $customer, $options);

        // Send contact based on type
        $result = match($contactType) {
            'email' => $this->sendEmail($customer, $personality, $message, $options),
            'sms' => $this->sendSMS($customer, $personality, $message, $options),
            'call', 'phone' => $this->makeCall($customer, $personality, $message, $options),
            default => throw new \Exception("Unknown contact type: {$contactType}"),
        };

        // Record interaction
        if ($result) {
            $assignment->recordInteraction();
        }

        return $result;
    }

    /**
     * Schedule contact for customer
     */
    public function scheduleContact(
        string $customerId,
        string $contactType,
        \DateTimeInterface $scheduledAt,
        array $options = []
    ): void {
        // Store scheduled contact in options or use a scheduled contacts table
        // For now, we'll use the customer's metadata or create a scheduled contact record
        // This could be enhanced with a dedicated scheduled_contacts table
        
        $customer = Customer::findOrFail($customerId);
        
        // Get personality
        $assignment = PersonalityAssignment::where('customer_id', $customerId)
            ->where('status', 'active')
            ->with('personality')
            ->first();

        if (!$assignment || !$assignment->personality) {
            throw new \Exception('Customer has no active personality assignment');
        }

        $personality = $assignment->personality;

        // Check if personality can handle this contact type
        if (!$personality->canHandle($contactType)) {
            throw new \Exception("Personality {$personality->identity} cannot handle {$contactType} contacts");
        }

        // Store scheduled contact (could use a scheduled_contacts table)
        // For now, we'll just log it
        Log::info('Contact scheduled', [
            'customer_id' => $customerId,
            'personality_id' => $personality->id,
            'contact_type' => $contactType,
            'scheduled_at' => $scheduledAt->toIso8601String(),
            'options' => $options,
        ]);

        // In a production system, you would:
        // 1. Create a scheduled_contacts table
        // 2. Store the scheduled contact record
        // 3. Use a queue/job scheduler to send at the scheduled time
    }

    /**
     * Generate message using personality
     */
    private function generatePersonalityMessage(
        AiPersonality $personality,
        Customer $customer,
        array $options = []
    ): string {
        $messageTemplate = $options['message'] ?? null;

        if ($messageTemplate) {
            // Replace variables in template
            $customerName = $customer->owner_name ? $customer->owner_name : $customer->business_name;
            $message = str_replace('{{customer_name}}', $customerName, $messageTemplate);
            $message = str_replace('{{business_name}}', $customer->business_name, $message);
            $message = str_replace('{{personality_name}}', $personality->identity, $message);
            return $message;
        }

        // Generate message using AI
        $customerName = $customer->owner_name ? $customer->owner_name : $customer->business_name;
        $context = [
            'customer_name' => $customerName,
            'business_name' => $customer->business_name,
            'industry' => $customer->industry_category,
            'purpose' => isset($options['purpose']) ? $options['purpose'] : 'general outreach',
        ];

        try {
            $contactType = isset($options['contact_type']) ? $options['contact_type'] : 'email';
            $defaultPrompt = "Generate a brief {$contactType} message to reach out to this customer.";
            $prompt = isset($options['prompt']) ? $options['prompt'] : $defaultPrompt;
            $conversationContext = isset($options['conversation_context']) ? $options['conversation_context'] : [];
            
            return $this->personalityService->generateResponse(
                $personality,
                $prompt,
                $conversationContext,
                $customer
            );
        } catch (\Exception $e) {
            Log::error('Failed to generate personality message', [
                'error' => $e->getMessage(),
                'personality_id' => $personality->id,
                'customer_id' => $customer->id,
            ]);

            // Fallback to greeting message
            return $this->personalityService->getGreeting($personality, $customer);
        }
    }

    /**
     * Send email using personality
     */
    private function sendEmail(
        Customer $customer,
        AiPersonality $personality,
        string $message,
        array $options = []
    ): bool {
        if (!$customer->email) {
            Log::warning('Customer has no email address', ['customer_id' => $customer->id]);
            return false;
        }

        $subject = isset($options['subject']) && $options['subject'] ? $options['subject'] : "Message from {$personality->identity}";
        
        // Convert message to HTML if needed
        $htmlContent = nl2br(htmlspecialchars($message));
        
        // Add personality signature
        $htmlContent .= "<br><br>--<br>{$personality->identity}";
        if ($personality->contact_email) {
            $htmlContent .= "<br>{$personality->contact_email}";
        }

        $result = $this->emailService->send(
            $customer->email,
            $subject,
            $htmlContent,
            $message, // Plain text version
            [
                'from_email' => $personality->contact_email ? $personality->contact_email : config('mail.from.address'),
                'from_name' => $personality->identity,
                'campaign_id' => isset($options['campaign_id']) && $options['campaign_id'] ? $options['campaign_id'] : null,
            ]
        );

        return $result !== null && ($result['success'] ?? false);
    }

    /**
     * Send SMS using personality
     */
    private function sendSMS(
        Customer $customer,
        AiPersonality $personality,
        string $message,
        array $options = []
    ): bool {
        if (!$customer->phone) {
            Log::warning('Customer has no phone number', ['customer_id' => $customer->id]);
            return false;
        }

        // Add personality signature to SMS
        $messageWithSignature = $message;
        $includeSignature = isset($options['include_signature']) ? $options['include_signature'] : true;
        if ($includeSignature) {
            $messageWithSignature .= " - {$personality->identity}";
        }

        $result = $this->smsService->send(
            $customer->phone,
            $messageWithSignature,
            [
                'campaign_id' => isset($options['campaign_id']) && $options['campaign_id'] ? $options['campaign_id'] : null,
            ]
        );

        return $result !== null && ($result['success'] ?? false);
    }

    /**
     * Make phone call using personality
     */
    private function makeCall(
        Customer $customer,
        AiPersonality $personality,
        string $message,
        array $options = []
    ): bool {
        if (!$customer->phone) {
            Log::warning('Customer has no phone number', ['customer_id' => $customer->id]);
            return false;
        }

        // Use message as call script
        $script = $message;

        $result = $this->phoneService->makeCall(
            $customer->phone,
            $script,
            [
                'use_tts' => true,
                'voicemail_enabled' => true,
            ]
        );

        return $result !== null && ($result['success'] ?? false);
    }

    /**
     * Get customer contact preferences
     */
    public function getContactPreferences(string $customerId): array
    {
        $customer = Customer::findOrFail($customerId);

        // Check if customer has contact preferences stored
        $preferences = $customer->contact_preferences ? $customer->contact_preferences : [];

        // Default preferences if not set
        $defaults = [
            'preferred_channel' => 'email',
            'allowed_channels' => ['email', 'sms', 'chat'],
            'time_of_day' => 'business_hours',
            'frequency' => 'weekly',
        ];

        return array_merge($defaults, $preferences);
    }

    /**
     * Update customer contact preferences
     */
    public function updateContactPreferences(string $customerId, array $preferences): void
    {
        $customer = Customer::findOrFail($customerId);

        $currentPreferences = $customer->contact_preferences ? $customer->contact_preferences : [];
        $updatedPreferences = array_merge($currentPreferences, $preferences);

        $customer->update(['contact_preferences' => $updatedPreferences]);
    }
}
```

### ContentGenerationService.php
```php
<?php

namespace App\Services;

use App\Models\ContentTemplate;
use App\Models\GeneratedContent;
use App\Models\OutboundCampaign;
use Illuminate\Support\Facades\Log;

class ContentGenerationService
{
    protected OpenRouterService $openRouterService;

    public function __construct(OpenRouterService $openRouterService)
    {
        $this->openRouterService = $openRouterService;
    }

    /**
     * Generate content from campaign
     */
    public function generateFromCampaign(
        string $campaignId,
        string $type,
        ?string $templateId = null,
        array $parameters = []
    ): GeneratedContent {
        // Load campaign data
        $campaign = OutboundCampaign::findOrFail($campaignId);
        
        // Get template
        $template = $templateId 
            ? ContentTemplate::find($templateId)
            : ContentTemplate::where('type', $type)
                ->where('tenant_id', $campaign->tenant_id)
                ->where('is_active', true)
                ->first();

        // Build generation context
        $context = $this->buildContext($campaign, $parameters);
        
        // Build prompt
        $prompt = $template 
            ? $template->renderPrompt($context)
            : $this->buildDefaultPrompt($type, $context);

        // Generate content via AI
        $messages = [
            ['role' => 'system', 'content' => $this->getSystemPrompt($type)],
            ['role' => 'user', 'content' => $prompt],
        ];

        $response = $this->openRouterService->chatCompletion($messages, [
            'temperature' => 0.8,
            'max_tokens' => 4000,
        ]);

        if (!$response) {
            throw new \Exception('Failed to generate content from AI');
        }

        $aiContent = $response['choices'][0]['message']['content'] ?? '';
        
        // Parse and structure content
        $contentData = $this->parseContentResponse($aiContent, $type, $parameters);

        // Create content record
        $content = GeneratedContent::create([
            'tenant_id' => $campaign->tenant_id,
            'title' => $contentData['title'],
            'slug' => $this->generateSlug($contentData['title']),
            'type' => $type,
            'status' => 'draft',
            'content' => $contentData['content'],
            'excerpt' => $contentData['excerpt'] ?? null,
            'metadata' => $contentData['metadata'] ?? [],
            'campaign_id' => $campaignId,
            'template_id' => $template?->id,
            'generation_params' => $parameters,
        ]);

        // Create initial version
        $content->createVersion('Initial AI-generated content');

        // Record workflow action
        $content->recordWorkflowAction('created', null, 'draft');

        return $content;
    }

    /**
     * Generate content from scratch
     */
    public function generate(
        string $tenantId,
        string $type,
        array $parameters,
        ?string $templateId = null
    ): GeneratedContent {
        // Get template
        $template = $templateId 
            ? ContentTemplate::find($templateId)
            : ContentTemplate::where('type', $type)
                ->where('tenant_id', $tenantId)
                ->where('is_active', true)
                ->first();

        // Build context
        $context = $parameters;

        // Build prompt
        $prompt = $template 
            ? $template->renderPrompt($context)
            : $this->buildDefaultPrompt($type, $context);

        // Generate content via AI
        $messages = [
            ['role' => 'system', 'content' => $this->getSystemPrompt($type)],
            ['role' => 'user', 'content' => $prompt],
        ];

        $response = $this->openRouterService->chatCompletion($messages, [
            'temperature' => 0.8,
            'max_tokens' => 4000,
        ]);

        if (!$response) {
            throw new \Exception('Failed to generate content from AI');
        }

        $aiContent = $response['choices'][0]['message']['content'] ?? '';
        
        // Parse and structure content
        $contentData = $this->parseContentResponse($aiContent, $type, $parameters);

        // Create content record
        $content = GeneratedContent::create([
            'tenant_id' => $tenantId,
            'title' => $contentData['title'],
            'slug' => $this->generateSlug($contentData['title']),
            'type' => $type,
            'status' => 'draft',
            'content' => $contentData['content'],
            'excerpt' => $contentData['excerpt'] ?? null,
            'metadata' => $contentData['metadata'] ?? [],
            'template_id' => $template?->id,
            'generation_params' => $parameters,
        ]);

        // Create initial version
        $content->createVersion('Initial AI-generated content');

        // Record workflow action
        $content->recordWorkflowAction('created', null, 'draft');

        return $content;
    }

    /**
     * Build context from campaign
     */
    private function buildContext(OutboundCampaign $campaign, array $parameters): array
    {
        $context = [
            'campaign_name' => $campaign->name,
            'campaign_type' => $campaign->type,
            'campaign_message' => $campaign->message,
            'campaign_subject' => $campaign->subject ?? '',
        ];

        if ($campaign->recipient_segments) {
            $context['target_audience'] = json_encode($campaign->recipient_segments);
        }

        return array_merge($context, $parameters);
    }

    /**
     * Build default prompt
     */
    private function buildDefaultPrompt(string $type, array $context): string
    {
        $prompts = [
            'article' => "Write a comprehensive article titled '{{title}}' about {{topic}}. Include: introduction, main points, and conclusion.",
            'blog' => "Write a blog post titled '{{title}}' about {{topic}}. Make it engaging and conversational.",
            'social' => "Create a social media post about {{topic}}. Make it concise and engaging.",
            'email' => "Write an email about {{topic}} with subject line '{{subject}}'. Include: greeting, main message, and call-to-action.",
            'landing_page' => "Create landing page content titled '{{title}}' about {{topic}}. Include: headline, subheadline, benefits, features, and call-to-action.",
        ];

        $template = $prompts[$type] ?? $prompts['article'];

        foreach ($context as $key => $value) {
            $placeholder = "{{{$key}}}";
            $template = str_replace($placeholder, (string) $value, $template);
        }

        return $template;
    }

    /**
     * Get system prompt for content type
     */
    private function getSystemPrompt(string $type): string
    {
        $prompts = [
            'article' => 'You are a professional article writer. Create well-structured, informative articles.',
            'blog' => 'You are a blog writer. Create engaging, conversational blog posts.',
            'social' => 'You are a social media content creator. Create concise, engaging social media posts.',
            'email' => 'You are an email copywriter. Create compelling, action-oriented email content.',
            'landing_page' => 'You are a landing page copywriter. Create persuasive, conversion-focused landing page content.',
        ];

        return $prompts[$type] ?? 'You are a professional content writer. Create high-quality content.';
    }

    /**
     * Parse AI response into structured content
     */
    private function parseContentResponse(string $aiContent, string $type, array $parameters): array
    {
        // Extract title
        $title = $parameters['title'] ?? $this->extractTitle($aiContent);

        // For now, use the AI content as-is
        // In production, you might want more sophisticated parsing
        $content = $aiContent;

        // Extract excerpt (first 200 characters)
        $excerpt = mb_substr(strip_tags($aiContent), 0, 200);

        // Build metadata
        $metadata = [
            'word_count' => str_word_count(strip_tags($content)),
            'generated_at' => now()->toIso8601String(),
        ];

        if (isset($parameters['tags'])) {
            $metadata['tags'] = $parameters['tags'];
        }

        if (isset($parameters['category'])) {
            $metadata['category'] = $parameters['category'];
        }

        return [
            'title' => $title,
            'content' => $content,
            'excerpt' => $excerpt,
            'metadata' => $metadata,
        ];
    }

    /**
     * Extract title from content
     */
    private function extractTitle(string $content): string
    {
        // Try to extract title from markdown header
        if (preg_match('/^#\s+(.+)$/m', $content, $matches)) {
            return trim($matches[1]);
        }

        // Try to extract from HTML title tag
        if (preg_match('/<h1[^>]*>(.*?)<\/h1>/i', $content, $matches)) {
            return strip_tags(trim($matches[1]));
        }

        // Use first line
        $lines = explode("\n", $content);
        $firstLine = trim($lines[0]);
        
        return mb_substr(strip_tags($firstLine), 0, 100) ?: 'Untitled Content';
    }

    /**
     * Generate slug from title
     */
    private function generateSlug(string $title): string
    {
        $slug = strtolower($title);
        $slug = preg_replace('/[^a-z0-9]+/', '-', $slug);
        $slug = trim($slug, '-');
        $slug .= '-' . substr(md5($title . time()), 0, 6);
        
        return $slug;
    }
}
```

### CrmAdvancedAnalyticsService.php
```php
<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Conversation;
use App\Models\Order;
use App\Models\ServiceSubscription;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CrmAdvancedAnalyticsService
{
    /**
     * Calculate customer engagement score
     * 
     * Factors:
     * - Number of conversations
     * - Average conversation duration
     * - Questions asked
     * - Recent activity
     * - Time since last interaction
     */
    public function calculateEngagementScore(string $customerId, string $tenantId): int
    {
        $customer = Customer::where('tenant_id', $tenantId)->find($customerId);
        if (!$customer) {
            return 0;
        }

        $score = 0;

        // Base score from lead score
        $score += (int) ($customer->lead_score * 0.3);

        // Conversation activity (max 30 points)
        $conversationCount = Conversation::where('customer_id', $customerId)
            ->where('tenant_id', $tenantId)
            ->count();
        
        $conversationScore = min($conversationCount * 5, 30);
        $score += $conversationScore;

        // Average conversation duration (max 20 points)
        $avgDuration = Conversation::where('customer_id', $customerId)
            ->where('tenant_id', $tenantId)
            ->whereNotNull('duration_seconds')
            ->avg('duration_seconds');
        
        if ($avgDuration) {
            // 60 seconds = 5 points, 300 seconds (5 min) = 20 points
            $durationScore = min((int) ($avgDuration / 15), 20);
            $score += $durationScore;
        }

        // Questions asked (max 15 points)
        $totalQuestions = Conversation::where('customer_id', $customerId)
            ->where('tenant_id', $tenantId)
            ->whereNotNull('questions_asked')
            ->get()
            ->sum(function ($conv) {
                return is_array($conv->questions_asked) ? count($conv->questions_asked) : 0;
            });
        
        $questionScore = min($totalQuestions * 2, 15);
        $score += $questionScore;

        // Recent activity (max 25 points)
        $recentConversations = Conversation::where('customer_id', $customerId)
            ->where('tenant_id', $tenantId)
            ->where('started_at', '>=', Carbon::now()->subDays(30))
            ->count();
        
        $recentScore = min($recentConversations * 5, 25);
        $score += $recentScore;

        // Time since last interaction (penalty)
        $lastConversation = Conversation::where('customer_id', $customerId)
            ->where('tenant_id', $tenantId)
            ->orderBy('started_at', 'desc')
            ->first();
        
        if ($lastConversation) {
            $daysSinceLastContact = Carbon::now()->diffInDays($lastConversation->started_at);
            // Penalty: -1 point per week after 4 weeks
            if ($daysSinceLastContact > 28) {
                $penalty = (int) (($daysSinceLastContact - 28) / 7);
                $score = max(0, $score - $penalty);
            }
        } else {
            // No conversations = low engagement
            $score = max(0, $score - 20);
        }

        // Cap at 100
        return min(100, max(0, $score));
    }

    /**
     * Calculate campaign ROI
     * 
     * ROI = (Revenue - Cost) / Cost * 100
     */
    public function calculateCampaignROI(string $campaignId, string $tenantId, ?int $days = null): array
    {
        $startDate = $days ? Carbon::now()->subDays($days) : null;

        // Get conversations from this campaign
        // Note: Campaign tracking relies on entry_point field or metadata
        // For better tracking, campaigns should store campaign_id in conversation metadata
        $query = Conversation::where('tenant_id', $tenantId)
            ->where(function ($q) use ($campaignId) {
                // Try to match by entry_point (basic match)
                $q->where('entry_point', $campaignId)
                  ->orWhere('entry_point', 'like', "%{$campaignId}%");
            });
        
        if ($startDate) {
            $query->where('started_at', '>=', $startDate);
        }

        $conversations = $query->get();

        // Count conversions (purchases)
        $conversions = Conversation::where('tenant_id', $tenantId)
            ->where('outcome', 'service_purchase')
            ->whereIn('id', $conversations->pluck('id'))
            ->count();

        // Calculate revenue from purchases
        $revenue = Order::where('tenant_id', $tenantId)
            ->where('payment_status', 'paid')
            ->whereIn('customer_id', $conversations->whereNotNull('customer_id')->pluck('customer_id'))
            ->when($startDate, function ($q) use ($startDate) {
                $q->where('paid_at', '>=', $startDate);
            })
            ->sum('total');

        // Estimate campaign cost (placeholder - should be from campaign cost data)
        // Default: $0.50 per conversation (email campaign cost estimate)
        $cost = $conversations->count() * 0.50;

        // Calculate ROI
        $roi = $cost > 0 ? (($revenue - $cost) / $cost) * 100 : 0;
        $roas = $cost > 0 ? $revenue / $cost : 0; // Return on Ad Spend

        return [
            'campaign_id' => $campaignId,
            'conversations' => $conversations->count(),
            'conversions' => $conversions,
            'conversion_rate' => $conversations->count() > 0 
                ? ($conversions / $conversations->count()) * 100 
                : 0,
            'revenue' => (float) $revenue,
            'cost' => (float) $cost,
            'roi' => round($roi, 2),
            'roas' => round($roas, 2),
            'profit' => (float) ($revenue - $cost),
            'period_days' => $days,
        ];
    }

    /**
     * Calculate predictive lead score
     * 
     * Uses machine learning-like approach based on historical data:
     * - Similar customers who converted
     * - Engagement patterns
     * - Purchase history patterns
     * - Industry trends
     */
    public function calculatePredictiveLeadScore(string $customerId, string $tenantId): array
    {
        $customer = Customer::where('tenant_id', $tenantId)->find($customerId);
        if (!$customer) {
            return [
                'current_score' => 0,
                'predicted_score' => 0,
                'confidence' => 0,
                'factors' => [],
            ];
        }

        $currentScore = $customer->lead_score ?? 0;
        $predictedScore = $currentScore;
        $factors = [];

        // Factor 1: Industry conversion rate (max +15 points)
        $industryConversions = Order::where('tenant_id', $tenantId)
            ->where('payment_status', 'paid')
            ->whereHas('customer', function ($q) use ($customer) {
                if ($customer->industry_category) {
                    $q->where('industry_category', $customer->industry_category);
                }
            })
            ->count();
        
        $industryCustomers = Customer::where('tenant_id', $tenantId)
            ->where('industry_category', $customer->industry_category)
            ->count();
        
        if ($industryCustomers > 0) {
            $industryConversionRate = ($industryConversions / $industryCustomers) * 100;
            $industryFactor = min((int) ($industryConversionRate / 2), 15);
            $predictedScore += $industryFactor;
            $factors[] = [
                'factor' => 'Industry conversion rate',
                'impact' => "+{$industryFactor}",
                'details' => "{$industryConversionRate}% conversion rate in {$customer->industry_category}",
            ];
        }

        // Factor 2: Engagement trend (max +20 points)
        $recentConversations = Conversation::where('customer_id', $customerId)
            ->where('tenant_id', $tenantId)
            ->where('started_at', '>=', Carbon::now()->subDays(30))
            ->count();
        
        $olderConversations = Conversation::where('customer_id', $customerId)
            ->where('tenant_id', $tenantId)
            ->where('started_at', '>=', Carbon::now()->subDays(60))
            ->where('started_at', '<', Carbon::now()->subDays(30))
            ->count();
        
        if ($olderConversations > 0) {
            $engagementTrend = ($recentConversations / $olderConversations) - 1;
            if ($engagementTrend > 0.5) {
                // 50%+ increase in engagement
                $trendFactor = min((int) ($engagementTrend * 20), 20);
                $predictedScore += $trendFactor;
                $factors[] = [
                    'factor' => 'Engagement trend',
                    'impact' => "+{$trendFactor}",
                    'details' => sprintf(
                        '%.0f%% increase in recent conversations',
                        $engagementTrend * 100
                    ),
                ];
            }
        }

        // Factor 3: Similar customer conversion rate (max +25 points)
        // Find customers with similar profiles who converted
        $similarCustomers = Customer::where('tenant_id', $tenantId)
            ->where('id', '!=', $customerId)
            ->when($customer->industry_category, function ($q) use ($customer) {
                $q->where('industry_category', $customer->industry_category);
            })
            ->where('lead_score', '>=', $currentScore - 10)
            ->where('lead_score', '<=', $currentScore + 10)
            ->pluck('id');
        
        if ($similarCustomers->count() > 0) {
            $similarConversions = Order::where('tenant_id', $tenantId)
                ->where('payment_status', 'paid')
                ->whereIn('customer_id', $similarCustomers)
                ->count();
            
            $similarConversionRate = ($similarConversions / $similarCustomers->count()) * 100;
            $similarFactor = min((int) ($similarConversionRate / 2), 25);
            $predictedScore += $similarFactor;
            $factors[] = [
                'factor' => 'Similar customer conversion',
                'impact' => "+{$similarFactor}",
                'details' => "{$similarConversionRate}% conversion rate for similar customers",
            ];
        }

        // Factor 4: Time in pipeline (max +15 points for recent additions)
        $daysSinceFirstContact = $customer->first_contact_at 
            ? Carbon::now()->diffInDays($customer->first_contact_at)
            : null;
        
        if ($daysSinceFirstContact !== null && $daysSinceFirstContact < 30) {
            // New customers more likely to convert
            $timeFactor = max(0, 15 - (int) ($daysSinceFirstContact / 2));
            $predictedScore += $timeFactor;
            $factors[] = [
                'factor' => 'Time in pipeline',
                'impact' => "+{$timeFactor}",
                'details' => "Recently added ({$daysSinceFirstContact} days ago)",
            ];
        } elseif ($daysSinceFirstContact !== null && $daysSinceFirstContact > 180) {
            // Old leads less likely
            $timePenalty = min((int) (($daysSinceFirstContact - 180) / 30), 10);
            $predictedScore = max(0, $predictedScore - $timePenalty);
            $factors[] = [
                'factor' => 'Time in pipeline',
                'impact' => "-{$timePenalty}",
                'details' => "Long time in pipeline ({$daysSinceFirstContact} days)",
            ];
        }

        // Factor 5: Conversation outcomes (max +10 points)
        $positiveOutcomes = Conversation::where('customer_id', $customerId)
            ->where('tenant_id', $tenantId)
            ->whereIn('outcome', ['demo_scheduled', 'pricing_requested', 'interested'])
            ->count();
        
        if ($positiveOutcomes > 0) {
            $outcomeFactor = min($positiveOutcomes * 3, 10);
            $predictedScore += $outcomeFactor;
            $factors[] = [
                'factor' => 'Positive outcomes',
                'impact' => "+{$outcomeFactor}",
                'details' => "{$positiveOutcomes} conversations with positive outcomes",
            ];
        }

        // Cap predicted score at 100
        $predictedScore = min(100, max(0, (int) $predictedScore));

        // Calculate confidence (based on data availability)
        $confidence = $this->calculateConfidence($customer, $tenantId);

        return [
            'current_score' => $currentScore,
            'predicted_score' => $predictedScore,
            'score_change' => $predictedScore - $currentScore,
            'confidence' => $confidence,
            'factors' => $factors,
        ];
    }

    /**
     * Calculate confidence level for predictive score
     */
    private function calculateConfidence(Customer $customer, string $tenantId): int
    {
        $confidence = 50; // Base confidence

        // More conversations = higher confidence
        $conversationCount = Conversation::where('customer_id', $customer->id)
            ->where('tenant_id', $tenantId)
            ->count();
        
        $confidence += min($conversationCount * 5, 25);

        // More industry data = higher confidence
        $industryCustomers = Customer::where('tenant_id', $tenantId)
            ->where('industry_category', $customer->industry_category)
            ->count();
        
        if ($industryCustomers > 10) {
            $confidence += 15;
        } elseif ($industryCustomers > 5) {
            $confidence += 10;
        }

        // Recent activity = higher confidence
        $recentActivity = Conversation::where('customer_id', $customer->id)
            ->where('tenant_id', $tenantId)
            ->where('started_at', '>=', Carbon::now()->subDays(30))
            ->count();
        
        if ($recentActivity > 0) {
            $confidence += 10;
        }

        return min(100, $confidence);
    }
}
```

### ElevenLabsService.php
```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ElevenLabsService
{
    protected string $apiKey;
    protected string $baseUrl = 'https://api.elevenlabs.io/v1';

    public function __construct()
    {
        $this->apiKey = config('services.elevenlabs.api_key');
    }

    /**
     * Generate TTS audio
     */
    public function generateAudio(string $text, ?string $voiceId = null): ?string
    {
        $voiceId = $voiceId ?? config('services.elevenlabs.default_voice_id');
        
        try {
            $response = Http::withHeaders([
                'xi-api-key' => $this->apiKey,
            ])->post("{$this->baseUrl}/text-to-speech/{$voiceId}", [
                'text' => $text,
                'model_id' => 'eleven_monolingual_v1',
                'voice_settings' => [
                    'stability' => 0.5,
                    'similarity_boost' => 0.75,
                ],
            ]);

            if ($response->successful()) {
                return $response->body();
            }

            Log::error('ElevenLabs TTS failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('ElevenLabs TTS error', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * List available voices
     */
    public function getVoices(): array
    {
        try {
            $response = Http::withHeaders([
                'xi-api-key' => $this->apiKey,
            ])->get("{$this->baseUrl}/voices");

            if ($response->successful()) {
                return $response->json('voices', []);
            }

            return [];
        } catch (\Exception $e) {
            Log::error('ElevenLabs get voices error', ['error' => $e->getMessage()]);
            return [];
        }
    }
}






```

### EmailService.php
```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class EmailService
{
    protected string $provider;
    protected ?string $sendgridApiKey;
    protected array $sesConfig;

    public function __construct()
    {
        $this->provider = config('mail.default', 'sendgrid');
        $this->sendgridApiKey = config('services.sendgrid.api_key');
        $this->sesConfig = config('services.ses');
    }

    /**
     * Send email via SendGrid
     */
    public function sendViaSendGrid(string $to, string $subject, string $htmlContent, ?string $textContent = null, array $options = []): ?array
    {
        if (!$this->sendgridApiKey) {
            Log::error('SendGrid API key not configured');
            return null;
        }

        try {
            $payload = [
                'personalizations' => [
                    [
                        'to' => [['email' => $to]],
                        'subject' => $subject,
                    ],
                ],
                'from' => [
                    'email' => $options['from_email'] ?? config('mail.from.address'),
                    'name' => $options['from_name'] ?? config('mail.from.name'),
                ],
                'subject' => $subject,
                'content' => [
                    [
                        'type' => 'text/html',
                        'value' => $htmlContent,
                    ],
                ],
            ];

            if ($textContent) {
                $payload['content'][] = [
                    'type' => 'text/plain',
                    'value' => $textContent,
                ];
            }

            // Add tracking if requested
            if ($options['track_opens'] ?? true) {
                $payload['tracking_settings'] = [
                    'open_tracking' => ['enable' => true],
                    'click_tracking' => ['enable' => true],
                ];
            }

            // Add custom args for webhook tracking
            if (isset($options['campaign_id'])) {
                $payload['custom_args'] = [
                    'campaign_id' => $options['campaign_id'],
                    'recipient_id' => $options['recipient_id'] ?? '',
                ];
            }

            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->sendgridApiKey}",
                'Content-Type' => 'application/json',
            ])->post('https://api.sendgrid.com/v3/mail/send', $payload);

            if ($response->successful()) {
                $messageId = $response->header('X-Message-Id');
                return [
                    'success' => true,
                    'message_id' => $messageId,
                    'provider' => 'sendgrid',
                ];
            }

            Log::error('SendGrid API failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('SendGrid error', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Send email via AWS SES
     */
    public function sendViaSES(string $to, string $subject, string $htmlContent, ?string $textContent = null, array $options = []): ?array
    {
        // SES integration would use AWS SDK
        // For now, fall back to Laravel Mail facade
        try {
            Mail::html($htmlContent, function ($message) use ($to, $subject, $textContent, $options) {
                $message->to($to)
                    ->subject($subject);
                
                if ($textContent) {
                    $message->text($textContent);
                }
            });

            return [
                'success' => true,
                'provider' => 'ses',
            ];
        } catch (\Exception $e) {
            Log::error('SES email error', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Send email (auto-selects provider)
     */
    public function send(string $to, string $subject, string $htmlContent, ?string $textContent = null, array $options = []): ?array
    {
        if ($this->provider === 'sendgrid' && $this->sendgridApiKey) {
            return $this->sendViaSendGrid($to, $subject, $htmlContent, $textContent, $options);
        }

        return $this->sendViaSES($to, $subject, $htmlContent, $textContent, $options);
    }

    /**
     * Send bulk emails
     */
    public function sendBulk(array $recipients, string $subject, string $htmlContent, ?string $textContent = null, array $options = []): array
    {
        $results = [];
        
        foreach ($recipients as $recipient) {
            $email = is_array($recipient) ? $recipient['email'] : $recipient;
            $recipientOptions = array_merge($options, is_array($recipient) ? $recipient : []);
            
            $results[] = [
                'email' => $email,
                'result' => $this->send($email, $subject, $htmlContent, $textContent, $recipientOptions),
            ];
        }

        return $results;
    }
}
```

### OpenAIService.php
```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenAIService
{
    protected string $apiKey;
    protected string $baseUrl = 'https://api.openai.com/v1';

    public function __construct()
    {
        $this->apiKey = config('services.openai.api_key');
    }

    /**
     * Generate embedding vector
     */
    public function generateEmbedding(string $text): ?array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
                'Content-Type' => 'application/json',
            ])->post("{$this->baseUrl}/embeddings", [
                'model' => 'text-embedding-ada-002',
                'input' => $text,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['data'][0]['embedding'] ?? null;
            }

            Log::error('OpenAI embedding failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('OpenAI embedding error', ['error' => $e->getMessage()]);
            return null;
        }
    }
}






```

### OpenRouterService.php
```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenRouterService
{
    protected string $apiKey;
    protected string $baseUrl = 'https://openrouter.ai/api/v1';

    public function __construct()
    {
        $this->apiKey = config('services.openrouter.api_key');
    }

    /**
     * Send chat completion request
     */
    public function chatCompletion(array $messages, array $options = []): ?array
    {
        try {
            $payload = [
                'model' => $options['model'] ?? 'anthropic/claude-3.5-sonnet',
                'messages' => $messages,
                'temperature' => $options['temperature'] ?? 0.7,
                'max_tokens' => $options['max_tokens'] ?? 2000,
            ];

            if (isset($options['system'])) {
                array_unshift($payload['messages'], [
                    'role' => 'system',
                    'content' => $options['system'],
                ]);
            }

            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
                'Content-Type' => 'application/json',
                'HTTP-Referer' => config('app.url', 'https://fibonacco.com'),
                'X-Title' => 'Fibonacco Learning Center',
            ])->post("{$this->baseUrl}/chat/completions", $payload);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('OpenRouter API failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('OpenRouter API error', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Get available models
     */
    public function getModels(): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
            ])->get("{$this->baseUrl}/models");

            if ($response->successful()) {
                return $response->json('data', []);
            }

            return [];
        } catch (\Exception $e) {
            Log::error('OpenRouter get models error', ['error' => $e->getMessage()]);
            return [];
        }
    }
}
```

### PersonalityService.php
```php
<?php

namespace App\Services;

use App\Models\AiPersonality;
use App\Models\PersonalityAssignment;
use App\Models\Customer;
use App\Models\Conversation;
use App\Services\OpenRouterService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class PersonalityService
{
    protected OpenRouterService $openRouterService;

    public function __construct(OpenRouterService $openRouterService)
    {
        $this->openRouterService = $openRouterService;
    }

    /**
     * Assign personality to customer
     */
    public function assignPersonality(
        string $customerId,
        ?string $personalityId = null,
        array $rules = []
    ): PersonalityAssignment {
        $customer = Customer::findOrFail($customerId);
        
        // If no personality specified, find the best match
        if (!$personalityId) {
            $personality = $this->findBestPersonality($customer);
        } else {
            $personality = AiPersonality::findOrFail($personalityId);
        }

        // Check if assignment already exists
        $existing = PersonalityAssignment::where('customer_id', $customerId)
            ->where('personality_id', $personality->id)
            ->first();

        if ($existing) {
            // Reactivate if inactive
            if ($existing->status !== 'active') {
                $existing->update(['status' => 'active']);
            }
            return $existing;
        }

        // Deactivate other assignments for this customer
        PersonalityAssignment::where('customer_id', $customerId)
            ->where('status', 'active')
            ->update(['status' => 'inactive']);

        // Create new assignment
        $assignment = PersonalityAssignment::create([
            'personality_id' => $personality->id,
            'customer_id' => $customerId,
            'tenant_id' => $customer->tenant_id,
            'status' => 'active',
            'assignment_rules' => $rules ?: $this->buildAssignmentRules($customer, $personality),
            'context' => $this->buildContext($customer),
        ]);

        return $assignment;
    }

    /**
     * Find best personality for customer
     */
    public function findBestPersonality(Customer $customer): AiPersonality
    {
        $tenantId = $customer->tenant_id;

        // Get active personalities, ordered by priority
        $personalities = AiPersonality::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'asc')
            ->get();

        if ($personalities->isEmpty()) {
            throw new \Exception('No active personalities found');
        }

        // Score personalities based on customer match
        $bestPersonality = null;
        $bestScore = 0;

        foreach ($personalities as $personality) {
            $score = $this->scorePersonalityMatch($customer, $personality);
            
            if ($score > $bestScore) {
                $bestScore = $score;
                $bestPersonality = $personality;
            }
        }

        return $bestPersonality ?? $personalities->first();
    }

    /**
     * Score how well a personality matches a customer
     */
    private function scorePersonalityMatch(Customer $customer, AiPersonality $personality): int
    {
        $score = 0;

        // Base score from priority
        $score += $personality->priority * 10;

        // Match expertise areas with customer industry
        if ($personality->expertise_areas && $customer->industry_category) {
            foreach ($personality->expertise_areas as $area) {
                if (stripos($customer->industry_category, $area) !== false) {
                    $score += 20;
                    break;
                }
            }
        }

        // Check if personality is currently active (time-based)
        if ($personality->isCurrentlyActive()) {
            $score += 10;
        }

        // Prefer personalities with fewer active assignments (load balancing)
        $activeAssignments = $personality->activeAssignments()->count();
        $score -= $activeAssignments; // Fewer assignments = higher score

        return $score;
    }

    /**
     * Build assignment rules
     */
    private function buildAssignmentRules(Customer $customer, AiPersonality $personality): array
    {
        return [
            'matched_on' => [
                'industry' => $customer->industry_category,
                'personality_priority' => $personality->priority,
            ],
            'assigned_at' => now()->toIso8601String(),
        ];
    }

    /**
     * Build context for personality assignment
     */
    private function buildContext(Customer $customer): array
    {
        return [
            'customer_id' => $customer->id,
            'business_name' => $customer->business_name,
            'industry' => $customer->industry_category,
            'lead_score' => $customer->lead_score,
        ];
    }

    /**
     * Get personality for conversation
     */
    public function getPersonalityForConversation(string $conversationId): ?AiPersonality
    {
        $conversation = Conversation::findOrFail($conversationId);
        
        // Check if conversation already has a personality
        if ($conversation->personality_id) {
            return AiPersonality::find($conversation->personality_id);
        }

        // Get personality from assignment
        if ($conversation->customer_id) {
            $assignment = PersonalityAssignment::where('customer_id', $conversation->customer_id)
                ->where('status', 'active')
                ->first();

            if ($assignment) {
                // Link personality to conversation
                $conversation->update(['personality_id' => $assignment->personality_id]);
                return $assignment->personality;
            }
        }

        return null;
    }

    /**
     * Generate response using personality
     */
    public function generateResponse(
        AiPersonality $personality,
        string $message,
        array $conversationContext = [],
        ?Customer $customer = null
    ): string {
        // Build system prompt with personality context
        $additionalContext = [];
        
        if ($customer) {
            $additionalContext['customer'] = [
                'business_name' => $customer->business_name,
                'industry' => $customer->industry_category,
            ];
        }

        $systemPrompt = $personality->getFullSystemPrompt($additionalContext);

        // Build messages
        $messages = [
            ['role' => 'system', 'content' => $systemPrompt],
        ];

        // Add conversation history
        foreach ($conversationContext as $msg) {
            $messages[] = [
                'role' => $msg['role'] ?? 'user',
                'content' => $msg['content'] ?? '',
            ];
        }

        // Add current message
        $messages[] = [
            'role' => 'user',
            'content' => $message,
        ];

        // Generate response
        $response = $this->openRouterService->chatCompletion($messages, [
            'model' => $personality->ai_model,
            'temperature' => (float) $personality->temperature,
            'max_tokens' => 2000,
        ]);

        if (!$response) {
            throw new \Exception('Failed to generate response from AI');
        }

        return $response['choices'][0]['message']['content'] ?? 'I apologize, but I was unable to generate a response.';
    }

    /**
     * Get greeting message for personality
     */
    public function getGreeting(AiPersonality $personality, ?Customer $customer = null): string
    {
        if ($personality->greeting_message) {
            $greeting = $personality->greeting_message;
            
            // Replace variables
            if ($customer) {
                $greeting = str_replace('{{customer_name}}', $customer->owner_name ?? $customer->business_name, $greeting);
                $greeting = str_replace('{{business_name}}', $customer->business_name, $greeting);
            }
            
            return $greeting;
        }

        return "Hello! I'm {$personality->identity}. How can I help you today?";
    }
}
```

### PhoneService.php
```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PhoneService
{
    protected string $accountSid;
    protected string $authToken;
    protected string $fromPhone;

    public function __construct()
    {
        $this->accountSid = config('services.twilio.account_sid');
        $this->authToken = config('services.twilio.auth_token');
        $this->fromPhone = config('services.twilio.from_phone');
    }

    /**
     * Make a phone call via Twilio
     */
    public function makeCall(string $to, string $script, array $options = []): ?array
    {
        if (!$this->accountSid || !$this->authToken) {
            Log::error('Twilio credentials not configured');
            return null;
        }

        try {
            // Twilio TwiML URL or script
            $twimlUrl = $options['twiml_url'] ?? null;
            $statusCallback = $options['status_callback'] ?? null;

            $payload = [
                'To' => $to,
                'From' => $this->fromPhone,
            ];

            if ($twimlUrl) {
                $payload['Url'] = $twimlUrl;
            } else {
                // Generate TwiML for script
                $payload['Twiml'] = $this->generateTwiML($script, $options);
            }

            if ($statusCallback) {
                $payload['StatusCallback'] = $statusCallback;
                $payload['StatusCallbackEvent'] = ['initiated', 'ringing', 'answered', 'completed'];
            }

            $response = Http::withBasicAuth($this->accountSid, $this->authToken)
                ->asForm()
                ->post("https://api.twilio.com/2010-04-01/Accounts/{$this->accountSid}/Calls.json", $payload);

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'call_sid' => $data['sid'] ?? null,
                    'status' => $data['status'] ?? null,
                    'provider' => 'twilio',
                ];
            }

            Log::error('Twilio API failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('Twilio call error', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Generate TwiML for call script
     */
    private function generateTwiML(string $script, array $options = []): string
    {
        // Simple TwiML generation - would need TTS for full implementation
        $twiml = '<?xml version="1.0" encoding="UTF-8"?>';
        $twiml .= '<Response>';
        
        if ($options['use_tts'] ?? false) {
            // Use text-to-speech
            $twiml .= '<Say voice="' . ($options['voice'] ?? 'alice') . '">' . htmlspecialchars($script) . '</Say>';
        } else {
            // Use play (for pre-recorded audio)
            if (isset($options['audio_url'])) {
                $twiml .= '<Play>' . htmlspecialchars($options['audio_url']) . '</Play>';
            } else {
                // Fallback to Say
                $twiml .= '<Say voice="alice">' . htmlspecialchars($script) . '</Say>';
            }
        }

        // Add voicemail handling
        if ($options['voicemail_enabled'] ?? true) {
            $twiml .= '<Record timeout="30" maxLength="60" transcribe="true" />';
        }

        $twiml .= '</Response>';
        
        return $twiml;
    }

    /**
     * Get call status
     */
    public function getCallStatus(string $callSid): ?array
    {
        if (!$this->accountSid || !$this->authToken) {
            return null;
        }

        try {
            $response = Http::withBasicAuth($this->accountSid, $this->authToken)
                ->get("https://api.twilio.com/2010-04-01/Accounts/{$this->accountSid}/Calls/{$callSid}.json");

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'status' => $data['status'] ?? null,
                    'duration' => $data['duration'] ?? null,
                    'direction' => $data['direction'] ?? null,
                ];
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Twilio get call status error', ['error' => $e->getMessage()]);
            return null;
        }
    }
}
```

### SMSService.php
```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SMSService
{
    protected string $accountSid;
    protected string $authToken;
    protected string $fromPhone;

    public function __construct()
    {
        $this->accountSid = config('services.twilio.account_sid');
        $this->authToken = config('services.twilio.auth_token');
        $this->fromPhone = config('services.twilio.from_phone');
    }

    /**
     * Send SMS via Twilio
     */
    public function send(string $to, string $message, array $options = []): ?array
    {
        if (!$this->accountSid || !$this->authToken) {
            Log::error('Twilio credentials not configured');
            return null;
        }

        try {
            $payload = [
                'To' => $to,
                'From' => $this->fromPhone,
                'Body' => $message,
            ];

            // Add status callback for delivery tracking
            if (isset($options['status_callback'])) {
                $payload['StatusCallback'] = $options['status_callback'];
            }

            // Add custom parameters for tracking
            if (isset($options['campaign_id'])) {
                $payload['StatusCallback'] = $payload['StatusCallback'] ?? $options['status_callback'] ?? '';
                // Store in webhook data via status callback
            }

            $response = Http::withBasicAuth($this->accountSid, $this->authToken)
                ->asForm()
                ->post("https://api.twilio.com/2010-04-01/Accounts/{$this->accountSid}/Messages.json", $payload);

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'message_sid' => $data['sid'] ?? null,
                    'status' => $data['status'] ?? null,
                    'provider' => 'twilio',
                ];
            }

            Log::error('Twilio SMS API failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('Twilio SMS error', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Send bulk SMS
     */
    public function sendBulk(array $recipients, string $message, array $options = []): array
    {
        $results = [];
        
        foreach ($recipients as $recipient) {
            $phone = is_array($recipient) ? $recipient['phone'] : $recipient;
            $recipientOptions = array_merge($options, is_array($recipient) ? $recipient : []);
            
            $results[] = [
                'phone' => $phone,
                'result' => $this->send($phone, $message, $recipientOptions),
            ];
        }

        return $results;
    }

    /**
     * Get message status
     */
    public function getMessageStatus(string $messageSid): ?array
    {
        if (!$this->accountSid || !$this->authToken) {
            return null;
        }

        try {
            $response = Http::withBasicAuth($this->accountSid, $this->authToken)
                ->get("https://api.twilio.com/2010-04-01/Accounts/{$this->accountSid}/Messages/{$messageSid}.json");

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'status' => $data['status'] ?? null,
                    'date_sent' => $data['date_sent'] ?? null,
                    'direction' => $data['direction'] ?? null,
                ];
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Twilio get message status error', ['error' => $e->getMessage()]);
            return null;
        }
    }
}
```

### StripeService.php
```php
<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Log;
use Stripe\Checkout\Session;
use Stripe\PaymentIntent;
use Stripe\Stripe;
use Stripe\StripeClient;

class StripeService
{
    private StripeClient $stripe;

    public function __construct()
    {
        $apiKey = config('services.stripe.secret');
        if (!$apiKey) {
            throw new Exception('Stripe API key not configured');
        }
        Stripe::setApiKey($apiKey);
        $this->stripe = new StripeClient($apiKey);
    }

    /**
     * Create a checkout session for services
     */
    public function createCheckoutSession(array $lineItems, string $successUrl, string $cancelUrl, array $metadata = []): Session
    {
        try {
            $sessionData = [
                'mode' => 'payment',
                'line_items' => $lineItems,
                'success_url' => $successUrl,
                'cancel_url' => $cancelUrl,
            ];

            if (!empty($metadata)) {
                $sessionData['metadata'] = $metadata;
            }

            return $this->stripe->checkout->sessions->create($sessionData);
        } catch (Exception $e) {
            Log::error('Stripe checkout session creation failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create a payment intent for direct charges
     */
    public function createPaymentIntent(int $amount, string $currency = 'usd', array $metadata = []): PaymentIntent
    {
        try {
            return $this->stripe->paymentIntents->create([
                'amount' => $amount,
                'currency' => $currency,
                'metadata' => $metadata,
            ]);
        } catch (Exception $e) {
            Log::error('Stripe payment intent creation failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Retrieve a checkout session
     */
    public function retrieveCheckoutSession(string $sessionId): Session
    {
        return $this->stripe->checkout->sessions->retrieve($sessionId);
    }

    /**
     * Retrieve a payment intent
     */
    public function retrievePaymentIntent(string $paymentIntentId): PaymentIntent
    {
        return $this->stripe->paymentIntents->retrieve($paymentIntentId);
    }
}
```

---
## API Resources

(no API Resources)
---
## Form Requests

(no Form Requests)
---
## Jobs

### GenerateEmbedding.php
```php
<?php

namespace App\Jobs;

use App\Models\Knowledge;
use App\Services\OpenAIService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GenerateEmbedding implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public string $knowledgeId
    ) {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(OpenAIService $openaiService): void
    {
        $knowledge = Knowledge::find($this->knowledgeId);
        
        if (!$knowledge) {
            Log::warning("Knowledge item not found: {$this->knowledgeId}");
            return;
        }
        
        // Update status to processing
        $knowledge->update(['embedding_status' => 'processing']);
        
        try {
            // Generate embedding
            $textToEmbed = $knowledge->title . "\n\n" . $knowledge->content;
            $embedding = $openaiService->generateEmbedding($textToEmbed);
            
            if (!$embedding) {
                throw new \Exception('Failed to generate embedding');
            }
            
            // Store embedding as PostgreSQL vector type
            // Convert array to PostgreSQL vector format
            $embeddingString = '[' . implode(',', $embedding) . ']';
            
            DB::statement(
                'UPDATE knowledge_base SET embedding = ?::vector, embedding_status = ? WHERE id = ?',
                [$embeddingString, 'completed', $knowledge->id]
            );
            
            Log::info("Embedding generated successfully for knowledge item: {$this->knowledgeId}");
            
        } catch (\Exception $e) {
            Log::error("Failed to generate embedding for knowledge item: {$this->knowledgeId}", [
                'error' => $e->getMessage()
            ]);
            
            $knowledge->update(['embedding_status' => 'failed']);
            
            throw $e;
        }
    }
}
```

### GenerateTTS.php
```php
<?php

namespace App\Jobs;

use App\Services\ElevenLabsService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class GenerateTTS implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public string $contentId,
        public string $type, // 'faq', 'narration', etc.
        public string $text,
        public ?string $voiceId = null,
        public ?string $savePath = null
    ) {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(ElevenLabsService $elevenLabsService): void
    {
        try {
            // Generate audio
            $audioData = $elevenLabsService->generateAudio($this->text, $this->voiceId);
            
            if (!$audioData) {
                throw new \Exception('Failed to generate audio');
            }
            
            // Determine save path
            $path = $this->savePath ?? "audio/{$this->type}/{$this->contentId}.mp3";
            
            // Save to Cloudflare R2 or local storage
            // TODO: Implement R2 storage
            Storage::put($path, $audioData);
            
            // Update database with audio URL
            // TODO: Update the appropriate model with audio_url
            
            Log::info("TTS generated successfully for: {$this->contentId}");
            
        } catch (\Exception $e) {
            Log::error("Failed to generate TTS for: {$this->contentId}", [
                'error' => $e->getMessage()
            ]);
            
            throw $e;
        }
    }
}
```

### MakePhoneCall.php
```php
<?php

namespace App\Jobs;

use App\Models\CampaignRecipient;
use App\Models\OutboundCampaign;
use App\Services\PhoneService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class MakePhoneCall implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public CampaignRecipient $recipient,
        public OutboundCampaign $campaign
    ) {
        $this->onQueue('calls');
    }

    public function handle(PhoneService $phoneService): void
    {
        try {
            $recipient = $this->recipient;
            $campaign = $this->campaign;

            // Prepare call script
            $script = $campaign->message;

            // If template is used, render it
            if ($campaign->template_id) {
                $template = \App\Models\PhoneScript::find($campaign->template_id);
                if ($template) {
                    $variables = array_merge(
                        $campaign->template_variables ?? [],
                        [
                            'customer_name' => $recipient->name ?? 'Customer',
                            'business_name' => $recipient->customer->business_name ?? '',
                        ]
                    );
                    $script = $template->render($variables);
                }
            }

            // Generate status callback URL for tracking (webhook route outside v1 prefix)
            $statusCallback = url("/outbound/phone/campaigns/{$campaign->id}/call-status");

            // Make call
            $result = $phoneService->makeCall(
                $recipient->phone,
                $script,
                [
                    'status_callback' => $statusCallback,
                    'use_tts' => true,
                    'voicemail_enabled' => true,
                ]
            );

            if ($result && ($result['success'] ?? false)) {
                $recipient->update([
                    'status' => 'sent',
                    'external_id' => $result['call_sid'] ?? null,
                    'sent_at' => now(),
                ]);

                $campaign->increment('sent_count');
            } else {
                $recipient->update([
                    'status' => 'failed',
                    'error_message' => 'Failed to initiate call',
                ]);

                $campaign->increment('failed_count');
            }
        } catch (\Exception $e) {
            Log::error('MakePhoneCall job failed', [
                'recipient_id' => $this->recipient->id,
                'campaign_id' => $this->campaign->id,
                'error' => $e->getMessage(),
            ]);

            $this->recipient->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            $this->campaign->increment('failed_count');
        }
    }
}
```

### SendEmailCampaign.php
```php
<?php

namespace App\Jobs;

use App\Models\CampaignRecipient;
use App\Models\OutboundCampaign;
use App\Services\EmailService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendEmailCampaign implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public CampaignRecipient $recipient,
        public OutboundCampaign $campaign
    ) {
        $this->onQueue('emails');
    }

    public function handle(EmailService $emailService): void
    {
        try {
            $recipient = $this->recipient;
            $campaign = $this->campaign;

            // Prepare email content
            $subject = $campaign->subject ?? 'No Subject';
            $message = $campaign->message;

            // If template is used, render it
            if ($campaign->template_id) {
                $template = \App\Models\EmailTemplate::find($campaign->template_id);
                if ($template) {
                    $variables = array_merge(
                        $campaign->template_variables ?? [],
                        [
                            'customer_name' => $recipient->name ?? 'Customer',
                            'business_name' => $recipient->customer->business_name ?? '',
                        ]
                    );
                    $rendered = $template->render($variables);
                    $subject = $rendered['subject'];
                    $message = $rendered['html'];
                }
            }

            // Send email
            $result = $emailService->send(
                $recipient->email,
                $subject,
                $message,
                null,
                [
                    'campaign_id' => $campaign->id,
                    'recipient_id' => $recipient->id,
                    'track_opens' => true,
                ]
            );

            if ($result && ($result['success'] ?? false)) {
                $recipient->update([
                    'status' => 'sent',
                    'external_id' => $result['message_id'] ?? null,
                    'sent_at' => now(),
                ]);

                $campaign->increment('sent_count');
            } else {
                $recipient->update([
                    'status' => 'failed',
                    'error_message' => 'Failed to send email',
                ]);

                $campaign->increment('failed_count');
            }
        } catch (\Exception $e) {
            Log::error('SendEmailCampaign job failed', [
                'recipient_id' => $this->recipient->id,
                'campaign_id' => $this->campaign->id,
                'error' => $e->getMessage(),
            ]);

            $this->recipient->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            $this->campaign->increment('failed_count');
        }
    }
}
```

### SendSMS.php
```php
<?php

namespace App\Jobs;

use App\Models\CampaignRecipient;
use App\Models\OutboundCampaign;
use App\Services\SMSService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendSMS implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public CampaignRecipient $recipient,
        public OutboundCampaign $campaign
    ) {
        $this->onQueue('sms');
    }

    public function handle(SMSService $smsService): void
    {
        try {
            $recipient = $this->recipient;
            $campaign = $this->campaign;

            // Prepare SMS message
            $message = $campaign->message;

            // If template is used, render it
            if ($campaign->template_id) {
                $template = \App\Models\SmsTemplate::find($campaign->template_id);
                if ($template) {
                    $variables = array_merge(
                        $campaign->template_variables ?? [],
                        [
                            'customer_name' => $recipient->name ?? 'Customer',
                            'business_name' => $recipient->customer->business_name ?? '',
                        ]
                    );
                    $message = $template->render($variables);
                }
            }

            // Generate status callback URL for tracking (webhook route outside v1 prefix)
            $statusCallback = url("/outbound/sms/campaigns/{$campaign->id}/sms-status");

            // Send SMS
            $result = $smsService->send(
                $recipient->phone,
                $message,
                [
                    'campaign_id' => $campaign->id,
                    'recipient_id' => $recipient->id,
                    'status_callback' => $statusCallback,
                ]
            );

            if ($result && ($result['success'] ?? false)) {
                $recipient->update([
                    'status' => 'sent',
                    'external_id' => $result['message_sid'] ?? null,
                    'sent_at' => now(),
                ]);

                $campaign->increment('sent_count');
            } else {
                $recipient->update([
                    'status' => 'failed',
                    'error_message' => 'Failed to send SMS',
                ]);

                $campaign->increment('failed_count');
            }
        } catch (\Exception $e) {
            Log::error('SendSMS job failed', [
                'recipient_id' => $this->recipient->id,
                'campaign_id' => $this->campaign->id,
                'error' => $e->getMessage(),
            ]);

            $this->recipient->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            $this->campaign->increment('failed_count');
        }
    }
}
```

---
## Config (Auth)

```php
<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Authentication Defaults
    |--------------------------------------------------------------------------
    |
    | This option defines the default authentication "guard" and password
    | reset "broker" for your application. You may change these values
    | as required, but they're a perfect start for most applications.
    |
    */

    'defaults' => [
        'guard' => env('AUTH_GUARD', 'web'),
        'passwords' => env('AUTH_PASSWORD_BROKER', 'users'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Authentication Guards
    |--------------------------------------------------------------------------
    |
    | Next, you may define every authentication guard for your application.
    | Of course, a great default configuration has been defined for you
    | which utilizes session storage plus the Eloquent user provider.
    |
    | All authentication guards have a user provider, which defines how the
    | users are actually retrieved out of your database or other storage
    | system used by the application. Typically, Eloquent is utilized.
    |
    | Supported: "session"
    |
    */

    'guards' => [
        'web' => [
            'driver' => 'session',
            'provider' => 'users',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | User Providers
    |--------------------------------------------------------------------------
    |
    | All authentication guards have a user provider, which defines how the
    | users are actually retrieved out of your database or other storage
    | system used by the application. Typically, Eloquent is utilized.
    |
    | If you have multiple user tables or models you may configure multiple
    | providers to represent the model / table. These providers may then
    | be assigned to any extra authentication guards you have defined.
    |
    | Supported: "database", "eloquent"
    |
    */

    'providers' => [
        'users' => [
            'driver' => 'eloquent',
            'model' => env('AUTH_MODEL', App\Models\User::class),
        ],

        // 'users' => [
        //     'driver' => 'database',
        //     'table' => 'users',
        // ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Resetting Passwords
    |--------------------------------------------------------------------------
    |
    | These configuration options specify the behavior of Laravel's password
    | reset functionality, including the table utilized for token storage
    | and the user provider that is invoked to actually retrieve users.
    |
    | The expiry time is the number of minutes that each reset token will be
    | considered valid. This security feature keeps tokens short-lived so
    | they have less time to be guessed. You may change this as needed.
    |
    | The throttle setting is the number of seconds a user must wait before
    | generating more password reset tokens. This prevents the user from
    | quickly generating a very large amount of password reset tokens.
    |
    */

    'passwords' => [
        'users' => [
            'provider' => 'users',
            'table' => env('AUTH_PASSWORD_RESET_TOKEN_TABLE', 'password_reset_tokens'),
            'expire' => 60,
            'throttle' => 60,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Password Confirmation Timeout
    |--------------------------------------------------------------------------
    |
    | Here you may define the number of seconds before a password confirmation
    | window expires and users are asked to re-enter their password via the
    | confirmation screen. By default, the timeout lasts for three hours.
    |
    */

    'password_timeout' => env('AUTH_PASSWORD_TIMEOUT', 10800),

];
```

---
## Middleware

---
## Composer Dependencies

```json
{
    "$schema": "https://getcomposer.org/schema.json",
    "name": "laravel/laravel",
    "type": "project",
    "description": "The skeleton application for the Laravel framework.",
    "keywords": ["laravel", "framework"],
    "license": "MIT",
    "require": {
        "php": "^8.2",
        "laravel/framework": "^12.0",
        "laravel/horizon": "^5.40",
        "laravel/sanctum": "^4.2",
        "laravel/tinker": "^2.10.1",
        "predis/predis": "^3.3"
    },
    "require-dev": {
        "fakerphp/faker": "^1.23",
        "laravel/pail": "^1.2.2",
        "laravel/pint": "^1.24",
        "laravel/sail": "^1.41",
        "mockery/mockery": "^1.6",
        "nunomaduro/collision": "^8.6",
        "phpunit/phpunit": "^11.5.3"
    },
    "autoload": {
        "psr-4": {
            "App\\": "app/",
            "Database\\Factories\\": "database/factories/",
            "Database\\Seeders\\": "database/seeders/"
        }
    },
    "autoload-dev": {
        "psr-4": {
            "Tests\\": "tests/"
        }
    },
    "scripts": {
        "setup": [
            "composer install",
            "@php -r \"file_exists('.env') || copy('.env.example', '.env');\"",
            "@php artisan key:generate",
            "@php artisan migrate --force",
            "npm install",
            "npm run build"
        ],
        "dev": [
            "Composer\\Config::disableProcessTimeout",
            "npx concurrently -c \"#93c5fd,#c4b5fd,#fb7185,#fdba74\" \"php artisan serve\" \"php artisan queue:listen --tries=1\" \"php artisan pail --timeout=0\" \"npm run dev\" --names=server,queue,logs,vite --kill-others"
        ],
        "test": [
            "@php artisan config:clear --ansi",
            "@php artisan test"
        ],
        "post-autoload-dump": [
            "Illuminate\\Foundation\\ComposerScripts::postAutoloadDump",
            "@php artisan package:discover --ansi"
        ],
        "post-update-cmd": [
            "@php artisan vendor:publish --tag=laravel-assets --ansi --force"
        ],
        "post-root-package-install": [
            "@php -r \"file_exists('.env') || copy('.env.example', '.env');\""
        ],
        "post-create-project-cmd": [
            "@php artisan key:generate --ansi",
            "@php -r \"file_exists('database/database.sqlite') || touch('database/database.sqlite');\"",
            "@php artisan migrate --graceful --ansi"
        ],
        "pre-package-uninstall": [
            "Illuminate\\Foundation\\ComposerScripts::prePackageUninstall"
        ]
    },
    "extra": {
        "laravel": {
            "dont-discover": []
        }
    },
    "config": {
        "optimize-autoloader": true,
        "preferred-install": "dist",
        "sort-packages": true,
        "allow-plugins": {
            "pestphp/pest-plugin": true,
            "php-http/discovery": true
        }
    },
    "minimum-stability": "stable",
    "prefer-stable": true
}





```
