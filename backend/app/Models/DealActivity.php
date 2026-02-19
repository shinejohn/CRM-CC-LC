<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DealActivity extends Model
{
    use HasUuids;

    protected $table = 'deal_activities';

    protected $fillable = [
        'deal_id',
        'type',
        'from_stage',
        'to_stage',
        'description',
        'created_by',
    ];

    public function deal(): BelongsTo
    {
        return $this->belongsTo(Deal::class);
    }
}
