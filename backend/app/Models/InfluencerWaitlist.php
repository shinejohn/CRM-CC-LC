<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class InfluencerWaitlist extends Model
{
    use HasUuids;

    protected $table = 'influencer_waitlist';

    protected $fillable = [
        'community_id',
        'customer_id',
        'category_group',
        'category_subtype',
        'product_slug',
        'position',
        'requested_at',
        'notified_at',
        'expires_at',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'position' => 'integer',
            'requested_at' => 'datetime',
            'notified_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}
