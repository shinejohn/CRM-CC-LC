<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CampaignSend extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) \Illuminate\Support\Str::uuid();
            }
        });
    }

    protected $casts = [
        'scheduled_for' => 'datetime',
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
        'opened_at' => 'datetime',
        'clicked_at' => 'datetime',
        'bounced_at' => 'datetime',
        'complained_at' => 'datetime',
        'followup_triggered_at' => 'datetime',
        'rvm_triggered' => 'boolean',
    ];

    /**
     * Get the customer (SMB) associated with this campaign send
     */
    public function customer()
    {
        // Try to get customer via smb_id
        // If smb_id points to customers table, use direct relationship
        if ($this->smb_id) {
            return $this->belongsTo(Customer::class, 'smb_id');
        }

        return null;
    }

    /**
     * Get the campaign associated with this send
     */
    public function campaign()
    {
        return $this->belongsTo(Campaign::class, 'campaign_id', 'id');
    }
}



