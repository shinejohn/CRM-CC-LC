<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Quote;
use App\Models\QuoteItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class PublicQuoteTest extends TestCase
{
    use RefreshDatabase;

    private string $tenantId;

    protected function setUp(): void
    {
        parent::setUp();
        $this->tenantId = (string) Str::uuid();
    }

    private function makeQuote(array $overrides = []): Quote
    {
        $customer = Customer::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $this->tenantId,
            'business_name' => 'Acme Widgets',
            'slug' => 'acme-widgets-' . Str::random(6),
            'primary_email' => 'owner@acme.test',
            'lead_score' => 0,
        ]);

        $quote = Quote::create(array_merge([
            'id' => (string) Str::uuid(),
            'tenant_id' => $this->tenantId,
            'customer_id' => $customer->id,
            'quote_number' => 'Q-TEST-' . Str::random(6),
            'public_token' => Quote::generatePublicToken(),
            'status' => 'sent',
            'subtotal' => 200.00,
            'tax' => 16.50,
            'discount' => 10.00,
            'total' => 206.50,
            'tax_rate' => 8.25,
            'valid_until' => now()->addDays(30),
            'sent_at' => now(),
            'notes' => 'Looking forward to working with you.',
        ], $overrides));

        QuoteItem::create([
            'id' => (string) Str::uuid(),
            'quote_id' => $quote->id,
            'description' => 'Consulting hours',
            'quantity' => 2,
            'unit_price' => 100.00,
            'total' => 200.00,
            'sort_order' => 0,
        ]);

        return $quote->fresh(['items', 'customer']);
    }

    public function test_get_by_token_returns_quote(): void
    {
        $quote = $this->makeQuote();

        $response = $this->getJson("/api/v1/public/quotes/{$quote->public_token}");

        $response->assertStatus(200)
            ->assertJsonPath('data.quote_number', $quote->quote_number)
            ->assertJsonPath('data.status', 'sent')
            ->assertJsonPath('data.business_name', 'Acme Widgets')
            ->assertJsonPath('data.items.0.description', 'Consulting hours');

        // Must not leak tenant identifiers.
        $response->assertJsonMissingPath('data.tenant_id');
        $response->assertJsonMissingPath('data.customer_id');
    }

    public function test_unknown_token_returns_404(): void
    {
        $response = $this->getJson('/api/v1/public/quotes/' . Str::random(48));

        $response->assertStatus(404);
    }

    public function test_accept_on_sent_quote_marks_accepted_and_creates_invoice(): void
    {
        $quote = $this->makeQuote();

        $response = $this->postJson("/api/v1/public/quotes/{$quote->public_token}/accept");

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'accepted');

        $invoiceId = $response->json('invoice_id');
        $this->assertNotNull($invoiceId);

        $this->assertDatabaseHas('quotes', ['id' => $quote->id, 'status' => 'accepted']);
        $this->assertDatabaseHas('invoices', ['id' => $invoiceId, 'quote_id' => $quote->id]);
    }

    public function test_accept_is_idempotent(): void
    {
        $quote = $this->makeQuote();

        $first = $this->postJson("/api/v1/public/quotes/{$quote->public_token}/accept");
        $first->assertStatus(200);
        $firstInvoiceId = $first->json('invoice_id');

        $second = $this->postJson("/api/v1/public/quotes/{$quote->public_token}/accept");
        $second->assertStatus(200)
            ->assertJsonPath('data.status', 'accepted')
            ->assertJsonPath('invoice_id', $firstInvoiceId);

        // Only one invoice should exist for this quote.
        $this->assertSame(1, \App\Models\Invoice::withoutGlobalScopes()->where('quote_id', $quote->id)->count());
    }

    public function test_decline_marks_declined(): void
    {
        $quote = $this->makeQuote();

        $response = $this->postJson("/api/v1/public/quotes/{$quote->public_token}/decline", [
            'reason' => 'Too expensive right now.',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'declined');

        $this->assertDatabaseHas('quotes', ['id' => $quote->id, 'status' => 'declined']);
    }

    public function test_expired_quote_cannot_be_accepted(): void
    {
        $quote = $this->makeQuote([
            'valid_until' => now()->subDay(),
        ]);

        $response = $this->postJson("/api/v1/public/quotes/{$quote->public_token}/accept");

        $response->assertStatus(410);
        $this->assertDatabaseHas('quotes', ['id' => $quote->id, 'status' => 'sent']);
    }

    public function test_declined_quote_cannot_then_be_accepted(): void
    {
        $quote = $this->makeQuote(['status' => 'declined']);

        $response = $this->postJson("/api/v1/public/quotes/{$quote->public_token}/accept");

        $response->assertStatus(409);
        $this->assertDatabaseMissing('invoices', ['quote_id' => $quote->id]);
    }

    public function test_accepted_quote_cannot_then_be_declined(): void
    {
        $quote = $this->makeQuote(['status' => 'accepted']);

        $response = $this->postJson("/api/v1/public/quotes/{$quote->public_token}/decline");

        $response->assertStatus(409);
        $this->assertDatabaseHas('quotes', ['id' => $quote->id, 'status' => 'accepted']);
    }
}
