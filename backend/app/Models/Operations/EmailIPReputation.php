<?php

namespace App\Models\Operations;

use Illuminate\Database\Eloquent\Model;

class EmailIPReputation extends Model
{
    protected $table = 'ops.email_ip_reputation';
    
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'ip_address',
        'ip_pool',
        'provider',
        'reputation_score',
        'gmail_reputation',
        'microsoft_reputation',
        'yahoo_reputation',
        'emails_sent_24h',
        'emails_sent_7d',
        'emails_sent_30d',
        'bounce_rate_24h',
        'bounce_rate_7d',
        'bounce_rate_30d',
        'complaint_rate_24h',
        'complaint_rate_7d',
        'complaint_rate_30d',
        'open_rate_24h',
        'open_rate_7d',
        'warmup_status',
        'warmup_started_at',
        'warmup_target_daily_volume',
        'warmup_current_daily_limit',
        'warmup_day_number',
        'is_blacklisted',
        'blacklist_sources',
        'last_blacklist_check',
        'is_active',
        'status',
        'recorded_at',
    ];

    protected $casts = [
        'reputation_score' => 'decimal:2',
        'bounce_rate_24h' => 'decimal:4',
        'bounce_rate_7d' => 'decimal:4',
        'bounce_rate_30d' => 'decimal:4',
        'complaint_rate_24h' => 'decimal:4',
        'complaint_rate_7d' => 'decimal:4',
        'complaint_rate_30d' => 'decimal:4',
        'open_rate_24h' => 'decimal:4',
        'open_rate_7d' => 'decimal:4',
        'emails_sent_24h' => 'integer',
        'emails_sent_7d' => 'integer',
        'emails_sent_30d' => 'integer',
        'warmup_target_daily_volume' => 'integer',
        'warmup_current_daily_limit' => 'integer',
        'warmup_day_number' => 'integer',
        'is_blacklisted' => 'boolean',
        'blacklist_sources' => 'array',
        'is_active' => 'boolean',
        'warmup_started_at' => 'datetime',
        'last_blacklist_check' => 'datetime',
        'recorded_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}

