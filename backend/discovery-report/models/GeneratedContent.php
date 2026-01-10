<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GeneratedContent extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'title',
        'slug',
        'type',
        'status',
        'content',
        'excerpt',
        'metadata',
        'campaign_id',
        'template_id',
        'generation_params',
        'assigned_to',
        'scheduled_publish_at',
        'published_at',
        'published_by',
        'published_channels',
        'publishing_metadata',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'generation_params' => 'array',
            'published_channels' => 'array',
            'publishing_metadata' => 'array',
            'scheduled_publish_at' => 'datetime',
            'published_at' => 'datetime',
        ];
    }

    public function versions(): HasMany
    {
        return $this->hasMany(ContentVersion::class, 'content_id');
    }

    public function workflowHistory(): HasMany
    {
        return $this->hasMany(ContentWorkflowHistory::class, 'content_id');
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(ContentTemplate::class, 'template_id');
    }

    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    public function isPublished(): bool
    {
        return $this->status === 'published';
    }

    public function isScheduled(): bool
    {
        return $this->scheduled_publish_at !== null && $this->status === 'draft';
    }

    /**
     * Create a new version
     */
    public function createVersion(string $changeNotes = null, ?string $userId = null): ContentVersion
    {
        $latestVersion = $this->versions()->orderBy('version_number', 'desc')->first();
        $versionNumber = $latestVersion ? $latestVersion->version_number + 1 : 1;

        return $this->versions()->create([
            'tenant_id' => $this->tenant_id,
            'version_number' => $versionNumber,
            'title' => $this->title,
            'content' => $this->content,
            'excerpt' => $this->excerpt,
            'metadata' => $this->metadata,
            'created_by' => $userId,
            'change_notes' => $changeNotes,
        ]);
    }

    /**
     * Record workflow action
     */
    public function recordWorkflowAction(
        string $action,
        ?string $fromStatus = null,
        ?string $toStatus = null,
        ?string $userId = null,
        ?string $notes = null,
        array $metadata = []
    ): ContentWorkflowHistory {
        return $this->workflowHistory()->create([
            'tenant_id' => $this->tenant_id,
            'action' => $action,
            'from_status' => $fromStatus ?? $this->status,
            'to_status' => $toStatus ?? $this->status,
            'performed_by' => $userId,
            'notes' => $notes,
            'metadata' => $metadata,
        ]);
    }
}
