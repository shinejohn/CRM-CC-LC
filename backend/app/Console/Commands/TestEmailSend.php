<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

final class TestEmailSend extends Command
{
    protected $signature = 'campaign:test-send
        {email : Recipient email address}';

    protected $description = 'Send a single test email to verify mail delivery configuration';

    public function handle(): int
    {
        $recipient = $this->argument('email');
        $mailer = config('mail.default');
        $host = config('mail.mailers.smtp.host', '(not set)');
        $from = config('mail.from.address', '(not set)');

        $this->info("Mail provider: {$mailer}");
        $this->info("SMTP host: {$host}");
        $this->info("From: {$from}");
        $this->info("Sending test email to: {$recipient}");
        $this->newLine();

        $html = <<<HTML
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: -apple-system, sans-serif; padding: 40px; background: #f5f5f5;">
            <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 8px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                <h2 style="color: #1e1b4b; margin-top: 0;">Fibonacco Email Test</h2>
                <p style="color: #374151; line-height: 1.6;">
                    This is a test email from the Fibonacco Learning Center.
                    If you're reading this, email delivery is working correctly.
                </p>
                <p style="color: #6b7280; font-size: 13px; margin-bottom: 0;">
                    Sent at: {$this->now()} via {$mailer} ({$host})
                </p>
            </div>
        </body>
        </html>
        HTML;

        try {
            Mail::html($html, function ($message) use ($recipient): void {
                $message->to($recipient)
                    ->subject('[Fibonacco] Email Delivery Test — ' . now()->format('Y-m-d H:i'));
            });

            $this->info('Test email sent successfully.');

            return 0;
        } catch (\Throwable $e) {
            $this->error('Failed to send: ' . $e->getMessage());

            return 1;
        }
    }

    private function now(): string
    {
        return now()->format('Y-m-d H:i:s T');
    }
}
