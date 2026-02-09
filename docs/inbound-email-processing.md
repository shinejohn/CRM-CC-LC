# Inbound Email Processing System

## Overview

The Inbound Email Processing System receives, processes, and routes inbound emails from customers. It classifies intent, analyzes sentiment, and routes emails to appropriate handlers or escalates to humans when needed.

## Architecture

### Core Components

1. **InboundEmailService** - Main service for processing emails
2. **EmailIntentClassifier** - Classifies email intent (question, complaint, request, etc.)
3. **EmailSentimentAnalyzer** - Analyzes email sentiment (positive, neutral, negative)
4. **InboundEmailRoutingService** - Routes emails based on intent and sentiment
5. **HandleInboundEmailReceived** - Event listener
6. **InboundEmailWebhookController** - Receives email webhooks

## Intent Classification

### Intent Types

- **question** - Customer asking a question
- **complaint** - Customer reporting a problem
- **request** - Customer making a request
- **appointment** - Customer wants to schedule something
- **support** - Customer needs support
- **pricing** - Customer asking about pricing
- **other** - Unclassified or general email

### Classification Methods

1. **Pattern Matching** - Fast pattern-based classification
2. **AI Classification** - OpenRouter AI for complex cases
3. **Fallback** - Default to 'other' if classification fails

## Sentiment Analysis

### Sentiment Types

- **positive** - Positive sentiment detected
- **neutral** - Neutral sentiment (default)
- **negative** - Negative sentiment (triggers escalation)

### Analysis Methods

1. **Keyword Matching** - Fast keyword-based analysis
2. **AI Analysis** - OpenRouter AI for nuanced sentiment

## Email Routing

### Routing Logic

Emails are routed based on intent and sentiment:

- **question** → Generate AI answer and send response
- **complaint** → Create high-priority interaction, notify team
- **request** → Create interaction for request fulfillment
- **appointment** → Schedule appointment, create interaction
- **support** → Route to support team, create interaction
- **pricing** → Send pricing information email
- **negative sentiment** → Escalate to human (regardless of intent)

## Database Schema

### conversations (extended)
- `entry_point` - 'email' for inbound emails
- `subject` - Email subject
- `messages` - Array of email messages
- `sentiment_trajectory` - Array of sentiment scores
- `outcome` - Intent classification result
- `metadata` - Intent and sentiment data

## Usage

### Processing Inbound Email

```php
use App\Services\InboundEmailService;
use App\Models\Customer;

$service = app(InboundEmailService::class);
$customer = Customer::find($customerId);

$result = $service->process(
    customer: $customer,
    fromEmail: 'customer@example.com',
    subject: 'Question about pricing',
    body: 'How much does it cost?',
    messageId: 'msg-123',
    inReplyTo: null
);

// Returns:
// [
//     'conversation_id' => 'uuid',
//     'intent' => ['intent' => 'pricing', 'confidence' => 0.85],
//     'sentiment' => 'neutral'
// ]
```

## Webhook Integration

### Inbound Email Webhook

**Endpoint**: `/api/v1/webhooks/inbound-email`

**Request Format**:
```json
{
    "from": "customer@example.com",
    "to": "support@yourcompany.com",
    "subject": "Question about service",
    "body": "Email body text here",
    "message_id": "msg-123",
    "in_reply_to": "msg-122"
}
```

## Event Flow

1. Inbound email received via webhook
2. `InboundEmailWebhookController` processes request
3. Finds customer by email address
4. `InboundEmailService` processes email
5. `EmailIntentClassifier` classifies intent
6. `EmailSentimentAnalyzer` analyzes sentiment
7. Conversation logged to database
8. `InboundEmailReceived` event fired
9. `HandleInboundEmailReceived` listener processes event
10. `InboundEmailRoutingService` routes email
11. Appropriate handler executes (answer, escalate, etc.)

## Routing Handlers

### Question Handler
- Generates AI-powered answer
- Uses customer context for personalization
- Sends response email
- Logs question for FAQ generation

### Complaint Handler
- Creates high-priority interaction
- Notifies team members
- Sets due date (4 hours)
- Includes complaint details

### Request Handler
- Creates interaction for fulfillment
- Assigns to appropriate team
- Tracks request status
- Sends acknowledgment

### Appointment Handler
- Creates appointment_request interaction
- May integrate with calendar system
- Sends confirmation email
- Updates customer record

### Support Handler
- Routes to support team
- Creates support_request interaction
- Sets normal priority
- Includes full email body

### Pricing Handler
- Sends pricing information email
- Uses pricing campaign template
- Tracks pricing inquiry
- May trigger sales workflow

### Escalation Handler
- Creates human_escalation interaction
- Sets high priority
- Due in 4 hours
- Includes sentiment and intent data

## Configuration

### OpenRouter Settings

```env
OPENROUTER_API_KEY=sk-or-v1-xxxxx
```

### Email Service Settings

```env
POSTAL_API_KEY=your_postal_key
POSTAL_SERVER=your_postal_server
```

## Examples

### Classifying Email Intent

```php
use App\Services\EmailIntentClassifier;

$classifier = new EmailIntentClassifier();
$result = $classifier->classify(
    subject: 'Question about pricing',
    body: 'How much does your service cost?'
);

// Returns:
// [
//     'intent' => 'pricing',
//     'confidence' => 0.85,
//     'method' => 'pattern'
// ]
```

### Analyzing Sentiment

```php
use App\Services\EmailSentimentAnalyzer;

$analyzer = new EmailSentimentAnalyzer();
$sentiment = $analyzer->analyze('I am very unhappy with your service!');

// Returns: 'negative'
```

## Monitoring

### Check Email Processing
```php
$conversations = Conversation::where('entry_point', 'email')
    ->where('created_at', '>=', now()->subDays(7))
    ->get();

foreach ($conversations as $conv) {
    echo "Intent: {$conv->outcome}";
    echo "Sentiment: " . ($conv->sentiment_trajectory[0] ?? 'unknown');
}
```

### View Escalations
```php
$escalations = Interaction::where('type', 'human_escalation')
    ->where('channel', 'email')
    ->where('status', 'pending')
    ->get();
```

## Testing

### Unit Tests
```bash
php artisan test --filter InboundEmailServiceTest
```

## Troubleshooting

### Email Not Being Received
1. Verify webhook endpoint is accessible
2. Check email service webhook configuration
3. Verify customer email matches database
4. Check webhook authentication

### Intent Classification Issues
1. Review pattern matching keywords
2. Verify OpenRouter API key is configured
3. Check confidence scores in logs
4. Add new patterns to `$intentPatterns` array

### Sentiment Analysis Issues
1. Review keyword lists (positive/negative words)
2. Verify AI fallback is working
3. Check sentiment scores in logs
4. Adjust keyword lists based on data

### Routing Not Working
1. Verify routing service is registered
2. Check intent classification results
3. Review sentiment analysis results
4. Ensure handlers are implemented

## Best Practices

1. **Always Classify**: Every email should be classified
2. **Log Conversations**: All emails logged as conversations
3. **Escalate Negative**: Always escalate negative sentiment
4. **Track Intent**: Use intent data for analytics
5. **Personalize Responses**: Use customer context in AI answers
6. **Handle Replies**: Check `in_reply_to` for conversation threading

## API Reference

### Process Inbound Email
```php
InboundEmailService::process(
    Customer $customer,
    string $fromEmail,
    string $subject,
    string $body,
    ?string $messageId = null,
    ?string $inReplyTo = null
): array
```

### Classify Intent
```php
EmailIntentClassifier::classify(
    string $subject,
    string $body
): array
```

### Analyze Sentiment
```php
EmailSentimentAnalyzer::analyze(
    string $body
): string
```

Returns: 'positive', 'neutral', or 'negative'

