<?php

namespace App\Models\SocialStudio;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class StudioCredit extends Model
{
    use HasFactory;

    protected $table = 'social_studio_credits';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'smb_id',
        'balance',
        'lifetime_purchased',
        'lifetime_consumed',
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
