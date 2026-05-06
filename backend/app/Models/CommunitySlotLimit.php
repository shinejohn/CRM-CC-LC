<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class CommunitySlotLimit extends Model
{
    use HasUuids;

    protected $fillable = [
        'community_id',
        'category_group',
        'category_subtype',
        'max_influencer_slots',
        'max_expert_slots',
        'current_influencer_count',
        'current_expert_count',
    ];

    protected function casts(): array
    {
        return [
            'max_influencer_slots' => 'integer',
            'max_expert_slots' => 'integer',
            'current_influencer_count' => 'integer',
            'current_expert_count' => 'integer',
        ];
    }

    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class);
    }

    public function influencerSlotsRemaining(): int
    {
        return max(0, $this->max_influencer_slots - $this->current_influencer_count);
    }

    public function expertSlotsRemaining(): int
    {
        return max(0, $this->max_expert_slots - $this->current_expert_count);
    }
}
