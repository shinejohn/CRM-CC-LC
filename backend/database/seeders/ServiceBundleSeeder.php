<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\ServiceBundle;
use Illuminate\Database\Seeder;

final class ServiceBundleSeeder extends Seeder
{
    public function run(): void
    {
        $bundles = [
            [
                'slug'           => 'starter',
                'name'           => 'Starter',
                'tagline'        => 'Get your business found and known in your community',
                'description'    => 'Perfect for businesses ready to establish their digital presence in the local community directory.',
                'price_cents'    => 9700,   // $97/mo
                'setup_fee_cents'=> 0,
                'features'       => [
                    'Community business listing',
                    'Basic SEO optimization',
                    'Monthly community newsletter mention',
                    'Social media profile setup',
                    'Google Business Profile claim & verify',
                    'Basic analytics dashboard',
                    '1 content post per month',
                ],
                'included_services' => ['business-listing', 'newsletter-mention', 'social-setup'],
                'is_active'      => true,
                'sort_order'     => 1,
                'highlight_badge'=> null,
            ],
            [
                'slug'           => 'professional',
                'name'           => 'Professional',
                'tagline'        => 'Grow your authority and generate consistent leads',
                'description'    => 'For businesses ready to dominate their local market with consistent content, visibility, and lead generation.',
                'price_cents'    => 29700,  // $297/mo
                'setup_fee_cents'=> 0,
                'features'       => [
                    'Everything in Starter',
                    'Featured placement in community directory',
                    'Weekly community spotlight posts',
                    '4 social media posts per month',
                    'Monthly email newsletter dedicated section',
                    'Lead capture landing page',
                    'Automated follow-up sequence',
                    'Engagement analytics + monthly report',
                    'AI-powered content suggestions',
                    'Priority support',
                ],
                'included_services' => ['business-listing', 'newsletter-mention', 'social-setup', 'featured-placement', 'content-creation', 'lead-capture'],
                'is_active'      => true,
                'sort_order'     => 2,
                'highlight_badge'=> 'Most Popular',
            ],
            [
                'slug'           => 'sponsor',
                'name'           => 'Community Sponsor',
                'tagline'        => 'Become the go-to authority in your community',
                'description'    => 'For established businesses that want maximum exposure, exclusive positioning, and full marketing automation.',
                'price_cents'    => 79700,  // $797/mo
                'setup_fee_cents'=> 0,
                'features'       => [
                    'Everything in Professional',
                    'Exclusive sponsor banner on all newsletters',
                    'Top-of-page featured listing (your category)',
                    'Unlimited social media content',
                    'Weekly video/audio content creation',
                    'Dedicated monthly email campaign to full list',
                    'Custom landing page with Sarah AI chat',
                    'Full 90-day automated outreach campaign',
                    'Dedicated account manager',
                    'Quarterly strategy call',
                    'Competitor monitoring alerts',
                    'White-glove onboarding',
                ],
                'included_services' => ['business-listing', 'newsletter-sponsor', 'social-unlimited', 'content-creation', 'lead-capture', 'email-campaign', 'sarah-ai', 'account-manager'],
                'is_active'      => true,
                'sort_order'     => 3,
                'highlight_badge'=> 'Best Value',
            ],
        ];

        foreach ($bundles as $bundle) {
            ServiceBundle::updateOrCreate(
                ['slug' => $bundle['slug']],
                $bundle
            );
        }
    }
}
