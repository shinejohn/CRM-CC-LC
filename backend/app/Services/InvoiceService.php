<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\InvoicePayment;
use App\Models\Quote;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class InvoiceService
{
    /**
     * Generate invoice number: INV-{YYYYMMDD}-{SEQ}
     */
    public function generateInvoiceNumber(string $tenantId): string
    {
        $prefix = 'INV-' . now()->format('Ymd') . '-';
        $last = Invoice::where('invoice_number', 'like', $prefix . '%')
            ->orderBy('invoice_number', 'desc')
            ->first();

        $seq = $last ? (int) substr($last->invoice_number, strlen($prefix)) + 1 : 1;

        return $prefix . str_pad((string) $seq, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Create invoice from quote.
     */
    public function createFromQuote(Quote $quote): Invoice
    {
        return DB::transaction(function () use ($quote) {
            $invoice = Invoice::create([
                'tenant_id' => $quote->tenant_id,
                'customer_id' => $quote->customer_id,
                'quote_id' => $quote->id,
                'invoice_number' => $this->generateInvoiceNumber($quote->tenant_id),
                'status' => 'draft',
                'subtotal' => $quote->subtotal,
                'tax' => $quote->tax,
                'discount' => $quote->discount,
                'total' => $quote->total,
                'amount_paid' => 0,
                'balance_due' => $quote->total,
                'due_date' => $quote->valid_until?->addDays(30) ?? now()->addDays(30),
                'notes' => $quote->notes,
            ]);

            foreach ($quote->items as $i => $item) {
                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'description' => $item->description,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'total' => $item->total,
                    'sort_order' => $i,
                ]);
            }

            return $invoice->load(['customer', 'quote', 'items']);
        });
    }

    /**
     * List invoices for tenant.
     */
    public function list(string $tenantId, array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = Invoice::where('tenant_id', $tenantId)
            ->with(['customer', 'quote', 'items', 'payments']);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['customer_id'])) {
            $query->where('customer_id', $filters['customer_id']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'ilike', "%{$search}%")
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
     * Create invoice with items.
     */
    public function create(string $tenantId, array $data): Invoice
    {
        return DB::transaction(function () use ($tenantId, $data) {
            $subtotal = 0;
            $items = [];
            foreach ($data['items'] ?? [] as $i => $item) {
                $total = ($item['quantity'] ?? 1) * ($item['unit_price'] ?? 0);
                $subtotal += $total;
                $items[] = [
                    'description' => $item['description'],
                    'quantity' => $item['quantity'] ?? 1,
                    'unit_price' => $item['unit_price'] ?? 0,
                    'total' => $total,
                    'sort_order' => $i,
                ];
            }

            $tax = round($subtotal * (($data['tax_rate'] ?? 0) / 100), 2);
            $discount = $data['discount'] ?? 0;
            $total = $subtotal - $discount + $tax;

            $invoice = Invoice::create([
                'tenant_id' => $tenantId,
                'customer_id' => $data['customer_id'],
                'quote_id' => $data['quote_id'] ?? null,
                'invoice_number' => $this->generateInvoiceNumber($tenantId),
                'status' => 'draft',
                'subtotal' => $subtotal,
                'tax' => $tax,
                'discount' => $discount,
                'total' => $total,
                'amount_paid' => 0,
                'balance_due' => $total,
                'due_date' => $data['due_date'] ?? now()->addDays(30),
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($items as $item) {
                InvoiceItem::create(array_merge($item, ['invoice_id' => $invoice->id]));
            }

            return $invoice->load(['customer', 'quote', 'items']);
        });
    }

    /**
     * Record payment on invoice.
     */
    public function recordPayment(Invoice $invoice, float $amount, array $data = []): Invoice
    {
        if ($amount <= 0) {
            throw new \InvalidArgumentException('Payment amount must be positive');
        }

        if ($amount > $invoice->balance_due) {
            throw new \InvalidArgumentException('Payment amount exceeds balance due');
        }

        return DB::transaction(function () use ($invoice, $amount, $data) {
            InvoicePayment::create([
                'invoice_id' => $invoice->id,
                'amount' => $amount,
                'payment_method' => $data['payment_method'] ?? null,
                'reference' => $data['reference'] ?? null,
                'paid_at' => $data['paid_at'] ?? now(),
                'notes' => $data['notes'] ?? null,
            ]);

            $newPaid = $invoice->amount_paid + $amount;
            $newBalance = $invoice->total - $newPaid;

            $status = $newBalance <= 0 ? 'paid' : 'partial';
            $paidAt = $newBalance <= 0 ? now() : $invoice->paid_at;

            $invoice->update([
                'amount_paid' => $newPaid,
                'balance_due' => max(0, $newBalance),
                'status' => $status,
                'paid_at' => $paidAt,
            ]);

            return $invoice->fresh(['customer', 'quote', 'items', 'payments']);
        });
    }

    /**
     * Send invoice: set status to sent, record sent_at.
     */
    public function send(Invoice $invoice): Invoice
    {
        if ($invoice->status !== 'draft') {
            throw new \InvalidArgumentException('Only draft invoices can be sent');
        }

        $invoice->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        return $invoice->load(['customer', 'quote', 'items', 'payments']);
    }

    /**
     * Mark overdue invoices.
     */
    public function markOverdue(): int
    {
        return Invoice::whereIn('status', ['draft', 'sent', 'partial'])
            ->whereNotNull('due_date')
            ->where('due_date', '<', now()->startOfDay())
            ->where('balance_due', '>', 0)
            ->update(['status' => 'overdue']);
    }
}
