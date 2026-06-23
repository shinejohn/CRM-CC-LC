<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmailTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

final class EmailTemplateController extends Controller
{
    /**
     * List email templates (paginated, searchable).
     */
    public function index(Request $request): JsonResponse
    {
        $query = EmailTemplate::query()->orderByDesc('updated_at');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search): void {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('subject', 'ilike', "%{$search}%")
                    ->orWhere('slug', 'ilike', "%{$search}%");
            });
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $perPage = (int) $request->query('per_page', 25);
        $perPage = max(1, min($perPage, 100));

        return response()->json($query->paginate($perPage));
    }

    /**
     * Show a single template.
     */
    public function show(string $id): JsonResponse
    {
        $template = EmailTemplate::findOrFail($id);

        return response()->json(['data' => $template]);
    }

    /**
     * Create a template.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'html_content' => 'required|string',
            'text_content' => 'nullable|string',
            'variables' => 'nullable|array',
            'variables.*' => 'string',
            'is_active' => 'boolean',
        ]);

        $tenantId = $this->resolveTenantId($request);

        $template = EmailTemplate::create([
            'tenant_id' => $tenantId,
            'name' => $data['name'],
            'slug' => Str::slug($data['name']).'-'.Str::lower(Str::random(6)),
            'subject' => $data['subject'],
            'html_content' => $data['html_content'],
            'text_content' => $data['text_content'] ?? null,
            'variables' => $data['variables'] ?? [],
            'is_active' => $data['is_active'] ?? true,
        ]);

        return response()->json([
            'data' => $template,
            'message' => 'Template created successfully',
        ], 201);
    }

    /**
     * Update a template.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $template = EmailTemplate::findOrFail($id);

        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'subject' => 'sometimes|required|string|max:255',
            'html_content' => 'sometimes|required|string',
            'text_content' => 'nullable|string',
            'variables' => 'nullable|array',
            'variables.*' => 'string',
            'is_active' => 'boolean',
        ]);

        $template->fill($data);
        $template->save();

        return response()->json([
            'data' => $template->fresh(),
            'message' => 'Template updated successfully',
        ]);
    }

    /**
     * Delete a template.
     */
    public function destroy(string $id): JsonResponse
    {
        $template = EmailTemplate::findOrFail($id);
        $template->delete();

        return response()->json(['message' => 'Template deleted successfully']);
    }

    /**
     * Render subject + body with a provided sample-variables map.
     *
     * Reuses EmailTemplate::render() — the same {{token}} str_replace logic
     * the campaign system uses to send mail.
     */
    public function preview(Request $request, string $id): JsonResponse
    {
        $template = EmailTemplate::findOrFail($id);

        $data = $request->validate([
            'variables' => 'nullable|array',
        ]);

        /** @var array<string, string> $variables */
        $variables = array_map(
            static fn ($value): string => is_scalar($value) ? (string) $value : '',
            $data['variables'] ?? []
        );

        return response()->json(['data' => $template->render($variables)]);
    }

    /**
     * Render arbitrary (unsaved) subject + body with sample variables.
     * Lets the editor preview before the first save.
     */
    public function previewRaw(Request $request): JsonResponse
    {
        $data = $request->validate([
            'subject' => 'required|string',
            'html_content' => 'required|string',
            'text_content' => 'nullable|string',
            'variables' => 'nullable|array',
        ]);

        $template = new EmailTemplate([
            'subject' => $data['subject'],
            'html_content' => $data['html_content'],
            'text_content' => $data['text_content'] ?? null,
        ]);

        /** @var array<string, string> $variables */
        $variables = array_map(
            static fn ($value): string => is_scalar($value) ? (string) $value : '',
            $data['variables'] ?? []
        );

        return response()->json(['data' => $template->render($variables)]);
    }

    private function resolveTenantId(Request $request): ?string
    {
        $user = Auth::user();
        if ($user && ! empty($user->tenant_id)) {
            return (string) $user->tenant_id;
        }

        return $request->header('X-Tenant-ID')
            ?? $request->input('tenant_id')
            ?? (string) config('fibonacco.system_tenant_id', '00000000-0000-0000-0000-000000000001');
    }
}
