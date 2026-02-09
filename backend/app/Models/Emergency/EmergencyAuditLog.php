<?php

namespace App\Models\Emergency;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmergencyAuditLog extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $table = 'emergency_audit_log';

    protected $fillable = [
        'broadcast_id',
        'action',
        'user_id',
        'user_name',
        'user_ip',
        'user_agent',
        'details',
        'created_at',
    ];

    protected $casts = [
        'details' => 'array',
        'created_at' => 'datetime',
    ];

    /**
     * Get the broadcast
     */
    public function broadcast(): BelongsTo
    {
        return $this->belongsTo(EmergencyBroadcast::class, 'broadcast_id');
    }

    /**
     * Get the user
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}



