<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class SarahNotebookEntry extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'notebook_id',
        'field_name',
        'old_value',
        'new_value',
        'source',
        'source_detail',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function notebook(): BelongsTo
    {
        return $this->belongsTo(SarahNotebook::class, 'notebook_id');
    }
}
