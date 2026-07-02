<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class TrainingExample extends Model
{
    use HasUuids;

    protected $fillable = [
        'dataset_id',
        'input',
        'expected_output',
        'category',
        'validation_status',
        'reviewed_by',
        'reviewed_at',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'reviewed_at' => 'datetime',
    ];

    /**
     * @return BelongsTo<TrainingDataset, TrainingExample>
     */
    public function dataset(): BelongsTo
    {
        return $this->belongsTo(TrainingDataset::class, 'dataset_id');
    }
}
