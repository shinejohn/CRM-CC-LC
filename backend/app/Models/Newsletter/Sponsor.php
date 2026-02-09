<?php

namespace App\Models\Newsletter;

use App\Models\SMB;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sponsor extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'uuid',
        'name',
        'smb_id',
        'logo_url',
        'website_url',
        'tagline',
        'contact_email',
        'contact_name',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the SMB if sponsor is also an SMB
     */
    public function smb(): BelongsTo
    {
        return $this->belongsTo(SMB::class, 'smb_id');
    }

    /**
     * Get sponsorships for this sponsor
     */
    public function sponsorships(): HasMany
    {
        return $this->hasMany(Sponsorship::class);
    }
}



