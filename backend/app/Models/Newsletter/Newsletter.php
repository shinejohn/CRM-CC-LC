<?php

namespace App\Models\Newsletter;

use App\Models\Community;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Newsletter extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'uuid',
        'community_id',
        'newsletter_type',
        'issue_date',
        'scheduled_for',
        'subject',
        'subject_b',
        'preheader',
        'content_json',
        'content_html',
        'status',
        'ab_test_enabled',
        'ab_test_percentage',
        'ab_test_winner',
        'ab_test_decided_at',
        'recipient_count',
        'sent_count',
        'delivered_count',
        'open_count',
        'unique_open_count',
        'click_count',
        'unique_click_count',
        'unsubscribe_count',
        'sponsor_revenue_cents',
        'building_started_at',
        'sending_started_at',
        'sending_completed_at',
    ];

    protected $casts = [
        'issue_date' => 'date',
        'scheduled_for' => 'datetime',
        'content_json' => 'array',
        'ab_test_enabled' => 'boolean',
        'ab_test_decided_at' => 'datetime',
        'building_started_at' => 'datetime',
        'sending_started_at' => 'datetime',
        'sending_completed_at' => 'datetime',
    ];

    /**
     * Get the community this newsletter belongs to
     */
    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class);
    }

    /**
     * Get content items for this newsletter
     */
    public function contentItems(): HasMany
    {
        return $this->hasMany(NewsletterContentItem::class)->orderBy('position');
    }

    /**
     * Check if newsletter is ready to send
     */
    public function isReadyToSend(): bool
    {
        return $this->status === 'scheduled' && !empty($this->content_html);
    }

    /**
     * Check if newsletter has been sent
     */
    public function isSent(): bool
    {
        return $this->status === 'sent';
    }

    /**
     * Get open rate percentage
     */
    public function getOpenRateAttribute(): float
    {
        if ($this->delivered_count === 0) {
            return 0.0;
        }
        return ($this->unique_open_count / $this->delivered_count) * 100;
    }

    /**
     * Get click rate percentage
     */
    public function getClickRateAttribute(): float
    {
        if ($this->delivered_count === 0) {
            return 0.0;
        }
        return ($this->unique_click_count / $this->delivered_count) * 100;
    }
}



