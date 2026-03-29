<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Validation\ValidationException;

final class CommunitySlotInventory extends Model
{
    use HasUuids;

    protected $table = 'community_slot_inventory';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $appends = [
        'available_slots',
        'status',
    ];

    protected $fillable = [
        'community_id',
        'platform',
        'slot_type',
        'category',
        'total_slots',
        'held_slots',
        'held_by',
    ];

    protected function casts(): array
    {
        return [
            'total_slots' => 'integer',
            'held_slots' => 'integer',
            'held_by' => 'array',
        ];
    }

    protected static function booted(): void
    {
        self::creating(function (CommunitySlotInventory $row): void {
            $dup = static::query()->where([
                'community_id' => $row->community_id,
                'platform' => $row->platform,
                'slot_type' => $row->slot_type,
                'category' => $row->category,
            ])->exists();

            if ($dup) {
                throw ValidationException::withMessages([
                    'slot_inventory' => 'A row already exists for this community, platform, slot type, and category.',
                ]);
            }
        });
    }

    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class, 'community_id');
    }

    public function getAvailableSlotsAttribute(): int
    {
        if ($this->total_slots >= 999999) {
            return PHP_INT_MAX;
        }

        return max(0, $this->total_slots - $this->held_slots);
    }

    public function getStatusAttribute(): string
    {
        if ($this->total_slots >= 999999) {
            return 'open';
        }

        if ($this->held_slots >= $this->total_slots) {
            return 'full';
        }

        $remaining = $this->total_slots - $this->held_slots;

        return $remaining <= max(1, (int) ceil($this->total_slots * 0.2)) ? 'almost_full' : 'open';
    }
}
