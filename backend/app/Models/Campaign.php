<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

final class Campaign extends Model
{
    use HasUuids, HasFactory;

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'type',
        'week',
        'day',
        'title',
        'subject',
        'slug',
        'service_type',
        'landing_page_slug',
        'email_template_id',
        'approval_button_text',
        'approval_config',
        'rvm_script',
        'rvm_config',
        'upsell_services',
        'meeting_topic',
        'is_active',
        'customer_id',
        'smb_id',
        'community_id',
        'name',
        'goal',
        'timeline',
        'status',
        'total_amount',
        'stripe_payment_intent_id',
        'sarah_context',
    ];

    protected $casts = [
        'approval_config' => 'array',
        'rvm_config' => 'array',
        'upsell_services' => 'array',
        'sarah_context' => 'array',
        'is_active' => 'boolean',
        'total_amount' => 'decimal:2',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function smb(): BelongsTo
    {
        return $this->belongsTo(SMB::class, 'smb_id');
    }

    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class);
    }

    public function landingPage(): HasOne
    {
        return $this->hasOne(CampaignLandingPage::class, 'campaign_id', 'id');
    }

    public function emails(): HasMany
    {
        return $this->hasMany(CampaignEmail::class, 'campaign_id', 'id');
    }

    public function content(): HasMany
    {
        return $this->hasMany(Content::class, 'campaign_id', 'id');
    }

    public function lineItems(): HasMany
    {
        return $this->hasMany(CampaignLineItem::class, 'campaign_id', 'id');
    }

    public function sarahMessages(): HasMany
    {
        return $this->hasMany(SarahMessage::class, 'campaign_id', 'id');
    }

    public function advertiserSession(): HasOne
    {
        return $this->hasOne(AdvertiserSession::class, 'campaign_id', 'id');
    }
}



