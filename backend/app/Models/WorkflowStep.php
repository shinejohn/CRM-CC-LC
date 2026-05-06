<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

final class WorkflowStep extends Model
{
    use HasUuids;

    protected $fillable = [
        'workflow_execution_id',
        'step_name',
        'status',
        'result',
        'error',
        'completed_at',
    ];

    protected $casts = [
        'result' => 'array',
        'completed_at' => 'datetime',
    ];
}
