<?php

namespace App\Services;

use App\Contracts\ApprovalServiceInterface;
use App\Contracts\LearningCenterServiceInterface;
use App\Events\Content\ContentCompleted;
use App\Events\Content\ContentViewed;
use App\Models\Content;
use App\Models\ContentView;
use App\Models\Customer;

class LearningCenterService implements LearningCenterServiceInterface
{
    public function __construct(
        protected ApprovalServiceInterface $approvalService
    ) {
    }

    public function getContent(string $slug): ?Content
    {
        return Content::where('slug', $slug)
            ->where('is_active', true)
            ->first();
    }

    public function getContentByCampaign(string $campaignId): ?Content
    {
        return Content::where('campaign_id', $campaignId)
            ->where('is_active', true)
            ->first();
    }

    public function personalize(Content $content, Customer $customer): array
    {
        $data = $content->toArray();

        // Personalize slides
        $data['slides'] = array_map(function ($slide) use ($customer) {
            return $this->personalizeSlide($slide, $customer);
        }, $data['slides'] ?? []);

        // Add personalized approval URL
        if ($content->service_type) {
            $data['approval_url'] = $this->generateApprovalUrl($content, $customer);
        }

        // Add personalized data
        $data['personalization'] = [
            'business_name' => $customer->business_name,
            'community' => $customer->community->name ?? '',
            'first_name' => explode(' ', $customer->primary_contact_name ?? '')[0] ?? 'there',
        ];

        return $data;
    }

    protected function personalizeSlide(array $slide, Customer $customer): array
    {
        // Replace placeholders in slide content
        $replacements = [
            '{{business_name}}' => $customer->business_name,
            '{{community}}' => $customer->community->name ?? '',
            '{{first_name}}' => explode(' ', $customer->primary_contact_name ?? '')[0] ?? 'there',
            '{{category}}' => $customer->category ?? 'business',
        ];

        if (isset($slide['content'])) {
            $slide['content'] = str_replace(
                array_keys($replacements),
                array_values($replacements),
                $slide['content']
            );
        }

        if (isset($slide['headline'])) {
            $slide['headline'] = str_replace(
                array_keys($replacements),
                array_values($replacements),
                $slide['headline']
            );
        }

        if (isset($slide['subheadline'])) {
            $slide['subheadline'] = str_replace(
                array_keys($replacements),
                array_values($replacements),
                $slide['subheadline']
            );
        }

        return $slide;
    }

    protected function generateApprovalUrl(Content $content, Customer $customer): string
    {
        $token = $this->approvalService->generateToken(
            $customer->id,
            $content->service_type,
            $content->slug
        );

        return url("/approve?task={$content->service_type}&customer_id={$customer->id}&source={$content->slug}&token={$token}");
    }

    public function trackViewStart(int $smbId, string $slug, array $context): int
    {
        $view = ContentView::create([
            'smb_id' => $smbId,
            'content_slug' => $slug,
            'started_at' => now(),
            'source_campaign_id' => $context['source_campaign_id'] ?? null,
            'source_url' => $context['source_url'] ?? null,
        ]);

        if ($smbId) {
            event(new ContentViewed($view->id, $smbId, $slug));
        }

        return $view->id;
    }

    public function trackSlideView(int $viewId, int $slideNumber): void
    {
        $view = ContentView::findOrFail($viewId);

        $slidesViewed = $view->slides_viewed ?? [];
        if (!in_array($slideNumber, $slidesViewed)) {
            $slidesViewed[] = $slideNumber;
        }

        $content = Content::where('slug', $view->content_slug)->first();
        $totalSlides = count($content->slides ?? []);
        $completion = $totalSlides > 0
            ? round((count($slidesViewed) / $totalSlides) * 100)
            : 0;

        $view->update([
            'slides_viewed' => $slidesViewed,
            'completion_percentage' => $completion,
        ]);
    }

    public function trackViewComplete(int $viewId): void
    {
        $view = ContentView::findOrFail($viewId);

        $view->update([
            'completed_at' => now(),
            'completion_percentage' => 100,
        ]);

        if ($view->smb_id) {
            event(new ContentCompleted($view->id, $view->smb_id, $view->content_slug));
        }
    }

    public function trackApprovalClick(int $viewId): void
    {
        ContentView::where('id', $viewId)->update([
            'approval_clicked' => true,
        ]);
    }

    public function trackDownload(int $viewId): void
    {
        ContentView::where('id', $viewId)->update([
            'downloaded_pdf' => true,
        ]);
    }
}

