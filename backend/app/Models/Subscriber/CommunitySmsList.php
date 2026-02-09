<?php

namespace App\Models\Subscriber;

use App\Models\Community;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommunitySmsList extends Model
{
    use HasFactory;

    protected $primaryKey = 'community_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'community_id',
        'alert_phones',
        'emergency_phones',
        'alert_count',
        'emergency_count',
        'compiled_at',
    ];

    protected $casts = [
        'compiled_at' => 'datetime',
    ];

    /**
     * Get the community
     */
    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class);
    }

    /**
     * Get alert phones as array
     */
    public function getAlertPhonesAttribute($value)
    {
        if (is_string($value)) {
            return json_decode($value, true) ?? [];
        }
        return $value ?? [];
    }

    /**
     * Set alert phones
     */
    public function setAlertPhonesAttribute($value)
    {
        $this->attributes['alert_phones'] = is_array($value) ? json_encode($value) : $value;
    }

    /**
     * Get emergency phones as array
     */
    public function getEmergencyPhonesAttribute($value)
    {
        if (is_string($value)) {
            return json_decode($value, true) ?? [];
        }
        return $value ?? [];
    }

    /**
     * Set emergency phones
     */
    public function setEmergencyPhonesAttribute($value)
    {
        $this->attributes['emergency_phones'] = is_array($value) ? json_encode($value) : $value;
    }
}



