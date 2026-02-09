<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\WorkflowExecution;
use Fibonacco\AiGatewayClient\AiGatewayClient;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class WorkflowOrchestrator
{
    public function __construct(
        protected AiGatewayClient $gateway
    ) {
    }

    /**
     * Execute a business event campaign workflow
     */
    public function executeEventCampaign(array $params): WorkflowResult
    {
        $workflowId = (string) Str::uuid();

        // Create execution record
        $execution = WorkflowExecution::create([
            'id' => $workflowId,
            'type' => 'business_event_campaign',
            'status' => 'running',
            'params' => $params,
            'initiated_by' => auth()->id(),
        ]);

        $results = [];

        try {
            // Step 1: Create Day.News articles
            if (!empty($params['publish_dates'])) {
                $results['articles'] = $this->createArticles($params);
                $this->logStep($execution, 'articles', $results['articles']);
            }

            // Step 2: Schedule social posts
            if (!empty($params['social_platforms'])) {
                $results['social'] = $this->scheduleSocialPosts($params);
                $this->logStep($execution, 'social', $results['social']);
            }

            // Step 3: Create TaskJuggler tasks
            if (!empty($params['tasks'])) {
                $results['tasks'] = $this->createTasks($params);
                $this->logStep($execution, 'tasks', $results['tasks']);
            }

            // Step 4: Update 4Calls knowledge
            if (!empty($params['call_script'])) {
                $results['4calls'] = $this->updateCallScript($params);
                $this->logStep($execution, '4calls', $results['4calls']);
            }

            // Step 5: Create URPA appointments
            if (!empty($params['urpa_client_id'])) {
                $results['urpa'] = $this->createUrpaItems($params);
                $this->logStep($execution, 'urpa', $results['urpa']);
            }

            $execution->update([
                'status' => 'completed',
                'completed_at' => now(),
                'results' => $results,
            ]);

            return new WorkflowResult(
                success: true,
                workflowId: $workflowId,
                steps: $results
            );

        } catch (\Exception $e) {
            Log::error('Workflow failed', [
                'workflow_id' => $workflowId,
                'error' => $e->getMessage(),
            ]);

            $execution->update([
                'status' => 'failed',
                'error' => $e->getMessage(),
            ]);

            return new WorkflowResult(
                success: false,
                workflowId: $workflowId,
                error: $e->getMessage()
            );
        }
    }

    protected function createArticles(array $params): array
    {
        $result = $this->gateway->agent(
            prompt: $this->buildArticlePrompt($params),
            tools: ['platform_database', 'daynews_api']
        );

        return $result;
    }

    protected function scheduleSocialPosts(array $params): array
    {
        // If you have a social media service, call it here
        // For now, return a placeholder
        return ['scheduled' => count($params['social_platforms']) * count($params['publish_dates'] ?? [1])];
    }

    protected function createTasks(array $params): array
    {
        $results = [];
        $projectName = $params['project'] ?? 'Event Campaigns';

        foreach ($params['tasks'] as $task) {
            $result = $this->gateway->agent(
                prompt: "Create a task in TaskJuggler: {$task['title']} for project '{$projectName}' due {$task['due']}",
                tools: ['taskjuggler_api']
            );
            $results[] = $result;
        }

        return ['tasks_created' => count($results), 'details' => $results];
    }

    protected function updateCallScript(array $params): array
    {
        // Integrate with 4Calls API via AI Gateway
        // We prompt the agent to use the 4calls_api tool
        return $this->gateway->agent(
            prompt: "Update call script for business '{$params['business_name']}' regarding event '{$params['event_name']}'.",
            tools: ['4calls_api']
        );
    }

    protected function createUrpaItems(array $params): array
    {
        // Integrate with URPA API via AI Gateway
        // We prompt the agent to use the urpa_api tool
        $tasks = json_encode($params['urpa_tasks'] ?? []);
        $appointments = json_encode($params['urpa_appointments'] ?? []);

        $urpaClientId = $params['urpa_client_id'] ?? 'unknown';

        return $this->gateway->agent(
            prompt: "Create URPA tasks: {$tasks} and appointments: {$appointments} for client {$urpaClientId}",
            tools: ['urpa_api']
        );
    }

    protected function buildArticlePrompt(array $params): string
    {
        $businessName = $params['business_name'] ?? 'Unknown Business';
        $eventName = $params['event_name'] ?? 'Unknown Event';
        $eventDate = $params['event_date'] ?? 'TBD';
        $eventDesc = $params['event_description'] ?? 'No description';
        $location = $params['location'] ?? 'Unknown Location';
        $publishDate = $params['publish_dates'][0] ?? now()->toDateString();

        return <<<PROMPT
Create a promotional article for Day.News about this business event:

Business: {$businessName}
Event: {$eventName}
Event Date: {$eventDate}
Description: {$eventDesc}
Location: {$location}

Create the article and schedule it for publication on {$publishDate}.
Use the daynews_api tool to create the article.
PROMPT;
    }

    protected function logStep(WorkflowExecution $execution, string $step, array $result): void
    {
        $execution->steps()->create([
            'step_name' => $step,
            'status' => isset($result['error']) ? 'failed' : 'completed',
            'result' => $result,
            'completed_at' => now(),
        ]);
    }
}
