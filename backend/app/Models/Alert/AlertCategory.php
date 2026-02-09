<?php

namespace App\Models\Alert;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AlertCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'name',
        'description',
        'default_severity',
        'default_send_sms',
        'allow_opt_out',
        'is_active',
        'display_order',
    ];

    protected $casts = [
        'default_send_sms' => 'boolean',
        'allow_opt_out' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * Get subscriber preferences for this category
     */
    public function subscriberPreferences(): HasMany
    {
        return $this->hasMany(\App\Models\Subscriber\SubscriberAlertPreference::class, 'category_slug', 'slug');
    }

    /**
     * Get alerts in this category
     */
    public function alerts(): HasMany
    {
        return $this->hasMany(Alert::class, 'category', 'slug');
    }
}



