<?php

namespace App\Models\Communication;

use Illuminate\Database\Eloquent\Model;

class SuppressionList extends Model
{
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
