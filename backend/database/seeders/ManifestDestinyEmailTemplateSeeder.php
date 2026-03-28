<?php

namespace Database\Seeders;

use App\Models\EmailTemplate;
use App\Models\SmsTemplate;
use Illuminate\Database\Seeder;

class ManifestDestinyEmailTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $tenantId = (string) config('fibonacco.system_tenant_id', '00000000-0000-0000-0000-000000000001');

        $emailTemplates = [
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
        ];

        foreach ($emailTemplates as $tpl) {
            EmailTemplate::withoutGlobalScopes()->updateOrCreate(
                ['slug' => $tpl['slug'], 'tenant_id' => $tenantId],
                [
                    'name' => $tpl['name'],
                    'subject' => $tpl['subject'],
                    'html_content' => $tpl['html_content'],
                    'text_content' => $tpl['text_content'],
                    'variables' => ['business_name', 'community_name', 'customer_name', 'city', 'listing_url', 'founder_days_remaining'],
                    'is_active' => true,
                ]
            );
        }

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
}
