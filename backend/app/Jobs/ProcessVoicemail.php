<?php

namespace App\Jobs;

use App\Models\Customer;
use App\Services\VoicemailTranscriptionService;
use App\Services\SMSService;
use App\Models\Interaction;
use App\Events\VoicemailReceived;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessVoicemail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public Customer $customer,
        public string $fromNumber,
        public string $recordingUrl,
        public ?int $durationSeconds = null
    ) {
        $this->onQueue('voicemail');
    }

    public function handle(
        VoicemailTranscriptionService $transcriptionService,
        SMSService $smsService
    ): void {
        try {
            Log::info('Processing voicemail', [
                'customer_id' => $this->customer->id,
                'from_number' => $this->fromNumber,
                'recording_url' => $this->recordingUrl,
            ]);

            // Download recording
            $accountSid = config('services.twilio.account_sid');
            $authToken = config('services.twilio.auth_token');
            
            $audioFilePath = $transcriptionService->downloadRecording(
                $this->recordingUrl,
                $accountSid,
                $authToken
            );

            if (!$audioFilePath) {
                Log::error('Failed to download voicemail recording', [
                    'customer_id' => $this->customer->id,
                    'recording_url' => $this->recordingUrl,
                ]);
                return;
            }

            // Transcribe audio
            $transcriptionResult = $transcriptionService->transcribe($audioFilePath);
            
            // Clean up temporary file
            $transcriptionService->cleanup($audioFilePath);

            if (!$transcriptionResult) {
                Log::error('Failed to transcribe voicemail', [
                    'customer_id' => $this->customer->id,
                ]);
                return;
            }

            $transcription = $transcriptionResult['text'] ?? '';
            $duration = $transcriptionResult['duration'] ?? $this->durationSeconds;

            // Analyze transcription
            $analysis = $transcriptionService->analyzeTranscription($transcription);
            $urgency = $analysis['urgency'];
            $intent = $analysis['intent'];
            $actionItems = $analysis['action_items'];

            // Create interaction record
            $interaction = Interaction::create([
                'customer_id' => $this->customer->id,
                'type' => 'voicemail',
                'title' => 'Voicemail Received',
                'description' => $transcription,
                'status' => $urgency === 'high' ? 'pending' : 'completed',
                'priority' => $urgency === 'high' ? 'high' : ($urgency === 'medium' ? 'normal' : 'low'),
                'entry_point' => 'phone',
                'metadata' => [
                    'from_number' => $this->fromNumber,
                    'recording_url' => $this->recordingUrl,
                    'duration_seconds' => $duration,
                    'transcription' => $transcription,
                    'urgency' => $urgency,
                    'intent' => $intent,
                    'action_items' => $actionItems,
                    'analyzed_at' => now()->toISOString(),
                ],
            ]);

            Log::info('Voicemail interaction created', [
                'interaction_id' => $interaction->id,
                'urgency' => $urgency,
                'intent' => $intent,
            ]);

            // Send acknowledgment SMS
            if ($this->customer->canContactViaSMS()) {
                $customerName = $this->customer->contact_name ?? $this->customer->business_name ?? 'there';
                $message = "Hi {$customerName}! We received your voicemail and will get back to you soon.";
                
                if ($urgency === 'high') {
                    $message .= " We'll prioritize your message.";
                }

                $smsService->send($this->customer->phone, $message);
                
                Log::info('Acknowledgment SMS sent', [
                    'customer_id' => $this->customer->id,
                ]);
            }

            // Fire VoicemailReceived event
            event(new VoicemailReceived(
                customer: $this->customer,
                fromNumber: $this->fromNumber,
                recordingUrl: $this->recordingUrl,
                transcription: $transcription,
                durationSeconds: $duration,
                urgency: $urgency
            ));

            // If urgent, schedule immediate callback
            if ($urgency === 'high') {
                $this->scheduleUrgentCallback($interaction);
            }

        } catch (\Exception $e) {
            Log::error('Error processing voicemail', [
                'customer_id' => $this->customer->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            throw $e; // Re-throw to trigger retry
        }
    }

    /**
     * Schedule urgent callback
     */
    protected function scheduleUrgentCallback(Interaction $interaction): void
    {
        // Create a callback interaction scheduled for immediate action
        Interaction::create([
            'customer_id' => $this->customer->id,
            'type' => 'callback',
            'title' => 'Urgent Callback Request',
            'description' => 'Customer left urgent voicemail',
            'status' => 'pending',
            'priority' => 'high',
            'scheduled_at' => now()->addMinutes(15), // Schedule within 15 minutes
            'due_at' => now()->addHours(1), // Due within 1 hour
            'entry_point' => 'phone',
            'previous_interaction_id' => $interaction->id,
            'metadata' => [
                'triggered_by' => 'urgent_voicemail',
                'voicemail_interaction_id' => $interaction->id,
            ],
        ]);

        Log::info('Urgent callback scheduled', [
            'customer_id' => $this->customer->id,
            'interaction_id' => $interaction->id,
        ]);
    }
}

