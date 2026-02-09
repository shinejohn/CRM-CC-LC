<?php

namespace App\Console\Commands;

use App\Models\AiPersonality;
use App\Models\DialogTree;
use App\Models\DialogTreeNode;
use App\Models\ObjectionHandler;
use Illuminate\Console\Command;

class SeedAccountManagerData extends Command
{
    protected $signature = 'am:seed';
    protected $description = 'Seed AI Account Manager data (personalities, dialog trees, objection handlers)';

    public function handle(): int
    {
        $this->seedPersonalities();
        $this->seedDialogTrees();
        $this->seedObjectionHandlers();
        
        $this->info('AI Account Manager data seeded successfully!');
        
        return Command::SUCCESS;
    }
    
    protected function seedPersonalities(): void
    {
        $this->info('Seeding AI Personalities...');
        
        $personalities = [
            [
                'name' => 'Sarah Mitchell',
                'slug' => 'sarah-mitchell',
                'description' => 'Warm, enthusiastic account manager specializing in restaurants and hospitality',
                'identity' => 'Sarah Mitchell',
                'persona_description' => 'A warm and enthusiastic account manager who loves helping restaurants succeed',
                'communication_style' => 'Friendly, encouraging, and detail-oriented',
                'industry_specializations' => ['restaurant', 'cafe', 'bar', 'hospitality', 'food service'],
                'personality_traits' => ['warm', 'enthusiastic', 'foodie', 'detail-oriented'],
                'dedicated_email' => 'sarah@fibonacco.com',
                'dedicated_phone' => '+1-555-0101',
                'dedicated_sms' => '+1-555-0101',
                'is_active' => true,
                'is_available' => true,
            ],
            [
                'name' => 'David Chen',
                'slug' => 'david-chen',
                'description' => 'Professional, analytical account manager for professional services',
                'identity' => 'David Chen',
                'persona_description' => 'A professional and analytical account manager focused on results',
                'communication_style' => 'Professional, thorough, and reliable',
                'industry_specializations' => ['legal', 'accounting', 'consulting', 'finance', 'insurance'],
                'personality_traits' => ['professional', 'analytical', 'thorough', 'reliable'],
                'dedicated_email' => 'david@fibonacco.com',
                'dedicated_phone' => '+1-555-0102',
                'dedicated_sms' => '+1-555-0102',
                'is_active' => true,
                'is_available' => true,
            ],
            [
                'name' => 'Emma Rodriguez',
                'slug' => 'emma-rodriguez',
                'description' => 'Creative, energetic account manager for retail and lifestyle brands',
                'identity' => 'Emma Rodriguez',
                'persona_description' => 'A creative and energetic account manager passionate about retail',
                'communication_style' => 'Creative, trendy, and supportive',
                'industry_specializations' => ['retail', 'boutique', 'fashion', 'beauty', 'fitness', 'wellness'],
                'personality_traits' => ['creative', 'energetic', 'trendy', 'supportive'],
                'dedicated_email' => 'emma@fibonacco.com',
                'dedicated_phone' => '+1-555-0103',
                'dedicated_sms' => '+1-555-0103',
                'is_active' => true,
                'is_available' => true,
            ],
            [
                'name' => 'Michael Thompson',
                'slug' => 'michael-thompson',
                'description' => 'Practical, solution-focused account manager for home services',
                'identity' => 'Michael Thompson',
                'persona_description' => 'A practical and solution-focused account manager for home services',
                'communication_style' => 'Straightforward, dependable, and solution-focused',
                'industry_specializations' => ['plumbing', 'hvac', 'electrical', 'landscaping', 'cleaning', 'home repair'],
                'personality_traits' => ['practical', 'solution-focused', 'straightforward', 'dependable'],
                'dedicated_email' => 'michael@fibonacco.com',
                'dedicated_phone' => '+1-555-0104',
                'dedicated_sms' => '+1-555-0104',
                'is_active' => true,
                'is_available' => true,
            ],
        ];
        
        foreach ($personalities as $data) {
            // Get tenant_id from existing personality or use default
            $existingPersonality = AiPersonality::first();
            $tenantId = $existingPersonality?->tenant_id ?? \Illuminate\Support\Str::uuid()->toString();
            
            AiPersonality::updateOrCreate(
                ['slug' => $data['slug']],
                array_merge($data, [
                    'tenant_id' => $tenantId,
                    'system_prompt' => "You are {$data['name']}, an AI Account Manager.",
                ])
            );
        }
        
        $this->info('Created ' . count($personalities) . ' AI personalities');
    }
    
    protected function seedDialogTrees(): void
    {
        $this->info('Seeding Dialog Trees...');
        
        // Initial Call Dialog Tree
        $tree = DialogTree::updateOrCreate(
            ['slug' => 'initial-call'],
            [
                'name' => 'Initial Call Script',
                'trigger_type' => 'initial_call',
                'pipeline_stage' => 'hook',
                'is_active' => true,
            ]
        );
        
        $nodes = [
            ['node_key' => 'start', 'node_type' => 'say', 'content' => "Hi, this is {am_name} from Fibonacco. I'm reaching out because we noticed {business_name} and wanted to share some exciting opportunities for local businesses.", 'default_next' => 'ask_time', 'order' => 1],
            ['node_key' => 'ask_time', 'node_type' => 'ask', 'content' => "Do you have a couple of minutes to chat?", 'prompt' => 'time_available', 'branches' => [['triggers' => ['yes', 'sure', 'okay'], 'next_node' => 'explain_offer'], ['triggers' => ['no', 'busy', 'not now'], 'next_node' => 'schedule_callback']], 'default_next' => 'explain_offer', 'order' => 2],
            ['node_key' => 'explain_offer', 'node_type' => 'say', 'content' => "Great! We're offering local businesses like yours a free 90-day trial of our premium marketing services. This includes featured articles, event promotion, and an AI-powered customer service assistant for your website.", 'default_next' => 'ask_interest', 'order' => 3],
            ['node_key' => 'ask_interest', 'node_type' => 'ask', 'content' => "Does that sound like something that could help {business_name}?", 'prompt' => 'interest_level', 'branches' => [['triggers' => ['yes', 'interested', 'sounds good', 'tell me more'], 'next_node' => 'collect_info'], ['triggers' => ['no', 'not interested'], 'next_node' => 'handle_no']], 'default_next' => 'collect_info', 'order' => 4],
            ['node_key' => 'collect_info', 'node_type' => 'ask', 'content' => "Wonderful! Let me get you set up. What's the best email to send your welcome package to?", 'prompt' => 'email', 'default_next' => 'confirm_trial', 'order' => 5],
            ['node_key' => 'confirm_trial', 'node_type' => 'say', 'content' => "Perfect! I'll send over everything you need to get started. You'll see your first article draft within 48 hours. Any questions for me?", 'default_next' => 'close_success', 'order' => 6],
            ['node_key' => 'close_success', 'node_type' => 'end', 'content' => "Excellent! Welcome aboard. I'll be your dedicated account manager, so don't hesitate to reach out. Talk soon!", 'action_type' => 'update_crm', 'action_params' => ['fields' => ['trial_started_at' => 'now']], 'order' => 7],
            ['node_key' => 'schedule_callback', 'node_type' => 'ask', 'content' => "No problem at all! When would be a better time to chat?", 'prompt' => 'callback_time', 'default_next' => 'confirm_callback', 'order' => 8],
            ['node_key' => 'confirm_callback', 'node_type' => 'end', 'content' => "Perfect, I'll call you then. Have a great day!", 'action_type' => 'schedule_callback', 'action_params' => ['delay_hours' => 24], 'order' => 9],
            ['node_key' => 'handle_no', 'node_type' => 'say', 'content' => "I completely understand. Before I let you go, can I ask what your biggest marketing challenge is right now? I might have some free resources that could help.", 'default_next' => 'soft_close', 'order' => 10],
            ['node_key' => 'soft_close', 'node_type' => 'end', 'content' => "Thanks for your time. I'll send over some helpful resources anyway, no strings attached. Feel free to reach out if anything changes!", 'action_type' => 'send_email', 'action_params' => ['template' => 'resources'], 'order' => 11],
        ];
        
        foreach ($nodes as $node) {
            DialogTreeNode::updateOrCreate(
                ['dialog_tree_id' => $tree->id, 'node_key' => $node['node_key']],
                array_merge($node, ['dialog_tree_id' => $tree->id])
            );
        }
        
        $this->info('Created initial call dialog tree with ' . count($nodes) . ' nodes');
    }
    
    protected function seedObjectionHandlers(): void
    {
        $this->info('Seeding Objection Handlers...');
        
        $handlers = [
            [
                'objection_type' => 'price',
                'trigger_phrase' => 'too expensive',
                'trigger_keywords' => ['expensive', 'cost', 'afford', 'budget', 'price', 'money'],
                'response' => "I totally understand budget concerns, {customer_name}. The great news is the trial is completely free for 90 days - you can see the actual value before committing to anything. Most businesses see results worth $500+ in just the first month.",
                'follow_up' => "Would you like to see some examples of what other local businesses have achieved?",
                'next_action' => 'send_info',
                'next_action_params' => ['template' => 'roi_examples'],
                'priority' => 10,
            ],
            [
                'objection_type' => 'time',
                'trigger_phrase' => 'too busy',
                'trigger_keywords' => ['busy', 'time', 'swamped', 'overwhelmed', 'later'],
                'response' => "I hear you - running a business is demanding! That's exactly why we handle everything for you. You just approve content, and we do the rest. Most business owners spend less than 15 minutes a week with us.",
                'follow_up' => "Would it help if I showed you how simple the process is?",
                'next_action' => 'schedule_callback',
                'next_action_params' => ['delay_days' => 3],
                'priority' => 9,
            ],
            [
                'objection_type' => 'not_interested',
                'trigger_phrase' => 'not interested',
                'trigger_keywords' => ['not interested', 'no thanks', 'pass', 'decline'],
                'response' => "No problem at all, {customer_name}. Can I ask what marketing you're currently doing? I might have some free tips that could help regardless.",
                'follow_up' => null,
                'next_action' => 'send_info',
                'next_action_params' => ['template' => 'free_tips'],
                'priority' => 5,
            ],
            [
                'objection_type' => 'need_to_think',
                'trigger_phrase' => 'need to think about it',
                'trigger_keywords' => ['think about', 'consider', 'talk to', 'partner', 'spouse', 'decide'],
                'response' => "Absolutely, it's smart to consider your options. While you're thinking, I can send over a quick summary of what's included and some success stories from similar businesses. Would that be helpful?",
                'follow_up' => "When would be a good time to follow up?",
                'next_action' => 'schedule_callback',
                'next_action_params' => ['delay_days' => 7],
                'priority' => 8,
            ],
            [
                'objection_type' => 'competitor',
                'trigger_phrase' => 'using something else',
                'trigger_keywords' => ['already have', 'using', 'competitor', 'another service', 'yelp', 'google ads'],
                'response' => "That's great that you're already investing in marketing! We actually complement most services - we focus on local community engagement that other platforms don't cover. Many of our businesses use us alongside their existing tools.",
                'follow_up' => "What's working best for you right now?",
                'next_action' => null,
                'priority' => 7,
            ],
            [
                'objection_type' => 'bad_timing',
                'trigger_phrase' => 'bad time of year',
                'trigger_keywords' => ['slow season', 'bad time', 'end of year', 'holidays', 'seasonal'],
                'response' => "Actually, that might make this the perfect time! Building your presence during slower periods means you're set up when things pick up. Plus, the trial is free so there's no cost during your slower months.",
                'follow_up' => "When does your busy season typically start?",
                'next_action' => 'schedule_callback',
                'next_action_params' => ['delay_days' => 14],
                'priority' => 6,
            ],
        ];
        
        foreach ($handlers as $handler) {
            ObjectionHandler::updateOrCreate(
                ['objection_type' => $handler['objection_type'], 'trigger_phrase' => $handler['trigger_phrase']],
                $handler
            );
        }
        
        $this->info('Created ' . count($handlers) . ' objection handlers');
    }
}

