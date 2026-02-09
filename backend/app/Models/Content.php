<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Content extends Model
{
    use HasFactory;

    protected $table = 'content';

    protected $fillable = [
        'slug',
        'type',  // 'edu', 'hook', 'howto', 'article'
        'title',
        'campaign_id',
        'slides',
        'article_body',
        'audio_base_url',
        'duration_seconds',
        'service_type',
        'approval_button_text',
        'personalization_fields',
        'metadata',
        'is_active',
    ];

    protected $casts = [
        'slides' => 'array',
        'personalization_fields' => 'array',
        'metadata' => 'array',
        'is_active' => 'boolean',
    ];

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class, 'campaign_id', 'id');
    }

    public function views(): HasMany
    {
        return $this->hasMany(ContentView::class, 'content_slug', 'slug');
    }
}

