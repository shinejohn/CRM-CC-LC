<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class ContentCard extends Model
{
    use HasUuids, HasFactory;

    protected $table = 'content_cards';

    protected $fillable = [
        'smb_id',
        'community_id',
        'content_type',
        'card_mode',
        'content_data',
        'sponsor_data',
        'caption_text',
        'tracking_url',
        'posted_at',
        'clicks',
        'date_for',
    ];

    protected $casts = [
        'content_data' => 'array',
        'sponsor_data' => 'array',
        'posted_at' => 'datetime',
        'date_for' => 'date',
    ];

    public function smb(): BelongsTo
    {
        return $this->belongsTo(SMB::class, 'smb_id');
    }

    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class);
    }
}
