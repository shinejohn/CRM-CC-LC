<?php

namespace Database\Seeders;

use App\Models\Service;
use App\Models\ServiceCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ServiceCatalogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create service categories
        $categories = [
            [
                'name' => 'Content Publishing',
                'slug' => 'content-publishing',
                'description' => 'Publishing and content management services',
            ],
            [
                'name' => 'Events & Tickets',
                'slug' => 'events-tickets',
                'description' => 'Event management and ticket sales',
            ],
            [
                'name' => 'Business Directory',
                'slug' => 'business-directory',
                'description' => 'Business listing and directory services',
            ],
            [
                'name' => 'AI & Automation',
                'slug' => 'ai-automation',
                'description' => 'AI-powered business automation services',
            ],
            [
                'name' => 'Marketing & Advertising',
                'slug' => 'marketing-advertising',
                'description' => 'Marketing and advertising solutions',
            ],
        ];

        $categoryMap = [];
        foreach ($categories as $catData) {
            $category = ServiceCategory::firstOrCreate(
                ['slug' => $catData['slug']],
                [
                    'id' => (string) Str::uuid(),
                    'name' => $catData['name'],
                    'description' => $catData['description'],
                    'display_order' => 0,
                    'is_active' => true,
                ]
            );
            $categoryMap[$catData['slug']] = $category->id;
        }

        // Day.News Services
        $this->createService([
            'name' => 'Day.News Article Publishing',
            'slug' => 'day-news-article-publishing',
            'description' => 'Publish articles to Day.News platform',
            'long_description' => 'Get your articles published on Day.News, a leading local news platform. Includes featured placement, SEO optimization, and social media promotion.',
            'service_type' => 'day.news',
            'service_tier' => 'basic',
            'category_id' => $categoryMap['content-publishing'],
            'price' => 29.99,
            'is_subscription' => false,
            'billing_period' => 'one-time',
            'features' => [
                'Article publishing',
                'Featured placement',
                'SEO optimization',
                'Social media promotion',
            ],
            'capabilities' => [
                'Publish articles to Day.News',
                'Reach local audiences',
                'Boost SEO',
                'Social media integration',
            ],
        ]);

        $this->createService([
            'name' => 'Day.News Premium Listing',
            'slug' => 'day-news-premium-listing',
            'description' => 'Premium business listing on Day.News',
            'long_description' => 'Get premium placement for your business on Day.News with enhanced visibility, featured badges, and priority in search results.',
            'service_type' => 'day.news',
            'service_tier' => 'premium',
            'category_id' => $categoryMap['business-directory'],
            'price' => 49.99,
            'compare_at_price' => 79.99,
            'is_subscription' => true,
            'billing_period' => 'monthly',
            'features' => [
                'Premium placement',
                'Featured badge',
                'Priority search',
                'Analytics dashboard',
            ],
        ]);

        // GoEventCity Services
        $this->createService([
            'name' => 'GoEventCity Event Promotion',
            'slug' => 'goeventcity-event-promotion',
            'description' => 'Promote your events on GoEventCity',
            'long_description' => 'Reach thousands of event-goers by promoting your events on GoEventCity. Includes event listing, ticket integration, and social promotion.',
            'service_type' => 'goeventcity',
            'service_tier' => 'basic',
            'category_id' => $categoryMap['events-tickets'],
            'price' => 39.99,
            'is_subscription' => false,
            'billing_period' => 'one-time',
            'features' => [
                'Event listing',
                'Ticket integration',
                'Social promotion',
                'Email marketing',
            ],
        ]);

        $this->createService([
            'name' => 'GoEventCity Venue Listing',
            'slug' => 'goeventcity-venue-listing',
            'description' => 'Professional venue listing on GoEventCity',
            'long_description' => 'Showcase your venue to event organizers and attendees with a professional listing, photo gallery, and booking integration.',
            'service_type' => 'goeventcity',
            'service_tier' => 'standard',
            'category_id' => $categoryMap['events-tickets'],
            'price' => 99.99,
            'is_subscription' => true,
            'billing_period' => 'monthly',
            'features' => [
                'Professional listing',
                'Photo gallery',
                'Booking integration',
                'Analytics',
            ],
        ]);

        // DowntownsGuide Services
        $this->createService([
            'name' => 'DowntownsGuide Business Listing',
            'slug' => 'downtownsguide-business-listing',
            'description' => 'Get listed on DowntownsGuide',
            'long_description' => 'List your business on DowntownsGuide to reach local customers. Includes basic listing, reviews, and contact information.',
            'service_type' => 'downtownsguide',
            'service_tier' => 'basic',
            'category_id' => $categoryMap['business-directory'],
            'price' => 19.99,
            'is_subscription' => false,
            'billing_period' => 'one-time',
            'features' => [
                'Business listing',
                'Review management',
                'Contact information',
                'Basic analytics',
            ],
        ]);

        $this->createService([
            'name' => 'DowntownsGuide Coupon Publishing',
            'slug' => 'downtownsguide-coupon-publishing',
            'description' => 'Publish coupons on DowntownsGuide',
            'long_description' => 'Drive traffic and sales with coupon publishing on DowntownsGuide. Create, manage, and track your promotional offers.',
            'service_type' => 'downtownsguide',
            'service_tier' => 'standard',
            'category_id' => $categoryMap['marketing-advertising'],
            'price' => 49.99,
            'is_subscription' => true,
            'billing_period' => 'monthly',
            'features' => [
                'Unlimited coupons',
                'Analytics tracking',
                'Redemption tracking',
                'Email promotion',
            ],
        ]);

        // GoLocalVoices Services
        $this->createService([
            'name' => 'GoLocalVoices Content Creation',
            'slug' => 'golocalvoices-content-creation',
            'description' => 'Create and publish local content',
            'long_description' => 'Share your local stories and content with the GoLocalVoices community. Connect with local audiences and build your brand.',
            'service_type' => 'golocalvoices',
            'service_tier' => 'basic',
            'category_id' => $categoryMap['content-publishing'],
            'price' => 24.99,
            'is_subscription' => false,
            'billing_period' => 'one-time',
            'features' => [
                'Content publishing',
                'Community engagement',
                'Social sharing',
                'Analytics',
            ],
        ]);

        $this->createService([
            'name' => 'GoLocalVoices Premium Account',
            'slug' => 'golocalvoices-premium-account',
            'description' => 'Premium account with advanced features',
            'long_description' => 'Upgrade to premium for advanced features including priority placement, enhanced analytics, and exclusive community access.',
            'service_type' => 'golocalvoices',
            'service_tier' => 'premium',
            'category_id' => $categoryMap['content-publishing'],
            'price' => 79.99,
            'is_subscription' => true,
            'billing_period' => 'monthly',
            'features' => [
                'Priority placement',
                'Enhanced analytics',
                'Exclusive access',
                'Dedicated support',
            ],
        ]);

        // AlphaSite Services
        $this->createService([
            'name' => 'AlphaSite AI Business Page',
            'slug' => 'alphasite-ai-business-page',
            'description' => 'AI-powered business page creation',
            'long_description' => 'Create a professional, AI-powered business page with automated content generation, SEO optimization, and multi-channel publishing.',
            'service_type' => 'alphasite',
            'service_tier' => 'standard',
            'category_id' => $categoryMap['ai-automation'],
            'price' => 149.99,
            'compare_at_price' => 199.99,
            'is_subscription' => false,
            'billing_period' => 'one-time',
            'features' => [
                'AI content generation',
                'SEO optimization',
                'Multi-channel publishing',
                'Analytics dashboard',
            ],
        ]);

        $this->createService([
            'name' => 'AlphaSite Directory Listing',
            'slug' => 'alphasite-directory-listing',
            'description' => 'Get listed in AlphaSite directory',
            'long_description' => 'List your business in the AlphaSite directory for enhanced visibility and lead generation. Includes AI-powered recommendations and CRM integration.',
            'service_type' => 'alphasite',
            'service_tier' => 'standard',
            'category_id' => $categoryMap['business-directory'],
            'price' => 99.99,
            'is_subscription' => true,
            'billing_period' => 'monthly',
            'features' => [
                'Directory listing',
                'AI recommendations',
                'CRM integration',
                'Lead generation',
            ],
        ]);

        // Fibonacco Services
        $this->createService([
            'name' => 'Fibonacco Learning Center Access',
            'slug' => 'fibonacco-learning-center-access',
            'description' => 'Access to Fibonacco Learning Center',
            'long_description' => 'Get full access to the Fibonacco Learning Center with presentations, training materials, FAQs, and AI-powered learning assistance.',
            'service_type' => 'fibonacco',
            'service_tier' => 'basic',
            'category_id' => $categoryMap['ai-automation'],
            'price' => 49.99,
            'is_subscription' => true,
            'billing_period' => 'monthly',
            'features' => [
                'Full Learning Center access',
                'AI training',
                'Presentation generation',
                'Campaign management',
            ],
        ]);

        $this->createService([
            'name' => 'Fibonacco AI Campaign Management',
            'slug' => 'fibonacco-ai-campaign-management',
            'description' => 'AI-powered campaign creation and management',
            'long_description' => 'Create and manage marketing campaigns with AI assistance. Includes campaign generation, landing page creation, and conversion tracking.',
            'service_type' => 'fibonacco',
            'service_tier' => 'premium',
            'category_id' => $categoryMap['marketing-advertising'],
            'price' => 199.99,
            'compare_at_price' => 299.99,
            'is_subscription' => true,
            'billing_period' => 'monthly',
            'features' => [
                'AI campaign generation',
                'Landing page creation',
                'Conversion tracking',
                'Analytics dashboard',
                'Email integration',
            ],
        ]);

        $this->createService([
            'name' => 'Fibonacco Enterprise Suite',
            'slug' => 'fibonacco-enterprise-suite',
            'description' => 'Complete enterprise solution',
            'long_description' => 'Full enterprise suite with all Fibonacco services including Learning Center, AI campaigns, CRM, outbound marketing, and command center.',
            'service_type' => 'fibonacco',
            'service_tier' => 'enterprise',
            'category_id' => $categoryMap['ai-automation'],
            'price' => 499.99,
            'is_subscription' => true,
            'billing_period' => 'monthly',
            'features' => [
                'All Fibonacco services',
                'Priority support',
                'Custom integrations',
                'Dedicated account manager',
                'Unlimited usage',
            ],
            'is_featured' => true,
        ]);
    }

    private function createService(array $data): Service
    {
        return Service::firstOrCreate(
            ['slug' => $data['slug']],
            array_merge($data, [
                'id' => (string) Str::uuid(),
                'service_category_id' => $data['category_id'],
                'is_active' => true,
                'track_inventory' => false,
            ])
        );
    }
}
