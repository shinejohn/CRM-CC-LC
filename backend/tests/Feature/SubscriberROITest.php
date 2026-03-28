<?php

namespace Tests\Feature;

use App\Models\Community;
use App\Models\CommunitySubscription;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Support\Str;
use Tests\TestCase;

class SubscriberROITest extends TestCase
{
    public function test_subscriber_roi_returns_report_for_active_subscription(): void
    {
        $tenantId = (string) Str::uuid();
        $user = User::factory()->create();
        $user->forceFill(['tenant_id' => $tenantId])->save();

        $customer = Customer::factory()->create([
            'tenant_id' => $tenantId,
            'external_id' => 'ext-roi-1',
        ]);
        $community = Community::factory()->create();

        CommunitySubscription::query()->create([
            'customer_id' => $customer->id,
            'community_id' => $community->id,
            'product_slug' => 'community-influencer',
            'tier' => 'influencer',
            'status' => 'active',
            'monthly_rate' => '299.00',
            'commitment_starts_at' => now()->subMonth(),
        ]);

        $response = $this->actingAs($user)->getJson("/api/v1/subscriber-roi/{$customer->id}");

        $response->assertOk();
        $response->assertJsonPath('data.customer_id', $customer->id);
        $response->assertJsonPath('data.subscription.tier', 'influencer');
        $response->assertJsonStructure([
            'data' => [
                'billing',
                'content_delivery',
                'advertising',
                'listing_performance',
                'commerce',
                'engagement',
                'estimated_value',
            ],
        ]);
    }

    public function test_subscriber_roi_404_for_customer_in_other_tenant(): void
    {
        $user = User::factory()->create();
        $user->forceFill(['tenant_id' => (string) Str::uuid()])->save();

        $otherCustomer = Customer::factory()->create([
            'tenant_id' => (string) Str::uuid(),
        ]);

        $this->actingAs($user)->getJson("/api/v1/subscriber-roi/{$otherCustomer->id}")
            ->assertNotFound();
    }

    public function test_subscriber_roi_422_without_active_subscription(): void
    {
        $tenantId = (string) Str::uuid();
        $user = User::factory()->create();
        $user->forceFill(['tenant_id' => $tenantId])->save();
        $customer = Customer::factory()->create(['tenant_id' => $tenantId]);

        $this->actingAs($user)->getJson("/api/v1/subscriber-roi/{$customer->id}")
            ->assertStatus(422)
            ->assertJsonPath('error', 'No active subscription');
    }
}
