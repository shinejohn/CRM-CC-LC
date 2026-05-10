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

    protected $fillable = [
        'smb_id',
        'content_slug',
        'started_at',
        'completed_at',
        'completion_percentage',
        'source_campaign_id',
        'source_url',
        'time_on_page_seconds',
        'slides_viewed',
        'approval_clicked',
        'downloaded_pdf',
        'shared',
    ];

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

