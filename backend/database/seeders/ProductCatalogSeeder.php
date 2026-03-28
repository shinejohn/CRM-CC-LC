<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

class ProductCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            // VISIBILITY & LISTING
            ['product_slug' => 'headliner', 'name' => 'Headliner', 'service_type' => 'cross-platform', 'price' => 75, 'compare_at_price' => 800, 'is_subscription' => true, 'billing_period' => 'monthly', 'sold_by' => 'emma', 'requires_products' => [], 'max_per_community' => 1, 'is_perk' => false, 'description' => 'Top-tier visibility placement across all platforms. Your business appears first in community feeds.'],
            ['product_slug' => 'priority-listing', 'name' => 'Priority Listing', 'service_type' => 'cross-platform', 'price' => 0, 'is_subscription' => false, 'sold_by' => 'auto', 'requires_products' => [], 'is_perk' => true, 'description' => 'Elevated listing position in community directories.'],
            ['product_slug' => 'premium-listing', 'name' => 'Premium Listing', 'service_type' => 'cross-platform', 'price' => 29, 'compare_at_price' => 199, 'is_subscription' => true, 'billing_period' => 'monthly', 'sold_by' => 'emma', 'requires_products' => [], 'is_perk' => false, 'description' => 'Enhanced business profile with photos, hours, and featured placement.'],
            ['product_slug' => 'awards-achievements', 'name' => 'Awards & Achievements', 'service_type' => 'cross-platform', 'price' => 0, 'is_subscription' => false, 'sold_by' => 'auto', 'requires_products' => [], 'is_perk' => true, 'description' => 'Display awards and community recognition badges on your listing.'],

            // DISPLAY ADVERTISING
            ['product_slug' => 'display-ads', 'name' => 'Display Ads', 'service_type' => 'cross-platform', 'price' => 50, 'compare_at_price' => 500, 'is_subscription' => true, 'billing_period' => 'monthly', 'sold_by' => 'emma', 'requires_products' => [], 'is_perk' => false, 'description' => 'Banner and sidebar advertisements across all community pages.'],
            ['product_slug' => 'email-ads', 'name' => 'Email Ads', 'service_type' => 'cross-platform', 'price' => 25, 'compare_at_price' => 300, 'is_subscription' => false, 'billing_unit' => 'per-send', 'sold_by' => 'emma', 'requires_products' => ['display-ads'], 'is_perk' => false, 'description' => 'Sponsored placement in community email newsletters.'],
            ['product_slug' => 'newsletter-sponsor', 'name' => 'Newsletter Sponsor', 'service_type' => 'day.news', 'price' => 100, 'compare_at_price' => 300, 'is_subscription' => false, 'billing_unit' => 'per-send', 'sold_by' => 'emma', 'requires_products' => ['display-ads'], 'is_perk' => false, 'description' => 'Exclusive newsletter sponsorship with branding header and CTA.'],

            // CONTENT & SPONSORSHIP
            ['product_slug' => 'article-companion', 'name' => 'Article Companion', 'service_type' => 'day.news', 'price' => 50, 'compare_at_price' => 150, 'is_subscription' => false, 'billing_unit' => 'per-article', 'sold_by' => 'emma', 'requires_products' => [], 'is_perk' => false, 'description' => 'Sponsored companion ad alongside published community articles.'],
            ['product_slug' => 'section-sponsor', 'name' => 'Section Sponsor', 'service_type' => 'cross-platform', 'price' => 300, 'compare_at_price' => 2000, 'is_subscription' => true, 'billing_period' => 'monthly', 'sold_by' => 'emma', 'requires_products' => [], 'max_per_community' => 1, 'is_perk' => false, 'description' => 'Exclusive sponsorship of a news section (e.g., Sports, Dining).'],
            ['product_slug' => 'content-posting', 'name' => 'Content Posting', 'service_type' => 'cross-platform', 'price' => 0, 'compare_at_price' => 50, 'is_subscription' => false, 'billing_unit' => 'per-use', 'sold_by' => 'self-serve', 'requires_products' => ['premium-listing'], 'is_perk' => false, 'description' => 'Publish announcements and updates directly to community feeds.'],
            ['product_slug' => 'legal-notices', 'name' => 'Legal Notices', 'service_type' => 'day.news', 'price' => 25, 'compare_at_price' => 200, 'is_subscription' => false, 'billing_unit' => 'per-notice', 'sold_by' => 'self-serve', 'requires_products' => [], 'is_perk' => false, 'description' => 'Publish official legal and public notices in the community newspaper.'],

            // POLLS
            ['product_slug' => 'poll-participation', 'name' => 'Poll Participation', 'service_type' => 'day.news', 'price' => 0, 'compare_at_price' => 149, 'is_subscription' => false, 'billing_unit' => 'per-poll', 'sold_by' => 'auto', 'requires_products' => [], 'is_perk' => false, 'description' => 'Participate in community polls as a listed business option.'],
            ['product_slug' => 'poll-sponsor', 'name' => 'Poll Sponsor', 'service_type' => 'day.news', 'price' => 100, 'compare_at_price' => 500, 'is_subscription' => false, 'billing_unit' => 'per-poll', 'sold_by' => 'emma', 'requires_products' => ['display-ads'], 'is_perk' => false, 'description' => 'Sponsor a community poll with your branding and custom question.'],

            // TRANSACTIONS
            ['product_slug' => 'booking-system', 'name' => 'Booking System', 'service_type' => 'goeventcity', 'price' => 49, 'is_subscription' => true, 'billing_period' => 'monthly', 'billing_unit' => 'commission', 'commission_rate' => 3.00, 'sold_by' => 'emma', 'requires_products' => ['premium-listing'], 'is_perk' => false, 'description' => 'Online booking and reservations powered by GoEventCity.'],
            ['product_slug' => 'ticket-sales', 'name' => 'Ticket Sales', 'service_type' => 'goeventcity', 'price' => 0, 'is_subscription' => false, 'billing_unit' => 'commission', 'commission_rate' => 5.00, 'sold_by' => 'self-serve', 'requires_products' => [], 'is_perk' => false, 'description' => 'Sell event tickets with integrated payment processing.'],
            ['product_slug' => 'marketplace', 'name' => 'Marketplace', 'service_type' => 'goeventcity', 'price' => 0, 'is_subscription' => false, 'billing_unit' => 'commission', 'commission_rate' => 10.00, 'sold_by' => 'self-serve', 'requires_products' => [], 'is_perk' => false, 'description' => 'Sell products and merchandise through the community marketplace.'],
            ['product_slug' => 'classifieds', 'name' => 'Classifieds', 'service_type' => 'day.news', 'price' => 5, 'compare_at_price' => 50, 'is_subscription' => false, 'billing_unit' => 'per-listing', 'sold_by' => 'self-serve', 'requires_products' => [], 'is_perk' => false, 'description' => 'Post classified ads in the community newspaper.'],
            ['product_slug' => 'coupons-deals', 'name' => 'Coupons & Deals', 'service_type' => 'cross-platform', 'price' => 0, 'compare_at_price' => 25, 'is_subscription' => false, 'billing_unit' => 'per-use', 'sold_by' => 'self-serve', 'requires_products' => ['premium-listing'], 'is_perk' => false, 'description' => 'Publish digital coupons and special offers across all platforms.'],

            // NOTIFICATIONS
            ['product_slug' => 'event-reminders', 'name' => 'Event Reminders', 'service_type' => 'goeventcity', 'price' => 5, 'compare_at_price' => 25, 'is_subscription' => false, 'billing_unit' => 'per-event', 'sold_by' => 'self-serve', 'requires_products' => ['premium-listing'], 'is_perk' => false, 'description' => 'Automated email and push reminders for upcoming events.'],
            ['product_slug' => 'ticket-reminders', 'name' => 'Ticket Reminders', 'service_type' => 'goeventcity', 'price' => 0, 'is_subscription' => false, 'sold_by' => 'auto', 'requires_products' => ['ticket-sales'], 'is_perk' => true, 'description' => 'Automated reminders sent to ticket holders before events.'],
            ['product_slug' => 'since-youre-going-to', 'name' => 'Since You\'re Going To...', 'service_type' => 'goeventcity', 'price' => 25, 'compare_at_price' => 100, 'is_subscription' => false, 'billing_unit' => 'per-event', 'sold_by' => 'emma', 'requires_products' => ['event-reminders'], 'is_perk' => false, 'description' => 'Cross-promote your business to attendees of nearby events.'],

            // SUBSCRIPTIONS
            ['product_slug' => 'calendar-follower-sub', 'name' => 'Calendar/Follower Subscription', 'service_type' => 'goeventcity', 'price' => 19, 'compare_at_price' => 49, 'is_subscription' => true, 'billing_period' => 'monthly', 'sold_by' => 'self-serve', 'requires_products' => ['premium-listing'], 'is_perk' => false, 'description' => 'Enable fans to subscribe to your event calendar and get automatic updates.'],
            ['product_slug' => 'gec-influencer-sub', 'name' => 'Community/Influencer Subscription (GEC)', 'service_type' => 'goeventcity', 'price' => 29, 'compare_at_price' => 99, 'is_subscription' => true, 'billing_period' => 'monthly', 'sold_by' => 'patricia', 'requires_products' => [], 'is_perk' => false, 'description' => 'GoEventCity influencer bundle with priority event listing and promotion.'],
            ['product_slug' => 'friend-calendar-invite', 'name' => 'Friend/Follower Calendar Invite', 'service_type' => 'goeventcity', 'price' => 1, 'compare_at_price' => 5, 'is_subscription' => false, 'billing_unit' => 'per-batch', 'sold_by' => 'self-serve', 'requires_products' => ['calendar-follower-sub'], 'is_perk' => false, 'description' => 'Batch-invite followers to add your events to their calendars.'],

            // AI SERVICES
            ['product_slug' => 'ai-personal-assistant', 'name' => 'AI Personal Assistant', 'service_type' => 'alphasite', 'price' => 99, 'compare_at_price' => 499, 'is_subscription' => true, 'billing_period' => 'monthly', 'sold_by' => 'self-serve', 'requires_products' => [], 'is_perk' => false, 'description' => 'AI-powered business assistant for scheduling, FAQs, and customer engagement.'],
            ['product_slug' => 'ai-4-calls', 'name' => 'AI 4 Calls', 'service_type' => 'alphasite', 'price' => 49, 'compare_at_price' => 199, 'is_subscription' => true, 'billing_period' => 'monthly', 'sold_by' => 'emma', 'requires_products' => ['ai-personal-assistant'], 'is_perk' => false, 'description' => 'AI-powered phone answering service handling up to 4 concurrent calls.'],
            ['product_slug' => 'ai-email-response', 'name' => 'AI Email Response', 'service_type' => 'alphasite', 'price' => 29, 'compare_at_price' => 99, 'is_subscription' => true, 'billing_period' => 'monthly', 'sold_by' => 'self-serve', 'requires_products' => ['ai-personal-assistant'], 'is_perk' => false, 'description' => 'AI-generated email responses using your business brand voice.'],
            ['product_slug' => 'ai-chatbot', 'name' => 'AI Chatbot', 'service_type' => 'alphasite', 'price' => 49, 'compare_at_price' => 149, 'is_subscription' => true, 'billing_period' => 'monthly', 'sold_by' => 'self-serve', 'requires_products' => ['ai-personal-assistant'], 'is_perk' => false, 'description' => 'AI chatbot embedded on your website and business profile.'],

            // DISTRIBUTION
            ['product_slug' => 'social-syndication', 'name' => 'Social Syndication', 'service_type' => 'cross-platform', 'price' => 29, 'compare_at_price' => 99, 'is_subscription' => true, 'billing_period' => 'monthly', 'sold_by' => 'self-serve', 'requires_products' => ['content-posting'], 'is_perk' => false, 'description' => 'Automatically syndicate content to Facebook, Instagram, and X.'],
            ['product_slug' => 'daynews-cross-post', 'name' => 'Day News Cross-Post', 'service_type' => 'cross-platform', 'price' => 25, 'compare_at_price' => 100, 'is_subscription' => false, 'billing_unit' => 'per-post', 'sold_by' => 'emma', 'requires_products' => ['premium-listing'], 'is_perk' => false, 'description' => 'Cross-post your announcements to neighboring Day News communities.'],

            // SPONSOR CREDITS
            ['product_slug' => 'community-sponsor-credit', 'name' => 'Community Sponsor Credit', 'service_type' => 'cross-platform', 'price' => 0, 'is_subscription' => false, 'sold_by' => 'patricia', 'requires_products' => [], 'is_perk' => true, 'description' => 'Credited recognition as an official community sponsor.'],
        ];

        $bundles = [
            ['product_slug' => 'community-influencer', 'name' => 'Community Influencer', 'service_type' => 'day.news', 'price' => 300, 'is_subscription' => true, 'billing_period' => 'monthly', 'sold_by' => 'emma', 'requires_products' => [], 'is_perk' => false, 'description' => 'Premier community influencer bundle: headliner placement, display ads, content posting, article companions, and AI services.'],
            ['product_slug' => 'community-expert', 'name' => 'Community Expert', 'service_type' => 'day.news', 'price' => 100, 'is_subscription' => true, 'billing_period' => 'monthly', 'sold_by' => 'emma', 'requires_products' => ['community-influencer'], 'is_perk' => false, 'description' => 'Expert add-on: branded column, expert badge, and enhanced content quotas.'],
            ['product_slug' => 'community-sponsor', 'name' => 'Community Sponsor', 'service_type' => 'day.news', 'price' => 300, 'is_subscription' => true, 'billing_period' => 'monthly', 'sold_by' => 'emma', 'requires_products' => [], 'is_perk' => false, 'description' => 'Official community sponsor: section sponsorship, logo placement, CTA, and sponsor credits.'],
            ['product_slug' => 'community-reporter', 'name' => 'Community Reporter', 'service_type' => 'day.news', 'price' => 100, 'is_subscription' => true, 'billing_period' => 'monthly', 'sold_by' => 'self-serve', 'requires_products' => [], 'is_perk' => false, 'description' => 'Community reporter subscription: publish articles, attend events, and contribute news.'],
        ];

        $allItems = array_merge($products, $bundles);

        foreach ($allItems as $item) {
            $slug = $item['product_slug'];
            $requiresProducts = $item['requires_products'] ?? [];
            unset($item['requires_products']);

            // Set defaults for optional fields
            $item['slug'] = $slug;
            $item['is_active'] = true;
            $item['requires_products'] = $requiresProducts;
            $item['is_subscription'] = $item['is_subscription'] ?? false;
            $item['is_perk'] = $item['is_perk'] ?? false;

            Service::updateOrCreate(
                ['product_slug' => $slug],
                $item
            );
        }
    }
}
