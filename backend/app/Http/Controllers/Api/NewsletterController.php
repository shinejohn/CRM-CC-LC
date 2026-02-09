<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Newsletter\Newsletter;
use App\Services\Newsletter\NewsletterService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NewsletterController extends Controller
{
    public function __construct(
        private NewsletterService $newsletterService
    ) {}

    /**
     * List newsletters
     */
    public function index(Request $request): JsonResponse
    {
        $query = Newsletter::with(['community', 'contentItems']);

        if ($request->has('community_id')) {
            $query->where('community_id', $request->community_id);
        }

        if ($request->has('type')) {
            $query->where('newsletter_type', $request->type);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $newsletters = $query->orderBy('issue_date', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json($newsletters);
    }

    /**
     * Create newsletter
     */
    public function create(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'community_id' => 'required|exists:communities,id',
            'newsletter_type' => 'required|in:daily,weekly,special',
            'issue_date' => 'required|date',
            'subject' => 'required|string|max:255',
            'subject_b' => 'nullable|string|max:255',
            'preheader' => 'nullable|string|max:255',
            'ab_test_enabled' => 'nullable|boolean',
            'ab_test_percentage' => 'nullable|integer|min:1|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $newsletter = $this->newsletterService->create($validator->validated());

        return response()->json([
            'message' => 'Newsletter created successfully.',
            'newsletter' => $newsletter->load(['community', 'contentItems']),
        ], 201);
    }

    /**
     * Get newsletter
     */
    public function show(int $id): JsonResponse
    {
        $newsletter = $this->newsletterService->getWithStats($id);

        return response()->json([
            'newsletter' => $newsletter,
        ]);
    }

    /**
     * Update newsletter
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'subject' => 'sometimes|string|max:255',
            'subject_b' => 'nullable|string|max:255',
            'preheader' => 'nullable|string|max:255',
            'ab_test_enabled' => 'nullable|boolean',
            'ab_test_percentage' => 'nullable|integer|min:1|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $newsletter = Newsletter::findOrFail($id);
        $newsletter->update($validator->validated());

        return response()->json([
            'message' => 'Newsletter updated successfully.',
            'newsletter' => $newsletter->fresh()->load(['community', 'contentItems']),
        ]);
    }

    /**
     * Delete newsletter
     */
    public function destroy(int $id): JsonResponse
    {
        $newsletter = Newsletter::findOrFail($id);
        $newsletter->delete();

        return response()->json([
            'message' => 'Newsletter deleted successfully.',
        ]);
    }

    /**
     * Build newsletter content
     */
    public function build(int $id): JsonResponse
    {
        $newsletter = $this->newsletterService->build($id);

        return response()->json([
            'message' => 'Newsletter built successfully.',
            'newsletter' => $newsletter->load(['community', 'contentItems']),
        ]);
    }

    /**
     * Schedule newsletter
     */
    public function schedule(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'scheduled_for' => 'required|date|after:now',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $newsletter = $this->newsletterService->schedule(
            $id,
            Carbon::parse($request->scheduled_for)
        );

        return response()->json([
            'message' => 'Newsletter scheduled successfully.',
            'newsletter' => $newsletter,
        ]);
    }

    /**
     * Send newsletter
     */
    public function send(int $id): JsonResponse
    {
        $result = $this->newsletterService->send($id);

        return response()->json([
            'message' => 'Newsletter sent successfully.',
            'result' => $result,
        ]);
    }

    /**
     * Cancel newsletter
     */
    public function cancel(int $id): JsonResponse
    {
        $success = $this->newsletterService->cancel($id);

        if (!$success) {
            return response()->json([
                'message' => 'Newsletter cannot be cancelled.',
            ], 400);
        }

        return response()->json([
            'message' => 'Newsletter cancelled successfully.',
        ]);
    }

    /**
     * Preview newsletter
     */
    public function preview(int $id): JsonResponse
    {
        $newsletter = Newsletter::with(['community', 'contentItems'])->findOrFail($id);

        return response()->json([
            'newsletter' => $newsletter,
            'preview_html' => $newsletter->content_html,
        ]);
    }

    /**
     * Test send newsletter
     */
    public function testSend(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // TODO: Implement test send functionality
        return response()->json([
            'message' => 'Test send functionality not yet implemented.',
        ], 501);
    }

    /**
     * Get newsletter stats
     */
    public function stats(int $id): JsonResponse
    {
        $newsletter = $this->newsletterService->getWithStats($id);

        return response()->json([
            'newsletter' => $newsletter,
            'stats' => [
                'recipient_count' => $newsletter->recipient_count,
                'sent_count' => $newsletter->sent_count,
                'delivered_count' => $newsletter->delivered_count,
                'open_count' => $newsletter->open_count,
                'unique_open_count' => $newsletter->unique_open_count,
                'click_count' => $newsletter->click_count,
                'unique_click_count' => $newsletter->unique_click_count,
                'open_rate' => $newsletter->open_rate,
                'click_rate' => $newsletter->click_rate,
                'sponsor_revenue_cents' => $newsletter->sponsor_revenue_cents,
            ],
        ]);
    }

    /**
     * Web view of newsletter (public)
     */
    public function webView(string $uuid): \Illuminate\View\View
    {
        $newsletter = Newsletter::where('uuid', $uuid)->firstOrFail();

        return view('newsletters.web-view', [
            'newsletter' => $newsletter,
            'content_html' => $newsletter->content_html,
        ]);
    }

    /**
     * Unsubscribe handler (public)
     */
    public function unsubscribe(Request $request, int $community, string $token): \Illuminate\View\View
    {
        // TODO: Implement unsubscribe logic with token validation
        return view('newsletters.unsubscribe', [
            'success' => false,
            'message' => 'Unsubscribe functionality not yet implemented.',
        ]);
    }
}



