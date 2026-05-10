<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class SponsorPlacement extends Model
{
    use HasUuids, HasFactory;

    protected $table = 'sponsor_placements';

    protected $fillable = [
        'smb_id',
        'partner_id',
        'monthly_budget_cents',
        'partner_cut_cents',
        'status',
        'posts_delivered',
        'clicks_delivered',
    ];

    protected $casts = [
        'monthly_budget_cents' => 'integer',
        'partner_cut_cents' => 'integer',
        'posts_delivered' => 'integer',
        'clicks_delivered' => 'integer',
    ];

    public function smb(): BelongsTo
    {
        return $this->belongsTo(SMB::class, 'smb_id');
    }

    public function syndicationPartner(): BelongsTo
    {
        return $this->belongsTo(SyndicationPartner::class, 'partner_id');
    }
}
