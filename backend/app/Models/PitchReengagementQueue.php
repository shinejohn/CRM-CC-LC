<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class PitchReengagementQueue extends Model
{
    use HasUuids;

    protected $table = 'pitch_reengagement_queue';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'session_id',
        'smb_id',
        'customer_id',
        'contact_email',
        'reengagement_type',
        'context',
        'deferred_gates',
        'deferred_products',
        'send_after',
        'status',
        'outbound_campaign_id',
        'sent_at',
        'opened_at',
        'clicked_at',
    ];

    protected function casts(): array
    {
        return [
            'context' => 'array',
            'deferred_gates' => 'array',
            'deferred_products' => 'array',
            'send_after' => 'datetime',
            'sent_at' => 'datetime',
            'opened_at' => 'datetime',
            'clicked_at' => 'datetime',
        ];
    }

    public function pitchSession(): BelongsTo
    {
        return $this->belongsTo(PitchSession::class, 'session_id');
    }

    public function smb(): BelongsTo
    {
        return $this->belongsTo(SMB::class, 'smb_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    public function outboundCampaign(): BelongsTo
    {
        return $this->belongsTo(OutboundCampaign::class, 'outbound_campaign_id');
    }

    public function scopeDueNow($query)
    {
        return $query->where('status', 'queued')
            ->where('send_after', '<=', now());
    }

    public function scopeQueued($query)
    {
        return $query->where('status', 'queued');
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('reengagement_type', $type);
    }
}
