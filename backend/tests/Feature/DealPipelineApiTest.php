<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Deal;
use App\Models\Quote;
use App\Models\Invoice;
use App\Models\CrmContact;
use App\Models\CrmActivity;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class DealPipelineApiTest extends TestCase
{
    use RefreshDatabase;

    private string $tenantId;

    protected function setUp(): void
    {
        parent::setUp();
        $this->createAndAuthenticateUser();
        $this->tenantId = (string) Str::uuid();
    }

    private function getHeaders(): array
    {
        return [
            'X-Tenant-ID' => $this->tenantId,
            'Accept' => 'application/json',
            'Content-Type' => 'application/json',
        ];
    }

    private function createCustomer(): Customer
    {
        return Customer::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $this->tenantId,
            'business_name' => 'Test Business',
            'slug' => 'test-business-' . Str::random(6),
            'lead_score' => 0,
        ]);
    }

    public function test_deals_full_crud(): void
    {
        $customer = $this->createCustomer();

        $createData = [
            'customer_id' => $customer->id,
            'name' => 'Big Deal',
            'value' => 5000,
            'stage' => 'hook',
        ];

        $createResponse = $this->postJson('/api/v1/deals', $createData, $this->getHeaders());
        $createResponse->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'name', 'value', 'stage', 'customer']])
            ->assertJson(['data' => ['name' => 'Big Deal', 'stage' => 'hook']]);

        $dealId = $createResponse->json('data.id');

        $showResponse = $this->getJson("/api/v1/deals/{$dealId}", $this->getHeaders());
        $showResponse->assertStatus(200)->assertJson(['data' => ['name' => 'Big Deal']]);

        $updateResponse = $this->putJson("/api/v1/deals/{$dealId}", ['name' => 'Updated Deal', 'value' => 6000], $this->getHeaders());
        $updateResponse->assertStatus(200)->assertJson(['data' => ['name' => 'Updated Deal', 'value' => '6000.00']]);

        $transitionResponse = $this->postJson("/api/v1/deals/{$dealId}/transition", ['stage' => 'engagement'], $this->getHeaders());
        $transitionResponse->assertStatus(200)->assertJson(['data' => ['stage' => 'engagement']]);

        $deleteResponse = $this->deleteJson("/api/v1/deals/{$dealId}", [], $this->getHeaders());
        $deleteResponse->assertStatus(204);
    }

    public function test_deal_requires_loss_reason_when_marked_lost(): void
    {
        $customer = $this->createCustomer();
        $deal = Deal::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $this->tenantId,
            'customer_id' => $customer->id,
            'name' => 'Lost Deal',
            'value' => 1000,
            'stage' => 'hook',
        ]);

        $response = $this->postJson("/api/v1/deals/{$deal->id}/transition", [
            'stage' => 'lost',
        ], $this->getHeaders());

        $response->assertStatus(422)->assertJsonValidationErrors(['loss_reason']);

        $successResponse = $this->postJson("/api/v1/deals/{$deal->id}/transition", [
            'stage' => 'lost',
            'loss_reason' => 'Budget constraints',
        ], $this->getHeaders());

        $successResponse->assertStatus(200)->assertJson(['data' => ['stage' => 'lost']]);
    }

    public function test_quotes_full_crud_and_convert_to_invoice(): void
    {
        $customer = $this->createCustomer();

        $createData = [
            'customer_id' => $customer->id,
            'items' => [
                ['description' => 'Service A', 'quantity' => 1, 'unit_price' => 100],
                ['description' => 'Service B', 'quantity' => 2, 'unit_price' => 50],
            ],
        ];

        $createResponse = $this->postJson('/api/v1/quotes', $createData, $this->getHeaders());
        $createResponse->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'quote_number', 'status', 'items']])
            ->assertJsonPath('data.status', 'draft');

        $quoteId = $createResponse->json('data.id');

        $sendResponse = $this->postJson("/api/v1/quotes/{$quoteId}/send", [], $this->getHeaders());
        $sendResponse->assertStatus(200)->assertJson(['data' => ['status' => 'sent']]);

        $convertResponse = $this->postJson("/api/v1/quotes/{$quoteId}/convert-to-invoice", [], $this->getHeaders());
        $convertResponse->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'invoice_number', 'status', 'total', 'balance_due']]);
    }

    public function test_invoices_full_crud_and_record_payment(): void
    {
        $customer = $this->createCustomer();

        $createData = [
            'customer_id' => $customer->id,
            'items' => [
                ['description' => 'Item 1', 'quantity' => 1, 'unit_price' => 200],
            ],
        ];

        $createResponse = $this->postJson('/api/v1/crm-invoices', $createData, $this->getHeaders());
        $createResponse->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'invoice_number', 'status', 'total', 'balance_due']]);

        $invoiceId = $createResponse->json('data.id');

        $paymentResponse = $this->postJson("/api/v1/crm-invoices/{$invoiceId}/record-payment", [
            'amount' => 200,
            'payment_method' => 'card',
        ], $this->getHeaders());

        $paymentResponse->assertStatus(200)
            ->assertJson(['data' => ['status' => 'paid', 'balance_due' => '0.00']]);
    }

    public function test_crm_contacts_full_crud(): void
    {
        $customer = $this->createCustomer();

        $createData = [
            'customer_id' => $customer->id,
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '555-1234',
            'title' => 'Manager',
            'is_primary' => true,
        ];

        $createResponse = $this->postJson('/api/v1/crm-contacts', $createData, $this->getHeaders());
        $createResponse->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'name', 'email', 'customer']])
            ->assertJson(['data' => ['name' => 'John Doe']]);

        $contactId = $createResponse->json('data.id');

        $updateResponse = $this->putJson("/api/v1/crm-contacts/{$contactId}", ['name' => 'Jane Doe'], $this->getHeaders());
        $updateResponse->assertStatus(200)->assertJson(['data' => ['name' => 'Jane Doe']]);

        $deleteResponse = $this->deleteJson("/api/v1/crm-contacts/{$contactId}", [], $this->getHeaders());
        $deleteResponse->assertStatus(204);
    }

    public function test_crm_activities_full_crud_and_complete(): void
    {
        $customer = $this->createCustomer();

        $createData = [
            'customer_id' => $customer->id,
            'type' => 'call',
            'subject' => 'Follow-up call',
            'scheduled_at' => now()->addDay()->toDateTimeString(),
        ];

        $createResponse = $this->postJson('/api/v1/crm-activities', $createData, $this->getHeaders());
        $createResponse->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'type', 'subject', 'status']])
            ->assertJson(['data' => ['status' => 'pending']]);

        $activityId = $createResponse->json('data.id');

        $completeResponse = $this->postJson("/api/v1/crm-activities/{$activityId}/complete", [
            'outcome' => 'Successful',
        ], $this->getHeaders());

        $completeResponse->assertStatus(200)->assertJson(['data' => ['status' => 'completed']]);

        $deleteResponse = $this->deleteJson("/api/v1/crm-activities/{$activityId}", [], $this->getHeaders());
        $deleteResponse->assertStatus(204);
    }

    public function test_deals_enforce_tenant_isolation(): void
    {
        $otherTenantId = (string) Str::uuid();
        $customer = $this->createCustomer();
        $deal = Deal::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $otherTenantId,
            'customer_id' => $customer->id,
            'name' => 'Other Tenant Deal',
            'value' => 1000,
            'stage' => 'hook',
        ]);

        $response = $this->getJson("/api/v1/deals/{$deal->id}", $this->getHeaders());
        $response->assertStatus(404);
    }

    public function test_deals_pipeline_kanban_view(): void
    {
        $customer = $this->createCustomer();
        Deal::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $this->tenantId,
            'customer_id' => $customer->id,
            'name' => 'Deal in Hook',
            'value' => 500,
            'stage' => 'hook',
        ]);

        $response = $this->getJson('/api/v1/deals/pipeline', $this->getHeaders());
        $response->assertStatus(200)
            ->assertJsonStructure(['data' => ['hook', 'engagement', 'sales', 'retention']]);
    }
}
