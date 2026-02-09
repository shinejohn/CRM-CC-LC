<?php

namespace App\Console\Commands;

use App\Models\Campaign;
use App\Models\CampaignEmail;
use App\Models\CampaignLandingPage;
use App\Models\Content;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class ImportCampaignContent extends Command
{
    protected $signature = 'content:import-campaigns {--path= : Path to campaign JSON directory}';
    protected $description = 'Import campaign JSON files into campaigns, content, landing pages, and emails.';

    public function handle(): int
    {
        $sourcePath = $this->option('path') ?: base_path('content');

        if (!File::isDirectory($sourcePath)) {
            $this->error("Directory not found: {$sourcePath}");
            return self::FAILURE;
        }

        $files = collect(File::files($sourcePath))
            ->filter(fn ($file) => Str::startsWith($file->getFilename(), 'campaign_')
                && Str::endsWith($file->getFilename(), '_complete.json'))
            ->values();

        if ($files->isEmpty()) {
            $this->warn("No campaign files found in {$sourcePath}");
            return self::SUCCESS;
        }

        $imported = 0;
        $failed = 0;

        foreach ($files as $file) {
            $payload = json_decode($file->getContents(), true);
            if (!$payload) {
                $this->error("Invalid JSON: {$file->getFilename()}");
                $failed++;
                continue;
            }

            $campaignData = $payload['campaign'] ?? [];
            $landingPageData = $payload['landing_page'] ?? [];
            $slides = $payload['slides'] ?? [];
            $article = $payload['article'] ?? null;
            $emails = $payload['emails'] ?? [];
            $personalization = $payload['personalization'] ?? [];

            $campaignId = $campaignData['id'] ?? null;
            if (!$campaignId) {
                $this->error("Missing campaign.id in {$file->getFilename()}");
                $failed++;
                continue;
            }

            DB::transaction(function () use (
                $campaignId,
                $campaignData,
                $landingPageData,
                $slides,
                $article,
                $emails,
                $personalization,
                $payload
            ) {
                $normalizedType = $this->normalizeCampaignType(
                    $campaignData['type'] ?? $campaignId
                );

                Campaign::updateOrCreate(
                    ['id' => $campaignId],
                    [
                        'type' => $normalizedType,
                        'week' => $campaignData['week'] ?? 0,
                        'day' => $campaignData['day'] ?? 0,
                        'title' => $campaignData['title'] ?? $campaignId,
                        'subject' => $campaignData['subject'] ?? '',
                        'slug' => $landingPageData['landing_page_slug']
                            ?? $campaignData['landing_page']
                            ?? Str::slug($campaignData['title'] ?? $campaignId),
                        'service_type' => $campaignData['service_type'] ?? null,
                        'landing_page_slug' => $landingPageData['landing_page_slug']
                            ?? $campaignData['landing_page']
                            ?? null,
                        'email_template_id' => null,
                        'approval_button_text' => $campaignData['approval_button_text'] ?? null,
                        'approval_config' => $campaignData['approval_config'] ?? [],
                        'rvm_script' => $campaignData['rvm_script'] ?? null,
                        'rvm_config' => $campaignData['rvm_config'] ?? [],
                        'upsell_services' => $campaignData['upsell_services'] ?? [],
                        'meeting_topic' => $campaignData['meeting_topic'] ?? null,
                        'is_active' => true,
                    ]
                );

                if (!empty($landingPageData)) {
                    CampaignLandingPage::updateOrCreate(
                        ['campaign_id' => $campaignId],
                        [
                            'landing_page_slug' => $landingPageData['landing_page_slug'] ?? null,
                            'url' => $landingPageData['url'] ?? null,
                            'template_id' => $landingPageData['template_id'] ?? null,
                            'template_name' => $landingPageData['template_name'] ?? null,
                            'slide_count' => $landingPageData['slide_count'] ?? count($slides),
                            'duration_seconds' => $landingPageData['duration_seconds'] ?? 0,
                            'primary_cta' => $landingPageData['primary_cta'] ?? null,
                            'secondary_cta' => $landingPageData['secondary_cta'] ?? null,
                            'ai_persona' => $landingPageData['ai_persona'] ?? null,
                            'ai_tone' => $landingPageData['ai_tone'] ?? null,
                            'ai_goal' => $landingPageData['ai_goal'] ?? null,
                            'audio_base_url' => $landingPageData['audio_base_url'] ?? null,
                            'crm_tracking' => (bool) ($landingPageData['crm_tracking'] ?? false),
                            'conversion_goal' => $landingPageData['conversion_goal'] ?? null,
                            'utm_source' => $landingPageData['utm_source'] ?? null,
                            'utm_medium' => $landingPageData['utm_medium'] ?? null,
                            'utm_campaign' => $landingPageData['utm_campaign'] ?? null,
                            'utm_content' => $landingPageData['utm_content'] ?? null,
                            'data_capture_fields' => $this->parseDataCaptureFields(
                                $landingPageData['data_capture_fields'] ?? null
                            ),
                            'metadata' => [
                                'template' => $payload['template'] ?? null,
                                'personalization' => $personalization ?: null,
                            ],
                        ]
                    );
                }

                Content::updateOrCreate(
                    ['slug' => $landingPageData['landing_page_slug'] ?? $campaignId],
                    [
                        'type' => $normalizedType,
                        'title' => $campaignData['title'] ?? $campaignId,
                        'campaign_id' => $campaignId,
                        'slides' => $slides,
                        'article_body' => $article['content'] ?? $article['body'] ?? null,
                        'audio_base_url' => $landingPageData['audio_base_url'] ?? null,
                        'duration_seconds' => $landingPageData['duration_seconds'] ?? 60,
                        'service_type' => $campaignData['service_type'] ?? null,
                        'approval_button_text' => $campaignData['approval_button_text'] ?? null,
                        'personalization_fields' => $personalization['required_fields'] ?? [],
                        'metadata' => [
                            'campaign' => $campaignData,
                            'landing_page' => $landingPageData,
                        ],
                        'is_active' => true,
                    ]
                );

                foreach ($emails as $templateKey => $template) {
                    CampaignEmail::updateOrCreate(
                        [
                            'campaign_id' => $campaignId,
                            'template_key' => $templateKey,
                        ],
                        [
                            'subject' => $template['subject'] ?? '',
                            'preview_text' => $template['preview_text'] ?? null,
                            'body_html' => $template['body'] ?? '',
                            'body_text' => $template['body_text'] ?? null,
                            'variables' => $this->extractTemplateVariables($template),
                            'is_active' => true,
                        ]
                    );
                }
            });

            $imported++;
            $this->info("Imported: {$campaignId}");
        }

        $this->info("Import complete. Imported {$imported}, failed {$failed}.");

        return $failed > 0 ? self::FAILURE : self::SUCCESS;
    }

    private function normalizeCampaignType(string $type): string
    {
        $normalized = strtolower(str_replace([' ', '_', '-'], '', $type));
        if (str_contains($normalized, 'howto')) {
            return 'howto';
        }
        if (str_contains($normalized, 'hook')) {
            return 'hook';
        }
        if (str_contains($normalized, 'edu')) {
            return 'edu';
        }
        return $normalized ?: 'edu';
    }

    private function parseDataCaptureFields(?string $fields): array
    {
        if (!$fields) {
            return [];
        }

        return collect(explode(',', $fields))
            ->map(fn ($field) => trim($field))
            ->filter()
            ->values()
            ->all();
    }

    private function extractTemplateVariables(array $template): array
    {
        $content = ($template['subject'] ?? '')
            . ' ' . ($template['preview_text'] ?? '')
            . ' ' . ($template['body'] ?? '')
            . ' ' . ($template['body_text'] ?? '');

        preg_match_all('/\{\{([a-zA-Z0-9_]+)\}\}/', $content, $matches);

        return collect($matches[1] ?? [])
            ->unique()
            ->values()
            ->all();
    }
}

