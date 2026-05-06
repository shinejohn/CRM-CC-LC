<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class SarahMessage extends Model
{
    use HasUuids;

    protected $fillable = [
        'business_id',
        'advertiser_session_id',
        'campaign_id',
        'type',
        'direction',
        'message',
        'context',
        'actioned',
        'actioned_at',
        'action_taken',
    ];

    protected function casts(): array
    {
        return [
            'context' => 'array',
            'actioned' => 'boolean',
            'actioned_at' => 'datetime',
        ];
    }

    public function smb(): BelongsTo
    {
        return $this->belongsTo(SMB::class, 'business_id');
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(AdvertiserSession::class, 'advertiser_session_id');
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }

    public function markActioned(string $action): void
    {
        $this->update([
            'actioned' => true,
            'actioned_at' => now(),
            'action_taken' => $action,
        ]);
    }
}
