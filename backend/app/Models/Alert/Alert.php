<?php

namespace App\Models\Alert;

use App\Models\Newsletter\Sponsor;
use App\Models\Newsletter\Sponsorship;
use App\Models\Subscriber\Subscriber;
use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Alert extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'uuid',
        'headline',
        'summary',
        'full_content',
        'category',
        'severity',
        'source_url',
        'source_name',
        'image_url',
        'target_type',
        'target_community_ids',
        'target_geo_json',
        'target_radius_miles',
        'send_email',
        'send_sms',
        'send_push',
        'sponsor_id',
        'sponsorship_id',
        'status',
        'created_by',
        'approved_by',
        'approved_at',
        'scheduled_for',
        'sending_started_at',
        'sending_completed_at',
        'total_recipients',
        'email_sent',
        'email_delivered',
        'email_opened',
        'sms_sent',
        'sms_delivered',
        'push_sent',
        'push_delivered',
        'total_clicks',
    ];

    protected $casts = [
        'target_community_ids' => 'array',
        'target_geo_json' => 'array',
        'send_email' => 'boolean',
        'send_sms' => 'boolean',
        'send_push' => 'boolean',
        'approved_at' => 'datetime',
        'scheduled_for' => 'datetime',
        'sending_started_at' => 'datetime',
        'sending_completed_at' => 'datetime',
    ];

    /**
     * Get the creator
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the approver
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the sponsor
     */
    public function sponsor(): BelongsTo
    {
        return $this->belongsTo(Sponsor::class);
    }

    /**
     * Get the sponsorship
     */
    public function sponsorship(): BelongsTo
    {
        return $this->belongsTo(Sponsorship::class);
    }

    /**
     * Get alert sends
     */
    public function sends(): HasMany
    {
        return $this->hasMany(AlertSend::class);
    }

    /**
     * Get the category model
     */
    public function categoryModel(): BelongsTo
    {
        return $this->belongsTo(AlertCategory::class, 'category', 'slug');
    }

    /**
     * Check if alert is draft
     */
    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    /**
     * Check if alert is pending approval
     */
    public function isPendingApproval(): bool
    {
        return $this->status === 'pending_approval';
    }

    /**
     * Check if alert is approved
     */
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Check if alert is sending
     */
    public function isSending(): bool
    {
        return $this->status === 'sending';
    }

    /**
     * Check if alert is sent
     */
    public function isSent(): bool
    {
        return $this->status === 'sent';
    }

    /**
     * Check if alert is cancelled
     */
    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    /**
     * Check if alert is scheduled
     */
    public function isScheduled(): bool
    {
        return $this->scheduled_for !== null && $this->scheduled_for > now();
    }

    /**
     * Get email open rate
     */
    public function getEmailOpenRateAttribute(): float
    {
        if ($this->email_sent === 0) {
            return 0.0;
        }
        return ($this->email_opened / $this->email_sent) * 100;
    }

    /**
     * Get click-through rate
     */
    public function getCtrAttribute(): float
    {
        $totalDelivered = $this->email_delivered + $this->push_delivered;
        if ($totalDelivered === 0) {
            return 0.0;
        }
        return ($this->total_clicks / $totalDelivered) * 100;
    }
}



