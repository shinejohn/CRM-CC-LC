<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class ContentWorkflowHistory extends Model
{
    use \App\Traits\HasTenantScope, HasFactory, HasUuids;

    protected $table = 'content_workflow_history';

    public $timestamps = true;

    const UPDATED_AT = null;

    protected $fillable = [
        'content_id',
        'tenant_id',
        'action',
        'from_status',
        'to_status',
        'performed_by',
        'notes',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }

    public function content(): BelongsTo
    {
        return $this->belongsTo(GeneratedContent::class, 'content_id');
    }
}
