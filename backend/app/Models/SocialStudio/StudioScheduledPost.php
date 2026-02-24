<?php

namespace App\Models\SocialStudio;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class StudioScheduledPost extends Model
{
    use HasFactory;

    protected $table = 'social_studio_scheduled_posts';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'smb_id',
        'content_id',
        'connected_account_id',
        'platform',
        'status',
        'scheduled_at',
        'posted_at',
        'platform_post_id',
        'error_log',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'posted_at' => 'datetime',
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

    public function connectedAccount()
    {
        return $this->belongsTo(StudioConnectedAccount::class, 'connected_account_id');
    }
}
