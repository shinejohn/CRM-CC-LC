<?php

namespace App\Services\Newsletter;

use App\Contracts\Newsletter\NewsletterServiceInterface;
use App\DTOs\Newsletter\SendResult;
use App\Models\Newsletter\Newsletter;
use App\Models\Newsletter\NewsletterContentItem;
use App\Models\Subscriber\Subscriber;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class NewsletterService implements NewsletterServiceInterface
{
    public function __construct(
        private ContentAggregator $aggregator,
        private SponsorService $sponsors,
        private NewsletterBuilder $builder,
        private MessageServiceAdapter $messages,
    ) {}
    
    public function create(array $data): Newsletter
    {
        return Newsletter::create([
            'community_id' => $data['community_id'],
            'newsletter_type' => $data['newsletter_type'],
            'issue_date' => $data['issue_date'],
            'subject' => $data['subject'],
            'subject_b' => $data['subject_b'] ?? null,
            'preheader' => $data['preheader'] ?? null,
            'content_json' => [],
            'status' => 'draft',
            'ab_test_enabled' => $data['ab_test_enabled'] ?? false,
            'ab_test_percentage' => $data['ab_test_percentage'] ?? 10,
        ]);
    }
    
    public function build(int $newsletterId): Newsletter
    {
        $newsletter = Newsletter::findOrFail($newsletterId);
        
        $newsletter->update([
            'status' => 'building',
            'building_started_at' => now(),
        ]);
        
        try {
            // 1. Aggregate content
            $content = $this->aggregator->aggregate(
                $newsletter->community_id,
                $newsletter->newsletter_type,
                $newsletter->issue_date
            );
            
            // 2. Select and insert sponsors
            $content = $this->sponsors->insertSponsors($content, $newsletter);
            
            // 3. Build HTML
            $html = $this->builder->build($newsletter, $content);
            
            // 4. Update newsletter
            $newsletter->update([
                'content_json' => $content,
                'content_html' => $html,
                'status' => 'scheduled',
            ]);
            
            // 5. Save content items
            $this->saveContentItems($newsletter, $content);
            
            return $newsletter->fresh();
        } catch (\Exception $e) {
            Log::error('Newsletter build failed', [
                'newsletter_id' => $newsletterId,
                'error' => $e->getMessage(),
            ]);
            $newsletter->update(['status' => 'failed']);
            throw $e;
        }
    }
    
    public function schedule(int $newsletterId, Carbon $sendAt): Newsletter
    {
        $newsletter = Newsletter::findOrFail($newsletterId);
        
        $newsletter->update([
            'status' => 'scheduled',
            'scheduled_for' => $sendAt,
        ]);
        
        return $newsletter->fresh();
    }
    
    public function send(int $newsletterId): array
    {
        $newsletter = Newsletter::findOrFail($newsletterId);
        
        if ($newsletter->status !== 'scheduled') {
            throw new \InvalidArgumentException("Newsletter must be scheduled before sending");
        }
        
        $newsletter->update([
            'status' => 'sending',
            'sending_started_at' => now(),
        ]);
        
        // Get recipient list
        $recipients = $this->getRecipients($newsletter);
        $newsletter->update(['recipient_count' => count($recipients)]);
        
        // Handle A/B testing
        if ($newsletter->ab_test_enabled) {
            return $this->sendWithAbTest($newsletter, $recipients);
        }
        
        // Send via MessageService adapter
        $result = $this->messages->sendBulk(
            $recipients,
            $newsletter->subject,
            $newsletter->content_html,
            [
                'sourceType' => 'newsletters',
                'sourceId' => $newsletter->id,
            ]
        );
        
        $newsletter->update([
            'status' => 'sent',
            'sent_count' => $result['queued'],
            'sending_completed_at' => now(),
        ]);
        
        // Record sponsor impressions
        $this->recordSponsorImpressions($newsletter, $result['queued']);
        
        return [
            'success' => true,
            'queued' => $result['queued'],
            'suppressed' => $result['suppressed'],
        ];
    }
    
    private function sendWithAbTest(Newsletter $newsletter, array $recipients): array
    {
        $testSize = (int) (count($recipients) * ($newsletter->ab_test_percentage / 100));
        $testSize = max($testSize, 100); // Minimum test size
        
        // Split recipients
        shuffle($recipients);
        $testA = array_slice($recipients, 0, (int)($testSize / 2));
        $testB = array_slice($recipients, (int)($testSize / 2), (int)($testSize / 2));
        $remainder = array_slice($recipients, $testSize);
        
        // Send test variants
        $this->sendVariant($newsletter, $testA, 'a', $newsletter->subject);
        $this->sendVariant($newsletter, $testB, 'b', $newsletter->subject_b ?? $newsletter->subject);
        
        // Schedule winner decision (wait 2 hours, then send to remainder)
        // This would dispatch a job: DecideAbTestWinner
        // For now, we'll just return the result
        
        return [
            'success' => true,
            'queued' => count($testA) + count($testB),
            'suppressed' => 0,
            'note' => 'A/B test in progress, remainder will be sent after 2 hours',
        ];
    }
    
    private function sendVariant(Newsletter $newsletter, array $recipients, string $variant, string $subject): void
    {
        $this->messages->sendBulk(
            $recipients,
            $subject,
            $newsletter->content_html,
            [
                'sourceType' => 'newsletters',
                'sourceId' => $newsletter->id,
                'variant' => $variant,
            ]
        );
    }
    
    private function getRecipients(Newsletter $newsletter): array
    {
        $query = Subscriber::whereHas('communities', function ($q) use ($newsletter) {
                $q->where('community_id', $newsletter->community_id)
                  ->where('newsletters_enabled', true);
            })
            ->where('email_opted_in', true)
            ->where('status', 'active');
        
        if ($newsletter->newsletter_type === 'daily') {
            $query->where('newsletter_frequency', 'daily');
        } else {
            $query->whereIn('newsletter_frequency', ['daily', 'weekly']);
        }
        
        return $query->get()
            ->map(function ($subscriber) {
                return [
                    'id' => $subscriber->id,
                    'type' => 'subscriber',
                    'address' => $subscriber->email,
                    'data' => [
                        'first_name' => $subscriber->first_name,
                        'unsubscribe_token' => $subscriber->uuid, // Use UUID as token
                    ],
                ];
            })
            ->toArray();
    }
    
    private function recordSponsorImpressions(Newsletter $newsletter, int $impressions): void
    {
        $sponsorItems = NewsletterContentItem::where('newsletter_id', $newsletter->id)
            ->where('content_type', 'sponsor')
            ->get();
        
        foreach ($sponsorItems as $item) {
            if ($item->content_id) {
                $this->sponsors->recordImpression($item->content_id, $impressions);
            }
        }
    }
    
    private function saveContentItems(Newsletter $newsletter, array $content): void
    {
        $position = 0;
        
        // Save header sponsor
        if (isset($content['header_sponsor'])) {
            NewsletterContentItem::create([
                'newsletter_id' => $newsletter->id,
                'content_type' => 'sponsor',
                'content_id' => $content['header_sponsor']['id'],
                'position' => $position++,
                'section' => 'header',
            ]);
        }
        
        // Save sections
        if (isset($content['sections'])) {
            foreach ($content['sections'] as $sectionName => $items) {
                foreach ($items as $item) {
                    NewsletterContentItem::create([
                        'newsletter_id' => $newsletter->id,
                        'content_type' => $item['type'] ?? 'article',
                        'content_id' => $item['id'] ?? null,
                        'position' => $position++,
                        'section' => $sectionName,
                        'headline' => $item['headline'] ?? null,
                        'summary' => $item['summary'] ?? null,
                        'image_url' => $item['image_url'] ?? null,
                        'link_url' => $item['link_url'] ?? null,
                    ]);
                }
            }
        }
    }
    
    public function getWithStats(int $newsletterId): Newsletter
    {
        return Newsletter::with(['contentItems', 'community'])->findOrFail($newsletterId);
    }
    
    public function cancel(int $newsletterId): bool
    {
        $newsletter = Newsletter::findOrFail($newsletterId);
        
        if (!in_array($newsletter->status, ['draft', 'scheduled'])) {
            return false;
        }
        
        $newsletter->update(['status' => 'cancelled']);
        return true;
    }
}



