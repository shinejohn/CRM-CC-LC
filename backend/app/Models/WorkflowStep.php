<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkflowStep extends Model
{
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
