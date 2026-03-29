<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class CustomerFaq extends Model
{
    use \App\Traits\HasTenantScope, HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'customer_id',
        'question',
        'answer',
        'short_answer',
        'category',
        'keywords',
        'source',
        'confidence',
        'source_conversation_id',
        'verified_by_owner',
        'verified_at',
        'should_ask_clarification',
        'clarification_question',
        'is_active',
    ];

    protected $casts = [
        'keywords' => 'array',
        'verified_by_owner' => 'boolean',
        'verified_at' => 'datetime',
        'should_ask_clarification' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * Get the customer this FAQ belongs to
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Mark FAQ as verified by owner
     */
    public function markAsVerified(): void
    {
        $this->verified_by_owner = true;
        $this->verified_at = now();
        $this->confidence = 'confirmed';
        $this->save();
    }
}
