<?php

namespace App\Http\Controllers\Api\V1;

use App\Contracts\LearningCenterServiceInterface;
use App\Events\Content\ContentCompleted;
use App\Events\Content\ContentViewed;
use App\Http\Controllers\Controller;
use App\Models\Content;
use App\Models\ContentView;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContentTrackingController extends Controller
{
    public function __construct(
        protected LearningCenterServiceInterface $learningCenterService
    ) {
    }

    /**
     * POST /api/v1/content/{slug}/track/start
     * Track view start
     */
    public function trackStart(string $slug, Request $request): JsonResponse
    {
        $request->validate([
            'smb_id' => 'nullable|exists:smbs,id',
            'source_campaign_id' => 'nullable|string',
            'source_url' => 'nullable|url',
        ]);

        $view = ContentView::create([
            'smb_id' => $request->smb_id,
            'content_slug' => $slug,
            'started_at' => now(),
            'source_campaign_id' => $request->source_campaign_id,
            'source_url' => $request->source_url,
        ]);

        if ($request->smb_id) {
            event(new ContentViewed($view->id, $request->smb_id, $slug));
        }

        return response()->json([
            'view_id' => $view->id,
        ]);
    }

    /**
     * POST /api/v1/content/{slug}/track/slide
     * Track slide view
     */
    public function trackSlide(string $slug, Request $request): JsonResponse
    {
        $request->validate([
            'view_id' => 'required|exists:content_views,id',
            'slide_number' => 'required|integer',
        ]);

        $view = ContentView::findOrFail($request->view_id);

        $slidesViewed = $view->slides_viewed ?? [];
        if (!in_array($request->slide_number, $slidesViewed)) {
            $slidesViewed[] = $request->slide_number;
        }

        $content = Content::where('slug', $slug)->first();
        $totalSlides = count($content->slides ?? []);
        $completion = $totalSlides > 0
            ? round((count($slidesViewed) / $totalSlides) * 100)
            : 0;

        $view->update([
            'slides_viewed' => $slidesViewed,
            'completion_percentage' => $completion,
        ]);

        return response()->json(['completion' => $completion]);
    }

    /**
     * POST /api/v1/content/{slug}/track/complete
     * Track completion
     */
    public function trackComplete(string $slug, Request $request): JsonResponse
    {
        $request->validate([
            'view_id' => 'required|exists:content_views,id',
            'time_on_page_seconds' => 'nullable|integer',
        ]);

        $view = ContentView::findOrFail($request->view_id);

        $view->update([
            'completed_at' => now(),
            'completion_percentage' => 100,
            'time_on_page_seconds' => $request->time_on_page_seconds,
        ]);

        if ($view->smb_id) {
            event(new ContentCompleted($view->id, $view->smb_id, $slug));
        }

        return response()->json(['success' => true]);
    }

    /**
     * POST /api/v1/content/{slug}/track/approval-click
     * Track approval click
     */
    public function trackApprovalClick(string $slug, Request $request): JsonResponse
    {
        $request->validate([
            'view_id' => 'required|exists:content_views,id',
        ]);

        ContentView::where('id', $request->view_id)->update([
            'approval_clicked' => true,
        ]);

        return response()->json(['success' => true]);
    }

    /**
     * POST /api/v1/content/{slug}/track/download
     * Track download
     */
    public function trackDownload(string $slug, Request $request): JsonResponse
    {
        $request->validate([
            'view_id' => 'required|exists:content_views,id',
        ]);

        ContentView::where('id', $request->view_id)->update([
            'downloaded_pdf' => true,
        ]);

        return response()->json(['success' => true]);
    }
}



