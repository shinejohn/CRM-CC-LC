<?php

namespace App\Models\SocialStudio;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class StudioSubscription extends Model
{
    use HasFactory;

    protected $table = 'social_studio_subscriptions';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'smb_id',
        'status',
        'monthly_credits',
        'discount_pct',
        'billing_amount_cents',
        'stripe_subscription_id',
        'next_credit_refresh_at',
    ];

    protected $casts = [
        'next_credit_refresh_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    public function smb()
    {
        return $this->belongsTo(\App\Models\SMB::class, 'smb_id');
    }
}
