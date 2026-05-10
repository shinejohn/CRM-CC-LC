<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class MarketingKitAsset extends Model
{
    use HasUuids, HasFactory;

    protected $table = 'marketing_kit_assets';

    protected $fillable = [
        'smb_id',
        'asset_type',
        'platform',
        'title',
        'config',
        'generated_html',
        'generated_svg',
        'embed_code',
        'is_active',
        'published_at',
    ];

    protected $casts = [
        'config' => 'array',
        'is_active' => 'boolean',
        'published_at' => 'datetime',
    ];

    public function smb(): BelongsTo
    {
        return $this->belongsTo(SMB::class, 'smb_id');
    }
}
