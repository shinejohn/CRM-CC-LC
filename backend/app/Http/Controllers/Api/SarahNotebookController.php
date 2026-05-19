<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Sarah\SarahNotebookService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class SarahNotebookController extends Controller
{
    public function __construct(
        private readonly SarahNotebookService $notebookService,
    ) {}

    /**
     * Get a customer's notebook (creates if it doesn't exist).
     */
    public function show(Request $request, string $customerId): JsonResponse
    {
        $purpose = $request->query('purpose', 'profile');

        $notebook = $this->notebookService->resolve($customerId, $purpose);

        return response()->json([
            'data' => [
                'id' => $notebook->id,
                'customer_id' => $notebook->customer_id,
                'purpose' => $notebook->purpose,
                'status' => $notebook->status,
                'data' => $notebook->data,
                'field_log' => $notebook->field_log,
                'completeness' => $notebook->completeness,
                'committed_at' => $notebook->committed_at?->toISOString(),
                'created_at' => $notebook->created_at?->toISOString(),
                'updated_at' => $notebook->updated_at?->toISOString(),
            ],
        ]);
    }

    /**
     * Update fields on a notebook.
     */
    public function update(Request $request, string $customerId): JsonResponse
    {
        $validated = $request->validate([
            'purpose' => 'sometimes|string|max:50',
            'fields' => 'required|array',
            'source' => 'sometimes|string|in:ai,user,form,scrape,import',
            'source_detail' => 'nullable|string|max:255',
        ]);

        $purpose = $validated['purpose'] ?? 'profile';
        $source = $validated['source'] ?? 'user';

        $notebook = $this->notebookService->resolve($customerId, $purpose);
        $notebook = $this->notebookService->setFields(
            $notebook,
            $validated['fields'],
            $source,
            $validated['source_detail'] ?? null,
        );

        return response()->json([
            'data' => [
                'id' => $notebook->id,
                'data' => $notebook->data,
                'field_log' => $notebook->field_log,
                'completeness' => $notebook->completeness,
                'status' => $notebook->status,
            ],
        ]);
    }

    /**
     * Get field change history.
     */
    public function history(Request $request, string $customerId): JsonResponse
    {
        $purpose = $request->query('purpose', 'profile');
        $field = $request->query('field');

        $notebook = $this->notebookService->resolve($customerId, $purpose);
        $entries = $this->notebookService->getHistory($notebook, $field);

        return response()->json([
            'data' => $entries->map(fn ($e) => [
                'field_name' => $e->field_name,
                'old_value' => $e->old_value,
                'new_value' => $e->new_value,
                'source' => $e->source,
                'source_detail' => $e->source_detail,
                'created_at' => $e->created_at?->toISOString(),
            ]),
        ]);
    }

    /**
     * Approve notebook and commit to customer record.
     */
    public function approve(string $customerId): JsonResponse
    {
        $notebook = $this->notebookService->resolve($customerId);
        $notebook = $this->notebookService->approve($notebook);

        return response()->json([
            'data' => [
                'id' => $notebook->id,
                'status' => $notebook->status,
                'committed_at' => $notebook->committed_at?->toISOString(),
                'completeness' => $notebook->completeness,
            ],
            'message' => 'Profile approved and committed to customer record.',
        ]);
    }
}
