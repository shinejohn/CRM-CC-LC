<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\InvoicePayment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class InvoicePdfTest extends TestCase
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
            'Accept' => 'application/pdf',
        ];
    }

    private function makeInvoice(): Invoice
    {
        $customer = Customer::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $this->tenantId,
            'business_name' => 'Acme Widgets',
            'slug' => 'acme-widgets-' . Str::random(6),
            'primary_email' => 'owner@acme.test',
            'city' => 'Austin',
            'state' => 'TX',
            'zip' => '78701',
            'lead_score' => 0,
        ]);

        $invoice = Invoice::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $this->tenantId,
            'customer_id' => $customer->id,
            'invoice_number' => 'INV-TEST-0001',
            'status' => 'partial',
            'subtotal' => 200.00,
            'tax' => 16.50,
            'discount' => 10.00,
            'total' => 206.50,
            'amount_paid' => 100.00,
            'balance_due' => 106.50,
            'due_date' => now()->addDays(30),
            'notes' => 'Thank you for your order.',
        ]);

        InvoiceItem::create([
            'id' => (string) Str::uuid(),
            'invoice_id' => $invoice->id,
            'description' => 'Consulting hours',
            'quantity' => 2,
            'unit_price' => 100.00,
            'total' => 200.00,
            'sort_order' => 0,
        ]);

        InvoicePayment::create([
            'id' => (string) Str::uuid(),
            'invoice_id' => $invoice->id,
            'amount' => 100.00,
            'payment_method' => 'card',
            'reference' => 'ch_test_123',
            'paid_at' => now(),
        ]);

        return $invoice;
    }

    /** @test */
    public function it_returns_a_pdf_for_an_invoice(): void
    {
        $invoice = $this->makeInvoice();

        $response = $this->get("/api/v1/crm-invoices/{$invoice->id}/pdf", $this->getHeaders());

        $response->assertStatus(200);
        $this->assertStringContainsString('application/pdf', (string) $response->headers->get('content-type'));

        $content = $response->getContent();
        $this->assertStringStartsWith('%PDF', (string) $content);
    }

    /** @test */
    public function it_does_not_leak_invoices_across_tenants(): void
    {
        $invoice = $this->makeInvoice();

        $response = $this->get("/api/v1/crm-invoices/{$invoice->id}/pdf", [
            'X-Tenant-ID' => (string) Str::uuid(),
            'Accept' => 'application/pdf',
        ]);

        $response->assertStatus(404);
    }
}
