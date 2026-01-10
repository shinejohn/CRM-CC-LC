<?php

namespace App\Jobs;

use App\Services\ElevenLabsService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class GenerateTTS implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public string $contentId,
        public string $type, // 'faq', 'narration', etc.
        public string $text,
        public ?string $voiceId = null,
        public ?string $savePath = null
    ) {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(ElevenLabsService $elevenLabsService): void
    {
        try {
            // Generate audio
            $audioData = $elevenLabsService->generateAudio($this->text, $this->voiceId);
            
            if (!$audioData) {
                throw new \Exception('Failed to generate audio');
            }
            
            // Determine save path
            $path = $this->savePath ?? "audio/{$this->type}/{$this->contentId}.mp3";
            
            // Save to Cloudflare R2 or local storage
            // TODO: Implement R2 storage
            Storage::put($path, $audioData);
            
            // Update database with audio URL
            // TODO: Update the appropriate model with audio_url
            
            Log::info("TTS generated successfully for: {$this->contentId}");
            
        } catch (\Exception $e) {
            Log::error("Failed to generate TTS for: {$this->contentId}", [
                'error' => $e->getMessage()
            ]);
            
            throw $e;
        }
    }
}
