<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

final class SendCampaignPreview extends Command
{
    protected $signature = 'campaign:send-preview
        {email? : Recipient email address (not needed with --html)}
        {--delay=3 : Seconds between emails to avoid rate limits}
        {--dry-run : List emails without sending}
        {--html : Write all emails as HTML files to storage/app/preview-emails/}';

    protected $description = 'Send all 90-day campaign emails to a single address for review';

    public function handle(): int
    {
        $recipient = $this->argument('email');
        $delay = (int) $this->option('delay');
        $dryRun = (bool) $this->option('dry-run');
        $htmlMode = (bool) $this->option('html');

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

        // ── HTML file mode: write all emails as browsable HTML files ──
        if ($htmlMode) {
            return $this->writeHtmlFiles($allEmails);
        }

        if (! $recipient) {
            $this->error('Email argument is required unless using --html mode.');
            return 1;
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

    private function writeHtmlFiles(array $allEmails): int
    {
        $outputDir = storage_path('app/preview-emails');

        if (is_dir($outputDir)) {
            // Clean old previews
            array_map('unlink', glob($outputDir . '/*.html'));
        } else {
            mkdir($outputDir, 0755, true);
        }

        $bar = $this->output->createProgressBar(count($allEmails));
        $bar->start();

        $indexRows = [];

        foreach ($allEmails as $i => $emailData) {
            $filename = sprintf(
                '%03d_w%02d_d%02d_%s_%s.html',
                $i + 1,
                (int) $emailData['week'],
                (int) $emailData['day'],
                preg_replace('/[^a-z0-9_-]/', '', strtolower(str_replace(' ', '-', $emailData['campaign_id']))),
                $emailData['variant']
            );

            $html = $this->buildHtml($emailData);
            file_put_contents($outputDir . '/' . $filename, $html);

            $indexRows[] = [
                'num' => $i + 1,
                'file' => $filename,
                'campaign' => $emailData['campaign_id'],
                'week' => $emailData['week'],
                'day' => $emailData['day'],
                'variant' => $emailData['variant'],
                'subject' => $emailData['subject'],
                'type' => $emailData['type'],
            ];

            $bar->advance();
        }

        // Build index page
        $this->buildIndexPage($outputDir, $indexRows);

        $bar->finish();
        $this->newLine(2);

        $indexPath = $outputDir . '/index.html';
        $this->info("Wrote " . count($allEmails) . " HTML files to:");
        $this->line("  {$outputDir}/");
        $this->newLine();
        $this->info("Open the index in your browser:");
        $this->line("  open {$indexPath}");

        return 0;
    }

    private function buildIndexPage(string $dir, array $rows): void
    {
        $tableRows = '';
        foreach ($rows as $r) {
            $subject = e($r['subject']);
            $campaign = e($r['campaign']);
            $type = e($r['type']);
            $tableRows .= <<<ROW
            <tr>
                <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;text-align:center;color:#6b7280">{$r['num']}</td>
                <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb"><a href="{$r['file']}" style="color:#4f46e5;text-decoration:none">{$subject}</a></td>
                <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:13px">{$campaign}</td>
                <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;text-align:center">{$r['week']}</td>
                <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;text-align:center">{$r['day']}</td>
                <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;text-align:center;font-size:12px;color:#6b7280">{$r['variant']}</td>
                <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:12px"><span style="background:#e0e7ff;color:#3730a3;padding:2px 8px;border-radius:4px;font-size:11px">{$type}</span></td>
            </tr>
            ROW;
        }

        $count = count($rows);
        $generated = now()->format('Y-m-d H:i:s');

        $html = <<<HTML
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Fibonacco 90-Day Campaign Emails ({$count})</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 24px; background: #f9fafb; color: #111827; }
                h1 { font-size: 24px; margin-bottom: 4px; }
                .subtitle { color: #6b7280; font-size: 14px; margin-bottom: 24px; }
                table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
                th { background: #1e1b4b; color: white; padding: 10px 12px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
                tr:hover { background: #f3f4f6; }
                a:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <h1>Fibonacco 90-Day Campaign Emails</h1>
            <p class="subtitle">{$count} emails &middot; Generated {$generated}</p>
            <table>
                <thead>
                    <tr>
                        <th style="text-align:center">#</th>
                        <th>Subject</th>
                        <th>Campaign</th>
                        <th style="text-align:center">Week</th>
                        <th style="text-align:center">Day</th>
                        <th style="text-align:center">Variant</th>
                        <th>Type</th>
                    </tr>
                </thead>
                <tbody>{$tableRows}</tbody>
            </table>
        </body>
        </html>
        HTML;

        file_put_contents($dir . '/index.html', $html);
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
