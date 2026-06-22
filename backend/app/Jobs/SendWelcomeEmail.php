<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Customer;
use App\Models\ServiceSubscription;
use App\Services\EmailService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

final class SendWelcomeEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(
        public Customer $customer,
        public ?ServiceSubscription $subscription = null,
    ) {
        $this->onQueue('emails');
    }

    public function handle(EmailService $emailService): void
    {
        $customer = $this->customer->fresh();

        if (! $customer) {
            return;
        }

        $email = $customer->email ?? $customer->primary_email;
        if (! $email) {
            return;
        }

        $subscription = $this->subscription?->fresh(['service']);
        $customerName = $customer->owner_name ?? $customer->business_name ?? 'there';
        $subject = 'Welcome to Fibonacco — here\'s how to get started';
        $html = $this->buildHtml($customerName, $subscription);

        $result = $emailService->send($email, $subject, $html, null, [
            'tag' => 'welcome',
        ]);

        if ($result && ($result['success'] ?? false)) {
            Log::info('Welcome email sent', [
                'customer_id' => $customer->id,
                'email' => $email,
            ]);
        } else {
            Log::warning('Welcome email send failed', [
                'customer_id' => $customer->id,
                'error' => $result['error'] ?? 'unknown',
            ]);
        }
    }

    private function buildHtml(string $customerName, ?ServiceSubscription $subscription): string
    {
        $baseUrl = rtrim((string) config('app.frontend_url', config('app.url')), '/');
        $servicesUrl = $baseUrl . '/learning/services';
        $billingUrl = $baseUrl . '/learning/services/billing';

        $subscriptionBlock = '';
        if ($subscription && $subscription->service) {
            $serviceName = $subscription->service->name;
            $tier = ucfirst($subscription->tier ?? 'standard');
            $expiresAt = $subscription->subscription_expires_at?->format('F j, Y') ?? 'N/A';

            $subscriptionBlock = <<<HTML
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:20px 0;">
                <h3 style="margin:0 0 8px;color:#166534;">Your Subscription</h3>
                <p style="margin:4px 0;"><strong>Service:</strong> {$serviceName}</p>
                <p style="margin:4px 0;"><strong>Tier:</strong> {$tier}</p>
                <p style="margin:4px 0;"><strong>Next billing:</strong> {$expiresAt}</p>
            </div>
            HTML;
        }

        return <<<HTML
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
            <h2 style="color:#111;">Welcome to Fibonacco!</h2>
            <p>Hi {$customerName},</p>
            <p>Thanks for joining us. Your account is set up and ready to go.</p>

            {$subscriptionBlock}

            <h3 style="color:#111;margin-top:24px;">Get started in 3 steps:</h3>
            <ol style="line-height:1.8;">
                <li><strong>Explore your services</strong> — See what's included in your plan</li>
                <li><strong>Check out the Learning Center</strong> — Tutorials and guides to help you grow</li>
                <li><strong>Set up your billing</strong> — Manage payment methods and invoices</li>
            </ol>

            <div style="margin-top:24px;">
                <a href="{$servicesUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;margin-right:12px;">
                    Browse Services
                </a>
                <a href="{$billingUrl}" style="display:inline-block;padding:12px 24px;background:#fff;color:#2563eb;text-decoration:none;border-radius:6px;font-weight:bold;border:1px solid #2563eb;">
                    Manage Billing
                </a>
            </div>

            <p style="margin-top:32px;font-size:13px;color:#666;">
                Need help? Reply to this email or visit our Learning Center for guides and tutorials.
            </p>
        </div>
        HTML;
    }
}
