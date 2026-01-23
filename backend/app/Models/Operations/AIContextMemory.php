<?php

namespace App\Models\Operations;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AIContextMemory extends Model
{
    protected $table = 'ops.ai_context_memory';
    
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'memory_type',
        'category',
        'key',
        'content',
        'structured_data',
        'importance_score',
        'access_count',
        'last_accessed_at',
        'source_session_id',
        'source_type',
        'is_active',
        'valid_from',
        'valid_until',
        'version',
        'previous_version_id',
    ];

    protected $casts = [
        'structured_data' => 'array',
        'importance_score' => 'decimal:2',
        'access_count' => 'integer',
        'version' => 'integer',
        'is_active' => 'boolean',
        'last_accessed_at' => 'datetime',
        'valid_from' => 'datetime',
        'valid_until' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function sourceSession(): BelongsTo
    {
        return $this->belongsTo(AISession::class, 'source_session_id');
    }

    public function previousVersion(): BelongsTo
    {
        return $this->belongsTo(AIContextMemory::class, 'previous_version_id');
    }

    /**
     * Check if memory is active
     */
    public function isActive(): bool
    {
        return $this->is_active === true;
    }

    /**
     * Check if memory is valid
     */
    public function isValid(): bool
    {
        if ($this->valid_until === null) {
            return $this->isActive();
        }
        return $this->isActive() && $this->valid_until > now();
    }
}

