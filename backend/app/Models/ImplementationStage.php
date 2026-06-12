<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class ImplementationStage extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'ticket_id',
        'stage_name',
        'stage_order',
        'status',
        'assigned_to',
        'due_at',
        'completed_at',
        'notes',
    ];

    protected $casts = [
        'stage_order'  => 'integer',
        'due_at'       => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }
}
