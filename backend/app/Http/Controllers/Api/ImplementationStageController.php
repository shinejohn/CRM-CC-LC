<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ImplementationStage;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

final class ImplementationStageController extends Controller
{
    public function index(string $ticketId): JsonResponse
    {
        $stages = ImplementationStage::where('ticket_id', $ticketId)
            ->orderBy('stage_order')
            ->get();

        return response()->json($stages);
    }

    public function update(Request $request, string $ticketId, string $stageId): JsonResponse
    {
        $ticket = Ticket::findOrFail($ticketId);
        abort_unless($ticket->type === 'implementation', 422, 'Stage updates only apply to implementation tickets.');

        $stage = ImplementationStage::where('id', $stageId)
            ->where('ticket_id', $ticketId)
            ->firstOrFail();

        $data = $request->validate([
            'status'      => ['sometimes', Rule::in(['pending', 'in_progress', 'complete', 'blocked'])],
            'assigned_to' => ['sometimes', 'nullable', 'uuid'],
            'due_at'      => ['sometimes', 'nullable', 'date'],
            'notes'       => ['sometimes', 'nullable', 'string'],
        ]);

        if (isset($data['status']) && $data['status'] === 'complete' && $stage->completed_at === null) {
            $data['completed_at'] = now();
        }

        $stage->update($data);

        // If all stages complete, mark ticket resolved
        $allComplete = ImplementationStage::where('ticket_id', $ticketId)
            ->where('status', '!=', 'complete')
            ->doesntExist();

        if ($allComplete && ! in_array($ticket->status, ['resolved', 'closed'], true)) {
            $ticket->update(['status' => 'resolved', 'resolved_at' => now()]);
        }

        return response()->json($stage);
    }

    public function reorder(Request $request, string $ticketId): JsonResponse
    {
        $data = $request->validate([
            'order'   => ['required', 'array'],
            'order.*' => ['uuid'],
        ]);

        foreach ($data['order'] as $idx => $stageId) {
            ImplementationStage::where('id', $stageId)
                ->where('ticket_id', $ticketId)
                ->update(['stage_order' => $idx + 1]);
        }

        return response()->json(['message' => 'Reordered.']);
    }
}
