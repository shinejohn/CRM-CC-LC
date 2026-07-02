<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class TrainingRun extends Model
{
    use HasUuids;

    protected $fillable = [
        'dataset_id',
        'status',
        'started_at',
        'finished_at',
        'notes',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
    ];

    /**
     * @return BelongsTo<TrainingDataset, TrainingRun>
     */
    public function dataset(): BelongsTo
    {
        return $this->belongsTo(TrainingDataset::class, 'dataset_id');
    }
}
