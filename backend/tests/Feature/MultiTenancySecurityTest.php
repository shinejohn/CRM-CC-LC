<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\SMB;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class MultiTenancySecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_only_access_customers_in_their_tenant()
    {
        // Add 2 SMBs
        $smb1 = SMB::factory()->create();
        $smb2 = SMB::factory()->create();

        $tenantId1 = (string) Str::uuid();
        $tenantId2 = (string) Str::uuid();

        // User 1 belongs to SMB 1
        $user1 = User::factory()->create([
            'smb_id' => $smb1->id,
            'tenant_id' => $tenantId1,
        ]);

        // User 2 belongs to SMB 2
        $user2 = User::factory()->create([
            'smb_id' => $smb2->id,
            'tenant_id' => $tenantId2,
        ]);

        // Customer for Tenant 1
        $customer1 = Customer::factory()->create([
            'tenant_id' => $tenantId1,
            'business_name' => 'Should See',
        ]);

        // Customer for Tenant 2
        $customer2 = Customer::factory()->create([
            'tenant_id' => $tenantId2,
            'business_name' => 'Should Not See',
        ]);

        // Act as User 1
        $this->actingAs($user1, 'sanctum');

        $response = $this->getJson('/api/v1/customers', ['X-Tenant-ID' => $tenantId1]);
        $response->assertStatus(200);

        // Assert User 1 sees customer1 and does NOT see customer2
        $response->assertJsonFragment(['business_name' => 'Should See']);
        $response->assertJsonMissing(['business_name' => 'Should Not See']);

        // Assert direct access to customer2 returns 404
        $this->getJson("/api/v1/customers/{$customer2->id}", ['X-Tenant-ID' => $tenantId1])->assertStatus(404);
    }
}
