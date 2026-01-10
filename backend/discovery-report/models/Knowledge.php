<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Knowledge extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'knowledge_base';

    protected $fillable = [
        'tenant_id',
        'title',
        'content',
        'category',
        'subcategory',
        'industry_codes',
        'embedding_status',
        'embedding',
        'is_public',
        'allowed_agents',
        'source',
        'source_url',
        'validation_status',
        'validated_at',
        'validated_by',
        'usage_count',
        'helpful_count',
        'not_helpful_count',
        'tags',
        'metadata',
        'created_by',
    ];

    protected $casts = [
        'industry_codes' => 'array',
        'allowed_agents' => 'array',
        'tags' => 'array',
        'metadata' => 'array',
        'is_public' => 'boolean',
        'validated_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the category relationship
     */
    public function faqCategory()
    {
        return $this->belongsTo(FaqCategory::class, 'category', 'slug');
    }
}






