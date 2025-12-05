<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GeneratedPresentation extends Model
{
    use HasUuids;

    protected $fillable = [
        'tenant_id',
        'customer_id',
        'template_id',
        'presentation_json',
        'audio_base_url',
        'audio_generated',
        'audio_generated_at',
        'input_hash',
        'expires_at',
        'view_count',
        'avg_completion_rate',
        'last_viewed_at',
    ];

    protected $casts = [
        'presentation_json' => 'array',
        'audio_generated' => 'boolean',
        'audio_generated_at' => 'datetime',
        'expires_at' => 'datetime',
        'last_viewed_at' => 'datetime',
        'created_at' => 'datetime',
        'avg_completion_rate' => 'decimal:2',
    ];

    /**
     * Get template
     */
    public function template(): BelongsTo
    {
        return $this->belongsTo(PresentationTemplate::class, 'template_id');
    }
}

