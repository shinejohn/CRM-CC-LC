<?php

namespace Tests\Feature;

use App\Models\Conversation;
use App\Models\Customer;
use App\Models\ConversationMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Illuminate\Support\Str;

class ConversationApiTest extends TestCase
{
    use RefreshDatabase;

    private string $tenantId;
    private Customer $customer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->createAndAuthenticateUser();

        $this->tenantId = (string) Str::uuid();
        $this->customer = Customer::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $this->tenantId,
            'business_name' => 'Test Customer',
            'slug' => 'test-customer-' . Str::random(6),
            'lead_score' => 0,
        ]);
    }

    private function getHeaders(): array
    {
        return [
            'X-Tenant-ID' => $this->tenantId,
            'Accept' => 'application/json',
            'Content-Type' => 'application/json',
        ];
    }

    /** @test */
    public function it_can_create_a_conversation(): void
    {
        $conversationData = [
            'customer_id' => $this->customer->id,
            'entry_point' => 'presentation',
            'template_id' => 'intro',
            'presenter_id' => 'presenter-1',
        ];

        $response = $this->postJson('/api/v1/conversations', $conversationData, $this->getHeaders());

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => ['id', 'session_id', 'customer_id', 'entry_point'],
                'message'
            ]);

        $this->assertDatabaseHas('conversations', [
            'tenant_id' => $this->tenantId,
            'customer_id' => $this->customer->id,
            'entry_point' => 'presentation',
        ]);
    }

    /** @test */
    public function it_can_list_conversations(): void
    {
        Conversation::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $this->tenantId,
            'customer_id' => $this->customer->id,
            'session_id' => 'session-' . Str::random(32),
            'messages' => [],
        ]);
        Conversation::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $this->tenantId,
            'customer_id' => $this->customer->id,
            'session_id' => 'session-' . Str::random(32),
            'messages' => [],
        ]);

        $response = $this->getJson('/api/v1/conversations', $this->getHeaders());

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'session_id', 'customer_id', 'started_at']
                ],
                'meta'
            ]);

        $data = $response->json('data');
        $this->assertCount(2, $data);
    }

    /** @test */
    public function it_can_show_a_conversation(): void
    {
        $conversation = Conversation::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $this->tenantId,
            'customer_id' => $this->customer->id,
            'session_id' => 'session-' . Str::random(32),
            'messages' => [],
        ]);

        $response = $this->getJson("/api/v1/conversations/{$conversation->id}", $this->getHeaders());

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $conversation->id,
                    'customer_id' => $this->customer->id,
                ]
            ]);
    }

    /** @test */
    public function it_can_update_a_conversation(): void
    {
        $conversation = Conversation::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $this->tenantId,
            'customer_id' => $this->customer->id,
            'session_id' => 'session-' . Str::random(32),
            'messages' => [],
        ]);

        $updateData = [
            'outcome' => 'signup',
            'outcome_details' => 'Customer signed up for premium',
            'topics_discussed' => ['pricing', 'features'],
        ];

        $response = $this->putJson("/api/v1/conversations/{$conversation->id}", $updateData, $this->getHeaders());

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'outcome' => 'signup',
                    'outcome_details' => 'Customer signed up for premium',
                ]
            ]);
    }

    /** @test */
    public function it_can_end_a_conversation(): void
    {
        $conversation = Conversation::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $this->tenantId,
            'customer_id' => $this->customer->id,
            'session_id' => 'session-' . Str::random(32),
            'messages' => [],
            'started_at' => now()->subMinutes(5),
        ]);

        $response = $this->postJson("/api/v1/conversations/{$conversation->id}/end", [], $this->getHeaders());

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => ['id', 'ended_at', 'duration_seconds'],
                'message'
            ]);

        $conversation->refresh();
        $this->assertNotNull($conversation->ended_at);
        $this->assertNotNull($conversation->duration_seconds);
    }

    /** @test */
    public function it_can_add_message_to_conversation(): void
    {
        $conversation = Conversation::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $this->tenantId,
            'customer_id' => $this->customer->id,
            'session_id' => 'session-' . Str::random(32),
            'messages' => [],
        ]);

        $messageData = [
            'role' => 'user',
            'content' => 'Hello, I have a question',
        ];

        $response = $this->postJson(
            "/api/v1/conversations/{$conversation->id}/messages",
            $messageData,
            $this->getHeaders()
        );

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => ['id', 'role', 'content', 'timestamp'],
                'message'
            ]);

        $this->assertDatabaseHas('conversation_messages', [
            'conversation_id' => $conversation->id,
            'role' => 'user',
            'content' => 'Hello, I have a question',
        ]);

        $conversation->refresh();
        $this->assertCount(1, $conversation->messages);
    }

    /** @test */
    public function it_can_list_conversation_messages(): void
    {
        $conversation = Conversation::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $this->tenantId,
            'customer_id' => $this->customer->id,
            'session_id' => 'session-' . Str::random(32),
            'messages' => [],
        ]);

        ConversationMessage::create([
            'id' => (string) Str::uuid(),
            'conversation_id' => $conversation->id,
            'role' => 'user',
            'content' => 'Message 1',
        ]);
        ConversationMessage::create([
            'id' => (string) Str::uuid(),
            'conversation_id' => $conversation->id,
            'role' => 'assistant',
            'content' => 'Message 2',
        ]);

        $response = $this->getJson("/api/v1/conversations/{$conversation->id}/messages", $this->getHeaders());

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    /** @test */
    public function it_enforces_tenant_isolation(): void
    {
        $otherTenantId = (string) Str::uuid();
        $otherConversation = Conversation::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $otherTenantId,
            'session_id' => 'session-' . Str::random(32),
            'messages' => [],
        ]);

        $response = $this->getJson("/api/v1/conversations/{$otherConversation->id}", $this->getHeaders());

        $response->assertStatus(404);
    }
}
