<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CrmActivity;
use App\Models\DashboardWidget;
use App\Models\Interaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

final class DashboardController extends Controller
{
    /**
     * The default widget layout handed to a user who has never customised
     * their dashboard. Mirrors the frontend `defaultCards` in DashboardGrid.
     *
     * @var list<array{widget_key:string,title:string,default_color:string,position:int,layout:array{row:int,col:int,rows:int,cols:int}}>
     */
    private const DEFAULT_WIDGETS = [
        ['widget_key' => 'tasks', 'title' => 'Tasks', 'default_color' => 'lavender', 'position' => 0, 'layout' => ['row' => 0, 'col' => 0, 'rows' => 1, 'cols' => 1]],
        ['widget_key' => 'email', 'title' => 'Email', 'default_color' => 'sky', 'position' => 1, 'layout' => ['row' => 0, 'col' => 1, 'rows' => 1, 'cols' => 1]],
        ['widget_key' => 'messages', 'title' => 'Messages', 'default_color' => 'rose', 'position' => 2, 'layout' => ['row' => 0, 'col' => 2, 'rows' => 1, 'cols' => 1]],
        ['widget_key' => 'calendar', 'title' => 'Calendar', 'default_color' => 'mint', 'position' => 3, 'layout' => ['row' => 1, 'col' => 0, 'rows' => 1, 'cols' => 1]],
        ['widget_key' => 'files', 'title' => 'Files', 'default_color' => 'ocean', 'position' => 4, 'layout' => ['row' => 1, 'col' => 1, 'rows' => 1, 'cols' => 1]],
        ['widget_key' => 'articles', 'title' => 'Articles', 'default_color' => 'peach', 'position' => 5, 'layout' => ['row' => 1, 'col' => 2, 'rows' => 1, 'cols' => 1]],
    ];

    /**
     * GET /v1/dashboard/widgets
     *
     * List the authenticated user's widgets, ordered. If the user has none
     * yet, seed and return the default set so the grid is never empty.
     */
    public function widgets(Request $request): JsonResponse
    {
        $userId = $this->userId($request);

        $widgets = DashboardWidget::query()
            ->where('user_id', $userId)
            ->orderBy('position')
            ->get();

        if ($widgets->isEmpty()) {
            $widgets = $this->seedDefaults($userId);
        }

        return response()->json([
            'data' => $widgets->map(fn (DashboardWidget $w): array => $this->toCard($w))->values(),
        ]);
    }

    /**
     * PUT /v1/dashboard/widgets
     *
     * Bulk upsert the full widget layout for the authenticated user
     * (position / config / visibility). Body: { widgets: [ { id?, type|widget_key,
     * title?, defaultColor?, position?, size?, config?, is_visible? } ] }.
     */
    public function saveWidgets(Request $request): JsonResponse
    {
        $userId = $this->userId($request);

        $validated = $request->validate([
            'widgets' => ['required', 'array'],
            'widgets.*.type' => ['required_without:widgets.*.widget_key', 'string', 'max:100'],
            'widgets.*.widget_key' => ['required_without:widgets.*.type', 'string', 'max:100'],
            'widgets.*.title' => ['nullable', 'string', 'max:150'],
            'widgets.*.defaultColor' => ['nullable', 'string', 'max:50'],
            'widgets.*.position' => ['nullable', 'array'],
            'widgets.*.size' => ['nullable', 'array'],
            'widgets.*.config' => ['nullable', 'array'],
            'widgets.*.is_visible' => ['nullable', 'boolean'],
        ]);

        foreach ($validated['widgets'] as $index => $incoming) {
            $key = $incoming['widget_key'] ?? $incoming['type'];

            DashboardWidget::query()->updateOrCreate(
                ['user_id' => $userId, 'widget_key' => $key],
                [
                    'title' => $incoming['title'] ?? ucfirst((string) $key),
                    'default_color' => $incoming['defaultColor'] ?? 'lavender',
                    'position' => $index,
                    'layout' => $this->layoutFrom($incoming),
                    'config' => $incoming['config'] ?? null,
                    'is_visible' => $incoming['is_visible'] ?? true,
                ]
            );
        }

        $widgets = DashboardWidget::query()
            ->where('user_id', $userId)
            ->orderBy('position')
            ->get();

        return response()->json([
            'data' => $widgets->map(fn (DashboardWidget $w): array => $this->toCard($w))->values(),
        ]);
    }

    /**
     * PUT /v1/dashboard/widgets/{id}
     *
     * Persist position / config / visibility for a single widget owned by the
     * authenticated user. Body may contain: { position:{row,col},
     * size:{rows,cols}, config, is_visible }.
     */
    public function updateWidget(Request $request, string $id): JsonResponse
    {
        $userId = $this->userId($request);

        $widget = DashboardWidget::query()
            ->where('user_id', $userId)
            ->where('id', $id)
            ->first();

        abort_if($widget === null, 404, 'Widget not found.');

        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:150'],
            'defaultColor' => ['nullable', 'string', 'max:50'],
            'position' => ['nullable', 'array'],
            'size' => ['nullable', 'array'],
            'config' => ['nullable', 'array'],
            'is_visible' => ['nullable', 'boolean'],
        ]);

        // Merge geometry onto the existing layout so a partial {row,col}
        // update (as the frontend sends) does not wipe rows/cols.
        if (array_key_exists('position', $validated) || array_key_exists('size', $validated)) {
            $widget->layout = $this->layoutFrom($validated, (array) ($widget->layout ?? []));
        }
        if (array_key_exists('title', $validated)) {
            $widget->title = (string) $validated['title'];
        }
        if (array_key_exists('defaultColor', $validated)) {
            $widget->default_color = (string) $validated['defaultColor'];
        }
        if (array_key_exists('config', $validated)) {
            $widget->config = $validated['config'];
        }
        if (array_key_exists('is_visible', $validated)) {
            $widget->is_visible = (bool) $validated['is_visible'];
        }

        $widget->save();

        return response()->json(['data' => $this->toCard($widget)]);
    }

    /**
     * GET /v1/dashboard/recent-activity
     *
     * Real cross-system feed: the latest CRM interactions + activities for the
     * authenticated user's tenant, merged and sorted newest-first. Both source
     * models carry a HasTenantScope global scope, so the query is already
     * constrained to $request->user()'s tenant.
     */
    public function recentActivity(Request $request): JsonResponse
    {
        // Ensure a tenant is present; the global scope denies untenanted users.
        $this->userId($request);

        $limit = min(50, max(1, (int) $request->input('limit', 10)));

        $interactions = Interaction::query()
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get(['id', 'type', 'title', 'description', 'status', 'completed_at', 'created_at'])
            ->map(function (Interaction $i): array {
                $ts = $i->completed_at ?? $i->created_at;

                return [
                    'id' => (string) $i->id,
                    'type' => (string) ($i->type ?? 'note'),
                    'title' => (string) ($i->title ?? 'Interaction'),
                    'description' => (string) ($i->description ?? ''),
                    'status' => $this->normalizeStatus($i->status),
                    'timestamp' => $ts?->toIso8601String(),
                ];
            });

        $activities = CrmActivity::query()
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get(['id', 'type', 'subject', 'description', 'status', 'completed_at', 'created_at'])
            ->map(function (CrmActivity $a): array {
                $ts = $a->completed_at ?? $a->created_at;

                return [
                    'id' => (string) $a->id,
                    'type' => (string) ($a->type ?? 'note'),
                    'title' => (string) ($a->subject ?? 'Activity'),
                    'description' => (string) ($a->description ?? ''),
                    'status' => $this->normalizeStatus($a->status),
                    'timestamp' => $ts?->toIso8601String(),
                ];
            });

        $feed = $interactions
            ->concat($activities)
            ->sortByDesc('timestamp')
            ->take($limit)
            ->values();

        return response()->json(['data' => $feed]);
    }

    /**
     * Resolve the authenticated user id, requiring a tenant assignment so the
     * activity feed's tenant-scoped queries are meaningful.
     */
    private function userId(Request $request): string
    {
        $user = $request->user();

        abort_if($user === null, 401, 'Unauthenticated.');
        abort_if(empty($user->tenant_id), 403, 'Forbidden: no tenant assigned to this account.');

        return (string) $user->id;
    }

    /**
     * Seed the default widget set for a user and return the persisted rows.
     */
    private function seedDefaults(string $userId): Collection
    {
        foreach (self::DEFAULT_WIDGETS as $default) {
            DashboardWidget::query()->create([
                'user_id' => $userId,
                'widget_key' => $default['widget_key'],
                'title' => $default['title'],
                'default_color' => $default['default_color'],
                'position' => $default['position'],
                'layout' => $default['layout'],
                'config' => null,
                'is_visible' => true,
            ]);
        }

        return DashboardWidget::query()
            ->where('user_id', $userId)
            ->orderBy('position')
            ->get();
    }

    /**
     * Build a { row, col, rows, cols } layout array from an incoming payload,
     * merging over an optional existing layout for partial updates.
     *
     * @param  array<string,mixed>  $incoming
     * @param  array<string,mixed>  $existing
     * @return array{row:int,col:int,rows:int,cols:int}
     */
    private function layoutFrom(array $incoming, array $existing = []): array
    {
        $position = is_array($incoming['position'] ?? null) ? $incoming['position'] : [];
        $size = is_array($incoming['size'] ?? null) ? $incoming['size'] : [];

        return [
            'row' => (int) ($position['row'] ?? $existing['row'] ?? 0),
            'col' => (int) ($position['col'] ?? $existing['col'] ?? 0),
            'rows' => (int) ($size['rows'] ?? $existing['rows'] ?? 1),
            'cols' => (int) ($size['cols'] ?? $existing['cols'] ?? 1),
        ];
    }

    /**
     * Map a DashboardWidget row to the frontend DashboardCard shape.
     *
     * @return array<string,mixed>
     */
    private function toCard(DashboardWidget $widget): array
    {
        $layout = (array) ($widget->layout ?? []);

        return [
            'id' => (string) $widget->id,
            'type' => $widget->widget_key,
            'title' => $widget->title,
            'defaultColor' => $widget->default_color,
            'position' => [
                'row' => (int) ($layout['row'] ?? 0),
                'col' => (int) ($layout['col'] ?? 0),
            ],
            'size' => [
                'rows' => (int) ($layout['rows'] ?? 1),
                'cols' => (int) ($layout['cols'] ?? 1),
            ],
            'config' => $widget->config,
            'is_visible' => (bool) $widget->is_visible,
        ];
    }

    /**
     * Coerce arbitrary source statuses into the frontend Activity status union.
     */
    private function normalizeStatus(?string $status): string
    {
        return match ($status) {
            'in_progress', 'completed', 'cancelled', 'pending' => $status,
            'done', 'complete' => 'completed',
            'active', 'running' => 'in_progress',
            'skipped', 'canceled' => 'cancelled',
            default => 'completed',
        };
    }
}
