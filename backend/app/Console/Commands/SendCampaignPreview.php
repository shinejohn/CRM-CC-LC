<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

final class SendCampaignPreview extends Command
{
    protected $signature = 'campaign:send-preview
        {email : Recipient email address}
        {--delay=3 : Seconds between emails to avoid rate limits}
        {--dry-run : List emails without sending}';

    protected $description = 'Send all 90-day campaign emails to a single address for review';

    public function handle(): int
    {
        $recipient = $this->argument('email');
        $delay = (int) $this->option('delay');
        $dryRun = (bool) $this->option('dry-run');

        $contentPath = base_path('../content');
        if (! is_dir($contentPath)) {
            $this->error("Content directory not found at: {$contentPath}");
            return 1;
        }

        $files = glob($contentPath . '/campaign_*_complete.json');
        if (empty($files)) {
            $this->error('No campaign JSON files found.');
            return 1;
        }

        sort($files);

        // Collect all emails with their campaign context
        $allEmails = [];

        foreach ($files as $file) {
            $data = json_decode((string) file_get_contents($file), true);
            if (! $data) {
                $this->warn("Skipping invalid JSON: " . basename($file));
                continue;
            }

            $campaign = $data['campaign'] ?? [];
            $emails = $data['emails'] ?? [];
            $campaignId = $campaign['id'] ?? basename($file);
            $week = $campaign['week'] ?? '?';
            $day = $campaign['day'] ?? '?';
            $type = $campaign['type'] ?? 'Unknown';
            $title = $campaign['title'] ?? '';

            foreach ($emails as $variantKey => $emailData) {
                $allEmails[] = [
                    'campaign_id' => $campaignId,
                    'week' => $week,
                    'day' => $day,
                    'type' => $type,
                    'title' => $title,
                    'variant' => $variantKey,
                    'subject' => $emailData['subject'] ?? '(no subject)',
                    'preview_text' => $emailData['preview_text'] ?? '',
                    'body' => $emailData['body'] ?? '',
                ];
            }
        }

        // Sort by week, then day, then variant
        usort($allEmails, function (array $a, array $b): int {
            $weekCmp = ((int) $a['week']) <=> ((int) $b['week']);
            if ($weekCmp !== 0) return $weekCmp;
            $dayCmp = ((int) $a['day']) <=> ((int) $b['day']);
            if ($dayCmp !== 0) return $dayCmp;
            return $a['variant'] <=> $b['variant'];
        });

        $this->info("Found " . count($allEmails) . " emails across " . count($files) . " campaigns.");
        $this->info("Recipient: {$recipient}");
        $this->newLine();

        if ($dryRun) {
            $this->table(
                ['#', 'Campaign', 'Week', 'Day', 'Variant', 'Subject'],
                collect($allEmails)->map(function (array $e, int $i): array {
                    return [
                        $i + 1,
                        $e['campaign_id'],
                        $e['week'],
                        $e['day'],
                        $e['variant'],
                        mb_substr($e['subject'], 0, 60),
                    ];
                })->toArray()
            );
            $this->info('Dry run complete. Use without --dry-run to send.');
            return 0;
        }

        $count = count($allEmails);
        $sent = 0;
        $failed = 0;

        if (! $this->confirm("Send {$count} emails to {$recipient}?", true)) {
            $this->info('Cancelled.');
            return 0;
        }

        $bar = $this->output->createProgressBar($count);
        $bar->start();

        foreach ($allEmails as $i => $emailData) {
            $subjectLine = sprintf(
                '[%s] Week %s Day %s — %s',
                $emailData['campaign_id'],
                $emailData['week'],
                $emailData['day'],
                $emailData['subject']
            );

            $htmlBody = $this->buildHtml($emailData);

            try {
                Mail::html($htmlBody, function ($message) use ($recipient, $subjectLine, $emailData): void {
                    $message->to($recipient)
                        ->subject($subjectLine)
                        ->replyTo('noreply@fibonacco.com');

                    if ($emailData['preview_text']) {
                        $message->getHeaders()->addTextHeader(
                            'X-Preview-Text',
                            $emailData['preview_text']
                        );
                    }
                });

                $sent++;
            } catch (\Throwable $e) {
                $failed++;
                $this->newLine();
                $this->error("  Failed [{$emailData['campaign_id']}]: {$e->getMessage()}");
            }

            $bar->advance();

            // Rate limit delay between emails
            if ($i < $count - 1 && $delay > 0) {
                sleep($delay);
            }
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("Done! Sent: {$sent}, Failed: {$failed}");

        return $failed > 0 ? 1 : 0;
    }

    private function buildHtml(array $emailData): string
    {
        $body = e($emailData['body']);
        $body = nl2br($body);

        // Replace template variables with demo values
        $body = str_replace(
            ['{{business_name}}', '{{community_name}}', '{{customer_name}}', '{{city}}', '{{your_business}}'],
            ['Your Business', 'Clearwater, FL', 'Business Owner', 'Clearwater', 'Your Business'],
            $body
        );

        $campaignId = e($emailData['campaign_id']);
        $week = e($emailData['week']);
        $day = e($emailData['day']);
        $type = e($emailData['type']);
        $title = e($emailData['title']);
        $variant = e($emailData['variant']);
        $previewText = e($emailData['preview_text']);

        return <<<HTML
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
                .meta-bar { background: #1e1b4b; color: white; padding: 16px 24px; }
                .meta-bar h3 { margin: 0 0 4px 0; font-size: 14px; color: #a5b4fc; }
                .meta-bar p { margin: 0; font-size: 12px; color: #94a3b8; }
                .meta-bar .campaign-id { font-size: 18px; font-weight: bold; color: white; }
                .meta-tags { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
                .meta-tag { background: rgba(255,255,255,0.1); border-radius: 4px; padding: 2px 8px; font-size: 11px; color: #c7d2fe; }
                .email-body { background: white; max-width: 600px; margin: 0 auto; padding: 32px 24px; line-height: 1.6; color: #1f2937; font-size: 15px; }
                .preview-text { background: #fef3c7; border-left: 3px solid #f59e0b; padding: 8px 12px; margin-bottom: 20px; font-size: 13px; color: #92400e; }
                .footer { text-align: center; padding: 16px; color: #9ca3af; font-size: 11px; }
            </style>
        </head>
        <body>
            <div class="meta-bar">
                <div class="campaign-id">{$campaignId}</div>
                <h3>{$title}</h3>
                <p>Variant: {$variant}</p>
                <div class="meta-tags">
                    <span class="meta-tag">Week {$week}</span>
                    <span class="meta-tag">Day {$day}</span>
                    <span class="meta-tag">{$type}</span>
                </div>
            </div>
            <div class="email-body">
                <div class="preview-text">Preview: {$previewText}</div>
                {$body}
            </div>
            <div class="footer">
                Fibonacco 90-Day Campaign Preview &middot; Email {$variant}
            </div>
        </body>
        </html>
        HTML;
    }
}
