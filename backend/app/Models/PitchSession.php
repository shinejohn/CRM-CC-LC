<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class PitchSession extends Model
{
    use HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'smb_id',
        'customer_id',
        'community_id',
        'conversation_id',
        'entry_platform',
        'entry_context',
        'org_type',
        'pitch_track',
        'status',
        'last_step',
        'discovery_answers',
        'territory_selection',
        'gates_offered',
        'gates_completed',
        'gates_deferred',
        'products_accepted',
        'products_declined',
        'products_deferred',
        'proposal_id',
        'proposal_value',
        'last_active_at',
        'resume_reminded_at',
        'abandoned_at',
        'pitch_completed_at',
        'business_name',
        'business_category',
        'flow_mode',
        'existing_products',
        'upsell_rationale',
        'existing_monthly_value',
    ];

    protected function casts(): array
    {
        return [
            'discovery_answers' => 'array',
            'territory_selection' => 'array',
            'gates_offered' => 'array',
            'gates_completed' => 'array',
            'gates_deferred' => 'array',
            'products_accepted' => 'array',
            'products_declined' => 'array',
            'products_deferred' => 'array',
            'proposal_value' => 'decimal:2',
            'last_active_at' => 'datetime',
            'resume_reminded_at' => 'datetime',
            'abandoned_at' => 'datetime',
            'pitch_completed_at' => 'datetime',
            'existing_products' => 'array',
            'upsell_rationale' => 'array',
            'existing_monthly_value' => 'decimal:2',
        ];
    }

    public function smb(): BelongsTo
    {
        return $this->belongsTo(SMB::class, 'smb_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class, 'community_id');
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class, 'conversation_id');
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class, 'proposal_id');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'pitching');
    }

    public function scopeAbandoned($query)
    {
        return $query->where('status', 'abandoned');
    }

    public function scopeConverted($query)
    {
        return $query->where('status', 'converted');
    }

    public function scopeForCommunity($query, int|string $communityId)
    {
        return $query->where('community_id', $communityId);
    }
}
