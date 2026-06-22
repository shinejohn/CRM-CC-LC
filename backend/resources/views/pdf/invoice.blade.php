<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Invoice {{ $invoice->invoice_number }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            color: #1f2937;
            line-height: 1.5;
        }
        .wrap { padding: 40px 44px; }
        .header {
            width: 100%;
            border-bottom: 3px solid #4f46e5;
            padding-bottom: 18px;
            margin-bottom: 28px;
        }
        .header td { vertical-align: top; }
        .doc-title {
            font-size: 30px;
            font-weight: bold;
            color: #4f46e5;
            letter-spacing: 2px;
        }
        .doc-number { color: #6b7280; margin-top: 4px; font-size: 13px; }
        .company { text-align: right; }
        .company .name { font-size: 15px; font-weight: bold; color: #111827; }
        .company .line { color: #6b7280; font-size: 11px; }
        .status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .status-paid { background: #dcfce7; color: #15803d; }
        .status-sent, .status-pending { background: #dbeafe; color: #1d4ed8; }
        .status-partial { background: #fef9c3; color: #a16207; }
        .status-overdue { background: #fee2e2; color: #b91c1c; }
        .status-draft, .status-cancelled, .status-void { background: #f3f4f6; color: #6b7280; }
        .meta { width: 100%; margin-bottom: 28px; }
        .meta td { vertical-align: top; width: 50%; }
        .label {
            font-size: 10px;
            font-weight: bold;
            color: #9ca3af;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 4px;
        }
        .bill-to .name { font-weight: bold; font-size: 13px; color: #111827; }
        .bill-to .line { color: #4b5563; font-size: 11px; }
        .dates td { padding-bottom: 10px; }
        table.items {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
        }
        table.items thead th {
            background: #f9fafb;
            border-bottom: 2px solid #e5e7eb;
            padding: 10px 8px;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #6b7280;
            text-align: left;
        }
        table.items thead th.right,
        table.items tbody td.right { text-align: right; }
        table.items tbody td {
            padding: 10px 8px;
            border-bottom: 1px solid #f3f4f6;
            color: #1f2937;
        }
        .totals { width: 100%; }
        .totals td { vertical-align: top; }
        .totals .summary { width: 260px; float: right; }
        .totals .summary table { width: 100%; border-collapse: collapse; }
        .totals .summary td { padding: 6px 0; color: #4b5563; }
        .totals .summary td.amt { text-align: right; color: #1f2937; }
        .totals .summary tr.grand td {
            border-top: 2px solid #e5e7eb;
            padding-top: 12px;
            font-size: 15px;
            font-weight: bold;
            color: #111827;
        }
        .totals .summary tr.grand td.amt { color: #4f46e5; }
        .payments { margin-top: 40px; clear: both; }
        .payments h3 {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #6b7280;
            margin-bottom: 8px;
        }
        .payments table { width: 100%; border-collapse: collapse; }
        .payments th {
            text-align: left;
            font-size: 10px;
            text-transform: uppercase;
            color: #9ca3af;
            padding: 6px 8px;
            border-bottom: 1px solid #e5e7eb;
        }
        .payments th.right, .payments td.right { text-align: right; }
        .payments td { padding: 6px 8px; border-bottom: 1px solid #f3f4f6; color: #4b5563; }
        .notes { margin-top: 32px; clear: both; }
        .notes .label { margin-bottom: 6px; }
        .notes p { color: #4b5563; }
        .footer {
            margin-top: 48px;
            text-align: center;
            color: #9ca3af;
            font-size: 10px;
            border-top: 1px solid #f3f4f6;
            padding-top: 16px;
        }
    </style>
</head>
<body>
<div class="wrap">
    <table class="header">
        <tr>
            <td>
                <div class="doc-title">INVOICE</div>
                <div class="doc-number">{{ $invoice->invoice_number }}</div>
                <div style="margin-top:10px;">
                    <span class="status status-{{ $invoice->status }}">{{ $invoice->status }}</span>
                </div>
            </td>
            <td class="company">
                <div class="name">{{ $company['company_name'] }}</div>
                <div class="line">{{ $company['address_line1'] }}</div>
                <div class="line">{{ $company['address_line2'] }}</div>
                <div class="line">{{ $company['email'] }}</div>
                <div class="line">{{ $company['website'] }}</div>
            </td>
        </tr>
    </table>

    <table class="meta">
        <tr>
            <td class="bill-to">
                <div class="label">Bill To</div>
                <div class="name">{{ $invoice->customer?->business_name ?? '—' }}</div>
                @if ($invoice->customer?->primary_contact_name)
                    <div class="line">{{ $invoice->customer->primary_contact_name }}</div>
                @endif
                @if ($invoice->customer?->primary_email ?? $invoice->customer?->email)
                    <div class="line">{{ $invoice->customer->primary_email ?? $invoice->customer->email }}</div>
                @endif
                @if ($invoice->customer?->address_line1)
                    <div class="line">{{ $invoice->customer->address_line1 }}</div>
                @endif
                @if ($invoice->customer?->city)
                    <div class="line">{{ $invoice->customer->city }}{{ $invoice->customer->state ? ', ' . $invoice->customer->state : '' }} {{ $invoice->customer->zip }}</div>
                @endif
            </td>
            <td>
                <table class="dates" style="width:100%;">
                    <tr>
                        <td>
                            <div class="label">Issue Date</div>
                            <div>{{ $issueDate }}</div>
                        </td>
                        <td>
                            <div class="label">Due Date</div>
                            <div>{{ $dueDate }}</div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <table class="items">
        <thead>
            <tr>
                <th>Description</th>
                <th class="right">Qty</th>
                <th class="right">Unit Price</th>
                <th class="right">Amount</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($invoice->items as $item)
                <tr>
                    <td>{{ $item->description }}</td>
                    <td class="right">{{ rtrim(rtrim(number_format((float) $item->quantity, 2), '0'), '.') }}</td>
                    <td class="right">{{ $money($item->unit_price) }}</td>
                    <td class="right">{{ $money($item->total) }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="4" style="text-align:center; color:#9ca3af; padding:20px;">No line items on this invoice.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <table class="totals">
        <tr>
            <td>
                <div class="summary">
                    <table>
                        <tr>
                            <td>Subtotal</td>
                            <td class="amt">{{ $money($invoice->subtotal) }}</td>
                        </tr>
                        <tr>
                            <td>Discount</td>
                            <td class="amt">{{ $money($invoice->discount) }}</td>
                        </tr>
                        <tr>
                            <td>Tax</td>
                            <td class="amt">{{ $money($invoice->tax) }}</td>
                        </tr>
                        <tr class="grand">
                            <td>Total</td>
                            <td class="amt">{{ $money($invoice->total) }}</td>
                        </tr>
                        <tr>
                            <td>Amount Paid</td>
                            <td class="amt">{{ $money($invoice->amount_paid) }}</td>
                        </tr>
                        <tr>
                            <td>Balance Due</td>
                            <td class="amt">{{ $money($invoice->balance_due) }}</td>
                        </tr>
                    </table>
                </div>
            </td>
        </tr>
    </table>

    @if ($invoice->payments->isNotEmpty())
        <div class="payments">
            <h3>Payment History</h3>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Method</th>
                        <th>Reference</th>
                        <th class="right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($invoice->payments as $payment)
                        <tr>
                            <td>{{ optional($payment->paid_at)->format('M d, Y') ?? '—' }}</td>
                            <td>{{ $payment->payment_method ?? 'Payment' }}</td>
                            <td>{{ $payment->reference ?? '—' }}</td>
                            <td class="right">{{ $money($payment->amount) }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    @endif

    @if ($invoice->notes)
        <div class="notes">
            <div class="label">Notes</div>
            <p>{{ $invoice->notes }}</p>
        </div>
    @endif

    <div class="footer">
        Thank you for your business. &middot; {{ $company['company_name'] }}
    </div>
</div>
</body>
</html>
