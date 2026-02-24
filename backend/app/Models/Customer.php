<?php

namespace App\Models;

use App\Enums\PipelineStage;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

/**
 * @method static \Illuminate\Database\Eloquent\Builder|Customer newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Customer newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Customer query()
 */

class Customer extends Model
{
    use HasFactory, SoftDeletes, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'tenant_id',
        'community_id',
        'slug',
        'external_id',
        'business_name',
        'dba_name',
        'business_type',
        'category',
        'owner_name',
        'primary_contact_name',
        'primary_email',
        'primary_phone',
        'secondary_contacts',
        'industry_id',
        'sub_category',
        'phone',
        'email',
        'website',
        'address',
        'address_line1',
        'address_line2',
        'city',
        'state',
        'zip',
        'country',
        'coordinates',
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
        // SMB-specific fields
        'engagement_tier',
        'engagement_score',
        'campaign_status',
        'current_campaign_id',
        'manifest_destiny_day',
        'manifest_destiny_start_date',
        'next_scheduled_send',
        'service_model',
        'services_activated',
        'services_approved_pending',
        'email_opted_in',
        'sms_opted_in',
        'rvm_opted_in',
        'phone_opted_in',
        'do_not_contact',
        'data_quality_score',
        'last_email_open',
        'last_email_click',
        'last_content_view',
        'last_approval',
        'total_approvals',
        'total_meetings',
        'metadata',
        // Intelligence Hub fields
        'ai_context',
        'customer_intelligence',
        'competitor_analysis',
        'survey_responses',
        'profile_completeness',
        'data_sources',
        'last_enriched_at',
        // Pipeline stage fields
        'pipeline_stage',
        'stage_entered_at',
        'trial_started_at',
        'trial_ends_at',
        'trial_active',
        'days_in_stage',
        'stage_history',
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
        'services_activated' => 'array',
        'services_approved_pending' => 'array',
        'secondary_contacts' => 'array',
        'coordinates' => 'array',
        'metadata' => 'array',
        'ai_context' => 'array',
        'customer_intelligence' => 'array',
        'competitor_analysis' => 'array',
        'survey_responses' => 'array',
        'data_sources' => 'array',
        'last_enriched_at' => 'datetime',
        'manifest_destiny_start_date' => 'date',
        'next_scheduled_send' => 'datetime',
        'last_email_open' => 'datetime',
        'last_email_click' => 'datetime',
        'last_content_view' => 'datetime',
        'last_approval' => 'datetime',
        'email_opted_in' => 'boolean',
        'sms_opted_in' => 'boolean',
        'rvm_opted_in' => 'boolean',
        'phone_opted_in' => 'boolean',
        'do_not_contact' => 'boolean',
        'google_rating' => 'decimal:1',
        'yelp_rating' => 'decimal:1',
        'lead_score' => 'integer',
        'established_year' => 'integer',
        'employee_count' => 'integer',
        'first_contact_at' => 'datetime',
        'onboarded_at' => 'datetime',
        // Pipeline stage casts
        'pipeline_stage' => PipelineStage::class,
        'stage_entered_at' => 'datetime',
        'trial_started_at' => 'datetime',
        'trial_ends_at' => 'datetime',
        'trial_active' => 'boolean',
        'stage_history' => 'array',
    ];

    protected static function booted()
    {
        static::creating(function ($customer) {
            if (empty($customer->tenant_id)) {
                $customer->tenant_id = (string) Str::uuid();
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
     * Get all interactions for this customer
     */
    public function interactions(): HasMany
    {
        return $this->hasMany(Interaction::class);
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

    /**
     * Get the community this customer belongs to
     */
    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class);
    }

    /**
     * Get CRM contacts for this customer
     */
    public function crmContacts(): HasMany
    {
        return $this->hasMany(CrmContact::class);
    }

    /**
     * Get deals for this customer
     */
    public function deals(): HasMany
    {
        return $this->hasMany(Deal::class);
    }

    /**
     * Get quotes for this customer
     */
    public function quotes(): HasMany
    {
        return $this->hasMany(Quote::class);
    }

    /**
     * Get invoices for this customer
     */
    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    /**
     * Get CRM activities for this customer
     */
    public function crmActivities(): HasMany
    {
        return $this->hasMany(CrmActivity::class);
    }

    /**
     * Scope: Active campaign customers
     */
    public function scopeActive($query)
    {
        return $query->where('campaign_status', 'running');
    }

    /**
     * Scope: Customers in specific tier
     */
    public function scopeInTier($query, int $tier)
    {
        return $query->where('engagement_tier', $tier);
    }

    /**
     * Scope: Customers who can receive email
     */
    public function scopeCanReceiveEmail($query)
    {
        return $query->where('email_opted_in', true)
            ->where('do_not_contact', false)
            ->whereNotNull('email');
    }

    /**
     * Scope: Customers who can receive SMS
     */
    public function scopeCanReceiveSMS($query)
    {
        return $query->where('sms_opted_in', true)
            ->where('do_not_contact', false)
            ->whereNotNull('phone');
    }

    /**
     * Scope: Customers who can receive RVM
     */
    public function scopeCanReceiveRVM($query)
    {
        return $query->where('rvm_opted_in', true)
            ->where('do_not_contact', false)
            ->whereNotNull('phone');
    }

    /**
     * Scope: Customers who can receive phone calls
     */
    public function scopeCanReceivePhone($query)
    {
        return $query->where('phone_opted_in', true)
            ->where('do_not_contact', false)
            ->whereNotNull('phone');
    }

    /**
     * Get tier name
     */
    public function getTierName(): string
    {
        $tiers = config('fibonacco.engagement.tiers', []);
        return $tiers[$this->engagement_tier]['name'] ?? 'Unknown';
    }

    /**
     * Check if customer is in active campaign
     */
    public function isInCampaign(): bool
    {
        return $this->campaign_status === 'running';
    }

    /**
     * Check if customer can be contacted via email
     */
    public function canContactViaEmail(): bool
    {
        return $this->email_opted_in
            && !$this->do_not_contact
            && !empty($this->email);
    }

    /**
     * Check if customer can be contacted via SMS
     */
    public function canContactViaSMS(): bool
    {
        return $this->sms_opted_in
            && !$this->do_not_contact
            && !empty($this->phone);
    }

    /**
     * Check if customer can be contacted via RVM
     */
    public function canContactViaRVM(): bool
    {
        return $this->rvm_opted_in
            && !$this->do_not_contact
            && !empty($this->phone);
    }

    /**
     * Check if customer can be contacted via phone
     */
    public function canContactViaPhone(): bool
    {
        return $this->phone_opted_in
            && !$this->do_not_contact
            && !empty($this->phone);
    }

    /**
     * Advance customer to a new pipeline stage
     */
    public function advanceToStage(PipelineStage $newStage, string $trigger = 'manual', ?string $changedBy = null): void
    {
        $oldStage = $this->pipeline_stage;
        $daysInPrevious = $this->days_in_stage;

        $history = $this->stage_history ?? [];
        $history[] = [
            'from' => $oldStage?->value,
            'to' => $newStage->value,
            'at' => now()->toISOString(),
            'days_in_previous' => $daysInPrevious,
            'trigger' => $trigger,
        ];

        $this->update([
            'pipeline_stage' => $newStage,
            'stage_entered_at' => now(),
            'days_in_stage' => 0,
            'stage_history' => $history,
            'stage_change_trigger' => $trigger,
        ]);
    }

    /**
     * Get days in current stage (computed attribute)
     */
    public function getDaysInCurrentStageAttribute(): int
    {
        if (!$this->stage_entered_at) {
            return 0;
        }
        return $this->stage_entered_at->diffInDays(now());
    }

    /**
     * Get trial days remaining (computed attribute)
     */
    public function getTrialDaysRemainingAttribute(): ?int
    {
        if (!$this->trial_ends_at) {
            return null;
        }
        $remaining = now()->diffInDays($this->trial_ends_at, false);
        return max(0, $remaining);
    }

    /**
     * Check if customer is currently in trial
     */
    public function isInTrial(): bool
    {
        return $this->pipeline_stage === PipelineStage::HOOK
            && $this->trial_ends_at
            && $this->trial_ends_at->isFuture();
    }
}
