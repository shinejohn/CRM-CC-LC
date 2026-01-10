<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContentVersion extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'content_id',
        'tenant_id',
        'version_number',
        'title',
        'content',
        'excerpt',
        'metadata',
        'created_by',
        'change_notes',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'version_number' => 'integer',
        ];
    }

    public function content(): BelongsTo
    {
        return $this->belongsTo(GeneratedContent::class, 'content_id');
    }
}
