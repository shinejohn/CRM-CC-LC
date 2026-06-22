<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Invoice;
use Barryvdh\DomPDF\Facade\Pdf;
use Barryvdh\DomPDF\PDF as PdfInstance;

final class InvoicePdfService
{
    /**
     * Render a branded PDF for the given invoice.
     */
    public function render(Invoice $invoice): PdfInstance
    {
        $invoice->loadMissing(['customer', 'items', 'payments']);

        $money = static fn (string|float|int|null $value): string
            => '$' . number_format((float) ($value ?? 0), 2);

        return Pdf::loadView('pdf.invoice', [
            'invoice' => $invoice,
            'company' => config('fibonacco.invoice'),
            'money' => $money,
            'issueDate' => optional($invoice->sent_at ?? $invoice->created_at)->format('M d, Y') ?? '—',
            'dueDate' => optional($invoice->due_date)->format('M d, Y') ?? '—',
        ])->setPaper('letter');
    }

    /**
     * Suggested download filename for the invoice PDF.
     */
    public function filename(Invoice $invoice): string
    {
        return $invoice->invoice_number . '.pdf';
    }
}
