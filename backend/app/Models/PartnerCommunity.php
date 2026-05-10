<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class PartnerCommunity extends Model
{
    use HasUuids, HasFactory;

    protected $table = 'partner_communities';

    protected $fillable = [
        'partner_id',
        'community_id',
        'platform',
        'group_name',
        'group_url',
        'member_count',
        'status',
        'posts_this_month',
        'clicks_this_month',
    ];

    protected $casts = [
        'member_count' => 'integer',
        'posts_this_month' => 'integer',
        'clicks_this_month' => 'integer',
    ];

    public function syndicationPartner(): BelongsTo
    {
        return $this->belongsTo(SyndicationPartner::class, 'partner_id');
    }

    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class);
    }
}
