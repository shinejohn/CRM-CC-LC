<?php

namespace App\Models\SocialStudio;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class StudioConnectedAccount extends Model
{
    use HasFactory;

    protected $table = 'social_studio_connected_accounts';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'smb_id',
        'platform',
        'platform_account_id',
        'display_name',
        'profile_image_url',
        'oauth_access_token',
        'oauth_refresh_token',
        'token_expires_at',
        'scopes',
        'status',
        'connected_at',
        'last_verified_at',
    ];

    protected $casts = [
        'scopes' => 'array',
        'token_expires_at' => 'datetime',
        'connected_at' => 'datetime',
        'last_verified_at' => 'datetime',
    ];

    protected $hidden = [
        'oauth_access_token',
        'oauth_refresh_token',
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
