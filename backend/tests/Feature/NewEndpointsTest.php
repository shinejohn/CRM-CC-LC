<?php

namespace Tests\Feature;

use App\Enums\PipelineStage;
use App\Models\Customer;
use App\Models\EmailConversation;
use App\Models\GeneratedPresentation;
use App\Models\Interaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Smoke tests for the newly-added CRM / AI / email / presentation endpoints
 * wired via routes/api-crm-extra.php and routes/api-email-health.php.
 */
class NewEndpointsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->createAndAuthenticateUser();
    }

    // ── CRM pipeline-stage transition ────────────────────────────────────

    public function test_pipeline_stage_valid_adjacent_transition_succeeds(): void
    {
        $customer = Customer::factory()->create([
            'pipeline_stage' => PipelineStage::HOOK,
        ]);

        $this->putJson("/api/v1/customers/{$customer->id}/pipeline-stage", [
            'pipeline_stage' => PipelineStage::ENGAGEMENT->value,
        ])
            ->assertStatus(200)
            ->assertJsonStructure(['data', 'message']);

        $this->assertSame(PipelineStage::ENGAGEMENT, $customer->fresh()->pipeline_stage);
    }

    public function test_pipeline_stage_illegal_jump_is_rejected(): void
    {
        $customer = Customer::factory()->create([
            'pipeline_stage' => PipelineStage::HOOK,
        ]);

        // Hook -> Sales skips Engagement and must be blocked (422).
        $this->putJson("/api/v1/customers/{$customer->id}/pipeline-stage", [
            'pipeline_stage' => PipelineStage::SALES->value,
        ])->assertStatus(422);

        $this->assertSame(PipelineStage::HOOK, $customer->fresh()->pipeline_stage);
    }

    // ── AI generate-faq (persistence mode, no live AI call) ──────────────

    public function test_generate_faq_persists_and_returns_faq_id(): void
    {
        $response = $this->postJson('/api/v1/ai/generate-faq', [
            'question' => 'What are your hours?',
            'answer' => 'We are open 9-5, Monday to Friday.',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['faq_id', 'success', 'data' => ['faq_id']]);

        $this->assertNotEmpty($response->json('faq_id'));
        $this->assertDatabaseHas('knowledge_base', [
            'title' => 'What are your hours?',
            'category' => 'faq',
        ]);
    }

    // ── Email contact health ─────────────────────────────────────────────

    public function test_email_contacts_health_returns_buckets(): void
    {
        Customer::factory()->create([
            'email' => 'valid@example.com',
            'zb_status' => 'valid',
            'zb_checked_at' => now(),
        ]);

        $this->getJson('/api/v1/email/contacts/health')
            ->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'total_contacts',
                    'validated_count',
                    'valid_count',
                    'invalid_count',
                    'catch_all_count',
                    'unknown_count',
                    'suppressed_count',
                    'suppression_rate',
                ],
            ]);
    }

    // ── Inbound inbox ────────────────────────────────────────────────────

    public function test_inbound_inbox_index_returns_envelope(): void
    {
        EmailConversation::create([
            'direction' => 'inbound',
            'from_email' => 'lead@example.com',
            'to_email' => 'hello@fibonacco.com',
            'subject' => 'Question about pricing',
            'body' => 'How much does it cost?',
            'intent' => 'question',
            'sentiment' => 'neutral',
        ]);

        $this->getJson('/api/v1/email/inbound')
            ->assertStatus(200)
            ->assertJsonStructure([
                'data' => [['id', 'from_email', 'subject', 'status', 'intent', 'sentiment']],
                'meta' => ['current_page', 'per_page', 'total', 'last_page'],
            ]);
    }

    public function test_inbound_escalate_marks_escalated_and_creates_interaction(): void
    {
        $customer = Customer::factory()->create(['email' => 'lead@example.com']);

        $conversation = EmailConversation::create([
            'direction' => 'inbound',
            'from_email' => 'lead@example.com',
            'to_email' => 'hello@fibonacco.com',
            'subject' => 'I want to cancel',
            'body' => 'Please cancel my account.',
            'intent' => 'complaint',
            'sentiment' => 'negative',
        ]);

        $this->postJson("/api/v1/email/inbound/{$conversation->id}/escalate", [
            'note' => 'Angry customer, needs a call.',
        ])
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'escalated');

        $this->assertSame(1, Interaction::query()
            ->where('customer_id', $customer->id)
            ->where('type', 'human_escalation')
            ->count());
    }

    // ── Presentations index ──────────────────────────────────────────────

    public function test_presentations_index_returns_envelope(): void
    {
        GeneratedPresentation::factory()->create();

        $this->getJson('/api/v1/presentations')
            ->assertStatus(200)
            ->assertJsonStructure([
                'data',
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);
    }
}
