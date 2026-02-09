<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class ContactSalesTest extends TestCase
{
    use WithFaker;

    /**
     * Test contact sales form submission with valid data
     */
    public function test_contact_sales_submission_success(): void
    {
        $data = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'company' => 'Acme Corp',
            'phone' => '+1-555-123-4567',
            'message' => 'I am interested in learning more about your services.',
            'campaign_id' => 'TEST-001',
            'campaign_slug' => 'test-campaign',
            'utm_source' => 'google',
            'utm_medium' => 'cpc',
            'utm_campaign' => 'test-campaign',
        ];

        $response = $this->postJson('/api/v1/learning/contact/sales', $data);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'success',
                'message',
            ]);
    }

    /**
     * Test contact sales form validation - missing required fields
     */
    public function test_contact_sales_validation_required_fields(): void
    {
        $response = $this->postJson('/api/v1/learning/contact/sales', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'message']);
    }

    /**
     * Test contact sales form validation - invalid email
     */
    public function test_contact_sales_validation_invalid_email(): void
    {
        $data = [
            'name' => 'John Doe',
            'email' => 'invalid-email',
            'message' => 'Test message',
        ];

        $response = $this->postJson('/api/v1/learning/contact/sales', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * Test contact sales form validation - message too long
     */
    public function test_contact_sales_validation_message_too_long(): void
    {
        $data = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'message' => str_repeat('a', 5001), // Exceeds 5000 character limit
        ];

        $response = $this->postJson('/api/v1/learning/contact/sales', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['message']);
    }

    /**
     * Test contact sales form with optional fields
     */
    public function test_contact_sales_with_optional_fields(): void
    {
        $data = [
            'name' => 'Jane Smith',
            'email' => 'jane@example.com',
            'message' => 'I would like to schedule a demo.',
        ];

        $response = $this->postJson('/api/v1/learning/contact/sales', $data);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }

    /**
     * Test contact sales form with campaign context
     */
    public function test_contact_sales_with_campaign_context(): void
    {
        $data = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'message' => 'Interested in this campaign.',
            'campaign_id' => 'HOOK-001',
            'campaign_slug' => 'claim-your-listing',
            'utm_source' => 'facebook',
            'utm_medium' => 'social',
            'utm_campaign' => 'spring-promo',
        ];

        $response = $this->postJson('/api/v1/learning/contact/sales', $data);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }

    /**
     * Test contact sales form with tenant ID header
     */
    public function test_contact_sales_with_tenant_id(): void
    {
        $data = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'message' => 'Test message',
        ];

        $response = $this->withHeaders([
            'X-Tenant-ID' => 'tenant-123',
        ])->postJson('/api/v1/learning/contact/sales', $data);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }
}






