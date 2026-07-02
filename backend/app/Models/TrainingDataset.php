<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class TrainingDataset extends Model
{
    use \App\Traits\HasTenantScope, HasUuids;

    protected $fillable = [
        'tenant_id',
        'name',
        'description',
        'agent_id',
        'status',
        'example_count',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'example_count' => 'integer',
    ];

    /**
     * @return HasMany<TrainingExample>
     */
    public function examples(): HasMany
    {
        return $this->hasMany(TrainingExample::class, 'dataset_id');
    }

    /**
     * @return HasMany<TrainingRun>
     */
    public function runs(): HasMany
    {
        return $this->hasMany(TrainingRun::class, 'dataset_id');
    }
}
