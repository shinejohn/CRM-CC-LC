<?php

namespace App\Models\Operations;

use Illuminate\Database\Eloquent\Model;

class RevenueSnapshot extends Model
{
    protected $table = 'ops.revenue_snapshots';
    
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'snapshot_date',
        'snapshot_type',
        'mrr',
        'arr',
        'revenue_b2b',
        'revenue_b2c',
        'revenue_advertising',
        'revenue_events',
        'revenue_services',
        'revenue_other',
        'revenue_tier_free',
        'revenue_tier_basic',
        'revenue_tier_community_influencer',
        'revenue_tier_premium',
        'revenue_tier_enterprise',
        'new_mrr',
        'expansion_mrr',
        'contraction_mrr',
        'churned_mrr',
        'net_new_mrr',
        'total_paying_customers',
        'new_customers',
        'churned_customers',
        'net_new_customers',
        'arpu',
        'ltv',
        'cac',
        'ltv_cac_ratio',
        'communities_active',
        'communities_revenue_generating',
        'avg_revenue_per_community',
        'computed_at',
    ];

    protected $casts = [
        'mrr' => 'decimal:2',
        'arr' => 'decimal:2',
        'revenue_b2b' => 'decimal:2',
        'revenue_b2c' => 'decimal:2',
        'revenue_advertising' => 'decimal:2',
        'revenue_events' => 'decimal:2',
        'revenue_services' => 'decimal:2',
        'revenue_other' => 'decimal:2',
        'revenue_tier_free' => 'decimal:2',
        'revenue_tier_basic' => 'decimal:2',
        'revenue_tier_community_influencer' => 'decimal:2',
        'revenue_tier_premium' => 'decimal:2',
        'revenue_tier_enterprise' => 'decimal:2',
        'new_mrr' => 'decimal:2',
        'expansion_mrr' => 'decimal:2',
        'contraction_mrr' => 'decimal:2',
        'churned_mrr' => 'decimal:2',
        'net_new_mrr' => 'decimal:2',
        'total_paying_customers' => 'integer',
        'new_customers' => 'integer',
        'churned_customers' => 'integer',
        'net_new_customers' => 'integer',
        'arpu' => 'decimal:2',
        'ltv' => 'decimal:2',
        'cac' => 'decimal:2',
        'ltv_cac_ratio' => 'decimal:2',
        'communities_active' => 'integer',
        'communities_revenue_generating' => 'integer',
        'avg_revenue_per_community' => 'decimal:2',
        'snapshot_date' => 'date',
        'computed_at' => 'datetime',
    ];
}

