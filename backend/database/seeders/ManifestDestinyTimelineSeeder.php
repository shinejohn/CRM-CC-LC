<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\PipelineStage;
use App\Models\CampaignTimeline;
use App\Models\CampaignTimelineAction;
use Illuminate\Database\Seeder;

final class ManifestDestinyTimelineSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedHookTimeline();
        $this->seedEducationTimeline();
        $this->seedHowtoTimeline();
    }

    /**
     * 90-day Hook trial timeline — maps to HOOK-001 through HOOK-015.
     *
     * The first 30 days mirror the original seeder (welcome → founder urgency),
     * then continues with higher-value offers through day 90.
     */
    private function seedHookTimeline(): void
    {
        $timeline = CampaignTimeline::updateOrCreate(
            ['slug' => 'manifest-destiny-hook'],
            [
                'name' => 'Manifest Destiny — Hook Stage',
                'description' => '90-day trial outreach: free listings → engagement → paid conversion',
                'pipeline_stage' => PipelineStage::HOOK,
                'duration_days' => 90,
                'is_active' => true,
            ]
        );

        CampaignTimelineAction::where('campaign_timeline_id', $timeline->id)->delete();

        $actions = [
            // Week 1: Claim + Event
            ['day_number' => 1, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'welcome_community_launch', 'campaign_id' => 'HOOK-001', 'conditions' => null, 'parameters' => ['subject' => 'Your business is already in our directory - claim it now', 'landing_page' => 'claim-your-listing']],
            ['day_number' => 1, 'channel' => 'internal', 'action_type' => 'send_notification', 'template_type' => null, 'campaign_id' => null, 'conditions' => null, 'parameters' => ['notification_type' => 'new_lead_batch_internal'], 'delay_hours' => 1, 'priority' => 10],
            ['day_number' => 3, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'your_business_featured', 'campaign_id' => null, 'conditions' => ['if' => 'email_opened', 'within_hours' => 48, 'then' => 'proceed']],
            ['day_number' => 5, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'hook_post_event', 'campaign_id' => 'HOOK-002', 'conditions' => null, 'parameters' => ['subject' => 'Got an event coming up? Post it free to 10,000+ locals', 'landing_page' => 'post-your-event']],

            // Week 2: Coupon + Engagement check
            ['day_number' => 7, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'free_listing_claim', 'campaign_id' => null, 'conditions' => null],
            ['day_number' => 10, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'hook_create_coupon', 'campaign_id' => 'HOOK-003', 'conditions' => null, 'parameters' => ['subject' => 'We drafted a coupon for {{business_name}} - publish it?', 'landing_page' => 'create-coupon']],
            ['day_number' => 10, 'channel' => 'sms', 'action_type' => 'send_sms', 'template_type' => 'listing_reminder_sms', 'campaign_id' => null, 'conditions' => ['if' => 'email_opened', 'within_hours' => 72, 'then' => 'skip'], 'priority' => 5],

            // Week 3: Featured + Classified
            ['day_number' => 14, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'community_influencer_intro', 'campaign_id' => null, 'conditions' => ['if' => 'engagement_score_above', 'threshold' => 30, 'then' => 'skip']],
            ['day_number' => 17, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'hook_get_featured', 'campaign_id' => 'HOOK-004', 'conditions' => null, 'parameters' => ['subject' => 'Apply to be featured in this week\'s spotlight', 'landing_page' => 'get-featured']],
            ['day_number' => 18, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'coupon_feature_offer', 'campaign_id' => null, 'conditions' => null],
            ['day_number' => 19, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'hook_post_classified', 'campaign_id' => 'HOOK-005', 'conditions' => null, 'parameters' => ['subject' => 'Hiring? Selling? Your classified is ready', 'landing_page' => 'post-classified']],

            // Week 4: Engagement check + CRM + Founder urgency
            ['day_number' => 21, 'channel' => 'system', 'action_type' => 'check_engagement', 'template_type' => null, 'campaign_id' => null, 'conditions' => null, 'parameters' => ['threshold' => 20]],
            ['day_number' => 24, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'founder_pricing_urgency', 'campaign_id' => null, 'conditions' => ['if' => 'founder_window_open']],
            ['day_number' => 25, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'hook_crm_integration', 'campaign_id' => 'HOOK-006', 'conditions' => null, 'parameters' => ['subject' => 'Connect your CRM and never lose a lead again', 'landing_page' => 'crm-integration']],
            ['day_number' => 28, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'last_chance_founder', 'campaign_id' => null, 'conditions' => ['if' => 'founder_window_open']],

            // Week 5: Featured listing upsell
            ['day_number' => 32, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'hook_featured_listing', 'campaign_id' => 'HOOK-007', 'conditions' => null, 'parameters' => ['subject' => 'Your listing could be getting 5x more views', 'landing_page' => 'featured-listing']],
            ['day_number' => 35, 'channel' => 'system', 'action_type' => 'check_engagement', 'template_type' => null, 'campaign_id' => null, 'conditions' => null, 'parameters' => ['threshold' => 30]],

            // Week 7: Newsletter + Sponsorship
            ['day_number' => 44, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'hook_newsletter_ad', 'campaign_id' => 'HOOK-008', 'conditions' => null, 'parameters' => ['subject' => 'Get in front of 10,000+ local subscribers this week', 'landing_page' => 'newsletter-advertising']],
            ['day_number' => 47, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'hook_become_sponsor', 'campaign_id' => 'HOOK-009', 'conditions' => null, 'parameters' => ['subject' => 'Sponsor our community events', 'landing_page' => 'become-sponsor']],

            // Week 8: Articles + Expert
            ['day_number' => 51, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'hook_article_ad', 'campaign_id' => 'HOOK-010', 'conditions' => null, 'parameters' => ['subject' => 'Get a feature article written about {{business_name}}', 'landing_page' => 'article-advertising']],
            ['day_number' => 54, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'hook_expert_reg', 'campaign_id' => 'HOOK-011', 'conditions' => null, 'parameters' => ['subject' => 'You\'re an expert. Let\'s make sure people know it.', 'landing_page' => 'expert-registration']],

            // Week 9: Influencer program
            ['day_number' => 58, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'hook_influencer', 'campaign_id' => 'HOOK-012', 'conditions' => null, 'parameters' => ['subject' => 'Local influencer opportunity', 'landing_page' => 'influencer-program']],

            // Week 10: Social posting + Holiday
            ['day_number' => 65, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'hook_social_trial', 'campaign_id' => 'HOOK-013', 'conditions' => null, 'parameters' => ['subject' => 'We\'ll post to your social media for free this week', 'landing_page' => 'social-posting-trial']],
            ['day_number' => 68, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'hook_holiday_events', 'campaign_id' => 'HOOK-014', 'conditions' => null, 'parameters' => ['subject' => 'Holiday event season is here', 'landing_page' => 'holiday-events']],

            // Week 11: Business nomination (final touch)
            ['day_number' => 72, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'hook_nomination', 'campaign_id' => 'HOOK-015', 'conditions' => null, 'parameters' => ['subject' => 'Someone nominated {{business_name}} for recognition', 'landing_page' => 'business-nomination']],

            // Day 80: Final engagement check
            ['day_number' => 80, 'channel' => 'system', 'action_type' => 'check_engagement', 'template_type' => null, 'campaign_id' => null, 'conditions' => null, 'parameters' => ['threshold' => 40]],

            // Day 90: Advance to engagement stage
            ['day_number' => 90, 'channel' => 'system', 'action_type' => 'update_stage', 'template_type' => null, 'campaign_id' => null, 'conditions' => null, 'parameters' => ['new_stage' => 'engagement']],
        ];

        $this->createActions($timeline->id, $actions);
    }

    /**
     * 60-day Education timeline — maps to EDU-001 through EDU-015.
     *
     * For businesses in the nurture stage: builds trust through education.
     */
    private function seedEducationTimeline(): void
    {
        $timeline = CampaignTimeline::updateOrCreate(
            ['slug' => 'manifest-destiny-education'],
            [
                'name' => 'Manifest Destiny ��� Education Stage',
                'description' => '60-day education sequence: thought leadership that builds trust and demonstrates platform value',
                'pipeline_stage' => PipelineStage::NURTURE,
                'duration_days' => 60,
                'is_active' => true,
            ]
        );

        CampaignTimelineAction::where('campaign_timeline_id', $timeline->id)->delete();

        $actions = [
            ['day_number' => 2, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'edu_the_new_day', 'campaign_id' => 'EDU-001', 'conditions' => null, 'parameters' => ['subject' => 'Something is happening in local marketing', 'landing_page' => 'the-new-day']],
            ['day_number' => 6, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'edu_ai_discovery', 'campaign_id' => 'EDU-002', 'conditions' => null, 'parameters' => ['subject' => 'Google is dying. Here\'s how people find businesses now.', 'landing_page' => 'ai-discovery']],
            ['day_number' => 10, 'channel' => 'system', 'action_type' => 'check_engagement', 'template_type' => null, 'campaign_id' => null, 'conditions' => null, 'parameters' => ['threshold' => 15]],
            ['day_number' => 12, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'edu_publishing_network', 'campaign_id' => 'EDU-003', 'conditions' => null, 'parameters' => ['subject' => 'One listing. Found everywhere. Here\'s how.', 'landing_page' => 'publishing-network']],
            ['day_number' => 16, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'edu_community_marketing', 'campaign_id' => 'EDU-004', 'conditions' => null, 'parameters' => ['subject' => 'Why \'community marketing\' beats \'digital marketing\'', 'landing_page' => 'community-marketing']],
            ['day_number' => 20, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'edu_reputation_ai', 'campaign_id' => 'EDU-005', 'conditions' => null, 'parameters' => ['subject' => 'Your reputation is now your algorithm', 'landing_page' => 'reputation-ai-age']],
            ['day_number' => 24, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'edu_ai_employee', 'campaign_id' => 'EDU-006', 'conditions' => null, 'parameters' => ['subject' => 'The employee you couldn\'t afford just became free', 'landing_page' => 'ai-employee']],
            ['day_number' => 28, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'edu_ai_content', 'campaign_id' => 'EDU-007', 'conditions' => null, 'parameters' => ['subject' => 'AI writes. You approve. Content happens.', 'landing_page' => 'ai-content']],
            ['day_number' => 30, 'channel' => 'system', 'action_type' => 'check_engagement', 'template_type' => null, 'campaign_id' => null, 'conditions' => null, 'parameters' => ['threshold' => 25]],
            ['day_number' => 32, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'edu_voice_ai', 'campaign_id' => 'EDU-008', 'conditions' => null, 'parameters' => ['subject' => 'Your phone can answer itself now', 'landing_page' => 'voice-ai']],
            ['day_number' => 36, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'edu_local_seo', 'campaign_id' => 'EDU-009', 'conditions' => null, 'parameters' => ['subject' => 'Local SEO isn\'t dead—it evolved', 'landing_page' => 'local-seo-guide']],
            ['day_number' => 40, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'edu_ai_content_guide', 'campaign_id' => 'EDU-010', 'conditions' => null, 'parameters' => ['subject' => 'AI can write your marketing. Here\'s how to make it actually good.', 'landing_page' => 'ai-content-guide']],
            ['day_number' => 44, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'edu_future_proof', 'campaign_id' => 'EDU-011', 'conditions' => null, 'parameters' => ['subject' => 'The businesses that survive the next 5 years will have this in common', 'landing_page' => 'future-proof-guide']],
            ['day_number' => 48, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'edu_data_privacy', 'campaign_id' => 'EDU-012', 'conditions' => null, 'parameters' => ['subject' => 'Your customers care about privacy', 'landing_page' => 'data-privacy-guide']],
            ['day_number' => 52, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'edu_competitive_intel', 'campaign_id' => 'EDU-013', 'conditions' => null, 'parameters' => ['subject' => 'What your competitors know about you', 'landing_page' => 'competitive-intelligence']],
            ['day_number' => 55, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'edu_ai_customer_service', 'campaign_id' => 'EDU-014', 'conditions' => null, 'parameters' => ['subject' => 'Your customers expect instant responses', 'landing_page' => 'ai-customer-service']],
            ['day_number' => 58, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'edu_ai_employees', 'campaign_id' => 'EDU-015', 'conditions' => null, 'parameters' => ['subject' => 'Meet your new AI employees', 'landing_page' => 'ai-employees-explained']],
            ['day_number' => 60, 'channel' => 'system', 'action_type' => 'update_stage', 'template_type' => null, 'campaign_id' => null, 'conditions' => null, 'parameters' => ['new_stage' => 'active']],
        ];

        $this->createActions($timeline->id, $actions);
    }

    /**
     * 90-day How-To timeline — maps to HOWTO-001 through HOWTO-030.
     *
     * For active subscribers: feature adoption + retention.
     */
    private function seedHowtoTimeline(): void
    {
        $timeline = CampaignTimeline::updateOrCreate(
            ['slug' => 'manifest-destiny-howto'],
            [
                'name' => 'Manifest Destiny — How-To Stage',
                'description' => '90-day feature adoption sequence for active subscribers: platform mastery → retention → upsell',
                'pipeline_stage' => PipelineStage::ACTIVE,
                'duration_days' => 90,
                'is_active' => true,
            ]
        );

        CampaignTimelineAction::where('campaign_timeline_id', $timeline->id)->delete();

        $actions = [
            ['day_number' => 1, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'howto_cc_basics', 'campaign_id' => 'HOWTO-001', 'conditions' => null, 'parameters' => ['subject' => 'Your Command Center is ready', 'landing_page' => 'command-center-basics']],
            ['day_number' => 3, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'howto_create_article', 'campaign_id' => 'HOWTO-002', 'conditions' => null, 'parameters' => ['subject' => 'How to get featured in local news', 'landing_page' => 'create-article']],
            ['day_number' => 6, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'howto_event_creation', 'campaign_id' => 'HOWTO-003', 'conditions' => null, 'parameters' => ['subject' => 'Post events that actually get attendance', 'landing_page' => 'event-creation-guide']],
            ['day_number' => 8, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'howto_venue_setup', 'campaign_id' => 'HOWTO-004', 'conditions' => null, 'parameters' => ['subject' => 'Turn your location into a destination', 'landing_page' => 'premium-venue-setup']],
            ['day_number' => 10, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'howto_performer_reg', 'campaign_id' => 'HOWTO-005', 'conditions' => null, 'parameters' => ['subject' => 'Get booked: Set up your performer profile', 'landing_page' => 'performer-registration']],
            ['day_number' => 13, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'howto_announcement', 'campaign_id' => 'HOWTO-006', 'conditions' => null, 'parameters' => ['subject' => 'Make news: How to post announcements', 'landing_page' => 'post-announcement']],
            ['day_number' => 15, 'channel' => 'system', 'action_type' => 'check_engagement', 'template_type' => null, 'campaign_id' => null, 'conditions' => null, 'parameters' => ['threshold' => 20]],
            ['day_number' => 17, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'howto_multi_community', 'campaign_id' => 'HOWTO-007', 'conditions' => null, 'parameters' => ['subject' => 'Expand your reach to multiple communities', 'landing_page' => 'multi-community-guide']],
            ['day_number' => 20, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'howto_ai_sales', 'campaign_id' => 'HOWTO-008', 'conditions' => null, 'parameters' => ['subject' => 'Let AI handle your initial customer conversations', 'landing_page' => 'ai-sales-setup']],
            ['day_number' => 24, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'howto_dashboard_tour', 'campaign_id' => 'HOWTO-009', 'conditions' => null, 'parameters' => ['subject' => 'Your dashboard explained: find everything in 5 minutes', 'landing_page' => 'dashboard-tour']],
            ['day_number' => 27, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'howto_social_connect', 'campaign_id' => 'HOWTO-010', 'conditions' => null, 'parameters' => ['subject' => 'Connect your social accounts in 5 minutes', 'landing_page' => 'social-connection-guide']],
            ['day_number' => 30, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'howto_email_marketing', 'campaign_id' => 'HOWTO-011', 'conditions' => null, 'parameters' => ['subject' => 'Set up email marketing in 10 minutes', 'landing_page' => 'email-marketing-setup']],
            ['day_number' => 33, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'howto_review_response', 'campaign_id' => 'HOWTO-012', 'conditions' => null, 'parameters' => ['subject' => 'How to respond to reviews (good and bad)', 'landing_page' => 'review-response-guide']],
            ['day_number' => 36, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'howto_auto_posting', 'campaign_id' => 'HOWTO-013', 'conditions' => null, 'parameters' => ['subject' => 'Set up auto-posting and never miss a day', 'landing_page' => 'automated-posting-guide']],
            ['day_number' => 39, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'howto_surveys', 'campaign_id' => 'HOWTO-014', 'conditions' => null, 'parameters' => ['subject' => 'Create customer surveys that get responses', 'landing_page' => 'customer-survey-setup']],
            ['day_number' => 42, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'howto_analytics', 'campaign_id' => 'HOWTO-015', 'conditions' => null, 'parameters' => ['subject' => 'Understand your analytics in 10 minutes', 'landing_page' => 'analytics-guide']],
            ['day_number' => 45, 'channel' => 'system', 'action_type' => 'check_engagement', 'template_type' => null, 'campaign_id' => null, 'conditions' => null, 'parameters' => ['threshold' => 30]],
            ['day_number' => 48, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'howto_lead_capture', 'campaign_id' => 'HOWTO-016', 'conditions' => null, 'parameters' => ['subject' => 'Capture leads from your website (finally)', 'landing_page' => 'lead-capture-guide']],
            ['day_number' => 51, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'howto_booking', 'campaign_id' => 'HOWTO-017', 'conditions' => null, 'parameters' => ['subject' => 'Let customers book appointments 24/7', 'landing_page' => 'appointment-booking-setup']],
            ['day_number' => 54, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'howto_invoicing', 'campaign_id' => 'HOWTO-018', 'conditions' => null, 'parameters' => ['subject' => 'Automate invoicing and get paid faster', 'landing_page' => 'invoice-automation-guide']],
            ['day_number' => 57, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'howto_sms', 'campaign_id' => 'HOWTO-019', 'conditions' => null, 'parameters' => ['subject' => 'Text your customers (the right way)', 'landing_page' => 'sms-marketing-guide']],
            ['day_number' => 60, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'howto_faq_builder', 'campaign_id' => 'HOWTO-020', 'conditions' => null, 'parameters' => ['subject' => 'Build an FAQ that answers questions first', 'landing_page' => 'faq-builder-guide']],
            ['day_number' => 63, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'howto_google_integration', 'campaign_id' => 'HOWTO-021', 'conditions' => null, 'parameters' => ['subject' => 'Connect Google Business Profile', 'landing_page' => 'google-integration-guide']],
            ['day_number' => 66, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'howto_workflow_automation', 'campaign_id' => 'HOWTO-022', 'conditions' => null, 'parameters' => ['subject' => 'Save 10+ hours weekly with automation', 'landing_page' => 'workflow-automation-guide']],
            ['day_number' => 69, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'howto_reports', 'campaign_id' => 'HOWTO-023', 'conditions' => null, 'parameters' => ['subject' => 'Generate business reports automatically', 'landing_page' => 'report-generation-guide']],
            ['day_number' => 72, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'howto_segmentation', 'campaign_id' => 'HOWTO-024', 'conditions' => null, 'parameters' => ['subject' => 'Segment customers for targeted marketing', 'landing_page' => 'customer-segmentation-guide']],
            ['day_number' => 75, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'howto_ai_training', 'campaign_id' => 'HOWTO-025', 'conditions' => null, 'parameters' => ['subject' => 'Train AI to sound like your business', 'landing_page' => 'ai-training-guide']],
            ['day_number' => 78, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'howto_integrations', 'campaign_id' => 'HOWTO-026', 'conditions' => null, 'parameters' => ['subject' => 'Connect your favorite tools in minutes', 'landing_page' => 'integration-marketplace']],
            ['day_number' => 81, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'howto_team', 'campaign_id' => 'HOWTO-027', 'conditions' => null, 'parameters' => ['subject' => 'Set up your team for collaboration', 'landing_page' => 'team-collaboration-guide']],
            ['day_number' => 84, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'howto_content_calendar', 'campaign_id' => 'HOWTO-028', 'conditions' => null, 'parameters' => ['subject' => 'Plan your content like a pro', 'landing_page' => 'content-calendar-guide']],
            ['day_number' => 87, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'howto_roi_tracking', 'campaign_id' => 'HOWTO-029', 'conditions' => null, 'parameters' => ['subject' => 'Know exactly what\'s working', 'landing_page' => 'roi-tracking-guide']],
            ['day_number' => 90, 'channel' => 'email', 'action_type' => 'send_email', 'template_type' => 'howto_success_playbook', 'campaign_id' => 'HOWTO-030', 'conditions' => null, 'parameters' => ['subject' => 'Your complete playbook for sustainable growth', 'landing_page' => 'success-playbook']],
        ];

        $this->createActions($timeline->id, $actions);
    }

    /**
     * Persist timeline action rows with sensible defaults.
     */
    private function createActions(int $timelineId, array $actions): void
    {
        foreach ($actions as $idx => $row) {
            CampaignTimelineAction::create([
                'campaign_timeline_id' => $timelineId,
                'day_number' => $row['day_number'],
                'channel' => $row['channel'],
                'action_type' => $row['action_type'],
                'template_type' => $row['template_type'] ?? null,
                'campaign_id' => $row['campaign_id'] ?? null,
                'conditions' => $row['conditions'] ?? null,
                'parameters' => $row['parameters'] ?? [],
                'delay_hours' => $row['delay_hours'] ?? 0,
                'priority' => $row['priority'] ?? 0,
                'is_active' => true,
            ]);
        }
    }
}
