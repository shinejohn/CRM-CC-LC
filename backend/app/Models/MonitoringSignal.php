<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class MonitoringSignal extends Model
{
    use HasUuids, HasFactory;

    // signal types that auto-create a ticket
    public const AUTO_TICKET_TYPES = ['complaint', 'bug_report', 'content_error'];

    protected $fillable = [
        'source_platform',
        'community_id',
        'raw_content',
        'signal_type',
        'url',
        'detected_at',
        'ticket_id',
        'auto_created',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'detected_at'  => 'datetime',
        'reviewed_at'  => 'datetime',
        'auto_created' => 'boolean',
    ];

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }

    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class);
    }

    public function shouldAutoCreateTicket(): bool
    {
        return in_array($this->signal_type, self::AUTO_TICKET_TYPES, true);
    }
}
