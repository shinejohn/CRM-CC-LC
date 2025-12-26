<?php

namespace Tests\Feature;

use App\Models\Customer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Illuminate\Support\Str;

class CustomerApiTest extends TestCase
{
    use RefreshDatabase;

    private string $tenantId;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Generate a test tenant ID
        $this->tenantId = (string) Str::uuid();
        
        // Set tenant ID in config for tests
        config(['app.default_tenant_id' => $this->tenantId]);
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
    public function it_can_list_customers(): void
    {
        // Create test customers using create() directly since factories may need database connection
        Customer::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $this->tenantId,
            'business_name' => 'Test Business 1',
            'slug' => 'test-business-1-' . Str::random(6),
            'lead_score' => 0,
        ]);
        Customer::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $this->tenantId,
            'business_name' => 'Test Business 2',
            'slug' => 'test-business-2-' . Str::random(6),
            'lead_score' => 0,
        ]);

        // Create customer for different tenant (should not appear)
        Customer::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => (string) Str::uuid(),
            'business_name' => 'Other Tenant Business',
            'slug' => 'other-tenant-' . Str::random(6),
            'lead_score' => 0,
        ]);

        $response = $this->getJson('/api/v1/customers', $this->getHeaders());

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'business_name', 'slug', 'tenant_id']
                ],
                'meta' => ['current_page', 'last_page', 'per_page', 'total']
            ]);

        $data = $response->json('data');
        $this->assertCount(2, $data);
        // Check that both businesses are in the response
        $businessNames = array_column($data, 'business_name');
        $this->assertContains('Test Business 1', $businessNames);
        $this->assertContains('Test Business 2', $businessNames);
    }

    /** @test */
    public function it_can_create_a_customer(): void
    {
        $customerData = [
            'business_name' => 'New Restaurant',
            'email' => 'test@restaurant.com',
            'phone' => '555-1234',
            'industry_category' => 'restaurant',
            'industry_subcategory' => 'pizza',
        ];

        $response = $this->postJson('/api/v1/customers', $customerData, $this->getHeaders());

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => ['id', 'business_name', 'slug', 'email'],
                'message'
            ]);

        $this->assertDatabaseHas('customers', [
            'tenant_id' => $this->tenantId,
            'business_name' => 'New Restaurant',
            'email' => 'test@restaurant.com',
        ]);
    }

    /** @test */
    public function it_validates_required_fields_when_creating_customer(): void
    {
        $response = $this->postJson('/api/v1/customers', [], $this->getHeaders());

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['business_name']);
    }

    /** @test */
    public function it_can_show_a_customer(): void
    {
        $customer = Customer::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $this->tenantId,
            'business_name' => 'Test Customer',
            'slug' => 'test-customer-' . Str::random(6),
            'lead_score' => 0,
        ]);

        $response = $this->getJson("/api/v1/customers/{$customer->id}", $this->getHeaders());

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $customer->id,
                    'business_name' => 'Test Customer',
                ]
            ]);
    }

    /** @test */
    public function it_can_show_customer_by_slug(): void
    {
        $customer = Customer::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $this->tenantId,
            'business_name' => 'Test Business',
            'slug' => 'test-business-123',
            'lead_score' => 0,
        ]);

        $response = $this->getJson('/api/v1/customers/slug/test-business-123', $this->getHeaders());

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $customer->id,
                    'slug' => 'test-business-123',
                ]
            ]);
    }

    /** @test */
    public function it_can_update_a_customer(): void
    {
        $customer = Customer::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $this->tenantId,
            'business_name' => 'Original Name',
            'slug' => 'original-name-' . Str::random(6),
            'lead_score' => 0,
        ]);

        $updateData = [
            'business_name' => 'Updated Name',
            'email' => 'updated@example.com',
        ];

        $response = $this->putJson("/api/v1/customers/{$customer->id}", $updateData, $this->getHeaders());

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'business_name' => 'Updated Name',
                    'email' => 'updated@example.com',
                ]
            ]);

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'business_name' => 'Updated Name',
        ]);
    }

    /** @test */
    public function it_can_update_business_context(): void
    {
        $customer = Customer::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $this->tenantId,
            'business_name' => 'Test Business',
            'slug' => 'test-business-' . Str::random(6),
            'lead_score' => 0,
        ]);

        $contextData = [
            'business_description' => 'A great pizza place',
            'industry_category' => 'restaurant',
            'industry_subcategory' => 'pizza',
            'brand_voice' => ['tone' => 'friendly', 'style' => 'casual'],
            'products_services' => ['pizza', 'delivery', 'catering'],
        ];

        $response = $this->putJson(
            "/api/v1/customers/{$customer->id}/business-context",
            $contextData,
            $this->getHeaders()
        );

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'business_description' => 'A great pizza place',
                    'industry_category' => 'restaurant',
                ]
            ]);
    }

    /** @test */
    public function it_can_get_ai_context(): void
    {
        $customer = Customer::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $this->tenantId,
            'business_name' => 'Test Business',
            'slug' => 'test-business-' . Str::random(6),
            'business_description' => 'Test description',
            'industry_category' => 'restaurant',
            'industry_subcategory' => 'pizza',
            'email' => 'test@example.com',
            'phone' => '555-1234',
            'lead_score' => 0,
        ]);

        $response = $this->getJson("/api/v1/customers/{$customer->id}/ai-context", $this->getHeaders());

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'customer_id',
                    'business_name',
                    'industry',
                    'business_description',
                    'location',
                    'contact',
                    'relationship',
                ]
            ])
            ->assertJson([
                'data' => [
                    'business_name' => 'Test Business',
                    'industry' => [
                        'category' => 'restaurant',
                        'subcategory' => 'pizza',
                    ],
                ]
            ]);
    }

    /** @test */
    public function it_can_delete_a_customer(): void
    {
        $customer = Customer::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $this->tenantId,
            'business_name' => 'Test Business',
            'slug' => 'test-business-' . Str::random(6),
            'lead_score' => 0,
        ]);

        $response = $this->deleteJson("/api/v1/customers/{$customer->id}", [], $this->getHeaders());

        $response->assertStatus(200)
            ->assertJson(['message' => 'Customer deleted successfully']);

        $this->assertDatabaseMissing('customers', ['id' => $customer->id]);
    }

    /** @test */
    public function it_enforces_tenant_isolation(): void
    {
        $otherTenantId = (string) Str::uuid();
        $otherCustomer = Customer::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $otherTenantId,
            'business_name' => 'Other Tenant Business',
            'slug' => 'other-tenant-' . Str::random(6),
            'lead_score' => 0,
        ]);

        // Try to access other tenant's customer
        $response = $this->getJson("/api/v1/customers/{$otherCustomer->id}", $this->getHeaders());

        $response->assertStatus(404);
    }
}
