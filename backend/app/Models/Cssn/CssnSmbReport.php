<?php

namespace App\Models\Cssn;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\SMB;
use App\Models\Community;

class CssnSmbReport extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'smb_id',
        'community_id',
        'report_period_start',
        'report_period_end',
        'total_posts',
        'total_impressions',
        'total_reach',
        'total_engagements',
        'total_link_clicks',
        'top_performing_post_id',
        'platform_breakdown',
        'syndication_dividend',
        'generated_at',
    ];

    protected $casts = [
        'report_period_start' => 'date',
        'report_period_end' => 'date',
        'platform_breakdown' => 'array',
        'generated_at' => 'datetime',
    ];

    public function smb(): BelongsTo
    {
        return $this->belongsTo(SMB::class);
    }

    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class);
    }
}
