<?php

namespace App\Models\Operations;

use Illuminate\Database\Eloquent\Model;

class PipelineMetric extends Model
{
    protected $table = 'ops.pipeline_metrics';
    
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'snapshot_date',
        'leads_total',
        'leads_new_today',
        'prospects_total',
        'prospects_in_hook_trial',
        'opportunities_total',
        'opportunities_value',
        'customers_converting_today',
        'customers_total',
        'lead_to_prospect_rate',
        'prospect_to_opportunity_rate',
        'opportunity_to_customer_rate',
        'overall_conversion_rate',
        'avg_days_lead_to_customer',
        'avg_days_in_hook_trial',
        'campaign_emails_sent',
        'campaign_emails_opened',
        'campaign_open_rate',
        'campaign_clicks',
        'campaign_click_rate',
        'communities_with_pipeline',
        'avg_pipeline_per_community',
        'projected_conversions_7d',
        'projected_mrr_7d',
        'projected_conversions_30d',
        'projected_mrr_30d',
        'computed_at',
    ];

    protected $casts = [
        'lead_to_prospect_rate' => 'decimal:4',
        'prospect_to_opportunity_rate' => 'decimal:4',
        'opportunity_to_customer_rate' => 'decimal:4',
        'overall_conversion_rate' => 'decimal:4',
        'opportunities_value' => 'decimal:2',
        'projected_mrr_7d' => 'decimal:2',
        'projected_mrr_30d' => 'decimal:2',
        'avg_days_lead_to_customer' => 'decimal:2',
        'avg_days_in_hook_trial' => 'decimal:2',
        'campaign_open_rate' => 'decimal:4',
        'campaign_click_rate' => 'decimal:4',
        'avg_pipeline_per_community' => 'decimal:2',
        'leads_total' => 'integer',
        'leads_new_today' => 'integer',
        'prospects_total' => 'integer',
        'prospects_in_hook_trial' => 'integer',
        'opportunities_total' => 'integer',
        'customers_converting_today' => 'integer',
        'customers_total' => 'integer',
        'campaign_emails_sent' => 'integer',
        'campaign_emails_opened' => 'integer',
        'campaign_clicks' => 'integer',
        'communities_with_pipeline' => 'integer',
        'projected_conversions_7d' => 'integer',
        'projected_conversions_30d' => 'integer',
        'snapshot_date' => 'date',
        'computed_at' => 'datetime',
    ];
}

