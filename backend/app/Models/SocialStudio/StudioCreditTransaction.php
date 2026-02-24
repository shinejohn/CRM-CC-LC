<?php

namespace App\Models\SocialStudio;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class StudioCreditTransaction extends Model
{
    use HasFactory;

    protected $table = 'social_studio_credit_transactions';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'smb_id',
        'type',
        'amount',
        'balance_after',
        'action_type',
        'content_id',
        'stripe_payment_intent_id',
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

    public function content()
    {
        return $this->belongsTo(StudioContent::class, 'content_id');
    }
}
