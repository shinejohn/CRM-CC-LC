<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class BusinessDirectory extends Model
{
    use HasUuids;

    protected $table = 'business_directory';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'community_id',
        'business_name',
        'city',
        'state',
        'category',
        'source',
        'claimed_smb_id',
        'claimed_at',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'claimed_at' => 'datetime',
        ];
    }

    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class, 'community_id');
    }

    public function claimedSmb(): BelongsTo
    {
        return $this->belongsTo(SMB::class, 'claimed_smb_id');
    }
}
