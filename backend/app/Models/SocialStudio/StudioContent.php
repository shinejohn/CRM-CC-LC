<?php

namespace App\Models\SocialStudio;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class StudioContent extends Model
{
    use HasFactory;

    protected $table = 'social_studio_content';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'smb_id',
        'session_id',
        'content_type',
        'source_brief',
        'platform',
        'generated_output',
        'credits_consumed',
        'status',
        'scheduled_at',
        'posted_at',
        'platform_post_id',
    ];

    protected $casts = [
        'generated_output' => 'array',
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

    public function scheduledPosts()
    {
        return $this->hasMany(StudioScheduledPost::class, 'content_id');
    }
}
