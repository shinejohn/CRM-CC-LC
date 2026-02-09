# Email Follow-up System

## Overview

The Email Follow-up System automatically follows up on emails that haven't been opened within 48 hours. It uses customer engagement scores to determine the best follow-up strategy (resend email, send SMS, schedule call, or escalate to human).

## Architecture

### Core Components

1. **CheckUnopenedEmails** - Scheduled job that finds unopened emails
2. **EmailFollowupService** - Determines and executes follow-up strategies
3. **HandleEmailNotOpened** - Event listener that processes unopened email events
4. **EmailNotOpened** - Event fired when email hasn't been opened

## Follow-up Strategies

### Strategy Selection Logic

The system selects follow-up strategies based on:
- Customer engagement score
- Number of previous follow-up attempts
- Hours since email was sent

### Strategy Types

1. **resend_email** - Resends email with modified subject ("Re: Original Subject")
2. **send_sms** - Sends SMS follow-up message
3. **schedule_call** - Schedules phone call for next business day
4. **escalate** - Escalates to human after 2 failed follow-ups

### Strategy Matrix

| Engagement Score | Follow-up 1 | Follow-up 2 | Follow-up 3+ |
|-----------------|-------------|-------------|---------------|
| ≥70 (High)      | SMS         | Resend Email| Escalate      |
| 40-70 (Medium)  | Resend Email| SMS         | Escalate      |
| <40 (Low)       | Resend Email| Schedule Call| Escalate      |

## Database Schema

### campaign_sends (extended)
- `followup_triggered_at` - When follow-up was triggered
- `followup_count` - Number of follow-up attempts
- `followup_strategy` - Strategy used (resend_email, send_sms, schedule_call, escalated)

## Usage

### Manual Follow-up Check

```php
use App\Jobs\CheckUnopenedEmails;

// Check for emails not opened in 48 hours
$job = new CheckUnopenedEmails(48);
$job->handle();
```

### Processing Unopened Email

```php
use App\Services\EmailFollowupService;
use App\Models\Customer;
use App\Models\CampaignSend;

$service = new EmailFollowupService();
$customer = Customer::find($customerId);
$campaignSend = CampaignSend::find($sendId);

$service->handleUnopenedEmail($customer, $campaignSend, 50);
```

## Scheduled Jobs

### CheckUnopenedEmails
Runs hourly to find emails not opened within threshold.

```php
// Schedule in app/Console/Kernel.php
$schedule->job(new CheckUnopenedEmails(48))->hourly();
```

## Event Flow

1. `CheckUnopenedEmails` job runs hourly
2. Finds emails sent 48+ hours ago, not opened, not bounced
3. Fires `EmailNotOpened` event for each
4. `HandleEmailNotOpened` listener processes event
5. `EmailFollowupService` determines strategy
6. Strategy executed (resend/SMS/call/escalate)
7. Campaign send record updated
8. Interaction created for tracking

## Follow-up Actions

### Resend Email
- Creates new `CampaignSend` record
- Modifies subject: "Re: {original_subject}"
- Creates `email_followup` interaction
- Tracks original campaign send ID

### Send SMS
- Sends SMS via SMS service
- Message: "Hi {business_name}! We noticed you haven't opened our email..."
- Creates `sms_followup` interaction
- Includes landing page link

### Schedule Call
- Creates `call_followup` interaction
- Schedules for next business day, 10 AM
- Sets priority to 'normal'
- May dispatch `MakePhoneCall` job

### Escalate to Human
- Creates `human_escalation` interaction
- Sets priority to 'high'
- Due in 4 hours
- Includes metadata: engagement score, follow-up count, last email open

## Configuration

### Follow-up Threshold
Default: 48 hours (configurable in job constructor)

```php
// Check after 72 hours instead
$job = new CheckUnopenedEmails(72);
```

### Engagement Thresholds
Defined in `EmailFollowupService`:
- High: ≥70
- Medium: 40-70
- Low: <40

## Examples

### Checking Unopened Emails

```php
use App\Jobs\CheckUnopenedEmails;

// Run manually
$job = new CheckUnopenedEmails(48);
$job->handle();
```

### Custom Follow-up Strategy

```php
use App\Services\EmailFollowupService;

$service = new EmailFollowupService();
$service->handleUnopenedEmail($customer, $campaignSend, $hoursSinceSent);
```

## Monitoring

### Check Follow-up Status
```php
$campaignSend = CampaignSend::find($id);
echo "Follow-ups: {$campaignSend->followup_count}";
echo "Strategy: {$campaignSend->followup_strategy}";
echo "Triggered: {$campaignSend->followup_triggered_at}";
```

### View Escalations
```php
$escalations = Interaction::where('type', 'human_escalation')
    ->where('status', 'pending')
    ->where('priority', 'high')
    ->get();
```

## Testing

### Unit Tests
```bash
php artisan test --filter EmailFollowupServiceTest
```

### Integration Tests
```bash
php artisan test --filter EmailFollowupTest
```

## Troubleshooting

### Follow-ups Not Triggering
1. Verify `CheckUnopenedEmails` job is scheduled
2. Check `sent_at` timestamp is 48+ hours ago
3. Verify email hasn't been opened (`opened_at` is null)
4. Check email hasn't bounced (`bounced_at` is null)
5. Ensure customer hasn't opted out

### Wrong Strategy Selected
1. Check customer engagement score
2. Verify follow-up count
3. Review strategy selection logic in `determineStrategy()`
4. Check engagement score thresholds

### Escalations Not Created
1. Verify follow-up count >= 2
2. Check escalation interaction creation in logs
3. Ensure customer record exists
4. Review `escalateToHuman()` method

## Best Practices

1. **Respect Opt-outs**: Always check `email_opted_in` and `do_not_contact`
2. **Limit Follow-ups**: Maximum 2 automated follow-ups before escalation
3. **Track Everything**: All follow-ups create interaction records
4. **Monitor Escalations**: Review high-priority escalations regularly
5. **Test Strategies**: Test each strategy type with sample customers
6. **Adjust Thresholds**: Tune engagement score thresholds based on data

## API Reference

### Check Unopened Emails
```php
CheckUnopenedEmails::__construct(int $hoursThreshold = 48)
CheckUnopenedEmails::handle(): void
```

### Handle Unopened Email
```php
EmailFollowupService::handleUnopenedEmail(
    Customer $customer,
    CampaignSend $campaignSend,
    int $hoursSinceSent
): void
```

### Determine Strategy
```php
EmailFollowupService::determineStrategy(
    Customer $customer,
    int $followupCount,
    int $hoursSinceSent
): string
```

Returns: 'resend_email', 'send_sms', 'schedule_call', or 'escalate'

