<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\EmailTemplate;
use App\Models\SmsTemplate;
use Illuminate\Database\Seeder;

/**
 * Seeds email + SMS templates for all three Manifest Destiny timelines.
 *
 * Every `template_type` referenced in ManifestDestinyTimelineSeeder must
 * have a matching template here or in tenant-specific overrides.
 */
final class ManifestDestinyEmailTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $tenantId = (string) config('fibonacco.system_tenant_id', '00000000-0000-0000-0000-000000000001');

        $vars = ['business_name', 'community_name', 'customer_name', 'city', 'listing_url', 'founder_days_remaining'];

        // ─── Hook Stage Templates ─────────────────────────────────
        $hookTemplates = [
            [
                'slug' => 'welcome_community_launch',
                'name' => 'Welcome — Community Launch',
                'subject' => 'Your community just got its own Day.News platform',
                'html_content' => '<p>Hi {{customer_name}},</p><p>{{community_name}} now has a daily local news platform powered by <strong>Day.News</strong>, and your business—<strong>{{business_name}}</strong>—is already part of the story neighbors will read.</p><p>You do not need to sign up again; we built the first wave of listings from public information so the site feels complete on day one. Review your free listing here: <a href="{{listing_url}}">{{listing_url}}</a></p><p>We are excited to help {{city}} businesses reach the community without shouting into the void of social feeds.</p><p>— The Day.News team</p>',
                'text_content' => "Hi {{customer_name}},\n\n{{community_name}} now has a Day.News local platform. Your business {{business_name}} is listed. View: {{listing_url}}\n\n— Day.News",
            ],
            [
                'slug' => 'your_business_featured',
                'name' => 'Your business featured',
                'subject' => 'We already wrote about {{business_name}} on Day.News',
                'html_content' => '<p>Hi {{customer_name}},</p><p>Editors at <strong>Day.News</strong> included <strong>{{business_name}}</strong> in early coverage for {{community_name}}. It is a light-touch mention today—and a chance to claim your profile, add hours, and show up correctly when locals search.</p><p><a href="{{listing_url}}">Review your listing</a></p>',
                'text_content' => 'Hi {{customer_name}}, Day.News featured {{business_name}} in {{community_name}}. Claim your listing: {{listing_url}}',
            ],
            [
                'slug' => 'free_listing_claim',
                'name' => 'Free listing claim',
                'subject' => 'Claim your free business listing on Day.News',
                'html_content' => '<p>Hi {{customer_name}},</p><p>Your free listing for <strong>{{business_name}}</strong> is waiting. Claiming takes a minute and helps neighbors find you on {{community_name}}\'s Day.News site.</p><p><a href="{{listing_url}}">Claim my listing</a></p>',
                'text_content' => 'Claim your free Day.News listing for {{business_name}}: {{listing_url}}',
            ],
            [
                'slug' => 'community_influencer_intro',
                'name' => 'Community influencer intro',
                'subject' => 'How neighbors are using Day.News in {{community_name}}',
                'html_content' => '<p>Hi {{customer_name}},</p><p>Local businesses near you are using <strong>Day.News</strong> to stay visible without expensive ad buys. Here is a quick snapshot of what an influencer-style package can look like—and why it matters in {{community_name}}.</p><p>Questions? Hit reply; we read every message.</p>',
                'text_content' => 'See how businesses use Day.News in {{community_name}}. Reply with questions.',
            ],
            [
                'slug' => 'coupon_feature_offer',
                'name' => 'Coupon feature offer',
                'subject' => 'Post a free coupon on Day.News for {{community_name}}',
                'html_content' => '<p>Hi {{customer_name}},</p><p>You can publish a limited-time coupon on <strong>Day.News</strong> so nearby readers can redeem it in store or online. It is a simple way to turn attention into visits for {{business_name}}.</p><p><a href="{{listing_url}}">Open your listing hub</a></p>',
                'text_content' => 'Publish a free coupon for {{business_name}} on Day.News: {{listing_url}}',
            ],
            [
                'slug' => 'founder_pricing_urgency',
                'name' => 'Founder pricing urgency',
                'subject' => 'Founder pricing: {{founder_days_remaining}} days left for {{community_name}}',
                'html_content' => '<p>Hi {{customer_name}},</p><p>The founder window for <strong>Day.News</strong> in {{community_name}} is closing. Lock in founder rates while they are still available—after that, standard community pricing applies.</p><p><a href="{{listing_url}}">Review options</a></p>',
                'text_content' => 'Founder pricing ends in {{founder_days_remaining}} days for Day.News in {{community_name}}. Details: {{listing_url}}',
            ],
            [
                'slug' => 'last_chance_founder',
                'name' => 'Last chance founder',
                'subject' => 'Final notice: founder pricing for Day.News in {{community_name}}',
                'html_content' => '<p>Hi {{customer_name}},</p><p>This is a short final note: founder pricing for <strong>Day.News</strong> in {{community_name}} is almost gone. If you want to secure the rate for {{business_name}}, act this week.</p><p><a href="{{listing_url}}">Secure founder pricing</a></p>',
                'text_content' => 'Last chance for founder Day.News pricing in {{community_name}}: {{listing_url}}',
            ],
            // New HOOK templates (WS-5 gap closure)
            [
                'slug' => 'hook_post_event',
                'name' => 'Hook — Post your event',
                'subject' => 'Got an event coming up? Post it free to 10,000+ locals',
                'html_content' => '<p>Hi {{customer_name}},</p><p>Got something happening at <strong>{{business_name}}</strong>? Thousands of neighbors in {{community_name}} are reading Day.News daily. Post your event for free and get it in front of people who actually live nearby.</p><p><a href="{{listing_url}}">Post your event</a></p>',
                'text_content' => 'Post your event for free on Day.News ({{community_name}}): {{listing_url}}',
            ],
            [
                'slug' => 'hook_create_coupon',
                'name' => 'Hook — Create a coupon',
                'subject' => 'We drafted a coupon for {{business_name}} - publish it?',
                'html_content' => '<p>Hi {{customer_name}},</p><p>We created a draft coupon for <strong>{{business_name}}</strong> based on what works for similar businesses in {{community_name}}. You can edit and publish it in under a minute.</p><p><a href="{{listing_url}}">Review your coupon</a></p>',
                'text_content' => 'A draft coupon for {{business_name}} is ready on Day.News: {{listing_url}}',
            ],
            [
                'slug' => 'hook_get_featured',
                'name' => 'Hook — Get featured',
                'subject' => 'Apply to be featured in this week\'s spotlight',
                'html_content' => '<p>Hi {{customer_name}},</p><p>Each week, Day.News spotlights one business in {{community_name}}. It is free, and the coverage reaches everyone on the platform. Apply for <strong>{{business_name}}</strong> now.</p><p><a href="{{listing_url}}">Apply for spotlight</a></p>',
                'text_content' => 'Apply for the Day.News weekly spotlight in {{community_name}}: {{listing_url}}',
            ],
            [
                'slug' => 'hook_post_classified',
                'name' => 'Hook — Post classified',
                'subject' => 'Hiring? Selling? Your classified is ready',
                'html_content' => '<p>Hi {{customer_name}},</p><p>Classifieds on Day.News reach verified locals in {{community_name}}. Whether <strong>{{business_name}}</strong> is hiring, selling equipment, or posting a special offer—it is free to list.</p><p><a href="{{listing_url}}">Post a classified</a></p>',
                'text_content' => 'Post a free classified for {{business_name}} on Day.News: {{listing_url}}',
            ],
            [
                'slug' => 'hook_crm_integration',
                'name' => 'Hook — CRM integration',
                'subject' => 'Connect your CRM and never lose a lead again',
                'html_content' => '<p>Hi {{customer_name}},</p><p>When someone claims a coupon or responds to your listing on Day.News, the lead goes directly to your CRM. No copy-paste, no missed opportunities for <strong>{{business_name}}</strong>.</p><p><a href="{{listing_url}}">Set up integration</a></p>',
                'text_content' => 'Connect your CRM to Day.News for {{business_name}}: {{listing_url}}',
            ],
            [
                'slug' => 'hook_featured_listing',
                'name' => 'Hook — Featured listing',
                'subject' => 'Your listing could be getting 5x more views',
                'html_content' => '<p>Hi {{customer_name}},</p><p>Featured listings in {{community_name}} get 5x more views than standard listings. <strong>{{business_name}}</strong> qualifies for a featured upgrade.</p><p><a href="{{listing_url}}">See featured options</a></p>',
                'text_content' => '{{business_name}} qualifies for featured listing on Day.News: {{listing_url}}',
            ],
            [
                'slug' => 'hook_newsletter_ad',
                'name' => 'Hook — Newsletter advertising',
                'subject' => 'Get in front of 10,000+ local subscribers this week',
                'html_content' => '<p>Hi {{customer_name}},</p><p>The Day.News newsletter goes out to 10,000+ subscribers in {{community_name}} every day. Place <strong>{{business_name}}</strong> in front of engaged local readers.</p><p><a href="{{listing_url}}">See newsletter options</a></p>',
                'text_content' => 'Advertise {{business_name}} in the Day.News newsletter: {{listing_url}}',
            ],
            [
                'slug' => 'hook_become_sponsor',
                'name' => 'Hook — Become a sponsor',
                'subject' => 'Sponsor our community events—your brand everywhere locals gather',
                'html_content' => '<p>Hi {{customer_name}},</p><p>Community sponsors in {{community_name}} get their brand on every event page, newsletter, and social post. Premium visibility for <strong>{{business_name}}</strong> with zero content creation required.</p><p><a href="{{listing_url}}">Explore sponsorship</a></p>',
                'text_content' => 'Explore sponsorship for {{business_name}} in {{community_name}}: {{listing_url}}',
            ],
            [
                'slug' => 'hook_article_ad',
                'name' => 'Hook — Article advertising',
                'subject' => 'Get a feature article written about {{business_name}}',
                'html_content' => '<p>Hi {{customer_name}},</p><p>Our editorial team can write a feature article about <strong>{{business_name}}</strong> for Day.News. Published articles reach thousands and rank in local search results.</p><p><a href="{{listing_url}}">Learn more</a></p>',
                'text_content' => 'Get a feature article about {{business_name}} on Day.News: {{listing_url}}',
            ],
            [
                'slug' => 'hook_expert_reg',
                'name' => 'Hook — Expert registration',
                'subject' => 'You\'re an expert. Let\'s make sure people know it.',
                'html_content' => '<p>Hi {{customer_name}},</p><p>Day.News is building a directory of trusted local experts in {{community_name}}. Register <strong>{{business_name}}</strong> as an expert in your field and get featured in relevant stories.</p><p><a href="{{listing_url}}">Register as expert</a></p>',
                'text_content' => 'Register {{business_name}} as a local expert: {{listing_url}}',
            ],
            [
                'slug' => 'hook_influencer',
                'name' => 'Hook — Influencer program',
                'subject' => 'Local influencer opportunity—get paid to share what you love',
                'html_content' => '<p>Hi {{customer_name}},</p><p>Community influencers on Day.News get premium placement, story mentions, and dedicated support. <strong>{{business_name}}</strong> is a great fit for the {{community_name}} influencer program.</p><p><a href="{{listing_url}}">Apply now</a></p>',
                'text_content' => 'Apply for the Day.News influencer program: {{listing_url}}',
            ],
            [
                'slug' => 'hook_social_trial',
                'name' => 'Hook — Social posting trial',
                'subject' => 'We\'ll post to your social media for free this week',
                'html_content' => '<p>Hi {{customer_name}},</p><p>For one week, we will create and post social media content for <strong>{{business_name}}</strong> based on what is happening in {{community_name}}. No cost, no commitment—just see if it works.</p><p><a href="{{listing_url}}">Start free trial</a></p>',
                'text_content' => 'Free social media posting trial for {{business_name}}: {{listing_url}}',
            ],
            [
                'slug' => 'hook_holiday_events',
                'name' => 'Hook — Holiday events',
                'subject' => 'Holiday event season is here—don\'t miss your chance to participate',
                'html_content' => '<p>Hi {{customer_name}},</p><p>{{community_name}} has holiday events coming up and local businesses are signing up for booths, sponsorships, and promotions. Make sure <strong>{{business_name}}</strong> is part of the festivities.</p><p><a href="{{listing_url}}">See holiday events</a></p>',
                'text_content' => 'Holiday events in {{community_name}} — sign up {{business_name}}: {{listing_url}}',
            ],
            [
                'slug' => 'hook_nomination',
                'name' => 'Hook — Business nomination',
                'subject' => 'Someone nominated {{business_name}} for recognition',
                'html_content' => '<p>Hi {{customer_name}},</p><p>A member of the {{community_name}} community nominated <strong>{{business_name}}</strong> for local business recognition on Day.News. Accept the nomination to be featured.</p><p><a href="{{listing_url}}">Accept nomination</a></p>',
                'text_content' => '{{business_name}} was nominated for recognition in {{community_name}}: {{listing_url}}',
            ],
        ];

        // ─── Education Stage Templates ────────────────────────────
        $eduTemplates = $this->buildGenericTemplates('edu', [
            ['slug' => 'edu_the_new_day', 'name' => 'EDU — The New Day', 'subject' => 'Something is happening in local marketing', 'body' => 'A quiet revolution is underway in how local businesses get found. Community-powered platforms are replacing the pay-to-play model. See what it means for {{business_name}}.'],
            ['slug' => 'edu_ai_discovery', 'name' => 'EDU — AI Discovery', 'subject' => 'Google is dying. Here\'s how people find businesses now.', 'body' => 'The way customers discover local businesses is changing fast. AI assistants, community platforms, and voice search are replacing traditional search. Here is what {{business_name}} needs to know.'],
            ['slug' => 'edu_publishing_network', 'name' => 'EDU — Publishing Network', 'subject' => 'One listing. Found everywhere. Here\'s how.', 'body' => 'When {{business_name}} is on Day.News, your listing appears across multiple community apps — not just one. One update, everywhere at once.'],
            ['slug' => 'edu_community_marketing', 'name' => 'EDU — Community Marketing', 'subject' => 'Why \'community marketing\' beats \'digital marketing\'', 'body' => 'Digital marketing is noisy. Community marketing reaches the people who actually live near {{business_name}}. Here is the difference and why it matters.'],
            ['slug' => 'edu_reputation_ai', 'name' => 'EDU — Reputation in AI Age', 'subject' => 'Your reputation is now your algorithm', 'body' => 'AI systems are now deciding which businesses to recommend. Your reputation — reviews, mentions, community presence — is the new algorithm for {{business_name}}.'],
            ['slug' => 'edu_ai_employee', 'name' => 'EDU — AI Employee', 'subject' => 'The employee you couldn\'t afford just became free', 'body' => 'AI can now handle customer inquiries, social media, and content creation for {{business_name}}. It is not a gimmick — it is a real productivity multiplier.'],
            ['slug' => 'edu_ai_content', 'name' => 'EDU �� AI Content', 'subject' => 'AI writes. You approve. Content happens.', 'body' => 'Consistent content is how {{business_name}} stays visible. AI can draft it; you just approve. No writing skills needed.'],
            ['slug' => 'edu_voice_ai', 'name' => 'EDU — Voice AI', 'subject' => 'Your phone can answer itself now', 'body' => 'Voice AI can answer calls, take messages, and even book appointments for {{business_name}} — 24 hours a day, 7 days a week.'],
            ['slug' => 'edu_local_seo', 'name' => 'EDU — Local SEO Guide', 'subject' => 'Local SEO isn\'t dead—it evolved', 'body' => 'Search is changing, but local visibility still matters. Here is what actually works now for businesses like {{business_name}} in {{community_name}}.'],
            ['slug' => 'edu_ai_content_guide', 'name' => 'EDU — AI Content Guide', 'subject' => 'AI can write your marketing. Here\'s how to make it actually good.', 'body' => 'AI-generated content works — when you know how to guide it. Quick tips for {{business_name}} to get marketing copy that sounds human.'],
            ['slug' => 'edu_future_proof', 'name' => 'EDU — Future-Proof Guide', 'subject' => 'The businesses that survive the next 5 years will have this in common', 'body' => 'The businesses thriving in 2031 will share a few key traits. Here is what {{business_name}} can start doing today to be one of them.'],
            ['slug' => 'edu_data_privacy', 'name' => 'EDU — Data Privacy', 'subject' => 'Your customers care about privacy', 'body' => 'Privacy-conscious businesses earn more trust. Here is what {{business_name}} should know about data privacy in {{community_name}}.'],
            ['slug' => 'edu_competitive_intel', 'name' => 'EDU — Competitive Intelligence', 'subject' => 'What your competitors know about you', 'body' => 'Competitive intelligence is not spying — it is smart business. Here is how {{business_name}} can understand the local landscape.'],
            ['slug' => 'edu_ai_customer_service', 'name' => 'EDU — AI Customer Service', 'subject' => 'Your customers expect instant responses', 'body' => 'Response time is the new differentiator. AI can help {{business_name}} respond instantly, even after hours.'],
            ['slug' => 'edu_ai_employees', 'name' => 'EDU — AI Employees Explained', 'subject' => 'Meet your new AI employees', 'body' => 'AI employees do not need coffee breaks, but they can handle customer service, content, and scheduling for {{business_name}}.'],
        ]);

        // ─── How-To Stage Templates ──────────────────────────────
        $howtoTemplates = $this->buildGenericTemplates('howto', [
            ['slug' => 'howto_cc_basics', 'name' => 'HOWTO — Command Center Basics', 'subject' => 'Your Command Center is ready - here\'s how to use it', 'body' => 'Everything you need to manage {{business_name}} on Day.News is in one place. Here is a quick tour of your Command Center in {{community_name}}.'],
            ['slug' => 'howto_create_article', 'name' => 'HOWTO — Create Article', 'subject' => 'How to get featured in local news', 'body' => 'Getting {{business_name}} mentioned in Day.News stories is easier than you think. Here is how to submit a pitch or let AI draft one for you.'],
            ['slug' => 'howto_event_creation', 'name' => 'HOWTO — Event Creation', 'subject' => 'Post events that actually get attendance', 'body' => 'Events on Day.News get promoted to the entire {{community_name}} readership. Here is how to create one for {{business_name}}.'],
            ['slug' => 'howto_venue_setup', 'name' => 'HOWTO — Venue Setup', 'subject' => 'Turn your location into a destination', 'body' => 'If {{business_name}} has a physical location, setting up a venue profile unlocks event hosting, performer booking, and community visibility.'],
            ['slug' => 'howto_performer_reg', 'name' => 'HOWTO — Performer Registration', 'subject' => 'Get booked: Set up your performer profile', 'body' => 'Performers and entertainers in {{community_name}} can get booked through Day.News. Set up your profile for {{business_name}}.'],
            ['slug' => 'howto_announcement', 'name' => 'HOWTO — Post Announcement', 'subject' => 'Make news: How to post announcements', 'body' => 'Announcements from {{business_name}} reach the entire {{community_name}} readership. New hours, special offers, team updates — post them in seconds.'],
            ['slug' => 'howto_multi_community', 'name' => 'HOWTO — Multi-Community Guide', 'subject' => 'Expand your reach to multiple communities', 'body' => '{{business_name}} can be visible in multiple Day.News communities at once. Here is how to expand your reach beyond {{community_name}}.'],
            ['slug' => 'howto_ai_sales', 'name' => 'HOWTO — AI Sales Setup', 'subject' => 'Let AI handle your initial customer conversations', 'body' => 'AI can qualify leads, answer common questions, and book appointments for {{business_name}} — 24/7, no training required.'],
            ['slug' => 'howto_dashboard_tour', 'name' => 'HOWTO — Dashboard Tour', 'subject' => 'Your dashboard explained: find everything in 5 minutes', 'body' => 'Your Day.News dashboard shows everything: listings, analytics, messages, and more. Here is a 5-minute guide for {{business_name}}.'],
            ['slug' => 'howto_social_connect', 'name' => 'HOWTO — Social Connection', 'subject' => 'Connect your social accounts in 5 minutes', 'body' => 'Link {{business_name}}\'s social accounts and post to all platforms from one place. Takes 5 minutes.'],
            ['slug' => 'howto_email_marketing', 'name' => 'HOWTO — Email Marketing', 'subject' => 'Set up email marketing in 10 minutes', 'body' => 'Email marketing for {{business_name}} is built into your Command Center. Set it up in 10 minutes and start reaching {{community_name}} subscribers.'],
            ['slug' => 'howto_review_response', 'name' => 'HOWTO — Review Response', 'subject' => 'How to respond to reviews (good and bad)', 'body' => 'Reviews shape reputation. Here is how {{business_name}} should respond to both positive and negative reviews on Day.News.'],
            ['slug' => 'howto_auto_posting', 'name' => 'HOWTO — Auto Posting', 'subject' => 'Set up auto-posting and never miss a day', 'body' => 'Consistent posting keeps {{business_name}} visible. Set up auto-posting and let AI handle the daily content.'],
            ['slug' => 'howto_surveys', 'name' => 'HOWTO — Customer Surveys', 'subject' => 'Create customer surveys that get responses', 'body' => 'Customer feedback drives improvement. Here is how {{business_name}} can create surveys that actually get completed.'],
            ['slug' => 'howto_analytics', 'name' => 'HOWTO — Analytics Guide', 'subject' => 'Understand your analytics in 10 minutes', 'body' => 'Your Day.News analytics show exactly how {{business_name}} is performing in {{community_name}}. Here is what each metric means.'],
            ['slug' => 'howto_lead_capture', 'name' => 'HOWTO — Lead Capture', 'subject' => 'Capture leads from your website (finally)', 'body' => 'When someone visits {{business_name}} on Day.News, capture their info automatically. No more missed leads.'],
            ['slug' => 'howto_booking', 'name' => 'HOWTO — Appointment Booking', 'subject' => 'Let customers book appointments 24/7', 'body' => 'Online booking for {{business_name}} means customers can schedule anytime. Set it up in your Command Center.'],
            ['slug' => 'howto_invoicing', 'name' => 'HOWTO — Invoice Automation', 'subject' => 'Automate invoicing and get paid faster', 'body' => 'Automated invoicing for {{business_name}} means less admin work and faster payments. Here is how to set it up.'],
            ['slug' => 'howto_sms', 'name' => 'HOWTO — SMS Marketing', 'subject' => 'Text your customers (the right way)', 'body' => 'SMS marketing has the highest open rate of any channel. Here is how {{business_name}} can use it effectively and compliantly.'],
            ['slug' => 'howto_faq_builder', 'name' => 'HOWTO — FAQ Builder', 'subject' => 'Build an FAQ that answers questions first', 'body' => 'A good FAQ reduces support load and builds trust. Build one for {{business_name}} using AI-assisted suggestions.'],
            ['slug' => 'howto_google_integration', 'name' => 'HOWTO — Google Integration', 'subject' => 'Connect Google Business Profile', 'body' => 'Sync {{business_name}}\'s Google Business Profile with Day.News for maximum local visibility.'],
            ['slug' => 'howto_workflow_automation', 'name' => 'HOWTO — Workflow Automation', 'subject' => 'Save 10+ hours weekly with automation', 'body' => 'Automate repetitive tasks for {{business_name}}: follow-ups, social posts, review requests, and more.'],
            ['slug' => 'howto_reports', 'name' => 'HOWTO — Report Generation', 'subject' => 'Generate business reports automatically', 'body' => 'Weekly and monthly reports for {{business_name}} — generated automatically, delivered to your inbox.'],
            ['slug' => 'howto_segmentation', 'name' => 'HOWTO — Customer Segmentation', 'subject' => 'Segment customers for targeted marketing', 'body' => 'Not all customers are the same. Segment {{business_name}}\'s audience for targeted messages that actually convert.'],
            ['slug' => 'howto_ai_training', 'name' => 'HOWTO �� AI Training', 'subject' => 'Train AI to sound like your business', 'body' => 'AI content for {{business_name}} can match your voice and tone. Here is how to train it using your best examples.'],
            ['slug' => 'howto_integrations', 'name' => 'HOWTO — Integration Marketplace', 'subject' => 'Connect your favorite tools in minutes', 'body' => 'Day.News integrates with the tools {{business_name}} already uses. Connect them from your Command Center.'],
            ['slug' => 'howto_team', 'name' => 'HOWTO — Team Collaboration', 'subject' => 'Set up your team for collaboration', 'body' => 'Add team members to {{business_name}}\'s Day.News account with the right permissions. Collaborate without stepping on toes.'],
            ['slug' => 'howto_content_calendar', 'name' => 'HOWTO — Content Calendar', 'subject' => 'Plan your content like a pro', 'body' => 'A content calendar keeps {{business_name}} consistent. Plan posts, articles, and events weeks ahead.'],
            ['slug' => 'howto_roi_tracking', 'name' => 'HOWTO — ROI Tracking', 'subject' => 'Know exactly what\'s working', 'body' => 'Track which activities drive results for {{business_name}}. Your ROI dashboard shows exactly where your investment pays off.'],
            ['slug' => 'howto_success_playbook', 'name' => 'HOWTO — Success Playbook', 'subject' => 'Your complete playbook for sustainable growth', 'body' => 'After 90 days on Day.News, {{business_name}} has everything in place. Here is your complete playbook for ongoing growth in {{community_name}}.'],
        ]);

        $allTemplates = array_merge($hookTemplates, $eduTemplates, $howtoTemplates);

        foreach ($allTemplates as $tpl) {
            EmailTemplate::withoutGlobalScopes()->updateOrCreate(
                ['slug' => $tpl['slug'], 'tenant_id' => $tenantId],
                [
                    'name' => $tpl['name'],
                    'subject' => $tpl['subject'],
                    'html_content' => $tpl['html_content'],
                    'text_content' => $tpl['text_content'],
                    'variables' => $vars,
                    'is_active' => true,
                ]
            );
        }

        // SMS template
        SmsTemplate::withoutGlobalScopes()->updateOrCreate(
            ['slug' => 'listing_reminder_sms', 'tenant_id' => $tenantId],
            [
                'name' => 'Listing reminder SMS',
                'message' => 'Day.News: Your free listing for {{business_name}} in {{community_name}} is ready. Open {{listing_url}} to claim.',
                'variables' => ['business_name', 'community_name', 'listing_url'],
                'is_active' => true,
            ]
        );
    }

    /**
     * Build a set of templates from compact definitions.
     *
     * @return list<array{slug: string, name: string, subject: string, html_content: string, text_content: string}>
     */
    private function buildGenericTemplates(string $prefix, array $defs): array
    {
        $out = [];
        foreach ($defs as $d) {
            $out[] = [
                'slug' => $d['slug'],
                'name' => $d['name'],
                'subject' => $d['subject'],
                'html_content' => '<p>Hi {{customer_name}},</p><p>' . $d['body'] . '</p><p><a href="{{listing_url}}">Learn more</a></p><p>— The Day.News team</p>',
                'text_content' => "Hi {{customer_name}},\n\n" . strip_tags($d['body']) . "\n\nDetails: {{listing_url}}\n\n— Day.News",
            ];
        }

        return $out;
    }
}
