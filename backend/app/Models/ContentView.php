<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

final class ContentView extends Model
{
    use HasUuids, HasFactory;

    protected $guarded = [];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'slides_viewed' => 'array',
        'approval_clicked' => 'boolean',
        'downloaded_pdf' => 'boolean',
        'shared' => 'boolean',
    ];

    public function smb(): BelongsTo
    {
        return $this->belongsTo(SMB::class);
    }

    public function content(): BelongsTo
    {
        return $this->belongsTo(Content::class, 'content_slug', 'slug');
    }
}

