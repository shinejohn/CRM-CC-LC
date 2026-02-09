# SMS Handling System

## Overview

The SMS Handling System processes inbound SMS messages, classifies intent, and automatically responds based on customer intent. It integrates with Twilio for SMS delivery and uses AI for intent classification when pattern matching is insufficient.

## Architecture

### Core Components

1. **SMSIntentClassifier** - Classifies SMS intent (yes, no, question, call_request, etc.)
2. **SMSResponseHandler** - Generates appropriate responses based on intent
3. **HandleSMSReceived** - Event listener that processes SMS events
4. **TwilioSMSWebhookController** - Receives webhooks from Twilio

## Intent Classification

### Pattern Matching

The system first attempts pattern matching for common intents:

- **YES**: "yes", "yeah", "yep", "sure", "ok", "absolutely", "sign me up"
- **NO**: "no", "nope", "not interested", "stop", "unsubscribe", "opt out"
- **QUESTION**: "?", "what", "how", "when", "where", "why", "can you", "help"
- **CALL_REQUEST**: "call me", "phone", "speak", "contact me", "callback"
- **APPOINTMENT**: "schedule", "meeting", "appointment", "book", "calendar"
- **PRICING**: "price", "cost", "pricing", "how much", "budget"

### AI Fallback

For ambiguous messages, the system uses OpenRouter AI to classify intent:

```php
$classifier = new SMSIntentClassifier();
$result = $classifier->classify("I might be interested but need to think");

// Returns:
// [
//     'intent' => 'question',
//     'confidence' => 0.75,
//     'method' => 'ai'
// ]
```

## Response Handling

### YES Response
- Sends landing page link
- Updates CRM with positive engagement
- Increases engagement score
- May trigger trial acceptance workflow

### NO Response
- Handles opt-out gracefully
- Updates contact preferences
- Logs interaction
- Stops further SMS campaigns

### QUESTION Response
- Generates AI-powered answer
- Uses customer context for personalized response
- Logs question for future FAQ generation

### CALL_REQUEST Response
- Schedules callback
- Creates interaction record
- May trigger phone call workflow

## Webhook Integration

### Twilio SMS Webhook

**Endpoint**: `/api/v1/webhooks/twilio/sms`

**Request Format**:
```json
{
    "From": "+1234567890",
    "To": "+1987654321",
    "Body": "Yes, I am interested",
    "MessageSid": "SM1234567890"
}
```

**Response**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>Thank you! Here's your link: [landing page]</Message>
</Response>
```

## Event Flow

1. SMS received via Twilio webhook
2. `TwilioSMSWebhookController` processes request
3. Finds customer by phone number
4. Fires `SMSReceived` event
5. `HandleSMSReceived` listener processes event
6. `SMSIntentClassifier` classifies intent
7. `SMSResponseHandler` generates response
8. Response sent back via Twilio
9. Customer record updated
10. Interaction logged

## Usage

### Classifying SMS Intent

```php
use App\Services\SMSIntentClassifier;

$classifier = new SMSIntentClassifier();
$result = $classifier->classify("Yes, I want to learn more");

// Result:
// [
//     'intent' => 'yes',
//     'confidence' => 0.9,
//     'method' => 'pattern'
// ]
```

### Handling SMS Event

```php
use App\Events\SMSReceived;
use App\Models\Customer;

$customer = Customer::find($customerId);

event(new SMSReceived(
    customer: $customer,
    fromNumber: '+1234567890',
    message: 'Yes, I am interested',
    classifiedIntent: 'yes',
    intentConfidence: 0.9
));
```

## Configuration

### Twilio Settings

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1987654321
```

### OpenRouter Settings (for AI fallback)

```env
OPENROUTER_API_KEY=sk-or-v1-xxxxx
```

## Response Templates

### YES Response Template
```
Hi {business_name}! Great to hear you're interested. 
Check out your personalized page: {landing_page_url}
```

### NO Response Template
```
Thanks for letting us know. We've updated your preferences. 
Reply HELP for assistance or STOP to unsubscribe.
```

### Question Response Template
```
{ai_generated_answer}

Need more help? Reply with your question or call us at {phone_number}.
```

## Engagement Score Updates

SMS interactions update customer engagement scores:

- **YES response**: +10 points
- **Question response**: +5 points
- **Call request**: +15 points
- **NO response**: -5 points (but respects opt-out)

## Testing

### Unit Tests
```bash
php artisan test --filter SMSIntentClassifierTest
```

### Integration Tests
```bash
php artisan test --filter SMSWebhookTest
```

## Troubleshooting

### SMS Not Being Received
1. Verify Twilio webhook URL is configured correctly
2. Check webhook endpoint is accessible
3. Verify phone number format matches database
4. Check customer `sms_opted_in` flag

### Intent Classification Issues
1. Check pattern matching first (most common)
2. Verify OpenRouter API key is configured
3. Review confidence scores in logs
4. Add new patterns to `$intentPatterns` array

### Response Not Sending
1. Verify Twilio credentials
2. Check webhook response format (must be TwiML XML)
3. Review error logs for Twilio API errors
4. Ensure customer hasn't opted out

## Best Practices

1. **Pattern First**: Always try pattern matching before AI
2. **Handle Opt-outs**: Immediately respect STOP/unsubscribe requests
3. **Personalize**: Use customer name and business name in responses
4. **Track Everything**: Log all SMS interactions for analytics
5. **Test Webhooks**: Use Twilio's webhook testing tools
6. **Rate Limiting**: Implement rate limiting to prevent spam

## API Reference

### Classify Intent
```php
SMSIntentClassifier::classify(string $message): array
```

Returns:
- `intent`: yes, no, question, call_request, appointment, pricing
- `confidence`: 0.0 to 1.0
- `method`: pattern or ai

### Handle SMS
```php
SMSResponseHandler::handle(SMSReceived $event): void
```

Processes SMS event and generates appropriate response.

