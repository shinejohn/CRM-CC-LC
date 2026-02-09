<?php

namespace App\Http\Controllers\Api\V1;

use App\Contracts\LearningCenterServiceInterface;
use App\Http\Controllers\Controller;
use App\Models\Content;
use App\Models\ContentView;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContentController extends Controller
{
    public function __construct(
        protected LearningCenterServiceInterface $learningCenterService
    ) {
    }

    /**
     * GET /api/v1/content
     * List all active content
     */
    public function index(Request $request): JsonResponse
    {
        $query = Content::query()
            ->when($request->type, fn($q, $type) => $q->where('type', $type))
            ->where('is_active', true)
            ->orderBy('created_at', 'desc');

        $perPage = $request->get('per_page', 20);
        $content = $query->paginate($perPage);

        return response()->json($content);
    }

    /**
     * GET /api/v1/content/{slug}
     * Get content by slug
     */
    public function show(string $slug, Request $request): JsonResponse
    {
        $content = Content::where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        // If customer ID provided, personalize content
        if ($customerId = $request->get('customer_id')) {
            $customer = Customer::find($customerId);
            if ($customer) {
                $personalized = $this->learningCenterService->personalize($content, $customer);
                return response()->json($personalized);
            }
        }

        return response()->json($content);
    }

    /**
     * GET /api/v1/content/{slug}/personalized/{customerId}
     * Get personalized content
     */
    public function personalized(string $slug, string $customerId): JsonResponse
    {
        $content = Content::where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();
        $customer = Customer::findOrFail($customerId);

        $personalized = $this->learningCenterService->personalize($content, $customer);

        return response()->json($personalized);
    }

    /**
     * GET /api/v1/content/{slug}/stats
     * Get content statistics
     */
    public function stats(string $slug): JsonResponse
    {
        $content = Content::where('slug', $slug)->firstOrFail();

        $views = ContentView::where('content_slug', $slug);

        $stats = [
            'total_views' => $views->count(),
            'unique_smb_views' => $views->whereNotNull('smb_id')->distinct('smb_id')->count(),
            'completions' => $views->whereNotNull('completed_at')->count(),
            'completion_rate' => $this->calculateCompletionRate($views),
            'avg_time_on_page' => $views->avg('time_on_page_seconds'),
            'approval_clicks' => $views->where('approval_clicked', true)->count(),
            'downloads' => $views->where('downloaded_pdf', true)->count(),
            'by_source' => $this->getViewsBySource($slug),
        ];

        return response()->json($stats);
    }

    protected function calculateCompletionRate($views): float
    {
        $total = $views->count();
        if ($total === 0) {
            return 0.0;
        }

        $completed = $views->whereNotNull('completed_at')->count();

        return round(($completed / $total) * 100, 2);
    }

    protected function getViewsBySource(string $slug): array
    {
        $views = ContentView::where('content_slug', $slug)
            ->whereNotNull('source_campaign_id')
            ->selectRaw('source_campaign_id, count(*) as count')
            ->groupBy('source_campaign_id')
            ->get();

        return $views->mapWithKeys(function ($view) {
            return [$view->source_campaign_id => $view->count];
        })->toArray();
    }

    /**
     * GET /api/v1/content/{slug}/article
     * Get article body
     */
    public function article(string $slug, Request $request): JsonResponse
    {
        $content = Content::where('slug', $slug)->firstOrFail();

        if (!$content->article_body) {
            return response()->json(['error' => 'No article content'], 404);
        }

        $article = [
            'title' => $content->title,
            'body' => $content->article_body,
            'related_content' => $this->getRelatedContent($content),
        ];

        // Personalize if customer provided
        if ($customerId = $request->get('customer_id')) {
            $customer = Customer::find($customerId);
            if ($customer) {
                $article['body'] = $this->personalizeArticle($article['body'], $customer);
                $article['approval_url'] = $this->generateApprovalUrl($content, $customer);
            }
        }

        return response()->json($article);
    }

    /**
     * GET /api/v1/content/{slug}/article/pdf
     * Download PDF
     */
    public function downloadPdf(string $slug, Request $request)
    {
        $content = Content::where('slug', $slug)->firstOrFail();

        // Track download
        if ($viewId = $request->get('view_id')) {
            ContentView::where('id', $viewId)->update(['downloaded_pdf' => true]);
        }

        // Check if PDF library is available
        if (!class_exists('\Barryvdh\DomPDF\Facade\Pdf')) {
            return response()->json([
                'error' => 'PDF generation not available. Please install barryvdh/laravel-dompdf'
            ], 503);
        }

        // Generate PDF
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('articles.pdf', [
            'content' => $content,
        ]);

        return $pdf->download($content->slug . '.pdf');
    }

    protected function getRelatedContent(Content $content): array
    {
        // Get related content based on service type or campaign
        return Content::query()
            ->where('slug', '!=', $content->slug)
            ->where(function ($q) use ($content) {
                $q->where('service_type', $content->service_type)
                  ->orWhere('type', $content->type);
            })
            ->where('is_active', true)
            ->limit(3)
            ->get(['slug', 'title', 'type', 'duration_seconds'])
            ->toArray();
    }

    protected function personalizeArticle(string $body, Customer $customer): string
    {
        $replacements = [
            '{{business_name}}' => $customer->business_name,
            '{{community}}' => $customer->community->name ?? '',
            '{{first_name}}' => explode(' ', $customer->primary_contact_name ?? '')[0] ?? 'there',
            '{{category}}' => $customer->category ?? 'business',
        ];

        return str_replace(
            array_keys($replacements),
            array_values($replacements),
            $body
        );
    }

    protected function generateApprovalUrl(Content $content, Customer $customer): string
    {
        $token = app(\App\Contracts\ApprovalServiceInterface::class)->generateToken(
            $customer->id,
            $content->service_type,
            $content->slug
        );

        return url("/approve?task={$content->service_type}&customer_id={$customer->id}&source={$content->slug}&token={$token}");
    }
}

