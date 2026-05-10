<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class SyndicationPartner extends Model
{
    use HasUuids, HasFactory;

    protected $table = 'syndication_partners';

    protected $fillable = [
        'user_id',
        'name',
        'email',
        'tier',
        'revenue_share_pct',
        'total_earned',
        'status',
    ];

    protected $casts = [
        'total_earned' => 'integer',
        'revenue_share_pct' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function partnerCommunities(): HasMany
    {
        return $this->hasMany(PartnerCommunity::class, 'partner_id');
    }

    public function sponsorPlacements(): HasMany
    {
        return $this->hasMany(SponsorPlacement::class, 'partner_id');
    }
}
