<?php

namespace App\Models\Subscriber;

use App\Models\Community;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommunityEmailList extends Model
{
    use HasFactory;

    protected $primaryKey = 'community_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'community_id',
        'daily_newsletter_emails',
        'weekly_newsletter_emails',
        'alert_emails',
        'emergency_emails',
        'daily_count',
        'weekly_count',
        'alert_count',
        'emergency_count',
        'compiled_at',
    ];

    protected $casts = [
        'compiled_at' => 'datetime',
    ];

    /**
     * Get the community
     */
    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class);
    }

    /**
     * Get daily newsletter emails as array
     */
    public function getDailyNewsletterEmailsAttribute($value)
    {
        if (is_string($value)) {
            return json_decode($value, true) ?? [];
        }
        return $value ?? [];
    }

    /**
     * Set daily newsletter emails
     */
    public function setDailyNewsletterEmailsAttribute($value)
    {
        $this->attributes['daily_newsletter_emails'] = is_array($value) ? json_encode($value) : $value;
    }

    /**
     * Get weekly newsletter emails as array
     */
    public function getWeeklyNewsletterEmailsAttribute($value)
    {
        if (is_string($value)) {
            return json_decode($value, true) ?? [];
        }
        return $value ?? [];
    }

    /**
     * Set weekly newsletter emails
     */
    public function setWeeklyNewsletterEmailsAttribute($value)
    {
        $this->attributes['weekly_newsletter_emails'] = is_array($value) ? json_encode($value) : $value;
    }

    /**
     * Get alert emails as array
     */
    public function getAlertEmailsAttribute($value)
    {
        if (is_string($value)) {
            return json_decode($value, true) ?? [];
        }
        return $value ?? [];
    }

    /**
     * Set alert emails
     */
    public function setAlertEmailsAttribute($value)
    {
        $this->attributes['alert_emails'] = is_array($value) ? json_encode($value) : $value;
    }

    /**
     * Get emergency emails as array
     */
    public function getEmergencyEmailsAttribute($value)
    {
        if (is_string($value)) {
            return json_decode($value, true) ?? [];
        }
        return $value ?? [];
    }

    /**
     * Set emergency emails
     */
    public function setEmergencyEmailsAttribute($value)
    {
        $this->attributes['emergency_emails'] = is_array($value) ? json_encode($value) : $value;
    }
}



