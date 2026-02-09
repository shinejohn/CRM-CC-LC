<?php

namespace Tests\Feature;

use App\Services\OpenRouterService;
use App\Services\WorkflowOrchestrator;
use Fibonacco\AiGatewayClient\AiGatewayClient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AiIntegrationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that OpenRouterService (V1) correctly routes through AiGatewayClient (V2)
     */
    public function test_v1_service_uses_v2_gateway()
    {
        // Mock the HTTP call that AiGatewayClient would make
        Http::fake([
            '*/api/ai/agent' => Http::response([
                'success' => true,
                'response' => 'Response from Gateway',
                'toolCalls' => []
            ], 200)
        ]);

        $service = app(OpenRouterService::class);

        $response = $service->chatCompletion([
            ['role' => 'user', 'content' => 'Hello Gateway']
        ]);

        // Verify structure matches OpenAI format which V1 Controller expects
        $this->assertEquals('chat.completion', $response['object']);
        $this->assertEquals('gateway-model', $response['model']);
        $this->assertEquals('Response from Gateway', $response['choices'][0]['message']['content']);
    }

    /**
     * Test Workflow Orchestrator (V2)
     */
    public function test_workflow_orchestrator_execution()
    {
        // Mock the HTTP call for multiple agent steps
        Http::fake([
            '*/api/ai/agent' => Http::response([
                'success' => true,
                'response' => 'Task Created',
                'toolCalls' => []
            ], 200)
        ]);

        $orchestrator = app(WorkflowOrchestrator::class);

        $params = [
            'business_name' => 'Test Biz',
            'event_name' => 'Grand Opening',
            'event_date' => '2026-10-01',
            'event_description' => 'Big party',
            'location' => 'Downtown',
            'publish_dates' => ['2026-09-20'],
            'social_platforms' => ['twitter'],
            'tasks' => [
                ['title' => 'Buy balloons', 'due' => '2026-09-30']
            ]
        ];

        $result = $orchestrator->executeEventCampaign($params);

        $this->assertTrue($result->success);
        $this->assertArrayHasKey('articles', $result->steps);
        $this->assertArrayHasKey('tasks', $result->steps);
    }
}
