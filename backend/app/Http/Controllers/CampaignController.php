<?php

namespace App\Http\Controllers;

use App\Services\WorkflowOrchestrator;
use App\Models\WorkflowExecution;
use Illuminate\Http\Request;

class CampaignController extends Controller
{
    public function __construct(
        protected WorkflowOrchestrator $orchestrator
    ) {
    }

    /**
     * Show campaign creation form
     */
    public function create()
    {
        // Inertia not installed, returning JSON representation for now
        return response()->json([
            'component' => 'Campaigns/Create',
            'props' => [],
        ]);
    }

    /**
     * Execute campaign workflow
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'business_id' => 'required',
            'business_name' => 'required|string',
            'event_name' => 'required|string',
            'event_date' => 'required|date',
            'event_description' => 'required|string',
            'location' => 'required|string',
            'publish_dates' => 'required|array|min:1',
            'publish_dates.*' => 'date',
            'social_platforms' => 'array',
            'tasks' => 'array',
            'tasks.*.title' => 'required|string',
            'tasks.*.due' => 'required|date',
            'call_script' => 'array',
            'urpa_client_id' => 'nullable',
            'urpa_tasks' => 'array',
            'urpa_appointments' => 'array',
        ]);

        $result = $this->orchestrator->executeEventCampaign($validated);

        if ($result->success) {
            // Redirect to show page with success message
            return redirect()
                ->route('campaigns.show', $result->workflowId)
                ->with('success', 'Campaign created successfully!');
        }

        return back()
            ->withErrors(['workflow' => $result->error])
            ->withInput();
    }

    /**
     * Show campaign status
     */
    public function show(string $id)
    {
        $execution = WorkflowExecution::with('steps')->findOrFail($id);

        // Inertia not installed, returning JSON representation for now
        return response()->json([
            'component' => 'Campaigns/Show',
            'props' => [
                'execution' => $execution,
            ],
        ]);
    }
}
