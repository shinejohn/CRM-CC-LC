<?php

namespace App\Models\Emergency;

use App\Models\Community;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MunicipalAdmin extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'community_id',
        'title',
        'department',
        'can_send_emergency',
        'can_send_test',
        'authorization_pin_hash',
        'phone',
        'is_active',
        'verified_at',
        'verified_by',
    ];

    protected $casts = [
        'can_send_emergency' => 'boolean',
        'can_send_test' => 'boolean',
        'is_active' => 'boolean',
        'verified_at' => 'datetime',
    ];

    /**
     * Get the user
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the community
     */
    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class);
    }

    /**
     * Check if admin can send emergency broadcasts
     */
    public function canSendEmergency(): bool
    {
        return $this->is_active && $this->can_send_emergency;
    }

    /**
     * Check if admin can send test broadcasts
     */
    public function canSendTest(): bool
    {
        return $this->is_active && $this->can_send_test;
    }
}



