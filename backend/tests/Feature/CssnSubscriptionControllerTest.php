<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\SMB;
use App\Models\Community;
use App\Models\User;
use App\Models\Cssn\CssnSubscription;
use App\Models\Cssn\CssnSmbPreference;
use App\Services\StripeService;
use Mockery;

class CssnSubscriptionControllerTest extends TestCase
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
        $this->smb = SMB::create([
            'uuid' => (string) \Illuminate\Support\Str::uuid(),
            'community_id' => $this->community->id,
            'business_name' => 'Test Business',
            'primary_email' => 'test@example.com',
        ]);
        
        // Mock Stripe Service to prevent actual API calls
        $mockStripe = Mockery::mock(StripeService::class);
        $mockCustomer = \Stripe\Customer::constructFrom(['id' => 'cus_test123']);
        $mockSubscription = \Stripe\Subscription::constructFrom(['id' => 'sub_test123']);

        $mockStripe->shouldReceive('createCustomer')->andReturn($mockCustomer);
        $mockStripe->shouldReceive('createSubscription')->andReturn($mockSubscription);
        
        $this->app->instance(StripeService::class, $mockStripe);
    }

    public function test_can_subscribe_to_cssn()
    {
        $payload = [
            'smb_id' => $this->smb->id,
            'community_id' => $this->community->id,
            'tier' => 'reach',
            'payment_method_id' => 'pm_test123',
        ];

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/cssn/subscribe', $payload);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'message',
                     'subscription' => ['id', 'tier', 'status', 'stripe_subscription_id']
                 ]);

        $this->assertDatabaseHas('cssn_subscriptions', [
            'smb_id' => $this->smb->id,
            'tier' => 'reach',
            'status' => 'active'
        ]);

        $this->assertDatabaseHas('cssn_smb_preferences', [
            'smb_id' => $this->smb->id
        ]);
    }

    public function test_can_fetch_subscription()
    {
        $subscription = CssnSubscription::create([
            'smb_id' => $this->smb->id,
            'community_id' => $this->community->id,
            'tier' => 'network',
            'mode' => 'subscription',
            'status' => 'active',
            'billing_amount_cents' => 79900,
            'billing_interval' => 'monthly',
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/v1/cssn/subscription/{$this->smb->id}");

        $response->assertStatus(200)
                 ->assertJsonPath('subscription.id', $subscription->id);
    }

    public function test_can_update_preferences()
    {
        $preferences = CssnSmbPreference::create([
            'smb_id' => $this->smb->id,
            'auto_distribute_events' => true,
        ]);

        $payload = [
            'auto_distribute_events' => false,
            'require_approval_before_post' => true
        ];

        $response = $this->actingAs($this->user)
            ->putJson("/api/v1/cssn/preferences/{$this->smb->id}", $payload);

        $response->assertStatus(200);

        $this->assertDatabaseHas('cssn_smb_preferences', [
            'smb_id' => $this->smb->id,
            'auto_distribute_events' => false,
            'require_approval_before_post' => true
        ]);
    }
}
