<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Quote;
use App\Models\QuoteItem;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class QuoteService
{
    /**
     * Generate quote number: Q-{YYYYMMDD}-{SEQ}
     */
    public function generateQuoteNumber(string $tenantId): string
    {
        $prefix = 'Q-' . now()->format('Ymd') . '-';
        $last = Quote::where('quote_number', 'like', $prefix . '%')
            ->orderBy('quote_number', 'desc')
            ->first();

        $seq = $last ? (int) substr($last->quote_number, strlen($prefix)) + 1 : 1;

        return $prefix . str_pad((string) $seq, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Calculate totals from items.
     */
    public function calculateTotals(Quote $quote): void
    {
        $subtotal = $quote->items->sum('total');
        $tax = round($subtotal * ($quote->tax_rate / 100), 2);
        $total = $subtotal - $quote->discount + $tax;

        $quote->update([
            'subtotal' => $subtotal,
            'tax' => $tax,
            'total' => $total,
        ]);
    }

    /**
     * List quotes for tenant.
     */
    public function list(string $tenantId, array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = Quote::where('tenant_id', $tenantId)
            ->with(['customer', 'deal', 'items']);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['customer_id'])) {
            $query->where('customer_id', $filters['customer_id']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('quote_number', 'ilike', "%{$search}%")
                    ->orWhereHas('customer', fn ($cq) => $cq->where('business_name', 'ilike', "%{$search}%"));
            });
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortDir = $filters['sort_dir'] ?? 'desc';
        $query->orderBy($sortBy, $sortDir);

        return $query->paginate($perPage);
    }

    /**
     * Create quote with items.
     */
    public function create(string $tenantId, array $data): Quote
    {
        return DB::transaction(function () use ($tenantId, $data) {
            $quote = Quote::create([
                'tenant_id' => $tenantId,
                'customer_id' => $data['customer_id'],
                'deal_id' => $data['deal_id'] ?? null,
                'quote_number' => $this->generateQuoteNumber($tenantId),
                'status' => 'draft',
                'tax_rate' => $data['tax_rate'] ?? 0,
                'discount' => $data['discount'] ?? 0,
                'valid_until' => $data['valid_until'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);

            if (!empty($data['items'])) {
                foreach ($data['items'] as $i => $item) {
                    $total = ($item['quantity'] ?? 1) * ($item['unit_price'] ?? 0);
                    QuoteItem::create([
                        'quote_id' => $quote->id,
                        'description' => $item['description'],
                        'quantity' => $item['quantity'] ?? 1,
                        'unit_price' => $item['unit_price'] ?? 0,
                        'total' => $total,
                        'sort_order' => $i,
                    ]);
                }
                $this->calculateTotals($quote->fresh());
            }

            return $quote->fresh()->load(['customer', 'deal', 'items']);
        });
    }

    /**
     * Update quote and items.
     */
    public function update(Quote $quote, array $data): Quote
    {
        return DB::transaction(function () use ($quote, $data) {
            $quote->fill(array_filter([
                'deal_id' => $data['deal_id'] ?? $quote->deal_id,
                'tax_rate' => $data['tax_rate'] ?? $quote->tax_rate,
                'discount' => $data['discount'] ?? $quote->discount,
                'valid_until' => $data['valid_until'] ?? $quote->valid_until,
                'notes' => $data['notes'] ?? $quote->notes,
            ]));
            $quote->save();

            if (isset($data['items'])) {
                $quote->items()->delete();
                foreach ($data['items'] as $i => $item) {
                    $total = ($item['quantity'] ?? 1) * ($item['unit_price'] ?? 0);
                    QuoteItem::create([
                        'quote_id' => $quote->id,
                        'description' => $item['description'],
                        'quantity' => $item['quantity'] ?? 1,
                        'unit_price' => $item['unit_price'] ?? 0,
                        'total' => $total,
                        'sort_order' => $i,
                    ]);
                }
                $this->calculateTotals($quote->fresh());
            }

            return $quote->load(['customer', 'deal', 'items']);
        });
    }

    /**
     * Send quote: set status to sent, record sent_at.
     */
    public function send(Quote $quote): Quote
    {
        if ($quote->status !== 'draft') {
            throw new \InvalidArgumentException('Only draft quotes can be sent');
        }

        $quote->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        return $quote->load(['customer', 'deal', 'items']);
    }

    /**
     * Convert quote to invoice.
     */
    public function convertToInvoice(Quote $quote): Invoice
    {
        if ($quote->status !== 'sent' && $quote->status !== 'accepted') {
            throw new \InvalidArgumentException('Only sent or accepted quotes can be converted to invoice');
        }

        return DB::transaction(function () use ($quote) {
            $invoiceService = app(InvoiceService::class);
            $invoice = $invoiceService->createFromQuote($quote);

            $quote->update(['status' => 'accepted']);

            return $invoice;
        });
    }

    /**
     * Check and expire sent quotes past valid_until.
     */
    public function expireStaleQuotes(): int
    {
        return Quote::where('status', 'sent')
            ->whereNotNull('valid_until')
            ->where('valid_until', '<', now())
            ->update(['status' => 'expired']);
    }
}
