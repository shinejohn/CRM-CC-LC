<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    use HasUuids;

    protected $fillable = [
        'tenant_id',
        'title',
        'slug',
        'excerpt',
        'content',
        'featured_image',
        'category',
        'status',
        'published_at',
        'is_ai_generated',
        'view_count',
        'created_by',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'is_ai_generated' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}

