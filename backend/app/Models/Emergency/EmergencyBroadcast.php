<?php

namespace App\Models\Emergency;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EmergencyBroadcast extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'title',
        'message',
        'instructions',
        'category',
        'severity',
        'community_ids',
        'send_email',
        'send_sms',
        'send_push',
        'send_voice',
        'authorized_by',
        'authorizer_name',
        'authorizer_title',
        'authorization_code',
        'authorized_at',
        'status',
        'sending_started_at',
        'sending_completed_at',
        'total_recipients',
        'email_queued',
        'email_sent',
        'email_delivered',
        'sms_queued',
        'sms_sent',
        'sms_delivered',
        'push_queued',
        'push_sent',
        'push_delivered',
        'voice_queued',
        'voice_sent',
        'voice_answered',
        'ipaws_alert_id',
        'audit_log',
    ];

    protected $casts = [
        'community_ids' => 'array',
        'send_email' => 'boolean',
        'send_sms' => 'boolean',
        'send_push' => 'boolean',
        'send_voice' => 'boolean',
        'authorized_at' => 'datetime',
        'sending_started_at' => 'datetime',
        'sending_completed_at' => 'datetime',
        'audit_log' => 'array',
    ];

    /**
     * Get the user who authorized this broadcast
     */
    public function authorizer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'authorized_by');
    }

    /**
     * Get the category
     */
    public function categoryModel(): BelongsTo
    {
        return $this->belongsTo(EmergencyCategory::class, 'category', 'slug');
    }

    /**
     * Get audit log entries
     */
    public function auditLogs(): HasMany
    {
        return $this->hasMany(EmergencyAuditLog::class, 'broadcast_id');
    }

    /**
     * Check if broadcast is pending
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if broadcast is authorized
     */
    public function isAuthorized(): bool
    {
        return $this->status === 'authorized';
    }

    /**
     * Check if broadcast is sending
     */
    public function isSending(): bool
    {
        return $this->status === 'sending';
    }

    /**
     * Check if broadcast is sent
     */
    public function isSent(): bool
    {
        return $this->status === 'sent';
    }

    /**
     * Check if broadcast is cancelled
     */
    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    /**
     * Get delivery percentage for email
     */
    public function getEmailDeliveryPercentage(): float
    {
        if ($this->total_recipients === 0) {
            return 0;
        }
        return round(($this->email_delivered / $this->total_recipients) * 100, 1);
    }

    /**
     * Get delivery percentage for SMS
     */
    public function getSmsDeliveryPercentage(): float
    {
        if ($this->total_recipients === 0) {
            return 0;
        }
        return round(($this->sms_delivered / $this->total_recipients) * 100, 1);
    }

    /**
     * Get delivery percentage for push
     */
    public function getPushDeliveryPercentage(): float
    {
        if ($this->total_recipients === 0) {
            return 0;
        }
        return round(($this->push_delivered / $this->total_recipients) * 100, 1);
    }
}



