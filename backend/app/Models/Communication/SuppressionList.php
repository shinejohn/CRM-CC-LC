<?php

declare(strict_types=1);

namespace App\Models\Communication;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

final class SuppressionList extends Model
{
    use HasUuids;

    protected $table = 'suppression_list';

    protected $fillable = [
        'channel',
        'address',
        'reason',
        'source',
        'community_id',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];
}
