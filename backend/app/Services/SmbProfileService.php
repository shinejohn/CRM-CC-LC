<?php

namespace App\Services;

use App\Models\Customer;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class SmbProfileService
{
    public function buildFullProfile(Customer $customer): array
    {
        $address = trim(implode(', ', array_filter([
            $customer->address_line1,
            $customer->address_line2,
            $customer->city,
            $customer->state,
            $customer->zip,
        ])));

        $metadata = $customer->metadata ?? [];
        $googleData = [
            'place_id' => $metadata['google_place_id'] ?? null,
            'rating' => $customer->google_rating ? (float) $customer->google_rating : null,
            'review_count' => $customer->google_review_count,
            'hours' => $customer->hours ?? [],
            'photos' => $metadata['photos'] ?? [],
            'address' => $address ?: $customer->address ?? null,
            'phone' => $customer->phone ?? $customer->primary_phone,
            'website' => $customer->website,
        ];

        $socialMedia = $customer->social_media ?? [];
        $enrichedData = [
            'owner_name' => $customer->owner_name,
            'owner_email' => $customer->email ?? $customer->primary_email,
            'facebook_url' => $socialMedia['facebook'] ?? null,
            'instagram_url' => $socialMedia['instagram'] ?? null,
            'website_description' => $customer->business_description,
            'website_services' => $customer->services ?? [],
            'sources_used' => $customer->data_sources ?? [],
        ];

        $surveyResponses = $customer->survey_responses ?? [];
        $aiContext = $customer->ai_context ?? [];
        $customerIntelligence = $customer->customer_intelligence ?? [];
        $competitorAnalysis = $customer->competitor_analysis ?? [];

        $campaignHistory = $this->getCampaignHistory($customer);

        $subscription = [
            'tier' => $customer->subscription_tier ?? 'free',
            'monthly_value' => $metadata['monthly_value'] ?? null,
            'estimated_ad_value_delivered' => $metadata['estimated_ad_value_delivered'] ?? null,
            'trial_days_remaining' => $customer->trial_ends_at ? max(0, now()->diffInDays($customer->trial_ends_at, false)) : null,
        ];

        $dataSources = $customer->data_sources ?? [];
        if ($customer->google_rating !== null) {
            $dataSources = array_values(array_unique(array_merge($dataSources, ['google_places'])));
        }
        if ($customer->website) {
            $dataSources = array_values(array_unique(array_merge($dataSources, ['website_scan'])));
        }
        if (!empty($surveyResponses)) {
            $dataSources = array_values(array_unique(array_merge($dataSources, ['owner_survey'])));
        }

        return [
            'id' => $customer->id,
            'community_id' => $customer->community_id,
            'name' => $customer->business_name,
            'category' => $customer->category ?? $customer->industry_category,
            'mapped_category' => $customer->industry_category ?? $customer->category,
            'google_data' => $googleData,
            'enriched_data' => $enrichedData,
            'survey_responses' => $surveyResponses,
            'ai_context' => $aiContext,
            'campaign_history' => $campaignHistory,
            'customer_intelligence' => $customerIntelligence,
            'competitor_analysis' => $competitorAnalysis,
            'subscription' => $subscription,
            'profile_completeness' => $customer->profile_completeness ?? $this->computeProfileCompleteness($customer),
            'data_sources' => $dataSources,
            'last_enriched_at' => $customer->last_enriched_at?->toIso8601String(),
        ];
    }

    public function getAIContext(Customer $customer): array
    {
        return [
            'business_name' => $customer->business_name,
            'owner_name' => $customer->owner_name,
            'ai_context' => $customer->ai_context ?? [],
            'survey_responses' => $customer->survey_responses ?? [],
            'brand_voice' => $customer->brand_voice ?? [],
            'unique_selling_points' => $customer->unique_selling_points ?? [],
            'business_description' => $customer->business_description,
            'products_services' => $customer->products_services ?? [],
            'target_audience' => $customer->target_audience ?? [],
        ];
    }

    public function buildIntelligenceSummary(Customer $customer): string
    {
        $parts = [];

        $parts[] = "Business: {$customer->business_name}";
        if ($customer->owner_name) {
            $parts[] = "Owner: {$customer->owner_name}";
        }
        if ($customer->business_description) {
            $parts[] = "Description: {$customer->business_description}";
        }
        if ($customer->industry_category) {
            $parts[] = "Category: {$customer->industry_category}";
        }
        if ($customer->unique_selling_points && is_array($customer->unique_selling_points)) {
            $parts[] = "Unique selling points: " . implode(', ', $customer->unique_selling_points);
        }
        if ($customer->products_services && is_array($customer->products_services)) {
            $parts[] = "Products/Services: " . json_encode($customer->products_services);
        }
        if ($customer->target_audience && is_array($customer->target_audience)) {
            $parts[] = "Target audience: " . json_encode($customer->target_audience);
        }
        if ($customer->brand_voice && is_array($customer->brand_voice)) {
            $parts[] = "Brand voice: " . json_encode($customer->brand_voice);
        }
        if ($customer->ai_context && is_array($customer->ai_context)) {
            $parts[] = "AI context: " . json_encode($customer->ai_context);
        }
        if ($customer->survey_responses && is_array($customer->survey_responses)) {
            $parts[] = "Survey responses: " . json_encode($customer->survey_responses);
        }
        if ($customer->customer_intelligence && is_array($customer->customer_intelligence)) {
            $parts[] = "Customer intelligence: " . json_encode($customer->customer_intelligence);
        }
        if ($customer->competitor_analysis && is_array($customer->competitor_analysis)) {
            $parts[] = "Competitor analysis: " . json_encode($customer->competitor_analysis);
        }

        return implode("\n\n", $parts);
    }

    private function getCampaignHistory(Customer $customer): array
    {
        $totalEmails = 0;
        $lastCampaignAt = null;

        if (Schema::hasTable('campaign_sends')) {
            $sends = DB::table('campaign_sends')
                ->where('smb_id', $customer->id)
                ->whereNotNull('sent_at')
                ->selectRaw('COUNT(*) as total, MAX(sent_at) as last_sent')
                ->first();
            if ($sends) {
                $totalEmails = (int) ($sends->total ?? 0);
                $lastCampaignAt = $sends->last_sent;
            }
        }

        return [
            'total_campaigns' => 0,
            'active_campaigns' => $customer->campaign_status === 'running' ? 1 : 0,
            'total_emails_sent' => $totalEmails,
            'avg_open_rate' => null,
            'avg_click_rate' => null,
            'last_campaign_at' => $lastCampaignAt,
        ];
    }

    private function computeProfileCompleteness(Customer $customer): int
    {
        $score = 0;
        $max = 0;
        $checks = [
            ['value' => $customer->business_name, 'weight' => 10],
            ['value' => $customer->category ?? $customer->industry_category, 'weight' => 5],
            ['value' => $customer->phone ?? $customer->primary_phone, 'weight' => 10],
            ['value' => $customer->email ?? $customer->primary_email, 'weight' => 10],
            ['value' => trim(implode(' ', array_filter([$customer->address_line1, $customer->city, $customer->state]))), 'weight' => 10],
            ['value' => $customer->website, 'weight' => 10],
            ['value' => $customer->hours, 'weight' => 5],
            ['value' => $customer->business_description, 'weight' => 10],
            ['value' => $customer->unique_selling_points, 'weight' => 10],
            ['value' => $customer->ai_context, 'weight' => 10],
            ['value' => $customer->survey_responses, 'weight' => 10],
        ];
        foreach ($checks as $c) {
            $max += $c['weight'];
            if (!empty($c['value'])) {
                $score += $c['weight'];
            }
        }
        return $max > 0 ? (int) round(100 * $score / $max) : 0;
    }
}
