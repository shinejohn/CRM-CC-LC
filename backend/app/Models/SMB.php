<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * SMB (Small/Medium Business) Model
 * Maps to the 'smbs' table
 */
class SMB extends Model
{
    use HasFactory;

    protected $table = 'smbs';

    protected $fillable = [
        'uuid',
        'community_id',
        'business_name',
        'dba_name',
        'business_type',
        'category',
        'primary_contact_name',
        'primary_email',
        'primary_phone',
        'secondary_contacts',
        'address',
        'city',
        'state',
        'zip',
        'coordinates',
        'engagement_tier',
        'engagement_score',
        'last_email_open',
        'last_email_click',
        'last_content_view',
        'last_approval',
        'total_approvals',
        'total_meetings',
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
        'metadata',
        'org_type',
        'pitch_track',
        'has_events',
        'has_venue',
        'is_performer',
        'website_exists',
        'website_current',
        'primary_goal',
        'customer_source',
        'marketing_spend_range',
        'communities_of_interest',
        'gates_completed',
        'gates_deferred',
        'products_accepted',
        'products_declined',
        'products_deferred',
        'pitch_status',
        'active_pitch_session_id',
        'converted_campaign_id',
        'proposal_value',
        'founder_days_remaining',
        'pitch_started_at',
        'pitch_completed_at',
        'last_pitch_activity_at',
    ];

    protected $casts = [
        'secondary_contacts' => 'array',
        'coordinates' => 'array',
        'services_activated' => 'array',
        'services_approved_pending' => 'array',
        'metadata' => 'array',
        'communities_of_interest' => 'array',
        'gates_completed' => 'array',
        'gates_deferred' => 'array',
        'products_accepted' => 'array',
        'products_declined' => 'array',
        'products_deferred' => 'array',
        'has_events' => 'boolean',
        'has_venue' => 'boolean',
        'is_performer' => 'boolean',
        'website_exists' => 'boolean',
        'website_current' => 'boolean',
        'proposal_value' => 'decimal:2',
        'last_email_open' => 'datetime',
        'last_email_click' => 'datetime',
        'last_content_view' => 'datetime',
        'last_approval' => 'datetime',
        'manifest_destiny_start_date' => 'date',
        'next_scheduled_send' => 'datetime',
        'pitch_started_at' => 'datetime',
        'pitch_completed_at' => 'datetime',
        'last_pitch_activity_at' => 'datetime',
    ];

    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class);
    }

    public function pitchSessions(): HasMany
    {
        return $this->hasMany(PitchSession::class, 'smb_id');
    }

    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class, 'smb_id');
    }
}
