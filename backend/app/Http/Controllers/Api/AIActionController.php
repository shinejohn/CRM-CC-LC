<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Events\AiTaskCompleted;
use App\Events\AiTaskFailed;
use App\Events\AiTaskProgress;
use App\Events\AiTaskStarted;
use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Deal;
use App\Services\AI\PrismAiService;
use App\Services\CrmActivityService;
use App\Services\DealService;
use App\Services\EmailService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

final class AIActionController extends Controller
{
    public function __construct(
        private readonly PrismAiService $aiService,
        private readonly CrmActivityService $activityService,
        private readonly DealService $dealService,
        private readonly EmailService $emailService,
    ) {}

    /**
     * POST /v1/ai/actions/execute
     *
     * Execute a confirmed AI action. Requires `confirmed: true` to prevent
     * replay or injection attacks.
     */
    public function execute(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'action'    => 'required|string',
            'arguments' => 'required|array',
            'confirmed' => 'required|boolean',
            'task_id'   => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if (!$request->boolean('confirmed')) {
            return response()->json(['error' => 'Action must be explicitly confirmed'], 403);
        }

        $actionName = $request->input('action');
        $arguments  = $request->input('arguments', []);
        $taskId     = $request->input('task_id') ?? Str::uuid()->toString();
        $user       = $request->user();

        // Broadcast: task started
        if ($user) {
            AiTaskStarted::dispatch(
                userId: (string) $user->id,
                taskId: $taskId,
                taskTitle: $this->getActionLabel($actionName),
                actionName: $actionName,
            );
        }

        try {
            $result = $this->dispatch($actionName, $arguments, $user);

            // Broadcast: task completed
            if ($user) {
                AiTaskCompleted::dispatch(
                    userId: (string) $user->id,
                    taskId: $taskId,
                    title: $this->getActionLabel($actionName),
                    result: $result,
                );
            }

            return response()->json([
                'data' => [
                    'task_id' => $taskId,
                    'action'  => $actionName,
                    'result'  => $result,
                    'status'  => 'completed',
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('AIActionController::execute error', [
                'action' => $actionName,
                'error'  => $e->getMessage(),
            ]);

            if ($user) {
                AiTaskFailed::dispatch(
                    userId: (string) $user->id,
                    taskId: $taskId,
                    title: $this->getActionLabel($actionName),
                    errorMessage: $e->getMessage(),
                );
            }

            return response()->json(['error' => 'Action failed: ' . $e->getMessage()], 500);
        }
    }

    // ── Action Dispatcher ──────────────────────────────────────────────────────

    private function dispatch(string $action, array $args, ?object $user): mixed
    {
        $tenantId = $user?->tenant_id ?? $user?->id ?? '';

        return match ($action) {
            'lookup_customer'       => $this->lookupCustomer($args, $tenantId),
            'create_followup_task'  => $this->createFollowupTask($args, $tenantId, $user),
            'draft_email'           => $this->draftEmail($args, $tenantId),
            'update_deal_stage'     => $this->updateDealStage($args, $tenantId),
            'generate_pitch'        => $this->generatePitch($args),
            'get_pipeline_summary'  => $this->getPipelineSummary($tenantId),
            'lookup_product_pricing'=> $this->lookupProductPricing($args),
            'schedule_callback'     => $this->scheduleCallback($args, $tenantId, $user),
            'generate_social_post'  => $this->generateSocialPost($args),
            'run_diagnostic'        => $this->runDiagnostic($args, $tenantId),
            default                 => throw new \InvalidArgumentException("Unknown action: {$action}"),
        };
    }

    // ── Individual Action Implementations ─────────────────────────────────────

    private function lookupCustomer(array $args, string $tenantId): array
    {
        $query = Customer::where('tenant_id', $tenantId);

        if (!empty($args['customer_id'])) {
            $customer = $query->find($args['customer_id']);
        } elseif (!empty($args['name'])) {
            $customer = $query->where('business_name', 'ilike', '%' . $args['name'] . '%')
                ->orWhere('owner_name', 'ilike', '%' . $args['name'] . '%')
                ->first();
        } else {
            return ['customers' => [], 'message' => 'No search criteria provided'];
        }

        if (!$customer) {
            return ['found' => false, 'message' => 'Customer not found'];
        }

        return [
            'found'         => true,
            'id'            => $customer->id,
            'business_name' => $customer->business_name,
            'owner_name'    => $customer->owner_name,
            'email'         => $customer->email,
            'industry'      => $customer->industry_category,
            'lead_score'    => $customer->lead_score,
            'pipeline_stage'=> $customer->pipeline_stage ?? 'unknown',
        ];
    }

    private function createFollowupTask(array $args, string $tenantId, ?object $user): array
    {
        $customerId = $args['customer_id'] ?? null;
        $title      = $args['title'] ?? 'Follow-up task';
        $dueDate    = $args['due_date'] ?? now()->addDays(3)->toDateString();
        $notes      = $args['notes'] ?? '';

        $activity = $this->activityService->create([
            'tenant_id'   => $tenantId,
            'customer_id' => $customerId,
            'user_id'     => $user?->id,
            'type'        => 'task',
            'title'       => $title,
            'notes'       => $notes,
            'due_date'    => $dueDate,
            'status'      => 'pending',
        ]);

        return [
            'created'    => true,
            'task_id'    => $activity->id,
            'title'      => $title,
            'due_date'   => $dueDate,
        ];
    }

    private function draftEmail(array $args, string $tenantId): array
    {
        $customerId = $args['customer_id'] ?? null;
        $subject    = $args['subject'] ?? 'Follow-up from Fibonacco';
        $tone       = $args['tone'] ?? 'professional';
        $purpose    = $args['purpose'] ?? '';

        // Get customer context for personalization
        $customerContext = '';
        if ($customerId) {
            $customer = Customer::where('tenant_id', $tenantId)->find($customerId);
            if ($customer) {
                $customerContext = "Customer: {$customer->business_name} ({$customer->owner_name}), Industry: {$customer->industry_category}";
            }
        }

        $prompt = "Draft a {$tone} email with subject: '{$subject}'.\n";
        if ($purpose) {
            $prompt .= "Purpose: {$purpose}\n";
        }
        if ($customerContext) {
            $prompt .= "Recipient context: {$customerContext}\n";
        }
        $prompt .= "Format: Subject line, then email body. Keep it concise and actionable.";

        $content = $this->aiService->chat(
            [['role' => 'user', 'content' => $prompt]],
            "You are a professional email copywriter for Fibonacco, a local business marketing company.",
            config('command-center-ai.ai_models.actions')
        );

        return [
            'drafted'     => true,
            'subject'     => $subject,
            'body'        => $content,
            'customer_id' => $customerId,
        ];
    }

    private function updateDealStage(array $args, string $tenantId): array
    {
        $dealId   = $args['deal_id'] ?? null;
        $newStage = $args['stage'] ?? null;

        if (!$dealId || !$newStage) {
            throw new \InvalidArgumentException('deal_id and stage are required');
        }

        $deal = Deal::where('tenant_id', $tenantId)->findOrFail($dealId);
        $deal->update(['stage' => $newStage]);

        return [
            'updated'   => true,
            'deal_id'   => $dealId,
            'new_stage' => $newStage,
            'deal_name' => $deal->name,
        ];
    }

    private function generatePitch(array $args): array
    {
        $customerName  = $args['customer_name'] ?? 'the customer';
        $productTier   = $args['product_tier'] ?? 'standard';
        $painPoints    = $args['pain_points'] ?? '';
        $industryFocus = $args['industry'] ?? '';

        $prompt = "Generate a compelling sales pitch for a {$industryFocus} business named '{$customerName}'.\n";
        $prompt .= "Product tier being pitched: {$productTier}\n";
        if ($painPoints) {
            $prompt .= "Known pain points: {$painPoints}\n";
        }
        $prompt .= "Format: Opening hook, value proposition, 3 key benefits, and a clear call to action.";

        $pitch = $this->aiService->chat(
            [['role' => 'user', 'content' => $prompt]],
            "You are a sales expert at Fibonacco. You help local businesses understand the value of AI-powered marketing.",
            config('command-center-ai.ai_models.actions')
        );

        return ['pitch' => $pitch, 'customer' => $customerName, 'tier' => $productTier];
    }

    private function getPipelineSummary(string $tenantId): array
    {
        $deals = Deal::where('tenant_id', $tenantId)
            ->selectRaw('stage, COUNT(*) as count, SUM(value) as total_value')
            ->groupBy('stage')
            ->get();

        $totalDeals = Deal::where('tenant_id', $tenantId)->count();
        $totalValue = Deal::where('tenant_id', $tenantId)->sum('value');

        return [
            'total_deals'  => $totalDeals,
            'total_value'  => $totalValue,
            'by_stage'     => $deals->map(fn ($d) => [
                'stage' => $d->stage,
                'count' => $d->count,
                'value' => $d->total_value,
            ])->toArray(),
        ];
    }

    private function lookupProductPricing(array $args): array
    {
        $tier = $args['tier'] ?? 'all';

        // Static pricing reference — matches the Fibonacco product catalog
        $pricing = [
            'basic' => [
                'name'          => 'Basic',
                'monthly_price' => 297,
                'features'      => ['1 campaign/month', 'Email marketing', 'Basic CRM'],
            ],
            'professional' => [
                'name'          => 'Professional',
                'monthly_price' => 697,
                'features'      => ['3 campaigns/month', 'Email + SMS', 'Full CRM', 'AI content'],
            ],
            'enterprise' => [
                'name'          => 'Enterprise',
                'monthly_price' => 1497,
                'features'      => ['Unlimited campaigns', 'All channels', 'Advanced AI', 'Dedicated manager'],
            ],
            'community_influencer' => [
                'name'          => 'Community Influencer',
                'monthly_price' => 97,
                'features'      => ['Community presence', 'Basic listings', 'Newsletter inclusion'],
            ],
        ];

        if ($tier !== 'all' && isset($pricing[$tier])) {
            return $pricing[$tier];
        }

        return ['tiers' => $pricing];
    }

    private function scheduleCallback(array $args, string $tenantId, ?object $user): array
    {
        $customerId   = $args['customer_id'] ?? null;
        $scheduledAt  = $args['scheduled_at'] ?? now()->addHours(24)->toIso8601String();
        $notes        = $args['notes'] ?? '';

        $activity = $this->activityService->create([
            'tenant_id'    => $tenantId,
            'customer_id'  => $customerId,
            'user_id'      => $user?->id,
            'type'         => 'call',
            'title'        => 'Scheduled Callback',
            'notes'        => $notes,
            'due_date'     => $scheduledAt,
            'status'       => 'pending',
        ]);

        return [
            'scheduled'    => true,
            'activity_id'  => $activity->id,
            'scheduled_at' => $scheduledAt,
            'customer_id'  => $customerId,
        ];
    }

    private function generateSocialPost(array $args): array
    {
        $businessName = $args['business_name'] ?? 'the business';
        $platform     = $args['platform'] ?? 'facebook';
        $topic        = $args['topic'] ?? 'general update';
        $tone         = $args['tone'] ?? 'friendly';

        $prompt = "Write a {$tone} {$platform} post for {$businessName} about: {$topic}. ";
        $prompt .= "Include relevant hashtags. Keep it engaging and appropriate for local business.";

        $post = $this->aiService->chat(
            [['role' => 'user', 'content' => $prompt]],
            "You are a social media expert specializing in local business marketing.",
            config('command-center-ai.ai_models.actions')
        );

        return ['post' => $post, 'platform' => $platform, 'business' => $businessName];
    }

    private function runDiagnostic(array $args, string $tenantId): array
    {
        $customerId = $args['customer_id'] ?? null;

        $customer = null;
        if ($customerId) {
            $customer = Customer::where('tenant_id', $tenantId)->find($customerId);
        }

        if (!$customer) {
            return ['error' => 'Customer not found for diagnostic'];
        }

        $stage  = $customer->pipeline_stage ?? 'unknown';
        $prompt = "Run a marketing diagnostic for a local business with these details:\n";
        $prompt .= "Business: {$customer->business_name}\n";
        $prompt .= "Industry: {$customer->industry_category}\n";
        $prompt .= "Lead score: {$customer->lead_score}\n";
        $prompt .= "Pipeline stage: {$stage}\n\n";
        $prompt .= "Provide: 1) Current strengths, 2) Key gaps, 3) Top 3 priority recommendations, 4) Revenue opportunity estimate.";

        $analysis = $this->aiService->chat(
            [['role' => 'user', 'content' => $prompt]],
            "You are a marketing diagnostic expert analyzing local business opportunities.",
            config('command-center-ai.ai_models.analysis')
        );

        return [
            'customer'    => $customer->business_name,
            'customer_id' => $customer->id,
            'diagnostic'  => $analysis,
        ];
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private function getActionLabel(string $action): string
    {
        return match ($action) {
            'lookup_customer'        => 'Looking up customer',
            'create_followup_task'   => 'Creating follow-up task',
            'draft_email'            => 'Drafting email',
            'update_deal_stage'      => 'Updating deal stage',
            'generate_pitch'         => 'Generating pitch',
            'get_pipeline_summary'   => 'Getting pipeline summary',
            'lookup_product_pricing' => 'Looking up pricing',
            'schedule_callback'      => 'Scheduling callback',
            'generate_social_post'   => 'Drafting social post',
            'run_diagnostic'         => 'Running diagnostic',
            default                  => Str::headline($action),
        };
    }
}
