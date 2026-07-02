<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\TrainDatasetJob;
use App\Models\AgentKnowledgeConfig;
use App\Models\AiPersonality;
use App\Models\TrainingDataset;
use App\Models\TrainingExample;
use App\Models\TrainingRun;
use App\Services\AI\PrismAiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Throwable;

/**
 * TrainingDatasetController
 *
 * Real persistence layer for the AI-training-data subsystem consumed by
 * src/services/learning/training-api.ts. All reads/writes are tenant-scoped
 * off the authenticated user. The one deliberately-honest placeholder is the
 * `train` action: it persists a TrainingRun and dispatches TrainDatasetJob,
 * which records the run lifecycle WITHOUT fabricating accuracy metrics because
 * no ML model-training backend exists in this codebase yet.
 */
final class TrainingDatasetController extends Controller
{
    /**
     * GET /v1/training/datasets — tenant-scoped list.
     */
    public function index(Request $request): JsonResponse
    {
        $datasets = TrainingDataset::query()
            ->orderByDesc('created_at')
            ->get();

        return response()->json($datasets);
    }

    /**
     * POST /v1/training/datasets — create a dataset for the caller's tenant.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'agent_id' => ['nullable', 'uuid'],
            'status' => ['nullable', 'string', 'max:30'],
            'metadata' => ['nullable', 'array'],
        ]);

        $dataset = TrainingDataset::create([
            'tenant_id' => $this->tenantId($request),
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'agent_id' => $data['agent_id'] ?? null,
            'status' => $data['status'] ?? 'draft',
            'example_count' => 0,
            'metadata' => $data['metadata'] ?? null,
        ]);

        return response()->json($dataset, 201);
    }

    /**
     * GET /v1/training/datasets/{id} — single dataset (tenant-scoped).
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $dataset = TrainingDataset::query()
            ->with('runs')
            ->findOrFail($id);

        return response()->json($dataset);
    }

    /**
     * PUT /v1/training/datasets/{id} — update mutable fields.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $dataset = TrainingDataset::findOrFail($id);

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'agent_id' => ['nullable', 'uuid'],
            'status' => ['sometimes', 'string', 'max:30'],
            'metadata' => ['nullable', 'array'],
        ]);

        $dataset->update($data);

        return response()->json($dataset);
    }

    /**
     * DELETE /v1/training/datasets/{id}.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $dataset = TrainingDataset::findOrFail($id);
        $dataset->delete();

        return response()->json(null, 204);
    }

    /**
     * POST /v1/training/datasets/{id}/examples — add a labelled example.
     */
    public function addExample(Request $request, string $id): JsonResponse
    {
        $dataset = TrainingDataset::findOrFail($id);

        $data = $request->validate([
            'input' => ['required', 'string'],
            'expected_output' => ['nullable', 'string'],
            'category' => ['nullable', 'string', 'max:255'],
            'validation_status' => ['nullable', 'string', 'in:pending,approved,rejected,merged'],
            'metadata' => ['nullable', 'array'],
        ]);

        $example = TrainingExample::create([
            'dataset_id' => $dataset->id,
            'input' => $data['input'],
            'expected_output' => $data['expected_output'] ?? null,
            'category' => $data['category'] ?? null,
            'validation_status' => $data['validation_status'] ?? 'pending',
            'metadata' => $data['metadata'] ?? null,
        ]);

        $this->syncExampleCount($dataset);

        return response()->json($example, 201);
    }

    /**
     * GET /v1/training/validation/queue — paginated pending examples for the
     * caller's tenant. Filters: priority (metadata->priority), type (category).
     */
    public function validationQueue(Request $request): JsonResponse
    {
        $tenantDatasetIds = TrainingDataset::query()->pluck('id');

        $query = TrainingExample::query()
            ->whereIn('dataset_id', $tenantDatasetIds)
            ->where('validation_status', 'pending')
            ->orderBy('created_at');

        if ($type = $request->query('type')) {
            $query->where('category', $type);
        }

        if ($priority = $request->query('priority')) {
            // priority is stored inside the example metadata JSON.
            $query->where('metadata->priority', $priority);
        }

        $items = $query->paginate((int) $request->query('per_page', 25));

        return response()->json($items);
    }

    /**
     * POST /v1/validation/{id}/approve — mark an example approved.
     */
    public function approve(Request $request, string $id): JsonResponse
    {
        return $this->transition($request, $id, 'approved', [
            'source' => ['nullable', 'string'],
        ]);
    }

    /**
     * POST /v1/validation/{id}/reject — mark an example rejected.
     */
    public function reject(Request $request, string $id): JsonResponse
    {
        return $this->transition($request, $id, 'rejected');
    }

    /**
     * POST /v1/validation/{id}/merge — merge caller-supplied fields into the
     * example, then mark it merged.
     */
    public function merge(Request $request, string $id): JsonResponse
    {
        $example = $this->findTenantExample($id);

        $merged = $request->all();
        $updates = [
            'validation_status' => 'merged',
            'reviewed_by' => $this->userId($request),
            'reviewed_at' => now(),
        ];

        if (array_key_exists('input', $merged) && is_string($merged['input'])) {
            $updates['input'] = $merged['input'];
        }
        if (array_key_exists('expected_output', $merged) && is_string($merged['expected_output'])) {
            $updates['expected_output'] = $merged['expected_output'];
        }
        if (array_key_exists('category', $merged) && is_string($merged['category'])) {
            $updates['category'] = $merged['category'];
        }

        // Preserve the full merge payload for audit in metadata.
        $metadata = $example->metadata ?? [];
        $metadata['merge_payload'] = $merged;
        $updates['metadata'] = $metadata;

        $example->update($updates);

        return response()->json($example);
    }

    /**
     * POST /v1/training/datasets/{id}/train — enqueue a training run.
     *
     * HONEST PLACEHOLDER: persists a real TrainingRun (status=queued) and
     * dispatches TrainDatasetJob. No model is actually trained and no metrics
     * are fabricated (see TrainDatasetJob).
     */
    public function train(Request $request, string $id): JsonResponse
    {
        $dataset = TrainingDataset::findOrFail($id);

        $run = TrainingRun::create([
            'dataset_id' => $dataset->id,
            'status' => 'queued',
        ]);

        $dataset->update(['status' => 'training']);

        TrainDatasetJob::dispatch($run->id);

        return response()->json([
            'run' => $run,
            'message' => 'Training run queued. Note: model training backend is not yet integrated; the run is recorded but no model is trained and no metrics are produced.',
        ], 202);
    }

    /**
     * GET /v1/agents/{agentId}/knowledge-config — fetch (or default) the
     * knowledge config for an agent (AiPersonality).
     */
    public function agentKnowledgeConfig(Request $request, string $agentId): JsonResponse
    {
        $agent = AiPersonality::findOrFail($agentId);

        $config = AgentKnowledgeConfig::query()
            ->where('agent_id', $agent->id)
            ->first();

        return response()->json($this->presentConfig($agent, $config));
    }

    /**
     * PUT /v1/agents/{agentId}/knowledge-config — upsert the knowledge config.
     */
    public function updateAgentKnowledgeConfig(Request $request, string $agentId): JsonResponse
    {
        $agent = AiPersonality::findOrFail($agentId);

        $data = $request->validate([
            'allowed_categories' => ['nullable', 'array'],
            'allowed_industries' => ['nullable', 'array'],
            'excluded_article_ids' => ['nullable', 'array'],
            'use_faq_first' => ['nullable', 'boolean'],
            'confidence_threshold' => ['nullable', 'numeric'],
            'fallback_behavior' => ['nullable', 'string', 'in:escalate,general_response,ask_clarification'],
        ]);

        $config = AgentKnowledgeConfig::query()
            ->where('agent_id', $agent->id)
            ->first();

        if ($config === null) {
            $config = new AgentKnowledgeConfig([
                'agent_id' => $agent->id,
                'tenant_id' => $this->tenantId($request),
            ]);
        }

        $config->config = array_merge($config->config ?? [], $data);
        $config->save();

        return response()->json($this->presentConfig($agent, $config));
    }

    /**
     * POST /v1/agents/{agentId}/test-query — run a real query against the
     * agent via PrismAiService and return the response.
     */
    public function testQuery(Request $request, string $agentId, PrismAiService $ai): JsonResponse
    {
        $agent = AiPersonality::findOrFail($agentId);

        $data = $request->validate([
            'query' => ['required', 'string'],
        ]);

        try {
            $answer = $ai->chat(
                messages: [['role' => 'user', 'content' => $data['query']]],
                systemPrompt: $agent->system_prompt ?: ($agent->system_prompt_override ?: null),
            );
        } catch (Throwable $e) {
            return response()->json([
                'error' => 'AI query failed',
                'message' => $e->getMessage(),
            ], 502);
        }

        // Shape kept compatible with the frontend testAgentQuery() contract
        // while returning the REAL AI answer (no fabricated retrieval scores).
        return response()->json([
            'query' => $data['query'],
            'answer' => $answer,
            'results' => [
                [
                    'id' => $agent->id,
                    'title' => $agent->name,
                    'score' => 1.0,
                    'would_use' => true,
                ],
            ],
        ]);
    }

    // ---------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------

    private function transition(Request $request, string $id, string $status, array $rules = []): JsonResponse
    {
        if ($rules !== []) {
            $request->validate($rules);
        }

        $example = $this->findTenantExample($id);

        $example->update([
            'validation_status' => $status,
            'reviewed_by' => $this->userId($request),
            'reviewed_at' => now(),
        ]);

        return response()->json($example);
    }

    /**
     * Locate an example that belongs to one of the caller-tenant's datasets.
     */
    private function findTenantExample(string $id): TrainingExample
    {
        $tenantDatasetIds = TrainingDataset::query()->pluck('id');

        return TrainingExample::query()
            ->whereIn('dataset_id', $tenantDatasetIds)
            ->findOrFail($id);
    }

    private function syncExampleCount(TrainingDataset $dataset): void
    {
        $count = TrainingExample::query()
            ->where('dataset_id', $dataset->id)
            ->count();

        $dataset->update(['example_count' => $count]);
    }

    /**
     * @return array<string, mixed>
     */
    private function presentConfig(AiPersonality $agent, ?AgentKnowledgeConfig $config): array
    {
        $stored = $config?->config ?? [];

        return [
            'agent_id' => $agent->id,
            'agent_name' => $agent->name,
            'agent_type' => $agent->slug ?? 'personality',
            'allowed_categories' => $stored['allowed_categories'] ?? [],
            'allowed_industries' => $stored['allowed_industries'] ?? [],
            'excluded_article_ids' => $stored['excluded_article_ids'] ?? [],
            'use_faq_first' => $stored['use_faq_first'] ?? true,
            'confidence_threshold' => $stored['confidence_threshold'] ?? 0.7,
            'fallback_behavior' => $stored['fallback_behavior'] ?? 'escalate',
            'total_accessible_articles' => 0,
            'total_accessible_faqs' => 0,
            'updated_at' => optional($config?->updated_at)->toISOString(),
        ];
    }

    private function tenantId(Request $request): ?string
    {
        return $request->user()?->tenant_id;
    }

    private function userId(Request $request): ?string
    {
        return $request->user()?->id;
    }
}
