<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
    ];

    protected $casts = [
        'secondary_contacts' => 'array',
        'coordinates' => 'array',
        'services_activated' => 'array',
        'services_approved_pending' => 'array',
        'metadata' => 'array',
        'last_email_open' => 'datetime',
        'last_email_click' => 'datetime',
        'last_content_view' => 'datetime',
        'last_approval' => 'datetime',
        'manifest_destiny_start_date' => 'date',
        'next_scheduled_send' => 'datetime',
    ];

    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class);
    }
}



