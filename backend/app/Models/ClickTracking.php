<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class ClickTracking extends Model
{
    use HasUuids, HasFactory;

    protected $table = 'click_tracking';

    protected $fillable = [
        'content_card_id',
        'asset_id',
        'partner_id',
        'smb_id',
        'community_id',
        'source',
        'utm_params',
        'ip_address',
        'user_agent',
        'clicked_at',
    ];

    protected $casts = [
        'utm_params' => 'array',
        'clicked_at' => 'datetime',
    ];

    public function contentCard(): BelongsTo
    {
        return $this->belongsTo(ContentCard::class);
    }

    public function marketingKitAsset(): BelongsTo
    {
        return $this->belongsTo(MarketingKitAsset::class, 'asset_id');
    }

    public function syndicationPartner(): BelongsTo
    {
        return $this->belongsTo(SyndicationPartner::class, 'partner_id');
    }

    public function smb(): BelongsTo
    {
        return $this->belongsTo(SMB::class, 'smb_id');
    }

    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class);
    }
}
