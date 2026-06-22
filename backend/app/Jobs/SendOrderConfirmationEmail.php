<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Order;
use App\Services\EmailService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

final class SendOrderConfirmationEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(
        public Order $order,
    ) {
        $this->onQueue('emails');
    }

    public function handle(EmailService $emailService): void
    {
        $order = $this->order->fresh(['items.service', 'customer']);

        if (! $order) {
            return;
        }

        $email = $order->customer_email;
        if (! $email) {
            return;
        }

        $customerName = $order->customer_name ?? $order->customer?->owner_name ?? 'Customer';
        $subject = "Order Confirmed — #{$order->order_number}";
        $html = $this->buildHtml($order, $customerName);

        $result = $emailService->send($email, $subject, $html, null, [
            'tag' => 'order_confirmation',
        ]);

        if ($result && ($result['success'] ?? false)) {
            Log::info('Order confirmation email sent', [
                'order_id' => $order->id,
                'email' => $email,
            ]);
        } else {
            Log::warning('Order confirmation email failed', [
                'order_id' => $order->id,
                'error' => $result['error'] ?? 'unknown',
            ]);
        }
    }

    private function buildHtml(Order $order, string $customerName): string
    {
        $itemsHtml = '';
        foreach ($order->items as $item) {
            $itemTotal = number_format((float) $item->total, 2);
            $itemsHtml .= <<<HTML
            <tr>
                <td style="padding:8px 0;border-bottom:1px solid #eee;">{$item->service_name}</td>
                <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:center;">{$item->quantity}</td>
                <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">\${$itemTotal}</td>
            </tr>
            HTML;
        }

        $subtotal = number_format((float) $order->subtotal, 2);
        $tax = number_format((float) $order->tax, 2);
        $total = number_format((float) $order->total, 2);
        $orderDate = $order->paid_at?->format('F j, Y') ?? $order->created_at->format('F j, Y');
        $dashboardUrl = rtrim((string) config('app.frontend_url', config('app.url')), '/') . '/learning/services/orders';

        return <<<HTML
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
            <h2 style="color:#111;">Order Confirmed</h2>
            <p>Hi {$customerName},</p>
            <p>Thank you for your purchase! Here's a summary of your order.</p>

            <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:20px 0;">
                <p style="margin:0 0 4px;"><strong>Order:</strong> #{$order->order_number}</p>
                <p style="margin:0;"><strong>Date:</strong> {$orderDate}</p>
            </div>

            <table style="width:100%;border-collapse:collapse;margin:20px 0;">
                <thead>
                    <tr style="border-bottom:2px solid #e5e7eb;">
                        <th style="text-align:left;padding:8px 0;font-size:13px;color:#6b7280;">Item</th>
                        <th style="text-align:center;padding:8px 0;font-size:13px;color:#6b7280;">Qty</th>
                        <th style="text-align:right;padding:8px 0;font-size:13px;color:#6b7280;">Total</th>
                    </tr>
                </thead>
                <tbody>{$itemsHtml}</tbody>
            </table>

            <div style="text-align:right;margin:16px 0;">
                <p style="margin:4px 0;color:#6b7280;">Subtotal: \${$subtotal}</p>
                <p style="margin:4px 0;color:#6b7280;">Tax: \${$tax}</p>
                <p style="margin:4px 0;font-size:18px;font-weight:bold;color:#111;">Total: \${$total}</p>
            </div>

            <p style="margin-top:24px;">
                <a href="{$dashboardUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">
                    View Your Orders
                </a>
            </p>

            <p style="margin-top:24px;font-size:13px;color:#666;">
                If you have questions about your order, reply to this email or contact our support team.
            </p>
        </div>
        HTML;
    }
}
