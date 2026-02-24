<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\SMB;
use App\Models\Community;
use App\Models\User;
use App\Models\SocialStudio\StudioCredit;
use App\Services\StripeService;
use Mockery;
use Illuminate\Support\Str;

class SocialStudioControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $smb;
    protected $community;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        $this->community = Community::factory()->create();
        
        // Manual SMB creation to match the SQLite BIGINT ID constraint workaround
        $this->smb = SMB::create([
            'uuid' => (string) Str::uuid(),
            'community_id' => $this->community->id,
            'business_name' => 'Studio Test Business',
            'primary_email' => 'studio_test@example.com',
        ]);

        // Mock Stripe Service
        $mockStripe = Mockery::mock(StripeService::class);
        $mockCustomer = \Stripe\Customer::constructFrom(['id' => 'cus_studio123']);
        $mockSubscription = \Stripe\Subscription::constructFrom(['id' => 'sub_studio123']);
        
        $mockStripe->shouldReceive('createCustomer')->andReturn($mockCustomer);
        $mockStripe->shouldReceive('createSubscription')->andReturn($mockSubscription);
        $this->app->instance(StripeService::class, $mockStripe);
    }

    public function test_can_fetch_credits()
    {
        StudioCredit::create([
            'smb_id' => $this->smb->id,
            'balance' => 500,
            'lifetime_purchased' => 500,
            'lifetime_consumed' => 0,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/v1/studio/credits/{$this->smb->id}");

        $response->assertStatus(200)
                 ->assertJsonPath('credits.balance', 500);
    }

    public function test_can_purchase_credits()
    {
        $payload = [
            'smb_id' => $this->smb->id,
            'amount_cents' => 2000,
            'credit_amount' => 500,
            'payment_method_id' => 'pm_mock_123',
        ];

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/studio/credits/purchase', $payload);

        $response->assertStatus(200)
                 ->assertJsonPath('balance', 500)
                 ->assertJsonPath('message', 'Credits purchased successfully');

        $this->assertDatabaseHas('social_studio_credits', [
            'smb_id' => $this->smb->id,
            'balance' => 500
        ]);
        
        $this->assertDatabaseHas('social_studio_credit_transactions', [
            'smb_id' => $this->smb->id,
            'type' => 'purchase',
            'amount' => 500
        ]);
    }

    public function test_can_subscribe_to_studio()
    {
        $payload = [
            'smb_id' => $this->smb->id,
            'payment_method_id' => 'pm_mock_sub_123',
        ];

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/studio/credits/subscribe', $payload);

        $response->assertStatus(201)
                 ->assertJsonPath('balance', 200);

        $this->assertDatabaseHas('social_studio_subscriptions', [
            'smb_id' => $this->smb->id,
            'status' => 'active',
            'monthly_credits' => 200
        ]);
    }

    public function test_can_generate_post_copy()
    {
        // Require credits first
        StudioCredit::create([
            'smb_id' => $this->smb->id,
            'balance' => 100,
            'lifetime_purchased' => 100,
            'lifetime_consumed' => 0,
        ]);

        $payload = [
            'smb_id' => $this->smb->id,
            'source_brief' => 'Our new summer collection drops tomorrow!',
            'platforms' => ['facebook', 'instagram'], // 5 credits * 2 = 10 cost
        ];

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/studio/generate/post-copy', $payload);

        $response->assertStatus(201)
                 ->assertJsonPath('balance', 90);

        $this->assertDatabaseHas('social_studio_content', [
            'smb_id' => $this->smb->id,
            'content_type' => 'post_copy',
            'credits_consumed' => 10
        ]);
    }

    public function test_fails_generation_if_insufficient_credits()
    {
        // 0 credits
        StudioCredit::create([
            'smb_id' => $this->smb->id,
            'balance' => 0,
            'lifetime_purchased' => 0,
            'lifetime_consumed' => 0,
        ]);

        $payload = [
            'smb_id' => $this->smb->id,
            'source_brief' => 'Testing',
            'platforms' => ['facebook'],
        ];

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/studio/generate/post-copy', $payload);

        $response->assertStatus(402) // Payment Required
                 ->assertJsonPath('message', 'Insufficient credits');
    }

    public function test_can_mock_oauth_connect()
    {
        $payload = [
            'smb_id' => $this->smb->id,
            'platform' => 'facebook',
            'code' => 'mock_auth_code_xyz',
        ];

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/studio/accounts/callback', $payload);

        $response->assertStatus(201)
                 ->assertJsonPath('account.platform', 'facebook');

        $this->assertDatabaseHas('social_studio_connected_accounts', [
            'smb_id' => $this->smb->id,
            'platform' => 'facebook',
            'status' => 'active'
        ]);
    }
}
