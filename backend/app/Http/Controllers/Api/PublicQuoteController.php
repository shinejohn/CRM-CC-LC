<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Quote;
use App\Services\QuoteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class PublicQuoteController extends Controller
{
    public function __construct(
        protected QuoteService $quoteService
    ) {}

    /**
     * Show a quote by its public token (no auth, token-gated).
     */
    public function show(string $token): JsonResponse
    {
        $quote = $this->resolveQuote($token);

        if ($quote === null) {
            return response()->json(['message' => 'Quote not found.'], 404);
        }

        return response()->json(['data' => $this->presentQuote($quote)]);
    }

    /**
     * Accept a quote: mark accepted and convert to an invoice.
     */
    public function accept(string $token): JsonResponse
    {
        $quote = $this->resolveQuote($token);

        if ($quote === null) {
            return response()->json(['message' => 'Quote not found.'], 404);
        }

        if ($quote->status === 'declined') {
            return response()->json(['message' => 'This quote has already been declined and can no longer be accepted.'], 409);
        }

        if ($quote->status === 'expired' || ($quote->status === 'sent' && $quote->isPastValidUntil())) {
            return response()->json(['message' => 'This quote has expired and can no longer be accepted.'], 410);
        }

        if ($quote->status !== 'sent' && $quote->status !== 'accepted') {
            return response()->json(['message' => 'This quote is not available for acceptance.'], 409);
        }

        // Idempotent: if already accepted, return the existing invoice instead of converting again.
        $invoice = $quote->status === 'accepted'
            ? $quote->invoice()->first()
            : $this->quoteService->convertToInvoice($quote);

        $quote->refresh();

        return response()->json([
            'data' => $this->presentQuote($quote),
            'invoice_id' => $invoice?->id,
        ]);
    }

    /**
     * Decline a quote.
     */
    public function decline(Request $request, string $token): JsonResponse
    {
        $quote = $this->resolveQuote($token);

        if ($quote === null) {
            return response()->json(['message' => 'Quote not found.'], 404);
        }

        if ($quote->status === 'accepted') {
            return response()->json(['message' => 'This quote has already been accepted and can no longer be declined.'], 409);
        }

        if ($quote->status === 'declined') {
            return response()->json(['data' => $this->presentQuote($quote)]);
        }

        $reason = $request->input('reason');
        $metadata = $quote->metadata ?? [];
        if (is_string($reason) && $reason !== '') {
            $metadata['decline_reason'] = mb_substr($reason, 0, 1000);
        }

        $quote->update([
            'status' => 'declined',
            'metadata' => $metadata,
        ]);

        $quote->refresh();

        return response()->json(['data' => $this->presentQuote($quote)]);
    }

    /**
     * Resolve a quote by its public token. No global scopes (unauthenticated context).
     */
    private function resolveQuote(string $token): ?Quote
    {
        if ($token === '' || mb_strlen($token) < 16) {
            return null;
        }

        return Quote::withoutGlobalScopes()
            ->with(['items', 'customer'])
            ->where('public_token', $token)
            ->first();
    }

    /**
     * Build a safe, tenant-leak-free representation of the quote for public consumption.
     */
    private function presentQuote(Quote $quote): array
    {
        return [
            'quote_number' => $quote->quote_number,
            'status' => $quote->status,
            'subtotal' => $quote->subtotal,
            'tax' => $quote->tax,
            'tax_rate' => $quote->tax_rate,
            'discount' => $quote->discount,
            'total' => $quote->total,
            'valid_until' => $quote->valid_until?->toIso8601String(),
            'sent_at' => $quote->sent_at?->toIso8601String(),
            'is_expired' => $quote->status === 'expired' || ($quote->status === 'sent' && $quote->isPastValidUntil()),
            'notes' => $quote->notes,
            'business_name' => $quote->customer?->business_name,
            'items' => $quote->items->map(fn ($item) => [
                'description' => $item->description,
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price,
                'total' => $item->total,
            ])->values(),
        ];
    }
}
