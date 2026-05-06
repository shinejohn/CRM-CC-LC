<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class AdvertiserSession extends Model
{
    use HasUuids;

    protected $fillable = [
        'business_id',
        'user_id',
        'community_id',
        'source_platform',
        'source_url',
        'source_article_id',
        'visitor_type',
        'intake_answers',
        'proposal',
        'status',
        'campaign_id',
        'business_name',
        'business_category',
        'last_active_at',
        'converted_at',
        'abandoned_at',
    ];

    protected function casts(): array
    {
        return [
            'intake_answers' => 'array',
            'proposal' => 'array',
            'last_active_at' => 'datetime',
            'converted_at' => 'datetime',
            'abandoned_at' => 'datetime',
        ];
    }

    public function smb(): BelongsTo
    {
        return $this->belongsTo(SMB::class, 'business_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class);
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(SarahMessage::class, 'advertiser_session_id');
    }

    public function isActive(): bool
    {
        return in_array($this->status, ['intake', 'proposed', 'negotiating'], true);
    }

    public function isConverted(): bool
    {
        return $this->status === 'converted';
    }
}
