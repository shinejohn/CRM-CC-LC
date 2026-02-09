<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WorkflowExecution extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'type',
        'status',
        'params',
        'initiated_by',
        'completed_at',
        'results',
        'error',
    ];

    protected $casts = [
        'params' => 'array',
        'results' => 'array',
        'completed_at' => 'datetime',
    ];

    public function steps(): HasMany
    {
        return $this->hasMany(WorkflowStep::class);
    }
}
