<?php

namespace App\Models\Subscriber;

use App\Models\Community;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Subscriber extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'email',
        'email_verified_at',
        'phone',
        'phone_verified_at',
        'first_name',
        'last_name',
        'zip_code',
        'location',
        'location_source',
        'email_opted_in',
        'email_opted_in_at',
        'sms_opted_in',
        'sms_opted_in_at',
        'push_opted_in',
        'newsletter_frequency',
        'alerts_enabled',
        'device_tokens',
        'last_email_sent_at',
        'last_email_opened_at',
        'last_email_clicked_at',
        'last_login_at',
        'engagement_score',
        'engagement_calculated_at',
        'status',
        'unsubscribed_at',
        'unsubscribe_reason',
        'password_hash',
        'remember_token',
        'source',
        'source_detail',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'phone_verified_at' => 'datetime',
        'email_opted_in' => 'boolean',
        'email_opted_in_at' => 'datetime',
        'sms_opted_in' => 'boolean',
        'sms_opted_in_at' => 'datetime',
        'push_opted_in' => 'boolean',
        'alerts_enabled' => 'boolean',
        'device_tokens' => 'array',
        'last_email_sent_at' => 'datetime',
        'last_email_opened_at' => 'datetime',
        'last_email_clicked_at' => 'datetime',
        'last_login_at' => 'datetime',
        'engagement_calculated_at' => 'datetime',
        'unsubscribed_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($subscriber) {
            if (empty($subscriber->uuid)) {
                $subscriber->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * Get communities this subscriber follows
     */
    public function communities(): BelongsToMany
    {
        return $this->belongsToMany(Community::class, 'subscriber_communities')
            ->withPivot(['subscribed_at', 'is_primary', 'newsletters_enabled', 'alerts_enabled'])
            ->withTimestamps();
    }

    /**
     * Get alert preferences
     */
    public function alertPreferences(): HasMany
    {
        return $this->hasMany(SubscriberAlertPreference::class);
    }

    /**
     * Get email verifications
     */
    public function emailVerifications(): HasMany
    {
        return $this->hasMany(EmailVerification::class);
    }

    /**
     * Get unsubscribe tokens
     */
    public function unsubscribeTokens(): HasMany
    {
        return $this->hasMany(UnsubscribeToken::class);
    }

    /**
     * Get events
     */
    public function events(): HasMany
    {
        return $this->hasMany(SubscriberEvent::class);
    }

    /**
     * Check if email is verified
     */
    public function isEmailVerified(): bool
    {
        return $this->email_verified_at !== null;
    }

    /**
     * Check if subscriber is active
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Check if subscriber wants newsletters
     */
    public function wantsNewsletters(): bool
    {
        return $this->email_opted_in && $this->newsletter_frequency !== 'none';
    }
}



