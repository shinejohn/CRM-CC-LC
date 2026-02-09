<?php

namespace Tests\Feature;

use App\Jobs\ProcessApproval;
use App\Models\Approval;
use App\Models\Customer;
use App\Services\ApprovalService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Tests\TestCase;

class ApprovalFlowTest extends TestCase
{
    use RefreshDatabase; protected function setUp(): void { parent::setUp(); $this->createAndAuthenticateUser(); }

    public function test_can_submit_approval(): void
    {
        Bus::fake();

        $customer = Customer::factory()->create([
            'email' => 'owner@example.com',
            'primary_email' => 'owner@example.com',
            'owner_name' => 'Owner Name',
            'primary_contact_name' => 'Owner Name',
        ]);

        $approvalService = app(ApprovalService::class);
        $token = $approvalService->generateToken($customer->id, 'appointment_booking', 'LC-1001');

        $response = $this->post('/approve', [
            'customer_id' => $customer->id,
            'service_type' => 'appointment_booking',
            'source' => 'LC-1001',
            'token' => $token,
            'approver_name' => 'Owner Name',
            'approver_email' => 'owner@example.com',
            'approver_phone' => '555-111-2222',
            'contact_consent' => '1',
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('approvals', [
            'customer_id' => $customer->id,
            'service_type' => 'appointment_booking',
            'approver_email' => 'owner@example.com',
        ]);

        Bus::assertDispatched(ProcessApproval::class);
    }

    public function test_full_approval_flow_renders_success(): void
    {
        Bus::fake();

        $customer = Customer::factory()->create();
        $approvalService = app(ApprovalService::class);
        $token = $approvalService->generateToken($customer->id, 'review_automation', 'LC-2002');

        $response = $this->followingRedirects()->post('/approve', [
            'customer_id' => $customer->id,
            'service_type' => 'review_automation',
            'source' => 'LC-2002',
            'token' => $token,
            'approver_name' => 'Test Owner',
            'approver_email' => 'test-owner@example.com',
            'approver_phone' => '555-333-4444',
            'contact_consent' => '1',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('approvals', [
            'customer_id' => $customer->id,
            'service_type' => 'review_automation',
        ]);
    }

    public function test_approvals_api_index(): void
    {
        Approval::factory()->count(2)->create();

        $response = $this->getJson('/api/v1/approvals');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'customer_id', 'service_type', 'status'],
                ],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);
    }
}

