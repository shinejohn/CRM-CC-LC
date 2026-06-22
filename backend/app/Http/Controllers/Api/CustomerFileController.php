<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\CustomerFile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

final class CustomerFileController extends Controller
{
    /**
     * The private disk used to store customer file attachments.
     */
    private const DISK = 'local';

    /**
     * GET /api/v1/customers/{id}/files — newest first.
     */
    public function index(Request $request, string $id): JsonResponse
    {
        $customer = $this->resolveCustomer($request, $id);

        $files = $customer->files()
            ->with('uploader:id,name')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn (CustomerFile $file) => $this->present($file));

        return response()->json(['data' => $files]);
    }

    /**
     * POST /api/v1/customers/{id}/files — multipart upload (field: file).
     */
    public function store(Request $request, string $id): JsonResponse
    {
        $customer = $this->resolveCustomer($request, $id);

        $request->validate([
            'file' => 'required|file|max:25600', // 25 MB
        ]);

        $upload = $request->file('file');

        $path = $upload->store("customer-files/{$customer->id}", self::DISK);

        $file = $customer->files()->create([
            'uploaded_by' => $request->user()?->id,
            'original_name' => $upload->getClientOriginalName(),
            'path' => $path,
            'mime_type' => $upload->getClientMimeType(),
            'size' => $upload->getSize(),
        ]);

        $file->load('uploader:id,name');

        return response()->json(['data' => $this->present($file)], 201);
    }

    /**
     * GET /api/v1/customers/{id}/files/{fileId}/download — stream as download.
     */
    public function download(Request $request, string $id, string $fileId): StreamedResponse
    {
        $customer = $this->resolveCustomer($request, $id);

        $file = $customer->files()->findOrFail($fileId);

        $disk = Storage::disk(self::DISK);

        abort_unless($disk->exists($file->path), 404, 'File not found');

        return $disk->download($file->path, $file->original_name, [
            'Content-Type' => $file->mime_type ?? 'application/octet-stream',
        ]);
    }

    /**
     * DELETE /api/v1/customers/{id}/files/{fileId} — delete row + stored blob.
     */
    public function destroy(Request $request, string $id, string $fileId): JsonResponse
    {
        $customer = $this->resolveCustomer($request, $id);

        $file = $customer->files()->findOrFail($fileId);

        $disk = Storage::disk(self::DISK);
        if ($disk->exists($file->path)) {
            $disk->delete($file->path);
        }

        $file->delete();

        return response()->json(['message' => 'File deleted successfully']);
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
    private function present(CustomerFile $file): array
    {
        return [
            'id' => $file->id,
            'customer_id' => $file->customer_id,
            'original_name' => $file->original_name,
            'mime_type' => $file->mime_type,
            'size' => $file->size,
            'uploaded_by' => $file->uploader ? [
                'id' => $file->uploader->id,
                'name' => $file->uploader->name,
            ] : null,
            'created_at' => $file->created_at?->toIso8601String(),
            'updated_at' => $file->updated_at?->toIso8601String(),
        ];
    }
}
