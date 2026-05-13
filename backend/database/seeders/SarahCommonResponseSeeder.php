<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\SarahCommonResponse;
use Illuminate\Database\Seeder;

final class SarahCommonResponseSeeder extends Seeder
{
    public function run(): void
    {
        $responses = [
            [
                'intent_key' => 'greeting-default',
                'category' => 'general',
                'response_text' => "Hi there! I'm Sarah, your AI business advisor. I'm here to walk you through this and answer any questions. What would you like to know?",
                'trigger_phrases' => ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'howdy'],
                'priority' => 10,
            ],
            [
                'intent_key' => 'pricing-general',
                'category' => 'pricing',
                'response_text' => "Great question! Our pricing is designed to be accessible for local businesses. Plans start at just \$99/month with no long-term contracts. I can walk you through exactly what's included and help you find the best fit for your budget.",
                'trigger_phrases' => ['how much', 'cost', 'price', 'pricing', 'expensive', 'afford', 'budget', 'subscription', 'per month'],
                'priority' => 20,
            ],
            [
                'intent_key' => 'duration-question',
                'category' => 'general',
                'response_text' => "This presentation takes about 3-5 minutes. I'll keep it focused on what matters most to your business. You can ask questions at any point, or skip ahead if you'd like.",
                'trigger_phrases' => ['how long', 'how many minutes', 'duration', 'take long', 'quick'],
                'priority' => 30,
            ],
            [
                'intent_key' => 'setup-cta',
                'category' => 'general',
                'response_text' => "I'd love to help you get started! Setting up is simple — I'll handle most of the work. All I need is a few details about your business and we can have you live in your community within 24 hours.",
                'trigger_phrases' => ['set this up', 'get started', 'sign up', 'start', 'set up', 'ready to go', 'lets do it', "let's do it"],
                'priority' => 25,
            ],
            [
                'intent_key' => 'skip-to-pricing',
                'category' => 'navigation',
                'response_text' => "Sure thing! Let me jump straight to the pricing breakdown. You'll see our plans are straightforward — no hidden fees, no surprises.",
                'trigger_phrases' => ['skip to pricing', 'just show me pricing', 'jump to pricing', 'skip ahead'],
                'priority' => 35,
            ],
            [
                'intent_key' => 'continue-presentation',
                'category' => 'navigation',
                'response_text' => "Of course! Let me continue with the presentation. There's some great stuff coming up.",
                'trigger_phrases' => ['continue', 'keep going', 'go on', 'next slide', 'move on', "what's next"],
                'priority' => 40,
            ],
            [
                'intent_key' => 'contact-team',
                'category' => 'general',
                'response_text' => "Absolutely! Our team would love to chat with you directly. You can reach us at hello@fibonacco.com or I can have someone call you back. What works best?",
                'trigger_phrases' => ['talk to someone', 'real person', 'phone call', 'contact', 'speak to', 'call me', 'email me'],
                'priority' => 30,
            ],
            [
                'intent_key' => 'skepticism-response',
                'category' => 'objection',
                'response_text' => "I totally understand your hesitation — you should be skeptical! That's why we offer a no-risk trial period. You can see the results in your own community before committing to anything. Would you like to see some real examples from businesses like yours?",
                'trigger_phrases' => ['too good to be true', 'scam', 'really work', 'skeptical', 'not sure about this', 'sounds like', 'doubt'],
                'priority' => 50,
            ],
            [
                'intent_key' => 'other-services',
                'category' => 'general',
                'response_text' => "Great question! Beyond what we're covering here, Fibonacco offers a full suite of community publishing tools — local news, events, business directories, and more. I can show you the full catalog after this presentation.",
                'trigger_phrases' => ['other services', 'what else', 'other products', 'full list', 'everything you offer', 'more options'],
                'priority' => 45,
            ],
            [
                'intent_key' => 'thanks-response',
                'category' => 'general',
                'response_text' => "You're welcome! I'm glad I could help. Is there anything else you'd like to know, or are you ready to take the next step?",
                'trigger_phrases' => ['thank you', 'thanks', 'appreciate', 'helpful', 'great info'],
                'priority' => 60,
            ],
            [
                'intent_key' => 'what-is-this',
                'category' => 'general',
                'response_text' => "Fibonacco is a community publishing platform that helps local businesses get discovered by the people who matter most — their neighbors. We create hyper-local digital communities with news, events, and business directories, and your business gets a premium position in your community.",
                'trigger_phrases' => ['what is this', 'what is fibonacco', 'what do you do', 'what are you', 'explain this'],
                'priority' => 15,
            ],
            [
                'intent_key' => 'how-does-it-work',
                'category' => 'general',
                'response_text' => "Here's the simple version: we build digital communities around real towns and neighborhoods. Your business gets a prominent listing, featured content, and targeted visibility to local residents. Think of it as your digital main street storefront.",
                'trigger_phrases' => ['how does it work', 'how it works', 'explain how', 'walk me through'],
                'priority' => 20,
            ],
            [
                'intent_key' => 'repeat-that',
                'category' => 'navigation',
                'response_text' => "Of course! Let me go over that again. Take your time — there's no rush. Feel free to ask me to clarify anything specific.",
                'trigger_phrases' => ['repeat', 'say that again', "didn't catch", 'one more time', 'again please'],
                'priority' => 55,
            ],
            [
                'intent_key' => 'goodbye',
                'category' => 'general',
                'response_text' => "Thanks for your time today! If you have more questions later, I'll be right here. Have a great day!",
                'trigger_phrases' => ['bye', 'goodbye', 'see you', 'gotta go', 'leaving', 'done for now'],
                'priority' => 70,
            ],
            [
                'intent_key' => 'explain-this-slide',
                'category' => 'navigation',
                'response_text' => '',
                'trigger_phrases' => ['explain this slide', 'what does this mean', 'tell me about this slide', 'more detail'],
                'priority' => 5,
                'always_ai' => true,
            ],
        ];

        foreach ($responses as $data) {
            SarahCommonResponse::updateOrCreate(
                ['intent_key' => $data['intent_key']],
                $data,
            );
        }
    }
}
