<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class DashboardWidget extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'widget_key',
        'title',
        'default_color',
        'position',
        'layout',
        'config',
        'is_visible',
    ];

    protected $casts = [
        'position' => 'integer',
        'layout' => 'array',
        'config' => 'array',
        'is_visible' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
