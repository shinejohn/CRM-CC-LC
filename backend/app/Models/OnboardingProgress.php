<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @method static \Illuminate\Database\Eloquent\Builder|OnboardingProgress newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|OnboardingProgress newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|OnboardingProgress query()
 */
final class OnboardingProgress extends Model
{
    use HasUuids;

    protected $table = 'onboarding_progress';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'customer_id',
        'step',
        'completed_at',
        'metadata',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}
