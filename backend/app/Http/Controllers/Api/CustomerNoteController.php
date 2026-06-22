<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\CustomerNote;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class CustomerNoteController extends Controller
{
    /**
     * GET /api/v1/customers/{id}/notes — newest first.
     */
    public function index(Request $request, string $id): JsonResponse
    {
        $customer = $this->resolveCustomer($request, $id);

        $notes = $customer->customerNotes()
            ->with('author:id,name')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn (CustomerNote $note) => $this->present($note));

        return response()->json(['data' => $notes]);
    }

    /**
     * POST /api/v1/customers/{id}/notes — create a note.
     */
    public function store(Request $request, string $id): JsonResponse
    {
        $customer = $this->resolveCustomer($request, $id);

        $validated = $request->validate([
            'body' => 'required|string',
        ]);

        $note = $customer->customerNotes()->create([
            'body' => $validated['body'],
            'user_id' => $request->user()?->id,
        ]);

        $note->load('author:id,name');

        return response()->json(['data' => $this->present($note)], 201);
    }

    /**
     * DELETE /api/v1/customers/{id}/notes/{noteId}.
     */
    public function destroy(Request $request, string $id, string $noteId): JsonResponse
    {
        $customer = $this->resolveCustomer($request, $id);

        $note = $customer->customerNotes()->findOrFail($noteId);
        $note->delete();

        return response()->json(['message' => 'Note deleted successfully']);
    }

    /**
     * Resolve the tenant-scoped customer or 404.
     */
    private function resolveCustomer(Request $request, string $id): Customer
    {
        $tenantId = $request->header('X-Tenant-ID')
            ?? $request->input('tenant_id')
            ?? $request->user()?->tenant_id;

        return Customer::where('tenant_id', $tenantId)->findOrFail($id);
    }

    /**
     * @return array<string, mixed>
     */
    private function present(CustomerNote $note): array
    {
        return [
            'id' => $note->id,
            'customer_id' => $note->customer_id,
            'body' => $note->body,
            'author' => $note->author ? [
                'id' => $note->author->id,
                'name' => $note->author->name,
            ] : null,
            'created_at' => $note->created_at?->toIso8601String(),
            'updated_at' => $note->updated_at?->toIso8601String(),
        ];
    }
}
