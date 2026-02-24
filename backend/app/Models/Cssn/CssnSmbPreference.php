<?php

namespace App\Models\Cssn;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\SMB;

class CssnSmbPreference extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'smb_id',
        'auto_distribute_coupons',
        'auto_distribute_events',
        'auto_distribute_articles',
        'auto_distribute_announcements',
        'require_approval_before_post',
        'preferred_post_time',
        'excluded_platforms',
        'brand_voice_override',
    ];

    protected $casts = [
        'auto_distribute_coupons' => 'boolean',
        'auto_distribute_events' => 'boolean',
        'auto_distribute_articles' => 'boolean',
        'auto_distribute_announcements' => 'boolean',
        'require_approval_before_post' => 'boolean',
        'excluded_platforms' => 'array',
    ];

    public function smb(): BelongsTo
    {
        return $this->belongsTo(SMB::class);
    }
}
