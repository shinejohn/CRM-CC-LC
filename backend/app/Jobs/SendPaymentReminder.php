<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\ServiceSubscription;
use App\Services\EmailService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

final class SendPaymentReminder implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(
        public ServiceSubscription $subscription,
        public string $reason,
    ) {
        $this->onQueue('emails');
    }

    public function handle(EmailService $emailService): void
    {
        $subscription = $this->subscription->fresh(['customer', 'service']);

        if (! $subscription || ! $subscription->customer) {
            return;
        }

        $customer = $subscription->customer;
        $email = $customer->email ?? $customer->primary_email;

        if (! $email) {
            Log::warning('SendPaymentReminder: no email for customer', [
                'customer_id' => $customer->id,
            ]);

            return;
        }

        $serviceName = $subscription->service?->name ?? 'your subscription';
        $amount = number_format((float) $subscription->monthly_amount, 2);
        $attempts = $subscription->renewal_attempts;
        $maxAttempts = 3;

        $subject = $this->buildSubject($serviceName, $attempts, $maxAttempts);
        $html = $this->buildHtml($customer, $serviceName, $amount, $attempts, $maxAttempts);

        $result = $emailService->send($email, $subject, $html, null, [
            'tag' => 'payment_reminder',
        ]);

        if ($result && ($result['success'] ?? false)) {
            Log::info('Payment reminder sent', [
                'subscription_id' => $subscription->id,
                'customer_id' => $customer->id,
                'reason' => $this->reason,
                'attempt' => $attempts,
            ]);
        } else {
            Log::warning('Payment reminder send failed', [
                'subscription_id' => $subscription->id,
                'error' => $result['error'] ?? 'unknown',
            ]);
        }
    }

    private function buildSubject(string $serviceName, int $attempts, int $maxAttempts): string
    {
        if ($this->reason === 'missing_payment_method') {
            return "Action required: Update payment method for {$serviceName}";
        }

        if ($attempts >= $maxAttempts) {
            return "Final notice: {$serviceName} subscription suspended";
        }

        if ($attempts >= 2) {
            return "Urgent: Payment failed for {$serviceName} — update your payment method";
        }

        return "Payment issue with {$serviceName} — please update your billing info";
    }

    private function buildHtml(
        \App\Models\Customer $customer,
        string $serviceName,
        string $amount,
        int $attempts,
        int $maxAttempts,
    ): string {
        $name = $customer->owner_name ?? $customer->business_name ?? 'Customer';
        $updateUrl = rtrim((string) config('app.frontend_url', config('app.url')), '/') . '/learning/services/billing';

        $urgencyNote = '';
        if ($attempts >= $maxAttempts) {
            $urgencyNote = '<p style="color:#dc2626;font-weight:bold;">Your subscription has been suspended due to repeated payment failures. Please update your payment method to reactivate.</p>';
        } elseif ($attempts >= 2) {
            $remaining = $maxAttempts - $attempts;
            $urgencyNote = "<p style=\"color:#d97706;\">We will attempt to charge your card {$remaining} more time(s) before suspending your subscription.</p>";
        }

        if ($this->reason === 'missing_payment_method') {
            $urgencyNote = '<p>We don\'t have a payment method on file for your account. Please add one to continue your subscription.</p>';
        }

        return <<<HTML
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
            <h2 style="color:#111;">Payment Update Required</h2>
            <p>Hi {$name},</p>
            <p>We were unable to process your payment of <strong>\${$amount}</strong> for <strong>{$serviceName}</strong>.</p>
            {$urgencyNote}
            <p style="margin-top:24px;">
                <a href="{$updateUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">
                    Update Payment Method
                </a>
            </p>
            <p style="margin-top:24px;font-size:13px;color:#666;">
                If you believe this is an error, please contact our support team.
            </p>
        </div>
        HTML;
    }
}
