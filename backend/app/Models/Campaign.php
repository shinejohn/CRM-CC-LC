<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Campaign extends Model
{
    use HasFactory;

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $guarded = [];

    protected $casts = [
        'approval_config' => 'array',
        'rvm_config' => 'array',
        'upsell_services' => 'array',
        'is_active' => 'boolean',
    ];

    public function landingPage(): HasOne
    {
        return $this->hasOne(CampaignLandingPage::class, 'campaign_id', 'id');
    }

    public function emails(): HasMany
    {
        return $this->hasMany(CampaignEmail::class, 'campaign_id', 'id');
    }

    public function content(): HasMany
    {
        return $this->hasMany(Content::class, 'campaign_id', 'id');
    }
}



