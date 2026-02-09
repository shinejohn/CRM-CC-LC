<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CampaignLandingPage extends Model
{
    use HasFactory;

    protected $primaryKey = 'campaign_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'campaign_id',
        'landing_page_slug',
        'url',
        'template_id',
        'template_name',
        'slide_count',
        'duration_seconds',
        'primary_cta',
        'secondary_cta',
        'ai_persona',
        'ai_tone',
        'ai_goal',
        'audio_base_url',
        'crm_tracking',
        'conversion_goal',
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_content',
        'data_capture_fields',
        'metadata',
    ];

    protected $casts = [
        'data_capture_fields' => 'array',
        'metadata' => 'array',
        'crm_tracking' => 'boolean',
    ];

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class, 'campaign_id', 'id');
    }
}

