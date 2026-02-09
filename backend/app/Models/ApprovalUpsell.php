<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApprovalUpsell extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'offered_at' => 'datetime',
        'accepted' => 'boolean',
        'accepted_at' => 'datetime',
        'declined_at' => 'datetime',
    ];

    public $timestamps = false;

    public function approval(): BelongsTo
    {
        return $this->belongsTo(Approval::class);
    }

    public function resultingApproval(): BelongsTo
    {
        return $this->belongsTo(Approval::class, 'resulting_approval_id');
    }
}

