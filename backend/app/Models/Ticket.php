<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class Ticket extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'ticket_number',
        'type',
        'status',
        'priority',
        'subject',
        'description',
        'client_id',
        'contact_id',
        'community_id',
        'channel',
        'app',
        'source',
        'assigned_to',
        'created_by',
        'external_ref',
        'tags',
        'sla_policy_id',
        'due_at',
        'first_responded_at',
        'resolved_at',
    ];

    protected $casts = [
        'tags'               => 'array',
        'due_at'             => 'datetime',
        'first_responded_at' => 'datetime',
        'resolved_at'        => 'datetime',
    ];

    // ── Ticket number generation ──────────────────────────────────────────────

    protected static function booted(): void
    {
        static::creating(function (self $ticket): void {
            if (empty($ticket->ticket_number)) {
                $ticket->ticket_number = self::generateTicketNumber();
            }
        });
    }

    private static function generateTicketNumber(): string
    {
        $year  = now()->format('Y');
        $count = self::whereYear('created_at', $year)->count() + 1;

        return 'TKT-' . $year . '-' . str_pad((string) $count, 5, '0', STR_PAD_LEFT);
    }

    // ── Relationships ─────────────────────────────────────────────────────────

    public function client(): BelongsTo
    {
        return $this->belongsTo(SMB::class, 'client_id');
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'contact_id');
    }

    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class, 'community_id');
    }

    public function slaPolicy(): BelongsTo
    {
        return $this->belongsTo(SlaPolicy::class, 'sla_policy_id');
    }

    public function notes(): HasMany
    {
        return $this->hasMany(TicketNote::class)->orderBy('created_at');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(TicketAttachment::class);
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(TicketStatusHistory::class)->orderBy('changed_at');
    }

    public function implementationStages(): HasMany
    {
        return $this->hasMany(ImplementationStage::class)->orderBy('stage_order');
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    public function isOverdue(): bool
    {
        return $this->due_at !== null
            && $this->due_at->isPast()
            && ! in_array($this->status, ['resolved', 'closed', 'cancelled'], true);
    }

    public function slaPercentUsed(): ?float
    {
        if ($this->due_at === null) {
            return null;
        }

        $created   = $this->created_at->timestamp;
        $due       = $this->due_at->timestamp;
        $now       = now()->timestamp;
        $total     = $due - $created;

        if ($total <= 0) {
            return 100.0;
        }

        return min(100.0, round((($now - $created) / $total) * 100, 1));
    }
}
