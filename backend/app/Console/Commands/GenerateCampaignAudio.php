<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Contracts\TTSProvider;
use App\Models\SarahCommonResponse;
use App\Services\ElevenLabsService;
use App\Services\OpenAITTSService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

final class GenerateCampaignAudio extends Command
{
    protected $signature = 'campaign:generate-audio
        {--campaign= : Single campaign ID (e.g., HOOK-001)}
        {--provider=openai : TTS provider (openai|elevenlabs)}
        {--voice= : Override voice ID}
        {--type=narration : What to generate (narration|common|greeting|all)}
        {--dry-run : Show what would be generated without calling API}
        {--force : Regenerate even if files exist}
        {--storage=local : Storage (local|r2)}';

    protected $description = 'Generate TTS audio for campaign narrations and common responses';

    private int $totalChars = 0;
    private int $totalFiles = 0;
    private int $skippedFiles = 0;
    private int $failedFiles = 0;

    public function handle(): int
    {
        $type = $this->option('type');
        $dryRun = (bool) $this->option('dry-run');
        $provider = $this->resolveProvider();

        if (! $provider && ! $dryRun) {
            $this->error('Could not resolve TTS provider. Check your API keys.');

            return self::FAILURE;
        }

        if ($dryRun) {
            $this->info('DRY RUN — no API calls will be made');
            $this->newLine();
        }

        if ($type === 'narration' || $type === 'all') {
            $this->generateNarrations($provider, $dryRun);
        }

        if ($type === 'common' || $type === 'all') {
            $this->generateCommonResponses($provider, $dryRun);
        }

        if ($type === 'greeting' || $type === 'all') {
            $this->generateGreetingsCompletions($provider, $dryRun);
        }

        $this->newLine();
        $this->info('Summary:');
        $this->table(
            ['Metric', 'Value'],
            [
                ['Total characters', number_format($this->totalChars)],
                ['Files to generate', $this->totalFiles],
                ['Skipped (exist)', $this->skippedFiles],
                ['Failed', $this->failedFiles],
                ['Est. cost (OpenAI tts-1-hd)', '$' . number_format($this->totalChars * 30 / 1_000_000, 2)],
                ['Est. cost (OpenAI tts-1)', '$' . number_format($this->totalChars * 15 / 1_000_000, 2)],
            ]
        );

        return self::SUCCESS;
    }

    private function generateNarrations(?TTSProvider $provider, bool $dryRun): void
    {
        $this->info('=== Slide Narrations ===');

        $contentDir = base_path('../content');
        if (! File::isDirectory($contentDir)) {
            $this->warn("Content directory not found: {$contentDir}");

            return;
        }

        $files = File::glob("{$contentDir}/campaign_*_complete.json");
        $campaignFilter = $this->option('campaign');

        $allSlides = [];

        foreach ($files as $file) {
            $json = json_decode(File::get($file), true);
            if (! $json) {
                continue;
            }

            $campaignId = $json['campaign']['id'] ?? null;
            if ($campaignFilter && $campaignId !== $campaignFilter) {
                continue;
            }

            $slug = $json['landing_page']['landing_page_slug'] ?? $this->slugify($campaignId ?? basename($file));
            $slides = $json['slides'] ?? [];

            foreach ($slides as $slide) {
                $narration = $slide['narration'] ?? '';
                $audioFile = $slide['audio_file'] ?? null;

                if (! $narration || ! $audioFile) {
                    continue;
                }

                $allSlides[] = [
                    'campaign_id' => $campaignId,
                    'slug' => $slug,
                    'slide_num' => $slide['slide_num'] ?? 0,
                    'audio_file' => $audioFile,
                    'narration' => $narration,
                    'storage_path' => "audio/presentations/{$slug}/audio/{$audioFile}",
                ];
            }
        }

        $this->info("Found " . count($allSlides) . " slides with narrations across " . count($files) . " campaigns");

        if (empty($allSlides)) {
            return;
        }

        $bar = $this->output->createProgressBar(count($allSlides));
        $bar->setFormat(' %current%/%max% [%bar%] %percent:3s%% — %message%');
        $bar->setMessage('Starting...');
        $bar->start();

        foreach ($allSlides as $item) {
            $bar->setMessage("{$item['campaign_id']} slide {$item['slide_num']}");

            $this->totalChars += mb_strlen($item['narration']);
            $this->totalFiles++;

            if (! $this->option('force') && $this->audioFileExists($item['storage_path'])) {
                $this->skippedFiles++;
                $bar->advance();

                continue;
            }

            if (! $dryRun && $provider) {
                $this->generateAndStore($provider, $item['narration'], $item['storage_path']);
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
    }

    private function generateCommonResponses(?TTSProvider $provider, bool $dryRun): void
    {
        $this->info('=== Common Responses ===');

        try {
            $responses = SarahCommonResponse::where('is_active', true)
                ->where('always_ai', false)
                ->whereNull('audio_file')
                ->orWhere(function ($q) {
                    $q->where('is_active', true)
                        ->where('always_ai', false)
                        ->where('audio_generated', false);
                })
                ->get();
        } catch (\Throwable) {
            $this->warn('sarah_common_responses table not found. Run migrations first.');

            return;
        }

        if ($this->option('force')) {
            $responses = SarahCommonResponse::where('is_active', true)
                ->where('always_ai', false)
                ->get();
        }

        $this->info("Found {$responses->count()} common responses to generate");

        foreach ($responses as $response) {
            $audioFile = "common/{$response->intent_key}.mp3";
            $storagePath = "audio/presentations/{$audioFile}";

            $this->totalChars += mb_strlen($response->response_text);
            $this->totalFiles++;

            if (! $this->option('force') && $this->audioFileExists($storagePath)) {
                $this->skippedFiles++;

                continue;
            }

            if (! $dryRun && $provider) {
                $audioBytes = $this->generateAudio($provider, $response->response_text);
                if ($audioBytes) {
                    $this->storeAudio($storagePath, $audioBytes);
                    $response->update([
                        'audio_file' => $audioFile,
                        'audio_generated' => true,
                    ]);
                    $this->line("  Generated: {$response->intent_key}");
                } else {
                    $this->failedFiles++;
                    $this->warn("  Failed: {$response->intent_key}");
                }
            }
        }
    }

    private function generateGreetingsCompletions(?TTSProvider $provider, bool $dryRun): void
    {
        $this->info('=== Greetings & Completions ===');

        $contentDir = base_path('../content');
        if (! File::isDirectory($contentDir)) {
            return;
        }

        $files = File::glob("{$contentDir}/campaign_*_complete.json");
        $campaignFilter = $this->option('campaign');
        $count = 0;

        foreach ($files as $file) {
            $json = json_decode(File::get($file), true);
            if (! $json) {
                continue;
            }

            $campaignId = $json['campaign']['id'] ?? null;
            if ($campaignFilter && $campaignId !== $campaignFilter) {
                continue;
            }

            $slug = $json['landing_page']['landing_page_slug'] ?? $this->slugify($campaignId ?? basename($file));
            $sarah = $json['sarah_context'] ?? [];

            // Greeting
            $greeting = $sarah['opening_line'] ?? null;
            if ($greeting) {
                $greetPath = "audio/presentations/{$slug}/audio/greeting.mp3";
                $this->totalChars += mb_strlen($greeting);
                $this->totalFiles++;

                if (! $this->option('force') && $this->audioFileExists($greetPath)) {
                    $this->skippedFiles++;
                } elseif (! $dryRun && $provider) {
                    $this->generateAndStore($provider, $greeting, $greetPath);
                }
                $count++;
            }

            // Completion
            $completion = $sarah['closing_line'] ?? null;
            if ($completion) {
                $completePath = "audio/presentations/{$slug}/audio/completion.mp3";
                $this->totalChars += mb_strlen($completion);
                $this->totalFiles++;

                if (! $this->option('force') && $this->audioFileExists($completePath)) {
                    $this->skippedFiles++;
                } elseif (! $dryRun && $provider) {
                    $this->generateAndStore($provider, $completion, $completePath);
                }
                $count++;
            }
        }

        $this->info("Found {$count} greeting/completion lines");
    }

    private function resolveProvider(): ?TTSProvider
    {
        $providerName = $this->option('provider');

        return match ($providerName) {
            'openai' => app(OpenAITTSService::class),
            'elevenlabs' => app(ElevenLabsService::class),
            default => app(OpenAITTSService::class),
        };
    }

    private function generateAudio(TTSProvider $provider, string $text): ?string
    {
        $voice = $this->option('voice') ?: null;

        return $provider->generateAudio($text, $voice);
    }

    private function generateAndStore(TTSProvider $provider, string $text, string $storagePath): void
    {
        $audioBytes = $this->generateAudio($provider, $text);
        if ($audioBytes) {
            $this->storeAudio($storagePath, $audioBytes);
        } else {
            $this->failedFiles++;
        }
    }

    private function storeAudio(string $path, string $bytes): void
    {
        $storageDisk = $this->option('storage');

        if ($storageDisk === 'r2') {
            Storage::disk('r2')->put($path, $bytes);
        } else {
            Storage::disk('public')->put($path, $bytes);
        }
    }

    private function audioFileExists(string $path): bool
    {
        $storageDisk = $this->option('storage');

        if ($storageDisk === 'r2') {
            return Storage::disk('r2')->exists($path);
        }

        return Storage::disk('public')->exists($path);
    }

    private function slugify(string $id): string
    {
        return strtolower(str_replace(['_', ' '], '-', $id));
    }
}
