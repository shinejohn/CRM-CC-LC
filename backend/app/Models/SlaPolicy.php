<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class SlaPolicy extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'name',
        'ticket_type',
        'priority',
        'first_response_hrs',
        'resolution_hrs',
        'applies_to_plan',
    ];

    protected $casts = [
        'first_response_hrs' => 'integer',
        'resolution_hrs'     => 'integer',
    ];

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class, 'sla_policy_id');
    }

    public static function forTicket(string $type, string $priority, ?string $plan = null): ?self
    {
        return self::where('ticket_type', $type)
            ->where('priority', $priority)
            ->when($plan, fn ($q) => $q->where('applies_to_plan', $plan))
            ->orderByRaw('applies_to_plan IS NULL ASC') // prefer plan-specific first
            ->first();
    }
}
