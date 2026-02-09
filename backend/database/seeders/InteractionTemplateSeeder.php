<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\InteractionTemplate;
use Illuminate\Support\Str;

class InteractionTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Default follow-up sequence template
        $defaultTemplate = InteractionTemplate::create([
            'tenant_id' => '00000000-0000-0000-0000-000000000000', // Will be replaced per tenant
            'name' => 'Standard Follow-up Sequence',
            'slug' => 'standard-follow-up-sequence',
            'description' => 'Default workflow: Call → Proposal → Follow-up',
            'steps' => [
                [
                    'step_number' => 1,
                    'type' => 'phone_call',
                    'title' => 'Initial Phone Call',
                    'description' => 'Make initial contact call on Monday',
                    'scheduled_offset_days' => 0,
                    'due_offset_days' => 0,
                    'next_step' => 2,
                ],
                [
                    'step_number' => 2,
                    'type' => 'send_proposal',
                    'title' => 'Send Proposal',
                    'description' => 'Send proposal by Wednesday',
                    'scheduled_offset_days' => 0, // Same day as call completion
                    'due_offset_days' => 2, // Due 2 days after call (Wednesday)
                    'next_step' => 3,
                ],
                [
                    'step_number' => 3,
                    'type' => 'follow_up',
                    'title' => 'Follow-up',
                    'description' => 'Follow up on proposal',
                    'scheduled_offset_days' => 3, // 3 days after proposal sent
                    'due_offset_days' => 2, // Due 2 days after scheduled
                    'next_step' => null, // End of sequence
                ],
            ],
            'is_active' => true,
            'is_default' => true,
        ]);

        // Quick outreach template
        $quickTemplate = InteractionTemplate::create([
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
            'name' => 'Quick Outreach Sequence',
            'slug' => 'quick-outreach-sequence',
            'description' => 'Fast sequence: Email → Call → Follow-up',
            'steps' => [
                [
                    'step_number' => 1,
                    'type' => 'email',
                    'title' => 'Initial Email',
                    'description' => 'Send introductory email',
                    'scheduled_offset_days' => 0,
                    'due_offset_days' => 0,
                    'next_step' => 2,
                ],
                [
                    'step_number' => 2,
                    'type' => 'phone_call',
                    'title' => 'Follow-up Call',
                    'description' => 'Call to discuss email',
                    'scheduled_offset_days' => 1, // Day after email
                    'due_offset_days' => 1,
                    'next_step' => 3,
                ],
                [
                    'step_number' => 3,
                    'type' => 'follow_up',
                    'title' => 'Final Follow-up',
                    'description' => 'Final check-in',
                    'scheduled_offset_days' => 2,
                    'due_offset_days' => 1,
                    'next_step' => null,
                ],
            ],
            'is_active' => true,
            'is_default' => false,
        ]);
    }
}

