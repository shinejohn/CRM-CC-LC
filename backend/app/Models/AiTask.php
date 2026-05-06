<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

final class AiTask extends Model
{
    use HasUuids, HasFactory;

    protected $guarded = [];

    protected $casts = [
        'input_data' => 'array',
        'output_data' => 'array',
        'suggested_at' => 'datetime',
        'approved_at' => 'datetime',
        'executed_at' => 'datetime',
        'completed_at' => 'datetime',
    ];
}



