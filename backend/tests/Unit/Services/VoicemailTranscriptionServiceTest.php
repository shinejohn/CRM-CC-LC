<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\VoicemailTranscriptionService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Config;

class VoicemailTranscriptionServiceTest extends TestCase
{
    protected VoicemailTranscriptionService $service;

    protected function setUp(): void
    {
        parent::setUp();
        Config::set('services.openai.api_key', 'test-key');
        $this->service = new VoicemailTranscriptionService();
    }

    /** @test */
    public function it_downloads_recording_from_twilio_url(): void
    {
        Storage::fake('local');

        Http::fake([
            '*.mp3' => Http::response('fake audio content', 200),
        ]);

        $result = $this->service->downloadRecording(
            'https://api.twilio.com/2010-04-01/Accounts/AC123/Recordings/RE123',
            'AC123',
            'auth-token'
        );

        $this->assertNotNull($result);
        $this->assertFileExists($result);
    }

    /** @test */
    public function it_handles_download_failure(): void
    {
        Http::fake([
            '*' => Http::response([], 404),
        ]);

        $result = $this->service->downloadRecording(
            'https://api.twilio.com/2010-04-01/Accounts/AC123/Recordings/RE123',
            'AC123',
            'auth-token'
        );

        $this->assertNull($result);
    }

    /** @test */
    public function it_transcribes_audio_file(): void
    {
        Config::set('services.openai.api_key', 'test-key');
        
        Http::fake([
            'api.openai.com/v1/audio/transcriptions' => Http::response([
                'text' => 'This is a test transcription',
                'language' => 'en',
            ], 200),
        ]);

        // Create a fake audio file
        Storage::fake('local');
        $audioPath = Storage::disk('local')->path('test.mp3');
        file_put_contents($audioPath, 'fake audio content');

        $result = $this->service->transcribe($audioPath);

        $this->assertIsArray($result);
        $this->assertArrayHasKey('text', $result);
        $this->assertEquals('This is a test transcription', $result['text']);

        // Cleanup
        @unlink($audioPath);
    }

    /** @test */
    public function it_handles_missing_api_key(): void
    {
        Config::set('services.openai.api_key', null);
        $service = new VoicemailTranscriptionService();

        Storage::fake('local');
        $audioPath = Storage::disk('local')->path('test.mp3');
        file_put_contents($audioPath, 'fake audio content');

        $result = $service->transcribe($audioPath);

        $this->assertNull($result);

        @unlink($audioPath);
    }

    /** @test */
    public function it_handles_missing_audio_file(): void
    {
        $result = $this->service->transcribe('/nonexistent/path.mp3');

        $this->assertNull($result);
    }

    /** @test */
    public function it_analyzes_transcription_for_urgency(): void
    {
        $transcription = 'This is urgent! I need help immediately!';

        $result = $this->service->analyzeTranscription($transcription);

        $this->assertIsArray($result);
        $this->assertArrayHasKey('urgency', $result);
        $this->assertContains($result['urgency'], ['low', 'medium', 'high']);
    }
}

