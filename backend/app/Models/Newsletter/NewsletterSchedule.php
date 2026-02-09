<?php

namespace App\Models\Newsletter;

use App\Models\Community;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NewsletterSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'community_id',
        'daily_enabled',
        'daily_send_time',
        'daily_template_id',
        'weekly_enabled',
        'weekly_send_day',
        'weekly_send_time',
        'weekly_template_id',
        'timezone',
    ];

    protected $casts = [
        'daily_enabled' => 'boolean',
        'weekly_enabled' => 'boolean',
    ];

    /**
     * Get the community
     */
    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class);
    }

    /**
     * Get daily template
     */
    public function dailyTemplate(): BelongsTo
    {
        return $this->belongsTo(NewsletterTemplate::class, 'daily_template_id');
    }

    /**
     * Get weekly template
     */
    public function weeklyTemplate(): BelongsTo
    {
        return $this->belongsTo(NewsletterTemplate::class, 'weekly_template_id');
    }
}

