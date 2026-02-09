# Voicemail Transcription System

## Overview

The Voicemail Transcription System automatically downloads voicemail recordings from Twilio, transcribes them using OpenAI Whisper API, analyzes them for urgency and intent, and creates appropriate interactions or triggers callbacks.

## Architecture

### Core Components

1. **VoicemailTranscriptionService** - Handles download, transcription, and analysis
2. **ProcessVoicemail** - Queue job for async processing
3. **HandleVoicemailReceived** - Event listener
4. **TwilioVoicemailWebhookController** - Receives webhooks from Twilio

## Workflow

1. Twilio sends voicemail webhook
2. `TwilioVoicemailWebhookController` receives webhook
3. Fires `VoicemailReceived` event
4. `HandleVoicemailReceived` listener processes event
5. `ProcessVoicemail` job dispatched to queue
6. Downloads recording from Twilio
7. Transcribes using OpenAI Whisper
8. Analyzes transcription for urgency and intent
9. Creates interaction or schedules callback
10. Sends acknowledgment SMS

## Transcription

### OpenAI Whisper API

The system uses OpenAI's Whisper API for transcription:

```php
$service = new VoicemailTranscriptionService();
$result = $service->transcribe('/path/to/audio.mp3');

// Returns:
// [
//     'text' => 'Transcribed text here',
//     'language' => 'en',
//     'duration' => 45.2,
//     'segments' => [...]
// ]
```

## Analysis

### Urgency Detection

The system analyzes transcriptions for urgency keywords:

**High Urgency**:
- urgent, asap, immediately, emergency, critical
- important, right away, now, today, hurry
- problem, issue, broken, not working, error

**Medium Urgency**:
- soon, when you can, at your convenience
- follow up, call back, return call

**Low Urgency**: Default for all other messages

### Intent Detection

Detects intent from transcription:

- **callback_request**: "call back", "return call", "call me"
- **question**: "?", "what", "how", "when", "where", "why"
- **complaint**: "problem", "issue", "broken", "not working"
- **appointment**: "schedule", "meeting", "appointment", "book"
- **information_request**: "need", "want", "looking for", "tell me"
- **general**: Default for unrecognized patterns

### Action Items Extraction

Extracts action items from transcription:

- **call**: "call", "phone", "reach"
- **email**: "email", "send", "reply"
- **schedule**: "schedule", "book", "appointment"
- **follow_up**: "follow up", "check", "verify"

## Usage

### Processing Voicemail

```php
use App\Services\VoicemailTranscriptionService;

$service = new VoicemailTranscriptionService();

// Download recording
$audioPath = $service->downloadRecording(
    $recordingUrl,
    $accountSid,
    $authToken
);

// Transcribe
$transcription = $service->transcribe($audioPath);

// Analyze
$analysis = $service->analyzeTranscription($transcription['text']);

// Cleanup
$service->cleanup($audioPath);
```

### Using Queue Job

```php
use App\Jobs\ProcessVoicemail;
use App\Events\VoicemailReceived;

event(new VoicemailReceived(
    customer: $customer,
    fromNumber: '+1234567890',
    recordingUrl: 'https://api.twilio.com/...',
    transcription: null, // Will be transcribed in job
    durationSeconds: 45
));

// Job automatically dispatched by listener
```

## Webhook Integration

### Twilio Voicemail Webhook

**Endpoint**: `/api/v1/webhooks/twilio/voicemail`

**Request Format**:
```json
{
    "CallSid": "CA1234567890",
    "From": "+1234567890",
    "To": "+1987654321",
    "RecordingUrl": "https://api.twilio.com/2010-04-01/Accounts/AC123/Recordings/RE123",
    "RecordingDuration": "45",
    "RecordingSid": "RE1234567890"
}
```

## Event Flow

1. Twilio sends voicemail webhook
2. `TwilioVoicemailWebhookController` processes request
3. Finds customer by phone number
4. Fires `VoicemailReceived` event
5. `HandleVoicemailReceived` listener processes event
6. Dispatches `ProcessVoicemail` job to queue
7. Job downloads recording
8. Job transcribes audio
9. Job analyzes transcription
10. Creates interaction or schedules callback
11. Sends acknowledgment SMS
12. Cleans up temporary file

## Response Actions

### High Urgency Voicemails
- Creates high-priority interaction
- Schedules immediate callback (within 1 hour)
- Sends urgent acknowledgment SMS
- May trigger phone call workflow

### Medium Urgency Voicemails
- Creates normal-priority interaction
- Schedules callback for next business day
- Sends standard acknowledgment SMS

### Low Urgency Voicemails
- Creates low-priority interaction
- Logs for follow-up
- Sends acknowledgment SMS

## Configuration

### OpenAI Settings

```env
OPENAI_API_KEY=sk-xxxxx
```

### Twilio Settings

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
```

## Examples

### Manual Transcription

```php
use App\Services\VoicemailTranscriptionService;

$service = new VoicemailTranscriptionService();

// Download
$audioPath = $service->downloadRecording(
    'https://api.twilio.com/.../RE123',
    config('services.twilio.account_sid'),
    config('services.twilio.auth_token')
);

// Transcribe
$result = $service->transcribe($audioPath);
echo $result['text'];

// Analyze
$analysis = $service->analyzeTranscription($result['text']);
echo "Urgency: {$analysis['urgency']}";
echo "Intent: {$analysis['intent']}";
```

## Monitoring

### Check Transcription Status
```php
$interaction = Interaction::where('type', 'voicemail')
    ->where('metadata->transcription_status', 'completed')
    ->first();

$transcription = $interaction->metadata['transcription'] ?? null;
$urgency = $interaction->metadata['urgency'] ?? null;
```

## Testing

### Unit Tests
```bash
php artisan test --filter VoicemailTranscriptionServiceTest
```

## Troubleshooting

### Download Failures
1. Verify Twilio credentials are correct
2. Check recording URL format
3. Ensure recording hasn't expired (Twilio keeps for 1 year)
4. Try both .mp3 and .wav formats

### Transcription Failures
1. Verify OpenAI API key is configured
2. Check audio file exists and is readable
3. Ensure audio format is supported (mp3, wav, m4a)
4. Check file size limits (25MB for Whisper API)

### Analysis Issues
1. Review urgency keyword detection logic
2. Check intent pattern matching
3. Verify action item extraction
4. Review transcription quality

## Best Practices

1. **Queue Processing**: Always use queue jobs for transcription (can take time)
2. **Cleanup Files**: Always clean up temporary audio files after processing
3. **Error Handling**: Handle download and transcription failures gracefully
4. **Urgency Detection**: Review and refine urgency keywords based on data
5. **Acknowledgment SMS**: Always send acknowledgment to customer
6. **Interaction Logging**: Log all voicemails as interactions for tracking

## API Reference

### Download Recording
```php
VoicemailTranscriptionService::downloadRecording(
    string $recordingUrl,
    string $accountSid,
    string $authToken
): ?string
```

Returns: Local file path or null on failure

### Transcribe Audio
```php
VoicemailTranscriptionService::transcribe(
    string $audioFilePath
): ?array
```

Returns: Transcription result array or null on failure

### Analyze Transcription
```php
VoicemailTranscriptionService::analyzeTranscription(
    string $transcription
): array
```

Returns:
- `urgency`: low, medium, high
- `intent`: callback_request, question, complaint, etc.
- `action_items`: Array of action types

### Cleanup
```php
VoicemailTranscriptionService::cleanup(
    string $audioFilePath
): void
```

Deletes temporary audio file.

