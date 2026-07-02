<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Ops;

use App\Http\Controllers\Controller;
use App\Models\Operations\Incident;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Write endpoints for Ops incidents. The GET /v1/ops/incidents index is served
 * by the pre-existing OpsController@getIncidents route and is intentionally not
 * redefined here.
 */
final class OpsIncidentController extends Controller
{
    /**
     * Accept both snake_case and camelCase keys the frontend may send.
     */
    private function pull(Request $request, string $snake): mixed
    {
        return $request->input($snake, $request->input(Str::camel($snake)));
    }

    /**
     * @param  array<string, mixed>  $row
     * @return array<string, mixed>
     */
    private function camelKeys(array $row): array
    {
        $out = [];

        foreach ($row as $key => $value) {
            if (is_string($value) && is_numeric($value)) {
                $value = $value + 0;
            }

            $out[Str::camel($key)] = $value;
        }

        return $out;
    }

    public function store(Request $request): JsonResponse
    {
        $incident = new Incident();
        $incident->fill([
            'title' => (string) ($this->pull($request, 'title') ?? 'Untitled incident'),
            'description' => $this->pull($request, 'description'),
            'severity' => (string) ($this->pull($request, 'severity') ?? 'minor'),
            'category' => $this->pull($request, 'category'),
            'impact_description' => $this->pull($request, 'impact_description'),
            'affected_components' => $this->pull($request, 'affected_components'),
            'affected_communities' => $this->pull($request, 'affected_communities'),
            'affected_customers' => $this->pull($request, 'affected_customers'),
            'status' => (string) ($this->pull($request, 'status') ?? 'investigating'),
            'started_at' => $this->pull($request, 'started_at') ?? now(),
            'lead_responder' => $this->pull($request, 'lead_responder')
                ?? ($request->user()?->getAuthIdentifier() !== null
                    ? (string) $request->user()->getAuthIdentifier()
                    : null),
            'responders' => $this->pull($request, 'responders'),
            'public_message' => $this->pull($request, 'public_message'),
            'internal_notes' => $this->pull($request, 'internal_notes'),
            'root_cause' => $this->pull($request, 'root_cause'),
        ]);
        $incident->save();

        return response()->json(['data' => $this->camelKeys($incident->fresh()->attributesToArray())], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $incident = Incident::findOrFail($id);

        $map = [
            'title', 'description', 'severity', 'category', 'impact_description',
            'affected_components', 'affected_communities', 'affected_customers',
            'status', 'started_at', 'identified_at', 'resolved_at', 'lead_responder',
            'responders', 'public_message', 'internal_notes', 'status_page_id',
            'postmortem_url', 'root_cause', 'corrective_actions',
        ];

        $updates = [];
        foreach ($map as $column) {
            if ($request->has($column) || $request->has(Str::camel($column))) {
                $updates[$column] = $this->pull($request, $column);
            }
        }

        // Convenience: stamp resolved_at when transitioning to resolved.
        if (($updates['status'] ?? null) === 'resolved' && ! array_key_exists('resolved_at', $updates)) {
            $updates['resolved_at'] = now();
        }

        $incident->update($updates);

        return response()->json(['data' => $this->camelKeys($incident->fresh()->attributesToArray())]);
    }
}
