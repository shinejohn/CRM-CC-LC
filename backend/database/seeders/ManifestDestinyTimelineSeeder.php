<?php

namespace Database\Seeders;

use App\Enums\PipelineStage;
use App\Models\CampaignTimeline;
use App\Models\CampaignTimelineAction;
use Illuminate\Database\Seeder;

class ManifestDestinyTimelineSeeder extends Seeder
{
    public function run(): void
    {
        $timeline = CampaignTimeline::updateOrCreate(
            ['slug' => 'manifest-destiny-hook'],
            [
                'name' => 'Manifest Destiny — Hook Stage',
                'description' => 'Initial 30-day outreach sequence for newly discovered businesses during community rollout',
                'pipeline_stage' => PipelineStage::HOOK,
                'duration_days' => 30,
                'is_active' => true,
            ]
        );

        CampaignTimelineAction::where('campaign_timeline_id', $timeline->id)->delete();

        $actions = [
            ['day_number' => 1, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'welcome_community_launch', 'conditions' => null, 'parameters' => [], 'delay_hours' => 0, 'priority' => 0],
            ['day_number' => 1, 'channel' => 'internal', 'action_type' => 'send_notification', 'template_type' => null, 'conditions' => null, 'parameters' => ['notification_type' => 'new_lead_batch_internal'], 'delay_hours' => 1, 'priority' => 10],

            ['day_number' => 3, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'your_business_featured', 'conditions' => ['if' => 'email_opened', 'within_hours' => 48, 'then' => 'proceed'], 'parameters' => [], 'delay_hours' => 0, 'priority' => 0],

            ['day_number' => 5, 'channel' => 'system', 'action_type' => 'check_engagement', 'template_type' => null, 'conditions' => null, 'parameters' => ['threshold' => 10], 'delay_hours' => 0, 'priority' => 0],

            ['day_number' => 7, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'free_listing_claim', 'conditions' => null, 'parameters' => [], 'delay_hours' => 0, 'priority' => 0],

            ['day_number' => 10, 'channel' => 'sms', 'action_type' => 'send_sms', 'template_type' => 'listing_reminder_sms', 'conditions' => ['if' => 'email_opened', 'within_hours' => 72, 'then' => 'skip'], 'parameters' => [], 'delay_hours' => 0, 'priority' => 0],

            ['day_number' => 14, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'community_influencer_intro', 'conditions' => ['if' => 'engagement_score_above', 'threshold' => 30, 'then' => 'skip'], 'parameters' => [], 'delay_hours' => 0, 'priority' => 0],

            ['day_number' => 18, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'coupon_feature_offer', 'conditions' => null, 'parameters' => [], 'delay_hours' => 0, 'priority' => 0],

            ['day_number' => 21, 'channel' => 'system', 'action_type' => 'check_engagement', 'template_type' => null, 'conditions' => null, 'parameters' => ['threshold' => 20], 'delay_hours' => 0, 'priority' => 0],

            ['day_number' => 24, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'founder_pricing_urgency', 'conditions' => ['if' => 'founder_window_open'], 'parameters' => [], 'delay_hours' => 0, 'priority' => 0],

            ['day_number' => 28, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'last_chance_founder', 'conditions' => ['if' => 'founder_window_open'], 'parameters' => [], 'delay_hours' => 0, 'priority' => 0],

            ['day_number' => 30, 'channel' => 'system', 'action_type' => 'update_stage', 'template_type' => null, 'conditions' => null, 'parameters' => ['new_stage' => 'engagement'], 'delay_hours' => 0, 'priority' => 0],
        ];

        foreach ($actions as $row) {
            CampaignTimelineAction::create(array_merge($row, [
                'campaign_timeline_id' => $timeline->id,
                'campaign_id' => null,
                'is_active' => true,
            ]));
        }
    }
}
